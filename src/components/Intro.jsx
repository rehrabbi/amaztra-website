import { useEffect, useRef } from 'react';

const EASE = 'cubic-bezier(.23,1,.32,1)';

/**
 * Cinematic loader: gold AMAZTRA wordmark, a 00 -> 100 counter, then a
 * "scroll to enter" prompt. Any wheel / touch / click / key gesture slides the
 * whole panel up and off, then calls onExit() so the app can drop the overlay.
 */
export default function Intro({ onExit }) {
  const elRef = useRef(null);
  const eyebrowRef = useRef(null);
  const titleRef = useRef(null);
  const lineRef = useRef(null);
  const countRef = useRef(null);
  const promptRef = useRef(null);
  const arrowRef = useRef(null);

  useEffect(() => {
    // lock scroll while the intro owns the screen
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let countRaf = 0;
    let exiting = false;
    let arrowAnim = null;
    const anims = [];

    if (reduce) {
      // no motion: snap everything to its final state
      if (eyebrowRef.current) eyebrowRef.current.style.opacity = '1';
      if (titleRef.current) titleRef.current.style.opacity = '1';
      if (lineRef.current) lineRef.current.style.width = 'min(360px,58vw)';
      if (countRef.current) countRef.current.textContent = '100';
      if (promptRef.current) promptRef.current.style.opacity = '1';
      if (arrowRef.current) arrowRef.current.style.opacity = '.9';
    } else {
      if (eyebrowRef.current)
        anims.push(eyebrowRef.current.animate(
          [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }],
          { duration: 800, delay: 250, easing: EASE, fill: 'both' }));
      if (titleRef.current)
        anims.push(titleRef.current.animate(
          [{ opacity: 0, transform: 'translateY(26px)', letterSpacing: '.5em' }, { opacity: 1, transform: 'none', letterSpacing: '.2em' }],
          { duration: 1300, delay: 450, easing: EASE, fill: 'both' }));
      if (lineRef.current)
        anims.push(lineRef.current.animate(
          [{ width: '0px' }, { width: 'min(360px,58vw)' }],
          { duration: 1100, delay: 950, easing: EASE, fill: 'both' }));

      // loader counter 00 -> 100
      const t0 = performance.now();
      const dur = 2100;
      const revealPrompt = () => {
        if (promptRef.current)
          anims.push(promptRef.current.animate(
            [{ opacity: 0 }, { opacity: 1 }],
            { duration: 700, easing: 'ease-out', fill: 'both' }));
        if (arrowRef.current)
          arrowAnim = arrowRef.current.animate(
            [{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: .9, transform: 'translateY(6px)' }],
            { duration: 1100, easing: 'ease-in-out', direction: 'alternate', iterations: Infinity });
      };
      const tick = () => {
        const p = Math.min(1, (performance.now() - t0) / dur);
        const v = Math.round((1 - Math.pow(1 - p, 2)) * 100);
        if (countRef.current) countRef.current.textContent = String(v).padStart(2, '0');
        if (p < 1) countRaf = requestAnimationFrame(tick);
        else revealPrompt();
      };
      countRaf = requestAnimationFrame(tick);
    }

    const events = ['wheel', 'touchmove', 'click', 'keydown'];
    const runExit = () => {
      if (exiting) return;
      exiting = true;
      events.forEach((ev) => window.removeEventListener(ev, runExit));
      cancelAnimationFrame(countRaf);
      const finish = () => {
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
        onExit();
      };
      if (elRef.current && !reduce) {
        const a = elRef.current.animate(
          [{ transform: 'translateY(0)' }, { transform: 'translateY(-100%)' }],
          { duration: 1000, easing: 'cubic-bezier(.76,0,.24,1)', fill: 'both' });
        a.onfinish = finish;
      } else finish();
    };
    events.forEach((ev) => window.addEventListener(ev, runExit, { passive: true }));

    return () => {
      cancelAnimationFrame(countRaf);
      events.forEach((ev) => window.removeEventListener(ev, runExit));
      if (arrowAnim) arrowAnim.cancel();
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [onExit]);

  return (
    <div
      ref={elRef}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'radial-gradient(120% 100% at 50% 20%, #201512 0%, #120f0d 55%, #0c0a09 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', willChange: 'transform',
      }}
    >
      <span aria-hidden="true" className="am-noise" style={{ opacity: 0.06 }} />

      <div style={{ textAlign: 'center', position: 'relative' }}>
        <div ref={eyebrowRef} style={{
          fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 'clamp(10px,1.1vw,13px)',
          letterSpacing: '.36em', textTransform: 'uppercase', color: '#C6A24C', opacity: 0,
        }}>Beauty from within</div>
        <div ref={titleRef} style={{
          marginTop: 'clamp(12px,2vh,20px)', fontFamily: "'Cinzel',serif", fontWeight: 700,
          fontSize: 'clamp(46px,11vw,150px)', lineHeight: 1, letterSpacing: '.2em',
          background: 'linear-gradient(180deg,#F9EAA6 0%,#E1BC5C 44%,#C99A34 66%,#A9761B 100%)',
          WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', opacity: 0,
        }}>AMAZTRA</div>
        <div ref={lineRef} style={{
          height: '1.5px', width: 0,
          background: 'linear-gradient(90deg,transparent,#C6A24C,transparent)',
          margin: 'clamp(18px,3vh,30px) auto 0',
        }} />
      </div>

      <div ref={countRef} style={{
        position: 'absolute', left: 'clamp(20px,5vw,46px)', bottom: 'clamp(18px,4vh,38px)',
        fontFamily: "'Anton',sans-serif", fontSize: 'clamp(38px,7vw,88px)', lineHeight: 1,
        color: 'rgba(237,228,211,.13)', letterSpacing: '.02em',
      }}>00</div>

      <div ref={promptRef} style={{
        position: 'absolute', bottom: 'clamp(24px,5vh,44px)', left: 0, right: 0, textAlign: 'center',
        fontFamily: "'Space Grotesk',sans-serif", fontWeight: 500, fontSize: 'clamp(10px,1.1vw,12px)',
        letterSpacing: '.26em', textTransform: 'uppercase', color: 'rgba(237,228,211,.5)', opacity: 0,
      }}>Scroll to enter</div>
      <div ref={arrowRef} style={{
        position: 'absolute', bottom: 'clamp(8px,2.4vh,20px)', left: 0, right: 0,
        textAlign: 'center', color: '#C6A24C', fontSize: '16px', opacity: 0,
      }}>↓</div>
    </div>
  );
}
