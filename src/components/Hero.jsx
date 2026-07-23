import { useEffect, useRef } from 'react';
import { doorHandoff, isNavLocked, registerHeroReset } from '../nav.js';

/**
 * Cinematic hero. The hero holds the top of the page and the first scroll is a
 * trigger, not a scrub: one flick (or swipe) plays a single eased tween of the
 * whole scene (each masthead word lifts and fades, the glow/grain parallax, the
 * product duo flies to centre and scales down), then the lifestyle clip plays
 * through once with the page held, and the branded doors close over it and open
 * on Story. Phones get the same beat as desktop, by request. Scrolling back up
 * out of Story closes the doors again and re-arms the hero behind them (desktop
 * only, since that reverse handoff belongs to the scroll navigator). Reduced
 * motion opts out entirely: a normal stacked hero, no hold and no clip. The
 * masthead words are revealed by the intro sliding away; when the intro hands
 * off they play a kinetic rise, then keep a gentle per-word idle drift.
 */
export default function Hero({ introDone }) {
  const pinRef = useRef(null);
  const glowRef = useRef(null);
  const noiseRef = useRef(null);
  const pouchRef = useRef(null);
  const boxRef = useRef(null);
  const dustRef = useRef(null);
  const videoWrapRef = useRef(null);
  const videoRef = useRef(null);
  const wordsRef = useRef([]);
  const cueRef = useRef(null);
  const reduceRef = useRef(false);
  const hpBaseRef = useRef(null);
  const armRef = useRef(null);       // the intro hands off by arming the hero

  const setWord = (i) => (el) => { wordsRef.current[i] = el; };

  // pin-scrub scroll: word scatter + pouch fly-to-centre + parallax (desktop only)
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    reduceRef.current = reduce;
    const clamp01 = (v) => Math.max(0, Math.min(1, v));
    const sm = (v) => v * v * (3 - 2 * v); // smoothstep

    let willChangeOn = false;
    const setWillChange = (on) => {
      if (on === willChangeOn) return;
      willChangeOn = on;
      const val = on ? 'transform,opacity' : 'auto';
      wordsRef.current.forEach((el) => { if (el) el.style.willChange = val; });
      if (pouchRef.current) pouchRef.current.style.willChange = val;
      if (boxRef.current) boxRef.current.style.willChange = val;
    };

    const measure = () => {
      const hp = pouchRef.current;
      if (hp) {
        const prev = hp.style.transform;
        hp.style.transform = 'none';
        const r = hp.getBoundingClientRect();
        hpBaseRef.current = { cx: r.left + r.width / 2, cy: r.top + r.height / 2, w: r.width };
        hp.style.transform = prev;
      }
      // Seat the capsule box in the real gap between the headline and the pouch.
      // The gap only exists on wide viewports; when it's too narrow the box is
      // hidden (CSS) so it never collides with the pouch or buries the headline.
      const bx = boxRef.current, base = hpBaseRef.current;
      if (bx && base) {
        const stage = bx.parentElement;
        const srect = stage.getBoundingClientRect();
        const title = stage.querySelector('.hero-title');
        const tr = title ? title.getBoundingClientRect() : srect;
        const gapL = tr.right - srect.left;               // headline right edge (stage-relative)
        const gapR = (base.cx - base.w / 2) - srect.left; // pouch left edge (stage-relative)
        const gap = gapR - gapL;
        bx.style.removeProperty('width');                 // reset to CSS clamp before measuring
        if (gap >= 150) {
          bx.dataset.fits = '1';
          bx.style.left = (gapL + gap / 2) + 'px';
          if (bx.offsetWidth > gap * 0.94) bx.style.width = Math.round(gap * 0.94) + 'px';
        } else {
          bx.dataset.fits = '0';                          // CSS hides it via [data-fits="0"]
          bx.style.left = '50%';
        }
      }
    };

    // paint the scene at progress p (0 = rest, 1 = scattered with the clip shown)
    const applyProg = (p) => {
      const vh = window.innerHeight || 1, vw = window.innerWidth || 1;
      const n = 4;
      wordsRef.current.forEach((el, i) => {
        if (!el) return;
        const start = (i / (n - 1)) * 0.28;
        const e = sm(clamp01((p - start) / 0.5));
        el.style.transform = 'translateY(' + (-e * 55).toFixed(1) + 'vh)';
        el.style.opacity = (1 - e).toFixed(3);
      });
      if (noiseRef.current) noiseRef.current.style.transform = 'translateY(' + (p * 42).toFixed(1) + 'px)';
      if (glowRef.current) glowRef.current.style.transform = 'translate(-50%,-50%) translateY(' + (p * 64).toFixed(1) + 'px)';

      // capsule box (hero middle): lift + fade out early, clearing the stage
      // before the duo starts flying to centre
      const bx = boxRef.current;
      if (bx) {
        const e = sm(clamp01(p / 0.18));
        bx.style.transform = 'translate(-50%,-50%) translateY(' + (-e * 46).toFixed(1) + 'px)';
        bx.style.opacity = (1 - e).toFixed(3);
      }

      const hp = pouchRef.current, base = hpBaseRef.current;
      if (hp && base) {
        const e = sm(clamp01((p - 0.14) / 0.62));
        const dx = (vw / 2 - base.cx) * e;
        const dy = (vh * 0.06) * e;
        const k = 1 - 0.7 * e;
        hp.style.transform = 'translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px) scale(' + k.toFixed(3) + ')';
        hp.style.opacity = (1 - clamp01((e - 0.72) / 0.28)).toFixed(3);
      }
      if (cueRef.current) cueRef.current.style.opacity = (1 - clamp01(p / 0.12)).toFixed(3);
      if (videoWrapRef.current) videoWrapRef.current.style.opacity = sm(clamp01((p - 0.48) / 0.42)).toFixed(3);
    };

    const rest = () => {
      wordsRef.current.forEach((el) => { if (el) { el.style.transform = 'none'; el.style.opacity = '1'; } });
      if (pouchRef.current) { pouchRef.current.style.transform = 'none'; pouchRef.current.style.opacity = '1'; }
      if (boxRef.current) { boxRef.current.style.transform = 'translate(-50%,-50%)'; boxRef.current.style.opacity = '1'; }
      if (videoWrapRef.current) videoWrapRef.current.style.opacity = '0';
      if (videoRef.current && !videoRef.current.paused) { try { videoRef.current.pause(); } catch { /* ignore */ } }
      if (cueRef.current) cueRef.current.style.opacity = '1';
      setWillChange(false);
    };

    // reduced motion: a plain stacked hero that scrolls natively, no hold, no clip
    if (reduce) {
      rest(); measure();
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }

    let triggered = false, playing = false, done = false, armed = false;
    let gateTimer = 0;
    // armed by the intro hand-off, so a stray scroll as the hero appears can't fire the scene
    armRef.current = () => { setTimeout(() => { armed = true; }, 1000); };
    // sine in-out: peaks at ~1.57x average velocity where cubic peaks at 2x, so the
    // middle of the travel stays calm instead of lurching
    const easeInOut = (t) => -(Math.cos(Math.PI * t) - 1) / 2;
    const keepTop = () => { if (!done) window.scrollTo(0, 0); };

    // the clip has played out: the doors close over the hero and open on Story
    const release = () => {
      playing = false; done = true;
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('scroll', keepTop);
      clearTimeout(gateTimer);
      const first = document.querySelector('.fullpage');
      const targetY = first ? Math.round(first.getBoundingClientRect().top + window.scrollY) : window.innerHeight;
      doorHandoff(targetY, () => {
        rest();
        const vw = videoWrapRef.current;
        if (vw) { vw.getAnimations().forEach((a) => a.cancel()); vw.style.opacity = '0'; }
      });
    };

    const startVideoGate = () => {
      if (playing) return;
      playing = true;
      const vid = videoRef.current;
      if (!vid) { release(); return; }
      vid.loop = false;
      const fin = () => { vid.removeEventListener('ended', fin); release(); };
      vid.addEventListener('ended', fin);
      try { vid.currentTime = 0; } catch { /* ignore */ }
      const pr = vid.play();
      if (pr && pr.catch) pr.catch(() => { vid.removeEventListener('ended', fin); release(); });
      // safety: never trap the user if 'ended' never lands
      gateTimer = setTimeout(() => { if (playing) { vid.removeEventListener('ended', fin); release(); } }, ((vid.duration || 6) * 1000) + 1600);
    };

    // one scroll fires this: a single eased tween of the whole scene, then the clip
    const runTween = () => {
      if (triggered || !armed) return;
      triggered = true;
      setWillChange(true);
      const DUR = 1900, t0 = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - t0) / DUR);
        applyProg(easeInOut(t));
        if (t < 1) requestAnimationFrame(step); else startVideoGate();
      };
      requestAnimationFrame(step);
    };

    function onWheel(e) {
      if (isNavLocked()) { e.preventDefault(); return; }
      if (done) return;
      e.preventDefault();            // stay put — the page never moves under the hero
      if (e.deltaY > 2) runTween();
    }
    function onKey(e) {
      if (isNavLocked() || done) return;
      if (!['ArrowDown', 'PageDown', ' ', 'Spacebar', 'Enter', 'ArrowUp', 'PageUp'].includes(e.key)) return;
      e.preventDefault();
      if (e.key !== 'ArrowUp' && e.key !== 'PageUp') runTween();
    }
    let ty0 = null;
    const onTouchStart = (e) => { ty0 = e.touches[0].clientY; };
    function onTouchMove(e) {
      if (isNavLocked()) { e.preventDefault(); return; }
      if (done) return;
      e.preventDefault();
      if (ty0 != null && ty0 - e.touches[0].clientY > 8) runTween();
    }

    const onResize = () => { measure(); if (!triggered) rest(); };
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKey, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('scroll', keepTop, { passive: true });
    window.addEventListener('resize', onResize);
    measure(); rest();

    // the reverse door handoff calls this to hand the first beat back to the hero
    registerHeroReset(() => {
      triggered = false; playing = false; done = false; armed = true;
      window.addEventListener('wheel', onWheel, { passive: false });
      window.addEventListener('keydown', onKey, { passive: false });
      window.addEventListener('touchmove', onTouchMove, { passive: false });
      window.addEventListener('scroll', keepTop, { passive: true });
      measure(); rest();
    });

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('scroll', keepTop);
      window.removeEventListener('resize', onResize);
      clearTimeout(gateTimer);
      registerHeroReset(null);
    };
  }, []);

  // rising gold-dust motes (ambient); spawn once
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const host = dustRef.current;
    if (!host || host.childElementCount) return;
    for (let i = 0; i < 24; i++) {
      const s = document.createElement('span');
      const sz = 2 + Math.random() * 3.5;
      s.style.cssText = 'position:absolute;bottom:' + (Math.random() * 45) + '%;left:' + (Math.random() * 100) + '%;width:' + sz.toFixed(1) + 'px;height:' + sz.toFixed(1) + 'px;border-radius:50%;background:radial-gradient(circle,rgba(246,227,154,.95),rgba(201,154,52,.15));box-shadow:0 0 6px rgba(246,227,154,.5);--dx:' + (Math.random() * 60 - 30).toFixed(0) + 'px;animation:hero-dust ' + (6 + Math.random() * 7).toFixed(1) + 's ease-in-out ' + (Math.random() * 6).toFixed(1) + 's infinite;';
      host.appendChild(s);
    }
  }, []);

  // kinetic-rise entrance on the masthead words, played when the intro hands off
  useEffect(() => {
    if (!introDone) return;
    if (armRef.current) armRef.current();   // only now can a scroll fire the scene
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    wordsRef.current.forEach((el, i) => {
      if (!el) return;
      el.animate(
        [
          { transform: 'translateY(118%)', opacity: 0 },
          { transform: 'translateY(-7%)', opacity: 1, offset: 0.68 },
          { transform: 'translateY(0)', opacity: 1 },
        ],
        { duration: 1050, delay: 130 + i * 140, easing: 'cubic-bezier(.2,1.05,.3,1)', fill: 'backwards' });
    });
  }, [introDone]);

  return (
    <div ref={pinRef} className="hero-pin" style={{ position: 'relative' }}>
      <section
        id="top"
        className="hero-sticky"
        style={{
          minHeight: '100svh', display: 'flex', flexDirection: 'column',
          justifyContent: 'flex-start', padding: 'clamp(12px,2vh,22px) clamp(20px,5vw,46px) 40px',
          overflow: 'hidden',
          background: '#141210',
        }}
      >
        {/* scroll-revealed lifestyle video — fades in as the masthead + pouch clear, then plays */}
        <div ref={videoWrapRef} aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0, pointerEvents: 'none' }}>
          <video ref={videoRef} src="assets/video/ritual-hd.mp4" poster="assets/video/ritual-hd-poster.jpg"
            muted playsInline preload="auto" tabIndex={-1}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          <span style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(18,15,13,.72) 0%,rgba(18,15,13,.34) 32%,rgba(18,15,13,.42) 72%,rgba(18,15,13,.8) 100%)' }} />
        </div>

        {/* parallax red glow */}
        <span aria-hidden="true" ref={glowRef} className="hero-glow" style={{
          position: 'absolute', left: '50%', top: '50%', width: '58vmin', height: '58vmin',
          transform: 'translate(-50%,-50%)', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(193,26,34,.26), transparent 62%)',
          filter: 'blur(26px)', pointerEvents: 'none', zIndex: 0,
          animation: 'glow-pulse 5.5s ease-in-out infinite',
        }} />

        {/* rising gold-dust field */}
        <div id="hero-dust" ref={dustRef} aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }} />

        {/* floating wordmark (gold, with one-off sheen sweep) */}
        <div className="wordmark" style={{
          position: 'relative', zIndex: 1, textAlign: 'center', width: '100%',
          fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 'clamp(40px,5.4vw,74px)',
          letterSpacing: '.14em',
          background: 'linear-gradient(180deg,#F6E39A 0%,#E1BC5C 38%,#C99A34 62%,#A9761B 100%)',
          WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
        }}>AMAZTRA</div>

        <span aria-hidden="true" ref={noiseRef} className="am-noise" style={{ opacity: 0.05 }} />

        {/* masthead + product */}
        <div className="hero-stage" style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'clamp(8px,1.5vw,32px)', width: '100%', maxWidth: '1180px', margin: '12px auto 0' }}>
          <h1 className="hero-title" style={{
            position: 'relative', zIndex: 2, flex: '0 0 auto',
            margin: 0, textAlign: 'right', fontFamily: "'Anton',sans-serif", fontWeight: 400, textTransform: 'uppercase',
            lineHeight: 0.82, letterSpacing: '-.015em', fontSize: 'clamp(72px,12vw,190px)', color: '#EDE4D3',
            pointerEvents: 'none',
          }}>
            <span ref={setWord(0)} data-hword style={{ display: 'block' }}><span className="hw-i" style={{ display: 'inline-block', animation: 'hw-drift 6s ease-in-out -1.5s infinite' }}>Beauty</span></span>
            <span className="hero-row" style={{ display: 'flex', gap: '.22em' }}>
              <span ref={setWord(1)} data-hword style={{ display: 'inline-block', color: '#E23A34', animation: 'red-shimmer 4.2s ease-in-out infinite' }}><span className="hw-i" style={{ display: 'inline-block', animation: 'hw-drift2 5.4s ease-in-out -.6s infinite' }}>you</span></span>
              <span ref={setWord(2)} data-hword style={{ display: 'inline-block', color: '#E23A34', animation: 'red-shimmer 4.2s ease-in-out .6s infinite' }}><span className="hw-i" style={{ display: 'inline-block', animation: 'hw-drift 5.8s ease-in-out -2.3s infinite' }}>can</span></span>
            </span>
            <span ref={setWord(3)} data-hword style={{ display: 'block', whiteSpace: 'nowrap', fontSize: '.54em', letterSpacing: '.005em', animation: 'wm-glow 4s ease-in-out 1.1s infinite' }}>
              <span className="ih-gold" style={{ display: 'inline-block', animation: 'ih-sheen 5s linear infinite, hw-drift 6.2s ease-in-out -.4s infinite' }}>brew</span>{' '}
              <span className="ih-gold" style={{ display: 'inline-block', animation: 'ih-sheen 5s linear infinite, hw-drift2 5.6s ease-in-out -1.8s infinite' }}>and</span>{' '}
              <span className="ih-gold" style={{ display: 'inline-block', animation: 'ih-sheen 5s linear infinite, hw-drift 5.9s ease-in-out -2.6s infinite' }}>take</span>
            </span>
          </h1>

          {/* product stage — static AMAZTRA box + pouch duo; floats gently and flies into the orbit on scroll */}
          {/* in-flow beside the headline; width capped by height so the pair never clips */}
          <div ref={pouchRef} className="hero-pouch" style={{
            position: 'relative', flex: '0 0 auto', zIndex: 3,
            width: 'min(clamp(340px,42vw,580px), calc(72svh * 1.35))',
          }}>
            <div className="spin-stack" style={{ position: 'relative', width: '100%', aspectRatio: '1.35 / 1' }}>
              <span aria-hidden="true" style={{ position: 'absolute', inset: '8% 6% 6%', borderRadius: '50%', background: 'radial-gradient(circle at 50% 48%, rgba(226,58,52,.4), rgba(193,26,34,.12) 46%, transparent 68%)', filter: 'blur(44px)', pointerEvents: 'none' }} />
              {/* box — behind, left; drifts on its own path */}
              <img className="hp-float" src="assets/img/amaztra-box.png" alt="AMAZTRA box, glutathione and collagen food supplement" draggable={false}
                style={{ position: 'absolute', left: '8%', bottom: 0, width: '42%', objectFit: 'contain', filter: 'drop-shadow(0 34px 52px rgba(0,0,0,.7))', userSelect: 'none', WebkitUserDrag: 'none', zIndex: 3, animation: 'am-float 8.5s ease-in-out infinite' }} />
              {/* pouch — in front, right; a slower, different drift so it never looks stuck to the box */}
              <img className="hp-float" src="assets/img/pouch/clean-front.png" alt="AMAZTRA instant coffee pouch" draggable={false}
                style={{ position: 'absolute', right: '2%', bottom: 0, width: '74%', objectFit: 'contain', filter: 'brightness(.9) drop-shadow(0 18px 40px rgba(0,0,0,.5))', userSelect: 'none', WebkitUserDrag: 'none', zIndex: 1, animation: 'am-float2 11s ease-in-out -2.5s infinite' }} />
            </div>
          </div>
        </div>

      </section>
    </div>
  );
}
