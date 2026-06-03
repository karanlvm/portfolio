/* ===========================================================
   NAV — scrolled state, scroll-top, mobile menu
   =========================================================== */
const navHeader = document.getElementById('nav-header');
const scrollTop = document.getElementById('scroll-top');
const navToggle = document.getElementById('nav-toggle');
const navLinks  = document.getElementById('nav-links');

window.addEventListener('scroll', () => {
  navHeader.classList.toggle('scrolled', window.scrollY > 30);
  scrollTop.classList.toggle('show', window.scrollY > 500);
}, { passive: true });

navToggle?.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  navToggle.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
});
navLinks?.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ===========================================================
   FOOTER YEAR + LOCAL TIME + MASTHEAD TIMESTAMP
   =========================================================== */
const yearEl     = document.getElementById('footer-year');
const timeEl     = document.getElementById('status-time');
const mastheadEl = document.getElementById('masthead-time');

function update() {
  const now = new Date();
  if (yearEl) yearEl.textContent = now.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  if (timeEl) {
    const t = now.toLocaleTimeString('en-US', {
      timeZone: 'America/Chicago',
      hour: 'numeric', minute: '2-digit', hour12: true,
    });
    timeEl.textContent = `${t} CT`;
  }

  if (mastheadEl) {
    const d = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    mastheadEl.textContent = d.toLowerCase();
  }
}
update();
setInterval(update, 30_000);

/* ===========================================================
   SPOTIFY — refreshed by GitHub Actions to data/spotify.json
   =========================================================== */
async function loadSpotify() {
  const tile     = document.getElementById('spotify-tile');
  const dot      = document.getElementById('spotify-dot');
  const stateEl  = document.getElementById('spotify-state');
  const cover    = document.getElementById('spotify-cover');
  const trackEl  = document.getElementById('spotify-track');
  const artistEl = document.getElementById('spotify-artist');
  if (!tile) return;

  try {
    const res = await fetch('data/spotify.json?ts=' + Date.now(), { cache: 'no-store' });
    if (!res.ok) throw new Error('no data');
    const d = await res.json();

    if (!d.track) {
      stateEl.textContent  = 'Nothing recent';
      trackEl.textContent  = '— silence —';
      artistEl.textContent = 'probably reading.';
      return;
    }

    if (d.isPlaying) {
      stateEl.textContent = 'Now playing';
      dot?.classList.add('dot--live');
      tile.classList.add('is-live');
    } else {
      stateEl.textContent = d.playedAt
        ? 'Last played · ' + timeAgo(d.playedAt)
        : 'Last played';
    }

    trackEl.textContent = d.track;
    trackEl.href        = d.url || '#';
    artistEl.textContent = d.artist + (d.album ? ' — ' + d.album : '');
    if (d.albumArt && cover) cover.src = d.albumArt;

  } catch (e) {
    stateEl.textContent  = 'Spotify offline';
    trackEl.textContent  = 'No data yet';
    artistEl.textContent = 'see README.';
  }
}
loadSpotify();

function timeAgo(iso) {
  const sec = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (sec < 60)   return sec + 's ago';
  const m = Math.floor(sec / 60);
  if (m < 60)     return m + 'm ago';
  const h = Math.floor(m / 60);
  if (h < 24)     return h + 'h ago';
  const d = Math.floor(h / 24);
  if (d < 30)     return d + 'd ago';
  return new Date(iso).toLocaleDateString();
}

/* ===========================================================
   GITHUB — public API
   =========================================================== */
