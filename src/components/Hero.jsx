import { useEffect, useRef } from 'react';
import SpinPouch from './SpinPouch.jsx';

/**
 * Cinematic hero. On desktop the section is pinned (via a 170vh wrapper) and the
 * scroll scrubs a scene: each masthead word lifts and fades, the glow/grain
 * parallax, and the product pouch flies to the viewport centre + scales down to
 * hand off to the ingredients orbit. On mobile / reduced-motion it's a normal
 * stacked hero with no pin. The masthead words are just revealed by the intro
 * sliding away — no entrance animation, to avoid a reload-like flash.
 */
export default function Hero() {
  const pinRef = useRef(null);
  const glowRef = useRef(null);
  const noiseRef = useRef(null);
  const pouchRef = useRef(null);
  const boxRef = useRef(null);
  const wordsRef = useRef([]);
  const reduceRef = useRef(false);
  const hpBaseRef = useRef(null);
  const pinActiveRef = useRef(false);

  const setWord = (i) => (el) => { wordsRef.current[i] = el; };

  // pin-scrub scroll: word scatter + pouch fly-to-centre + parallax (desktop only)
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    reduceRef.current = reduce;
    const clamp01 = (v) => Math.max(0, Math.min(1, v));
    const sm = (v) => v * v * (3 - 2 * v); // smoothstep

    const setWillChange = (on) => {
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
        hp.style.transform = 'translateY(-50%)';
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
      if (pouchRef.current) { pouchRef.current.style.transform = 'translateY(-50%)'; pouchRef.current.style.opacity = '1'; }
      if (boxRef.current) { boxRef.current.style.transform = 'translate(-50%,-50%)'; boxRef.current.style.opacity = '1'; }
      setWillChange(false);
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
        hp.style.transform = 'translateY(-50%) translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px) scale(' + k.toFixed(3) + ')';
        hp.style.opacity = (1 - clamp01((e - 0.72) / 0.28)).toFixed(3);
      }
    };

    // rAF-throttle so getBoundingClientRect runs at most once per frame
    const onScroll = () => { if (queued) return; queued = true; requestAnimationFrame(compute); };
    const onResize = () => { measure(); onScroll(); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    measure();
    compute();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

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
        {/* parallax red glow */}
        <span aria-hidden="true" ref={glowRef} className="hero-glow" style={{
          position: 'absolute', left: '82%', top: '44%', width: '58vmin', height: '58vmin',
          transform: 'translate(-50%,-50%)', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(193,26,34,.26), transparent 62%)',
          filter: 'blur(26px)', pointerEvents: 'none', zIndex: 0,
        }} />

        {/* floating wordmark (gold, with one-off sheen sweep) */}
        <div className="am-rise wordmark" style={{
          position: 'relative', zIndex: 1, animationDelay: '0s', textAlign: 'center', width: '100%',
          fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 'clamp(30px,4vw,54px)',
          letterSpacing: '.14em',
          background: 'linear-gradient(180deg,#F6E39A 0%,#E1BC5C 38%,#C99A34 62%,#A9761B 100%)',
          WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
        }}>AMAZTRA</div>

        <span aria-hidden="true" ref={noiseRef} className="am-noise" style={{ opacity: 0.05 }} />

        {/* masthead + product */}
        <div className="hero-stage" style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center', marginTop: '12px' }}>
          <h1 className="hero-title" style={{
            position: 'relative', zIndex: 2,
            margin: 0, fontFamily: "'Anton',sans-serif", fontWeight: 400, textTransform: 'uppercase',
            lineHeight: 0.82, letterSpacing: '-.015em', fontSize: 'clamp(72px,15.5vw,232px)', color: '#EDE4D3',
            pointerEvents: 'none',
          }}>
            <span ref={setWord(0)} style={{ display: 'block' }}>Beauty</span>
            <span className="hero-row" style={{ display: 'flex', gap: '.22em' }}>
              <span ref={setWord(1)} style={{ display: 'inline-block', color: '#E23A34' }}>you</span>
              <span ref={setWord(2)} style={{ display: 'inline-block', color: '#E23A34' }}>can</span>
            </span>
            <span ref={setWord(3)} style={{ display: 'block' }}>brew</span>
          </h1>

          {/* product stage — draggable spin; flies into the orbit as you scroll (desktop) */}
          {/* width is capped by height (80svh * pouch aspect 684/926) so the full pouch never clips */}
          <div ref={pouchRef} className="hero-pouch" style={{
            position: 'absolute', right: 'clamp(-24px,1vw,40px)', top: '50%', zIndex: 3,
            transform: 'translateY(-50%)',
            width: 'min(clamp(360px,46vw,560px), calc(80svh * 657 / 843))',
          }}>
            <SpinPouch />
          </div>
        </div>
      </section>
    </div>
  );
}
