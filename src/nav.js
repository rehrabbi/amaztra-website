/**
 * Section-by-section scroll navigator + covered handoffs.
 *
 * One scroll moves one section, eased. Every boundary is *covered*: an overlay
 * hides the viewport, the page jumps behind it, then the overlay lifts, so the
 * page never visibly scrolls between sections. Boundaries:
 *
 *   Hero <-> Story                 branded split doors (the AMAZTRA wordmark joins)
 *   Story <-> Ritual <-> Six       plain eased glide, no cover (by request)
 *   Six actives <-> What's Inside  the pouch turns to its other face and flies home
 *   everything else                neutral quick cover
 *
 * Desktop only: below 760px the phone keeps its native scroll, which no takeover
 * can imitate without fighting the OS momentum. Reduced motion opts out entirely.
 *
 * The hero owns the first beat, so it registers a reset here and the navigator
 * calls it when the doors close on the way back up.
 */

const state = {
  lock: false,        // a covered handoff owns the screen; everything else stands down
  heroReset: null,    // re-arms the hero when the doors close on the way back up
  animating: false,
};

export const isNavLocked = () => state.lock;
export const registerHeroReset = (fn) => { state.heroReset = fn; };

const EASE_OUT = 'cubic-bezier(.16,1,.3,1)';
const EASE_IN = 'cubic-bezier(.5,0,.2,1)';
const GRAIN = "url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22140%22 height=%22140%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%222%22 stitchTiles=%22stitch%22/><feColorMatrix type=%22saturate%22 values=%220%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/></svg>')";

/** Branded split doors: two panels slide shut, the page jumps hidden, then they part. */
export function doorHandoff(targetY, onCover) {
  state.lock = true; state.animating = true;
  const wrap = document.createElement('div');
  wrap.style.cssText = 'position:fixed;inset:0;z-index:120;pointer-events:auto;overflow:hidden';

  const mk = (left) => {
    const d = document.createElement('div');
    d.style.cssText = 'position:absolute;top:0;bottom:0;' + (left ? 'left:0' : 'right:0')
      + ';width:50.5%;overflow:hidden;background:radial-gradient(130% 120% at ' + (left ? '100%' : '0%')
      + ' 32%,#241713 0%,#171310 56%,#120f0d 100%);box-shadow:inset 0 0 90px rgba(0,0,0,.55);transform:translateX('
      + (left ? '-100%' : '100%') + ')';
    d.innerHTML =
      '<div style="position:absolute;inset:0;background:linear-gradient(' + (left ? '90deg' : '270deg') + ',rgba(246,227,154,.10),transparent 55%)"></div>'
      + '<div style="position:absolute;inset:0;mix-blend-mode:screen;opacity:.05;background-image:' + GRAIN + '"></div>'
      + '<div style="position:absolute;top:50%;' + (left ? 'right:0' : 'left:0') + ';transform:translate(' + (left ? '50%' : '-50%')
      + ',-50%);font-family:\'Cinzel\',serif;font-weight:700;font-size:clamp(60px,10vw,150px);letter-spacing:.12em;line-height:1;white-space:nowrap;'
      + 'background:linear-gradient(180deg,#F6E39A 0%,#E1BC5C 40%,#C99A34 64%,#A9761B 100%);-webkit-background-clip:text;background-clip:text;color:transparent;'
      + 'filter:drop-shadow(0 4px 18px rgba(201,154,52,.3))">AMAZTRA</div>';
    wrap.appendChild(d);
    return d;
  };
  const l = mk(true), r = mk(false);
  document.body.appendChild(wrap);

  l.animate([{ transform: 'translateX(-100%)' }, { transform: 'translateX(0)' }], { duration: 640, easing: EASE_IN, fill: 'forwards' });
  const close = r.animate([{ transform: 'translateX(100%)' }, { transform: 'translateX(0)' }], { duration: 640, easing: EASE_IN, fill: 'forwards' });
  close.onfinish = () => {
    window.scrollTo(0, targetY);   // jump while fully covered, so no visible scroll
    if (onCover) onCover();
    l.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-100%)' }], { duration: 760, delay: 600, easing: EASE_OUT, fill: 'forwards' });
    const open = r.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(100%)' }], { duration: 760, delay: 600, easing: EASE_OUT, fill: 'forwards' });
    open.onfinish = () => { wrap.remove(); state.lock = false; state.animating = false; };
  };
}