async function loadGitHub() {
  const reposEl     = document.getElementById('gh-repos');
  const followersEl = document.getElementById('gh-followers');
  const starsEl     = document.getElementById('gh-stars');
  const recentEl    = document.getElementById('gh-recent');
  if (!reposEl) return;

  try {
    const [userRes, reposRes] = await Promise.all([
      fetch('https://api.github.com/users/karanlvm'),
      fetch('https://api.github.com/users/karanlvm/repos?sort=pushed&per_page=6&type=owner'),
    ]);
    if (!userRes.ok || !reposRes.ok) throw new Error('gh');
    const user  = await userRes.json();
    const repos = await reposRes.json();

    reposEl.textContent     = user.public_repos ?? '—';
    followersEl.textContent = user.followers   ?? '—';
    const totalStars = repos.reduce((a, r) => a + (r.stargazers_count || 0), 0);
    starsEl.textContent = totalStars;

    recentEl.innerHTML = '';
    repos.filter(r => !r.fork).slice(0, 3).forEach(r => {
      const li = document.createElement('li');
      li.className = 'gh-recent__item';
      li.innerHTML = `
        <a href="${r.html_url}" target="_blank" rel="noopener">${escapeHtml(r.name)}</a>
        <span class="gh-recent__item-lang">${r.language || '—'}</span>
      `;
      recentEl.appendChild(li);
    });
    if (!recentEl.children.length) {
      recentEl.innerHTML = '<li class="gh-recent__item gh-recent__item--placeholder">no recent activity</li>';
    }
  } catch (e) {
    reposEl.textContent     = '–';
    followersEl.textContent = '–';
    starsEl.textContent     = '–';
    recentEl.innerHTML = '<li class="gh-recent__item gh-recent__item--placeholder">github offline</li>';
  }
}
loadGitHub();

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, m => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[m]));
}

/* ===========================================================
   REVEAL ON SCROLL
   =========================================================== */
const srEls = document.querySelectorAll(
  '.section-mark, .lede, .essay__main p, .margin__block, .work, .cv__row, .colophon__block'
);
const srObs = new IntersectionObserver((entries, obs) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => {
        e.target.style.opacity   = '1';
        e.target.style.transform = 'translateY(0)';
      }, Math.min(i, 6) * 60);
      obs.unobserve(e.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

srEls.forEach(el => {
  el.style.opacity   = '0';
  el.style.transform = 'translateY(14px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  srObs.observe(el);
});

/* ===========================================================
   TERMINAL
   =========================================================== */
const term      = document.getElementById('terminal');
const termInput = document.getElementById('terminal-input');
const termOut   = document.getElementById('terminal-out');
const termClose = document.getElementById('term-close');
const termBtn   = document.getElementById('nav-term-btn');

let termOpen = false;
let history  = [];
let histIdx  = -1;

function openTerm() {
  term.hidden = false;
  requestAnimationFrame(() => term.classList.add('open'));
  termOpen = true;
  setTimeout(() => termInput.focus(), 50);
  if (!termOut.children.length) printBanner();
}
function closeTerm() {
  term.classList.remove('open');
  termOpen = false;
  setTimeout(() => { term.hidden = true; }, 200);
}

window.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' && e.target !== termInput) return;
  if (e.target.tagName === 'TEXTAREA') return;
  if (!termOpen && (e.key === '`' || e.key === '~')) {
    e.preventDefault();
    openTerm();
  } else if (termOpen && e.key === 'Escape') {
    closeTerm();
  }
});
termClose?.addEventListener('click', closeTerm);
termBtn?.addEventListener('click', (e) => { e.preventDefault(); openTerm(); });
term?.addEventListener('click', (e) => { if (e.target === term) closeTerm(); });

function printBanner() {
  print(`<span class="accent">karan's portfolio · twilight edition</span>
type <span class="cmd">help</span> for commands · <span class="muted">esc to close</span>
`);
}
function print(html) {
  const div = document.createElement('div');
  div.className = 'line';
  div.innerHTML = html;
  termOut.appendChild(div);
  termOut.parentElement.scrollTop = termOut.parentElement.scrollHeight;
}
function printCmd(cmd) {
  print(`<span class="cmd">karan@portfolio:~$</span> ${escapeHtml(cmd)}`);
}

