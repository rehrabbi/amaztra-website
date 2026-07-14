import { useEffect, useRef } from 'react';

/**
 * Scroll-flatten 3D "container scroll" intro (Aceternity-style, dependency-free).
 * The APC logo + AMAZTRA title sit behind/above an Aceternity screen frame that
 * previews the hero. Scrolling flattens the tablet (rotateX -> 0); once it has
 * flattened past the halfway point the rest (deep zoom + hand-off) auto-drives
 * with input locked, then crossfades to the real hero. Respects reduced motion.
 */
export default function Intro({ onExit }) {
  const elRef = useRef(null);
  const cardRef = useRef(null);
  const glowRef = useRef(null);
  const titleRef = useRef(null);
  const hintRef = useRef(null);

  useEffect(() => {
    const prevRestore = 'scrollRestoration' in window.history ? window.history.scrollRestoration : null;
    if (prevRestore !== null) window.history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lerp = (a, b, t) => a + (b - a) * t;
    const ease = (t) => 1 - Math.pow(1 - t, 3);

    let prog = 0;          // 0 = tilted back, 1 = flat
    let target = 0;
    let entered = reduce ? 1 : 0;
    let ready = false;
    let exiting = false;
    let locked = false;
    let raf = 0;

    const clamp01 = (t) => Math.max(0, Math.min(1, t));
    const apply = () => {
      const p = ease(prog);
      const pFlat = clamp01(p / 0.5);            // phase 1: tilt -> flat
      const pZoom = ease(clamp01((p - 0.42) / 0.58)); // phase 2: zoom into the screen
      const rot = lerp(24, 0, pFlat);
      const baseScale = lerp(0.86, 1, pFlat);
      const zoom = lerp(1, 1.8, pZoom);
      const ty = lerp(30, 0, pFlat) - (1 - entered) * 40;
      if (cardRef.current) {
        cardRef.current.style.transform =
          'perspective(1500px) rotateX(' + rot.toFixed(2) + 'deg) scale(' + (baseScale * zoom * lerp(0.94, 1, entered)).toFixed(3) + ') translateY(' + ty.toFixed(1) + 'px)';
        cardRef.current.style.opacity = entered.toFixed(3);
      }
      if (glowRef.current) glowRef.current.style.opacity = (0.3 + pFlat * 0.5).toFixed(3);
      if (titleRef.current) {
        titleRef.current.style.transform = 'translateY(' + lerp(0, -60, pZoom).toFixed(1) + 'px)';
        titleRef.current.style.opacity = (entered * (1 - clamp01(pZoom / 0.45))).toFixed(3);
      }
      if (hintRef.current) hintRef.current.style.opacity = (ready ? (1 - p) * 0.9 : 0).toFixed(3);
    };

    const tick = () => {
      if (entered < 1) entered = Math.min(1, entered + 0.045);
      // once the tablet has flattened (user scrolled to this point), auto-drive the rest
      if (ready && ease(prog) >= 0.5 && target < 1) { target = 1; locked = true; }
      prog += (target - prog) * (locked ? 0.028 : 0.06);
      if (Math.abs(target - prog) < 0.001) prog = target;
      apply();
      // ready once the entrance settles
      if (!ready && entered >= 1) ready = true;
      // auto-exit when fully flattened + zoomed
      if (ready && prog > 0.992 && !exiting) runExit();
      raf = requestAnimationFrame(tick);
    };

    const bump = (d) => { if (!reduce && !locked) target = Math.max(0, Math.min(1, target + d)); };
    const onWheel = (e) => { if (ready && !locked) bump(e.deltaY / 2100); };
    let ty0 = null;
    const onTouchStart = (e) => { ty0 = e.touches[0].clientY; };
    const onTouchMove = (e) => { if (ty0 != null && ready && !locked) { bump((ty0 - e.touches[0].clientY) / 820); ty0 = e.touches[0].clientY; } };
    const onClick = () => { if (ready && !locked) { target = 1; locked = true; } };
    const onKey = (e) => { if (ready && !locked && (e.key === 'ArrowDown' || e.key === ' ' || e.key === 'Enter' || e.key === 'PageDown')) { target = 1; locked = true; } };

    const runExit = () => {
      if (exiting) return;
      exiting = true;
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('click', onClick);
      window.removeEventListener('keydown', onKey);
      const finish = () => {
        cancelAnimationFrame(raf);
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
        window.scrollTo(0, 0);
        onExit();
      };
      if (elRef.current && !reduce) {
        const a = elRef.current.animate(
          [{ opacity: 1 }, { opacity: 0 }],
          { duration: 550, easing: 'ease-in-out', fill: 'both' });
        a.onfinish = finish;
      } else finish();
    };

    if (reduce) {
      prog = 1; target = 1; entered = 1; ready = true;
      apply();
      window.addEventListener('click', onClick, { passive: true });
      window.addEventListener('keydown', onKey);
      // let a click exit in reduced mode
      const exitNow = () => runExit();
      window.addEventListener('wheel', exitNow, { passive: true });
      return () => {
        cancelAnimationFrame(raf);
        window.removeEventListener('click', onClick);
        window.removeEventListener('keydown', onKey);
        window.removeEventListener('wheel', exitNow);
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
        if (prevRestore !== null) window.history.scrollRestoration = prevRestore;
      };
    }

    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('click', onClick, { passive: true });
    window.addEventListener('keydown', onKey);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('click', onClick);
      window.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      if (prevRestore !== null) window.history.scrollRestoration = prevRestore;
    };
  }, [onExit]);

  return (
    <div ref={elRef} style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'radial-gradient(120% 100% at 50% 12%, #201512 0%, #120f0d 55%, #0c0a09 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', willChange: 'transform', perspective: '1400px',
      }}>
      <span aria-hidden="true" className="am-noise" style={{ opacity: 0.06 }} />

      {/* logo + title BEHIND the screen (out of flow, lower z for depth) */}
      <div ref={titleRef} style={{ position: 'absolute', top: 'clamp(14px,4vh,48px)', left: 0, right: 0, zIndex: 0, textAlign: 'center', opacity: 0, willChange: 'transform,opacity', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <img src="assets/img/pouch/apc-logo.png" alt="Amazing Pharma Corporation logo"
          style={{ width: 'clamp(52px,7vw,88px)', maxHeight: '11vh', objectFit: 'contain', filter: 'drop-shadow(0 8px 18px rgba(0,0,0,.5))' }} />
        <div style={{
          marginTop: 'clamp(8px,1.4vh,14px)', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 'clamp(9px,1vw,12px)',
          letterSpacing: '.34em', textTransform: 'uppercase', color: '#C6A24C' }}>Manufactured by Amazing Pharma Corporation</div>
        <div style={{
          marginTop: 'clamp(6px,1vh,10px)', fontFamily: "'Cinzel',serif", fontWeight: 700,
          fontSize: 'clamp(28px,5.4vw,72px)', lineHeight: 1, letterSpacing: '.2em',
          background: 'linear-gradient(180deg,#F9EAA6 0%,#E1BC5C 44%,#C99A34 66%,#A9761B 100%)',
          WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>AMAZTRA</div>
      </div>

      {/* Aceternity screen frame — zooms in on scroll to hand off to the hero */}
      <div ref={cardRef} style={{
          position: 'relative', zIndex: 1, opacity: 0, transformOrigin: '50% 50%', willChange: 'transform',
          width: 'min(1000px,90vw)', maxHeight: '60vh', aspectRatio: '16 / 10',
          border: '4px solid rgba(108,108,108,.9)', borderRadius: '30px', padding: 'clamp(12px,2vw,24px)',
          background: '#222222', boxShadow: '0 50px 100px -20px rgba(0,0,0,.7), 0 30px 60px -30px rgba(0,0,0,.6)' }}>
        <div style={{ position: 'relative', height: '100%', width: '100%', overflow: 'hidden', borderRadius: '16px',
          background: 'radial-gradient(120% 90% at 82% 8%, #241713 0%, #171310 46%, #120f0d 100%)' }}>
          {/* mini hero preview */}
          <span aria-hidden="true" ref={glowRef} style={{
            position: 'absolute', left: '80%', top: '46%', width: '46%', height: '70%',
            transform: 'translate(-50%,-50%)', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(193,26,34,.4), transparent 62%)', filter: 'blur(26px)', opacity: 0.3 }} />
          <div style={{ position: 'absolute', top: '7%', left: 0, right: 0, textAlign: 'center',
            fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 'clamp(13px,2vw,22px)', letterSpacing: '.14em',
            background: 'linear-gradient(180deg,#F6E39A,#A9761B)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>AMAZTRA</div>
          <div style={{ position: 'absolute', left: '6%', top: '50%', transform: 'translateY(-50%)',
            fontFamily: "'Anton',sans-serif", textTransform: 'uppercase', lineHeight: 0.82, letterSpacing: '-.015em',
            fontSize: 'clamp(34px,7.2vw,92px)', color: '#EDE4D3' }}>
            Beauty<br /><span style={{ color: '#E23A34' }}>you can</span><br />brew
          </div>
          <img src="assets/img/pouch/1-front-cut.png" alt="" aria-hidden="true"
            style={{ position: 'absolute', right: '5%', top: '50%', transform: 'translateY(-50%)', height: '74%',
              filter: 'drop-shadow(0 20px 30px rgba(0,0,0,.55))' }} />
        </div>
      </div>

      <div ref={hintRef} style={{
        position: 'absolute', bottom: 'clamp(18px,4vh,34px)', left: 0, right: 0, textAlign: 'center', opacity: 0,
        fontFamily: "'Space Grotesk',sans-serif", fontWeight: 500, fontSize: 'clamp(10px,1.1vw,12px)',
        letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(237,228,211,.55)' }}>Scroll to enter ↓</div>
    </div>
  );
}
