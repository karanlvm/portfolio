// Refresh Spotify "now playing" / "last played" snapshot.
// Run by .github/workflows/spotify.yml every 15 minutes.

import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';

const {
  SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET,
  SPOTIFY_REFRESH_TOKEN,
} = process.env;

const OUT = 'data/spotify.json';

function bail(reason) {
  console.error('[spotify] skipping:', reason);
  // Don't fail the workflow — keep last good snapshot in place.
  process.exit(0);
}

if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) {
  bail('missing one of SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN secrets.');
}

async function getAccessToken() {
  const basic = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64');
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: SPOTIFY_REFRESH_TOKEN,
    }),
  });
  if (!res.ok) throw new Error(`token refresh failed: ${res.status} ${await res.text()}`);
  const { access_token } = await res.json();
  return access_token;
}

async function getCurrentlyPlaying(token) {
  const res = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 204) return null; // nothing playing
  if (!res.ok) {
    console.warn('[spotify] currently-playing returned', res.status);
    return null;
  }
  const json = await res.json();
  if (!json?.item) return null;
  return json;
}

async function getRecentlyPlayed(token) {
  const res = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=1', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    console.warn('[spotify] recently-played returned', res.status);
    return null;
  }
  const json = await res.json();
  return json?.items?.[0] ?? null;
}

function shape(track, { isPlaying, playedAt }) {
  return {
    isPlaying,
    track:    track.name,
    artist:   track.artists.map(a => a.name).join(', '),
    album:    track.album?.name ?? null,
    albumArt: track.album?.images?.[0]?.url ?? null,
    url:      track.external_urls?.spotify ?? null,
    playedAt: playedAt ?? null,
    updatedAt: new Date().toISOString(),
  };
}

let data;
try {
  const token = await getAccessToken();
  const now   = await getCurrentlyPlaying(token);

  if (now?.is_playing && now.item) {
    data = shape(now.item, { isPlaying: true });
  } else {
    const recent = await getRecentlyPlayed(token);
    if (recent?.track) {
      data = shape(recent.track, { isPlaying: false, playedAt: recent.played_at });
    } else {
      data = {
        isPlaying: false,
        track: null, artist: null, album: null, albumArt: null, url: null,
        playedAt: null,
        updatedAt: new Date().toISOString(),
      };
    }
  }
} catch (err) {
  console.error('[spotify] error:', err.message);
  // Keep previous file untouched on transient errors.
  if (existsSync(OUT)) {
    console.log('[spotify] keeping previous snapshot');
    process.exit(0);
  }
  // Otherwise write an empty placeholder so frontend doesn't 404.
  data = { isPlaying: false, updatedAt: new Date().toISOString() };
}

mkdirSync('data', { recursive: true });

// Skip writing if nothing meaningful changed (avoids commit churn).
if (existsSync(OUT)) {
  try {
    const prev = JSON.parse(readFileSync(OUT, 'utf8'));
    const same =
      prev.isPlaying === data.isPlaying &&
      prev.track     === data.track     &&
      prev.artist    === data.artist    &&
      prev.playedAt  === data.playedAt;
    if (same) {
      console.log('[spotify] no change');
      process.exit(0);
    }
  } catch {}
}

writeFileSync(OUT, JSON.stringify(data, null, 2) + '\n');
console.log('[spotify] wrote', OUT, '·', data.isPlaying ? 'PLAYING' : 'last played', '·', data.track);