const COMMANDS = {
  help: () =>
`<span class="accent">available commands</span>
  <span class="cmd">help</span>      this menu
  <span class="cmd">whoami</span>    about me
  <span class="cmd">ls</span>        list sections
  <span class="cmd">cat &lt;s&gt;</span>   show a section (about | work | path | now)
  <span class="cmd">contact</span>   how to reach me
  <span class="cmd">github</span>    open github
  <span class="cmd">spotify</span>   open spotify
  <span class="cmd">resume</span>    download résumé
  <span class="cmd">date</span>      current time
  <span class="cmd">clear</span>     clear terminal
  <span class="cmd">exit</span>      close terminal

<span class="muted">there are easter eggs. try 'sudo hire-me'.</span>`,

  whoami: () =>
`<span class="accent">karan vasudevamurthy</span>
software engineer @ iTradeNetwork
m.s. computer science · ut arlington
ml × security`,

  ls: () => `<span class="accent">about/   work/   path/   now/   contact/</span>`,

  cat: (args) => {
    const s = (args || '').trim().toLowerCase().replace(/\/$/, '');
    switch (s) {
      case 'about': case 'about.md':
        return `software engineer with an m.s. in cs from ut arlington (gpa 3.83).
interests live where ml and security fold over each other.
currently building software for the food &amp; beverage supply chain
at iTradeNetwork. it's pronounced <span class="accent">kah-rahn</span>.`;
      case 'work': case 'projects':
        return `<span class="accent">01</span>  pyward         security-aware python linter
<span class="accent">02</span>  forgeos        small os kernel, c++
<span class="accent">03</span>  localgpt       local llm inference + rag
<span class="accent">04</span>  sentiment      bert vs lstm · published paper
<span class="accent">05</span>  dirtypipe      cve-2022-0847 walkthrough
<span class="accent">06</span>  musiqi         music streaming, vite + react

<span class="muted">→ github.com/karanlvm</span>`;
      case 'path': case 'experience': case 'exp':
        return `<span class="accent">2026 — now</span>     swe @ iTradeNetwork
<span class="accent">2025 – 2026</span>    research assistant · cyber guard lab, uta
<span class="accent">2024 – 2025</span>    graduate ta · information security, uta
<span class="accent">2023 – 2025</span>    m.s. computer science · ut arlington
<span class="accent">2021 – 2022</span>    applied ml intern · visteon
<span class="accent">2019 – 2023</span>    b.e. cse · dayananda sagar college`;
      case 'now': case 'now.md':
        return `currently  building software at iTradeNetwork
listening  check the margin on the about page
reading    designing data-intensive applications
location   texas, us`;
      default:
        return `<span class="err">cat: ${escapeHtml(s) || '(no file)'}: no such section</span>
try: <span class="cmd">cat about</span>, <span class="cmd">cat work</span>, <span class="cmd">cat path</span>, <span class="cmd">cat now</span>`;
    }
  },

  contact: () =>
`email     <a href="mailto:kvasudevam@gmail.com">kvasudevam@gmail.com</a>
linkedin  <a href="https://www.linkedin.com/in/karanlvm/" target="_blank">linkedin.com/in/karanlvm</a>
github    <a href="https://github.com/karanlvm" target="_blank">github.com/karanlvm</a>`,

  github:  () => { window.open('https://github.com/karanlvm', '_blank'); return 'opening github…'; },
  spotify: () => { window.open('https://open.spotify.com/user/karanlvm', '_blank'); return 'opening spotify…'; },
  linkedin:() => { window.open('https://www.linkedin.com/in/karanlvm/', '_blank'); return 'opening linkedin…'; },
  resume:  () => { window.open('assets/resume.pdf', '_blank'); return 'opening résumé…'; },
  date:    () => new Date().toString(),
  clear:   () => '__clear__',
  exit:    () => '__exit__',

  /* easter eggs */
  'sudo hire-me': () =>
`<span class="accent">[sudo] password for recruiter:</span> ********
permission granted ✓
dispatching application to <a href="mailto:kvasudevam@gmail.com">kvasudevam@gmail.com</a>
(jk — but seriously, email me.)`,
  coffee: () => `☕  brewing... done. enjoy.`,
  matrix: () => `wake up, neo...
the matrix has you...
follow the white rabbit. 🐇`,
  hello:  () => `hello there 👋`,
  hi:     () => `hi! try <span class="cmd">help</span>.`,
  sudo:   (a) => COMMANDS[`sudo ${a}`] ? COMMANDS[`sudo ${a}`]() : `<span class="err">sudo: ${escapeHtml(a||'')}: command not found</span>`,
  rm:     () => `<span class="err">rm: nice try.</span>`,
  'rm -rf /': () => `<span class="err">rm: refusing to delete the universe.</span>`,
  vim:    () => `you'll never escape vim. (try :q)`,
  ':q':   () => `you escaped vim. legendary.`,
  echo:   (a) => escapeHtml(a || ''),
  about:  () => COMMANDS.cat('about'),
  work:   () => COMMANDS.cat('work'),
  path:   () => COMMANDS.cat('path'),
  now:    () => COMMANDS.cat('now'),
};

