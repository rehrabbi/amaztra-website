import { useEffect, useRef } from 'react';

/**
 * Cinematic hero. On desktop the section is pinned (via a 170vh wrapper) and the
 * scroll scrubs a scene: each masthead word lifts and fades, the glow/grain
 * parallax, and the product pouch flies to the viewport centre + scales down to
 * hand off to the ingredients orbit. On mobile / reduced-motion it's a normal
 * stacked hero with no pin. The masthead words are just revealed by the intro
 * sliding away. When the intro hands off, the words play a kinetic rise; each
 * word then keeps a gentle per-word idle drift.
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
  const reduceRef = useRef(false);
  const hpBaseRef = useRef(null);
  const pinActiveRef = useRef(false);
  const playedRef = useRef(false);   // hero clip has played through once
  const lockedRef = useRef(false);   // scroll is gated while the clip plays
  const lockYRef = useRef(0);
  const glidingRef = useRef(false);  // programmatic glide owns the scroll position
  const glideRafRef = useRef(0);

  const setWord = (i) => (el) => { wordsRef.current[i] = el; };

  // pin-scrub scroll: word scatter + pouch fly-to-centre + parallax (desktop only)
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    reduceRef.current = reduce;
    const clamp01 = (v) => Math.max(0, Math.min(1, v));
    const sm = (v) => v * v * (3 - 2 * v); // smoothstep

    const setWillChange = (on) => {
      // never drop the layers mid-glide: the teardown lands as a hitch
      if (!on && (lockedRef.current || glidingRef.current)) return;
      if (on === pinActiveRef.current) return;
      pinActiveRef.current = on;
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

    const rest = () => {
      wordsRef.current.forEach((el) => { if (el) { el.style.transform = 'none'; el.style.opacity = '1'; } });
      if (pouchRef.current) { pouchRef.current.style.transform = 'none'; pouchRef.current.style.opacity = '1'; }
      if (boxRef.current) { boxRef.current.style.transform = 'translate(-50%,-50%)'; boxRef.current.style.opacity = '1'; }
      if (videoWrapRef.current) videoWrapRef.current.style.opacity = '0';
      if (videoRef.current && !videoRef.current.paused) videoRef.current.pause();
      setWillChange(false);
    };

    // --- scroll gate: hold the page while the hero clip plays once, then glide to the next
    // section. Fires once per load, only on desktop where the pin-scrub runs. ---
    const scrollKeys = new Set(['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' ', 'Spacebar']);
    // While gliding, real input means the user wants control back: stop and hand it over
    // rather than letting native scroll and scrollTo fight for the same frame.
    const blockWheel = (e) => { if (glidingRef.current) { endGlide(); return; } e.preventDefault(); };
    const blockKeys = (e) => {
      if (!scrollKeys.has(e.key)) return;
      if (glidingRef.current) { endGlide(); return; }
      e.preventDefault();
    };
    const snapBack = () => { if (glidingRef.current) return; window.scrollTo(0, lockYRef.current); };
    // sine in-out: peaks at ~1.57x average velocity where cubic peaks at 2x, so the
    // middle of the travel stays calm instead of lurching
    const easeInOut = (t) => -(Math.cos(Math.PI * t) - 1) / 2;
    let gateTimer = 0;

    const endGlide = () => {
      if (glideRafRef.current) cancelAnimationFrame(glideRafRef.current);
      glideRafRef.current = 0;
      glidingRef.current = false;
      releaseLock();
    };

    const glideTo = (targetY, duration) => {
      const startY = window.scrollY, dist = targetY - startY, t0 = performance.now();
      glidingRef.current = true;
      const stepFn = (now) => {
        const t = Math.min(1, (now - t0) / duration);
        window.scrollTo(0, startY + dist * easeInOut(t));
        compute();  // track the hero scrub in this frame instead of a frame behind
        if (t < 1) { glideRafRef.current = requestAnimationFrame(stepFn); return; }
        endGlide();
      };
      glideRafRef.current = requestAnimationFrame(stepFn);
    };
    const releaseLock = () => {
      window.removeEventListener('wheel', blockWheel);
      window.removeEventListener('touchmove', blockWheel);
      window.removeEventListener('keydown', blockKeys);
      window.removeEventListener('scroll', snapBack);
      lockedRef.current = false;
    };
    const finishGate = () => {
      if (playedRef.current) return;
      playedRef.current = true;
      clearTimeout(gateTimer);
      const vid = videoRef.current;
      if (vid) vid.removeEventListener('ended', finishGate);
      const ing = document.getElementById('ingredients');
      const targetY = ing ? (ing.getBoundingClientRect().top + window.scrollY) : (window.scrollY + window.innerHeight);
      // Hold the gate through the glide and release it at the end (endGlide). Dropping the
      // lock first let leftover wheel/trackpad momentum fight scrollTo every frame.
      const dur = Math.min(2400, Math.max(1400, Math.abs(targetY - window.scrollY) * 1.35));
      glideTo(targetY, dur); // smooth, natural settle into the next section
    };
    const startGate = () => {
      if (playedRef.current || lockedRef.current) return;
      lockedRef.current = true;
      lockYRef.current = window.scrollY;
      if (videoWrapRef.current) videoWrapRef.current.style.opacity = '1';
      window.addEventListener('wheel', blockWheel, { passive: false });
      window.addEventListener('touchmove', blockWheel, { passive: false });
      window.addEventListener('keydown', blockKeys, { passive: false });
      window.addEventListener('scroll', snapBack, { passive: false });
      const vid = videoRef.current;
      if (vid) {
        vid.loop = false;
        vid.addEventListener('ended', finishGate);
        try { vid.currentTime = 0; } catch { /* ignore */ }
        const pr = vid.play(); if (pr && pr.catch) pr.catch(() => finishGate());
        gateTimer = setTimeout(finishGate, ((vid.duration || 5) * 1000) + 1500); // safety: never trap the user
      } else { finishGate(); }
    };

    let queued = false;
    const compute = () => {
      queued = false;
      const vh = window.innerHeight || 1;
      const vw = window.innerWidth || 1;

      // no pin/scrub on mobile or reduced motion — normal stacked hero
      if (reduce || vw <= 760) { rest(); return; }

      const wrap = pinRef.current;
      let p = 0;
      if (wrap) {
        const rect = wrap.getBoundingClientRect();
        const total = Math.max(1, wrap.offsetHeight - vh);
        p = clamp01(-rect.top / total);
      }
      setWillChange(p > 0.001 && p < 0.999);

      const n = 4;
      wordsRef.current.forEach((el, i) => {
        if (!el) return;
        const start = (i / (n - 1)) * 0.32;
        const local = clamp01((p - start) / 0.5);
        const e = sm(local);
        el.style.transform = 'translateY(' + (-e * 55).toFixed(1) + 'vh)';
        el.style.opacity = (1 - e).toFixed(3);
      });

      if (noiseRef.current) noiseRef.current.style.transform = 'translateY(' + (p * 42).toFixed(1) + 'px)';
      if (glowRef.current) glowRef.current.style.transform = 'translate(-50%,-50%) translateY(' + (p * 64).toFixed(1) + 'px)';

      // capsule box (hero middle): lift + fade out early, clearing the stage
      // before the pouch starts flying to centre at p ~ 0.22
      const bx = boxRef.current;
      if (bx) {
        const e = sm(clamp01(p / 0.18));
        bx.style.transform = 'translate(-50%,-50%) translateY(' + (-e * 46).toFixed(1) + 'px)';
        bx.style.opacity = (1 - e).toFixed(3);
      }

      const hp = pouchRef.current;
      const base = hpBaseRef.current;
      if (hp && base) {
        const e = sm(clamp01((p - 0.22) / 0.62));
        const dx = (vw / 2 - base.cx) * e;
        const dy = (vh * 0.06) * e;
        const k = 1 - 0.7 * e;
        hp.style.transform = 'translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px) scale(' + k.toFixed(3) + ')';
        hp.style.opacity = (1 - clamp01((e - 0.72) / 0.28)).toFixed(3);
      }

      // lifestyle video reveal — cross-fades in as the words + pouch clear; once it is full,
      // the scroll gate takes over (plays the clip through once, then glides to the next section)
      const vidWrap = videoWrapRef.current;
      if (vidWrap && !lockedRef.current) {
        vidWrap.style.opacity = sm(clamp01((p - 0.5) / 0.32)).toFixed(3);
        if (!playedRef.current && p > 0.82) startGate();
      }
    };

    // rAF-throttle so getBoundingClientRect runs at most once per frame
    const onScroll = () => {
      if (glidingRef.current || queued) return;  // the glide calls compute itself
      queued = true;
      requestAnimationFrame(compute);
    };
    const onResize = () => { measure(); onScroll(); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    measure();
    compute();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      clearTimeout(gateTimer);
      if (glideRafRef.current) cancelAnimationFrame(glideRafRef.current);
      glidingRef.current = false;
      releaseLock();
      const vid = videoRef.current; if (vid) vid.removeEventListener('ended', finishGate);
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
          justifyContent: 'flex-start', padding: 'clamp(32px,6vh,64px) clamp(20px,5vw,46px) 40px',
          overflow: 'hidden',
          background: 'radial-gradient(120% 90% at 82% 8%, #241713 0%, #171310 46%, #120f0d 100%)',
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
            <span ref={setWord(3)} data-hword className="ih-gold" style={{ display: 'block', whiteSpace: 'nowrap', fontSize: '.54em', letterSpacing: '.005em', animation: 'ih-sheen 5s linear infinite, wm-glow 4s ease-in-out 1.1s infinite' }}>brew or take</span>
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
                style={{ position: 'absolute', left: '2%', bottom: 0, width: '58%', objectFit: 'contain', filter: 'drop-shadow(0 28px 40px rgba(0,0,0,.55))', userSelect: 'none', WebkitUserDrag: 'none', zIndex: 1, animation: 'am-float 8.5s ease-in-out infinite' }} />
              {/* pouch — in front, right; a slower, different drift so it never looks stuck to the box */}
              <img className="hp-float" src="assets/img/pouch/clean-front.png" alt="AMAZTRA instant coffee pouch" draggable={false}
                style={{ position: 'absolute', right: '2%', bottom: 0, width: '52%', objectFit: 'contain', filter: 'drop-shadow(0 28px 40px rgba(0,0,0,.6))', userSelect: 'none', WebkitUserDrag: 'none', zIndex: 2, animation: 'am-float2 11s ease-in-out -2.5s infinite' }} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