/** Neutral covered jump for boundaries without a themed transition. */
function quickCover(targetY, onCover) {
  state.lock = true; state.animating = true;
  const ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;z-index:120;opacity:0;pointer-events:auto;background:radial-gradient(120% 90% at 50% 0%,#1c1512 0%,#0d0b0a 70%)';
  document.body.appendChild(ov);
  ov.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 440, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' });
  setTimeout(() => { window.scrollTo(0, targetY); if (onCover) onCover(); }, 460);
  setTimeout(() => {
    const o = ov.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 540, easing: EASE_OUT, fill: 'forwards' });
    o.onfinish = () => { ov.remove(); state.lock = false; state.animating = false; };
  }, 580);
}

/** The pouch turns to its other face, then glides to its resting spot in the arriving section. */
function pouchFlipHandoff(targetY, opts) {
  state.lock = true; state.animating = true;
  const wrap = document.createElement('div');
  wrap.style.cssText = 'position:fixed;inset:0;z-index:120;pointer-events:auto;overflow:hidden;perspective:1400px';
  const cover = document.createElement('div');
  cover.style.cssText = 'position:absolute;inset:0;opacity:0;background:' + opts.coverBg;
  const p1 = document.createElement('img'); p1.src = opts.fromImg; p1.alt = '';
  p1.style.cssText = 'position:absolute;left:50%;top:50%;height:64vh;transform:translate(-50%,-50%) rotateY(0deg);transform-origin:center;backface-visibility:hidden;filter:drop-shadow(0 30px 48px rgba(0,0,0,.55));z-index:6';
  const p2 = document.createElement('img'); p2.src = opts.toImg; p2.alt = '';
  p2.style.cssText = 'position:absolute;left:50%;top:50%;height:66vh;transform:translate(-50%,-50%) rotateY(-90deg);transform-origin:center;backface-visibility:hidden;filter:drop-shadow(0 30px 48px rgba(0,0,0,.5));z-index:6';
  wrap.append(cover, p1, p2);
  document.body.appendChild(wrap);

  const srcPouch = opts.srcSel && document.querySelector(opts.srcSel);
  if (srcPouch) srcPouch.style.visibility = 'hidden';

  p1.animate([{ transform: 'translate(-50%,-50%) rotateY(0deg)' }, { transform: 'translate(-50%,-50%) rotateY(90deg)' }], { duration: 520, easing: EASE_IN, fill: 'forwards' });
  cover.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 620, delay: 200, easing: 'ease', fill: 'forwards' });
  setTimeout(() => p1.remove(), 520);
  p2.animate([{ transform: 'translate(-50%,-50%) rotateY(-90deg)' }, { transform: 'translate(-50%,-50%) rotateY(0deg)' }], { duration: 560, delay: 500, easing: EASE_OUT, fill: 'forwards' });

  setTimeout(() => {
    window.scrollTo(0, targetY);
    if (srcPouch) srcPouch.style.visibility = '';
    const dstImg = opts.dstSel && document.querySelector(opts.dstSel);
    const dstHide = document.querySelector(opts.dstHideSel || opts.dstSel);
    if (dstHide) dstHide.style.visibility = 'hidden';   // hide the whole target, badge included
    cover.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 640, easing: EASE_OUT, fill: 'forwards' });

    // fly the flipped pouch from screen centre to wherever it lives in the arriving section
    const from = p2.getBoundingClientRect();
    const to = dstImg ? dstImg.getBoundingClientRect() : from;
    const dx = (to.left + to.width / 2) - (from.left + from.width / 2);
    const dy = (to.top + to.height / 2) - (from.top + from.height / 2);
    const sc = from.height ? to.height / from.height : 1;
    const g = p2.animate([
      { transform: 'translate(-50%,-50%) scale(1)' },
      { transform: 'translate(calc(-50% + ' + dx.toFixed(1) + 'px), calc(-50% + ' + dy.toFixed(1) + 'px)) scale(' + sc.toFixed(3) + ')' },
    ], { duration: 820, easing: 'cubic-bezier(.33,1,.68,1)', fill: 'forwards' });
    g.onfinish = () => {
      if (!dstHide) { wrap.remove(); state.lock = false; state.animating = false; return; }
      dstHide.style.visibility = 'visible';
      const f = dstHide.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 240, easing: 'ease', fill: 'forwards' });
      f.onfinish = () => { wrap.remove(); state.lock = false; state.animating = false; };
    };
  }, 1120);
}

const FLIP = {
  toLabel: {
    coverBg: 'linear-gradient(180deg,#d8c8a8,#c9b791)',
    fromImg: 'assets/img/pouch/1-front-cut.png', toImg: 'assets/img/pouch/back-full.png',
    srcSel: '#orbit-pouch img', dstSel: '#label-open2 img', dstHideSel: '#label-open2',
  },
  toOrbit: {
    coverBg: 'radial-gradient(120% 90% at 82% 8%,#241713 0%,#171310 46%,#120f0d 100%)',
    fromImg: 'assets/img/pouch/back-full.png', toImg: 'assets/img/pouch/1-front-cut.png',
    srcSel: '#label-open2 img', dstSel: '#orbit-pouch img', dstHideSel: '#orbit-pouch',
  },
};

