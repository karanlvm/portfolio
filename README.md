# Karan Vasudevamurthy — Portfolio

A personal site built like a dashboard, not a resume. Bento-grid layout with a live Spotify tile (cron-refreshed), a GitHub Pulse tile (public API), and a hidden terminal you can pop open with **`~`**.

🔗 **Live:** [karanlvm.com](https://karanlvm.com)

## Stack

Plain HTML, CSS, vanilla JS. No build step. Deployed to GitHub Pages.

```
portfolio/
├── index.html
├── assets/
│   ├── css/styles.css
│   ├── js/main.js
│   └── img/
├── data/
│   └── spotify.json          ← refreshed by GH Actions
├── scripts/
│   └── fetch-spotify.mjs     ← runs in CI
└── .github/workflows/
    ├── static.yml            ← deploys site
    └── spotify.yml           ← refreshes spotify every 15min
```

## Running locally

```bash
git clone https://github.com/karanlvm/portfolio.git
cd portfolio
python3 -m http.server 8000   # any static server works
open http://localhost:8000
```

## Wiring up the Spotify tile

The Spotify tile reads from `data/spotify.json`, which is refreshed every 15 minutes by a GitHub Actions cron job. You need to give that job three secrets so it can authenticate as you.

### 1. Create a Spotify Developer App

1. Go to [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
2. **Create app** → name it whatever (e.g. "portfolio-now-playing")
3. Set **Redirect URI** to `http://localhost:8888/callback` (we'll use this once)
4. Copy the **Client ID** and **Client Secret**

### 2. Get a refresh token (one-time dance)

The refresh token never expires — you grab it once and store it as a secret. Easiest path:

**Option A — use a helper site like [getyourspotifyrefreshtoken.vercel.app](https://getyourspotifyrefreshtoken.vercel.app)** (paste client id/secret, authorize, copy refresh token).

**Option B — do it manually:**

a. Open this URL in your browser (replace `CLIENT_ID`):
```
https://accounts.spotify.com/authorize?client_id=CLIENT_ID&response_type=code&redirect_uri=http://localhost:8888/callback&scope=user-read-currently-playing%20user-read-recently-played
```
b. Authorize. You'll be redirected to `localhost:8888/callback?code=AUTH_CODE` (the page will fail to load — that's fine, copy `AUTH_CODE` from the URL).

c. Exchange the auth code for a refresh token:
```bash
curl -X POST https://accounts.spotify.com/api/token \
  -u "CLIENT_ID:CLIENT_SECRET" \
  -d "grant_type=authorization_code" \
  -d "code=AUTH_CODE" \
  -d "redirect_uri=http://localhost:8888/callback"
```
Copy the `refresh_token` from the JSON response.

### 3. Add the secrets to GitHub

In the repo: **Settings → Secrets and variables → Actions → New repository secret**. Add all three:

| Name | Value |
|---|---|
| `SPOTIFY_CLIENT_ID` | from step 1 |
| `SPOTIFY_CLIENT_SECRET` | from step 1 |
| `SPOTIFY_REFRESH_TOKEN` | from step 2 |

### 4. Kick off the workflow

Go to **Actions → Refresh Spotify data → Run workflow** to trigger it once manually. After it runs, `data/spotify.json` will be populated and the tile on the site will go live within ~15s of the next page load.

From then on, the workflow runs every 15 minutes automatically.

> If nothing is playing, the tile shows the **last played** track with a "Xh ago" timestamp.

## Wiring up the contact form

The form posts to [Formspree](https://formspree.io) (free tier, 50 submissions/mo).

1. Sign up at [formspree.io](https://formspree.io)
2. Create a new form, pointed at `kvasudevam@gmail.com`
3. Copy the form endpoint (e.g. `https://formspree.io/f/xpzgkbno`)
4. In `index.html`, find the `<form ... action="...">` line and replace `REPLACE_WITH_YOUR_FORMSPREE_ID` with the endpoint.

Until you do this, the form will show *"Form endpoint not configured yet — email me directly."*

## Terminal easter egg

Press **`~`** (or click the terminal icon in the nav) to open the terminal. Commands:

```
help, whoami, ls, cat <section>, contact, github, spotify, resume, date, clear, exit
```

There are a few hidden ones too (`sudo hire-me`, `coffee`, `matrix`, `vim`, …). Use `↑` / `↓` for history.

## License

MIT.