function run(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return;
  history.unshift(trimmed); histIdx = -1;
  printCmd(trimmed);

  const lower = trimmed.toLowerCase();
  if (COMMANDS[lower]) return handle(COMMANDS[lower]());
  const [cmd, ...rest] = lower.split(/\s+/);
  if (COMMANDS[cmd])   return handle(COMMANDS[cmd](rest.join(' ')));
  print(`<span class="err">command not found: ${escapeHtml(cmd)}</span> — try <span class="cmd">help</span>`);
}
function handle(out) {
  if (out === '__clear__') { termOut.innerHTML = ''; return; }
  if (out === '__exit__')  { closeTerm(); return; }
  if (out) print(out);
}

termInput?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    run(termInput.value);
    termInput.value = '';
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (histIdx + 1 < history.length) { histIdx++; termInput.value = history[histIdx]; }
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (histIdx > 0) { histIdx--; termInput.value = history[histIdx]; }
    else             { histIdx = -1; termInput.value = ''; }
  } else if (e.key === 'l' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    termOut.innerHTML = '';
  }
});

/* ===========================================================
   CURSOR FOLLOWER  (additive, hidden on touch)
   =========================================================== */
(function () {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  if (!window.matchMedia('(hover: hover)').matches)   return;

  const dot = document.createElement('div');
  dot.className = 'cursor-dot';
  dot.setAttribute('aria-hidden', 'true');
  document.body.appendChild(dot);

  let tx = window.innerWidth / 2;
  let ty = window.innerHeight / 2;
  let cx = tx, cy = ty;
  let shown = false;

  window.addEventListener('mousemove', (e) => {
    tx = e.clientX;
    ty = e.clientY;
    if (!shown) { cx = tx; cy = ty; shown = true; dot.style.opacity = ''; }
  });
  window.addEventListener('mouseleave', () => { dot.style.opacity = '0'; });
  window.addEventListener('mouseenter', () => { dot.style.opacity = ''; });

  function tick() {
    cx += (tx - cx) * 0.22;
    cy += (ty - cy) * 0.22;
    dot.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
    requestAnimationFrame(tick);
  }
  tick();

  // Hover state on interactive elements
  const HOVER_SEL = 'a, button, [role="button"], summary, .work, .fn-ref, kbd, .pill, label';
  const TEXT_SEL  = 'input, textarea, [contenteditable="true"]';

  document.addEventListener('mouseover', (e) => {
    const t = e.target;
    if (t.closest(TEXT_SEL))      dot.classList.add('is-text');
    else if (t.closest(HOVER_SEL)) dot.classList.add('is-hover');
  });
  document.addEventListener('mouseout', (e) => {
    const t = e.target;
    if (t.closest(TEXT_SEL))      dot.classList.remove('is-text');
    if (t.closest(HOVER_SEL))     dot.classList.remove('is-hover');
  });
})();

/* console message */
console.log('%c— Karan Vasudevamurthy —', 'color:#d4a017;font-size:18px;font-style:italic;font-family:Georgia,serif');
console.log('%cPress ~ for a terminal.', 'color:#b8aea0;font-family:monospace');