export function initNavigator() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};
  if (window.innerWidth <= 760) return () => {};   // phones keep native scroll

  const heroPin = document.querySelector('.hero-pin');
  const getTargets = () => [...document.querySelectorAll('.fullpage')];
  const yOf = (el) => Math.round(el.getBoundingClientRect().top + window.scrollY);
  const maxY = () => document.documentElement.scrollHeight - window.innerHeight;
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  let cool = 0;
  const glide = (ty, dur) => {
    ty = Math.max(0, Math.min(maxY(), ty));
    const sy = window.scrollY, d = ty - sy;
    if (Math.abs(d) < 2) return;
    state.animating = true;
    const t0 = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - t0) / dur);
      window.scrollTo(0, Math.round(sy + d * easeInOut(t)));
      if (t < 1) requestAnimationFrame(step);
      else { cool = performance.now() + 90; state.animating = false; }
    };
    requestAnimationFrame(step);
  };

  const modalOpen = () => {
    const m = document.getElementById('label-modal');
    return !!m && m.style.display === 'flex';
  };
  // the hero owns its own beat until it hands off
  const inHero = () => {
    if (!heroPin) return false;
    return heroPin.getBoundingClientRect().bottom > window.innerHeight * 0.92;
  };
  const nearestIndex = (targets) => {
    const sy = window.scrollY;
    let bi = 0, bd = Infinity;
    targets.forEach((el, i) => { const d = Math.abs(yOf(el) - sy); if (d < bd) { bd = d; bi = i; } });
    return bi;
  };
  // true while the current section still has unseen content in that direction — the
  // safety valve, so a section taller than the viewport never hides its overflow
  const canNative = (dir, targets, idx) => {
    const el = targets[idx];
    if (!el) return false;
    const top = yOf(el), bottom = top + el.offsetHeight;
    const sy = window.scrollY, vb = sy + window.innerHeight;
    return dir > 0 ? (bottom - vb > 6) : (sy - top > 6);
  };

  const PLAIN = ['story', 'ritual', 'ingredients'];

  const move = (dir) => {
    const targets = getTargets();
    if (!targets.length) return;
    const idx = nearestIndex(targets);
    const ni = idx + dir;
    // back up out of Story: the doors close, the hero re-arms behind them
    if (dir < 0 && ni < 0 && targets[idx] && targets[idx].id === 'story') {
      doorHandoff(0, () => { if (state.heroReset) state.heroReset(); });
      return;
    }
    if (ni < 0) { glide(0, 900); return; }
    if (ni > targets.length - 1) { glide(maxY(), 700); return; }

    const cur = targets[idx], nxt = targets[ni], targetY = yOf(nxt);
    if (cur && nxt && PLAIN.includes(cur.id) && PLAIN.includes(nxt.id)) {
      glide(targetY, Math.min(1050, Math.max(680, Math.abs(targetY - window.scrollY) * 0.72)));
      return;
    }
    if (dir > 0 && cur.id === 'ingredients' && nxt.id === 'whats-inside') { pouchFlipHandoff(targetY, FLIP.toLabel); return; }
    if (dir < 0 && cur.id === 'whats-inside' && nxt.id === 'ingredients') { pouchFlipHandoff(targetY, FLIP.toOrbit); return; }
    quickCover(targetY);
  };

  const onWheel = (e) => {
    if (state.lock || modalOpen() || inHero()) return;
    if (state.animating) { e.preventDefault(); return; }
    if (performance.now() < cool) { e.preventDefault(); return; }
    if (Math.abs(e.deltaY) < 4) return;
    const dir = e.deltaY > 0 ? 1 : -1;
    const targets = getTargets();
    if (canNative(dir, targets, nearestIndex(targets))) return;   // let tall sections scroll through first
    e.preventDefault();
    move(dir);
  };

  const onKey = (e) => {
    if (state.lock || modalOpen() || inHero() || state.animating) return;
    if (['ArrowDown', 'PageDown', ' ', 'Spacebar'].includes(e.key)) { e.preventDefault(); move(1); }
    else if (['ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); move(-1); }
  };

  const onAnchor = (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const el = document.getElementById(a.getAttribute('href').slice(1));
    if (!el) return;
    e.preventDefault();
    glide(yOf(el.closest('.fullpage') || el), 900);
  };

  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('keydown', onKey, { passive: false });
  document.addEventListener('click', onAnchor);
  return () => {
    window.removeEventListener('wheel', onWheel);
    window.removeEventListener('keydown', onKey);
    document.removeEventListener('click', onAnchor);
  };
}
