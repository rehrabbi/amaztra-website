import { useEffect, useRef } from 'react';

const RISE_EASE = 'cubic-bezier(.2,1.15,.3,1)';
const STRIKE_EASE = 'cubic-bezier(.23,1,.32,1)';
const prefersReduce = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Content knob from the handoff (originPunch): 'it should brew.' | 'it should pour.' | 'just add coffee.'
const ORIGIN_PUNCH = 'it should brew.';

/**
 * Origin — kinetic brand-story opener. On view the lines rise in (staggered),
 * then a red strike wipes across "work"; the punch line is gold-gradient and,
 * once struck, catches an ember glow while sparks rise off it. Ambient ember
 * motes drift up the whole panel and the top seam fades from the section above,
 * so Ingredients -> Origin read as one space. Reduced motion shows everything at rest.
 */
export default function Story() {
  const rootRef = useRef(null);
  const strikeRef = useRef(null);
  const punchRef = useRef(null);
  const ambientRef = useRef(null);
  const dustRef = useRef(null);
  const sparksRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const rises = [...root.querySelectorAll('[data-rise]')];
    const strike = strikeRef.current;
    const reduce = prefersReduce();

    // ambient ember field (16 motes) + extended gold dust (24) drifting up the panel
    if (!reduce) {
      const amb = ambientRef.current;
      if (amb && !amb.childElementCount) {
        for (let i = 0; i < 16; i++) {
          const s = document.createElement('span');
          const sz = 2 + Math.random() * 3.5, gold = Math.random() > 0.4;
          s.style.cssText = 'position:absolute;bottom:-10px;left:' + (Math.random() * 100) + '%;width:' + sz.toFixed(1) + 'px;height:' + sz.toFixed(1) + 'px;border-radius:50%;background:' + (gold ? 'radial-gradient(circle,rgba(246,183,74,.9),rgba(201,90,40,.15))' : 'radial-gradient(circle,rgba(226,58,52,.85),transparent)') + ';box-shadow:0 0 7px ' + (gold ? 'rgba(246,183,74,.55)' : 'rgba(226,58,52,.5)') + ';--dx:' + (Math.random() * 80 - 40).toFixed(0) + 'px;animation:o-embed ' + (9 + Math.random() * 8).toFixed(1) + 's ease-in-out ' + (Math.random() * 9).toFixed(1) + 's infinite;';
          amb.appendChild(s);
        }
      }
      const dust = dustRef.current;
      if (dust && !dust.childElementCount) {
        for (let i = 0; i < 24; i++) {
          const s = document.createElement('span');
          const sz = 2 + Math.random() * 3.5;
          s.style.cssText = 'position:absolute;bottom:' + (Math.random() * 45) + '%;left:' + (Math.random() * 100) + '%;width:' + sz.toFixed(1) + 'px;height:' + sz.toFixed(1) + 'px;border-radius:50%;background:radial-gradient(circle,rgba(246,227,154,.95),rgba(201,154,52,.15));box-shadow:0 0 6px rgba(246,227,154,.5);--dx:' + (Math.random() * 60 - 30).toFixed(0) + 'px;animation:hero-dust ' + (6 + Math.random() * 7).toFixed(1) + 's ease-in-out ' + (Math.random() * 6).toFixed(1) + 's infinite;';
          dust.appendChild(s);
        }
      }
    }

    if (reduce) {
      rises.forEach((el) => { el.style.opacity = '1'; el.style.transform = 'none'; });
      if (strike) strike.style.transform = 'rotate(-3deg) scaleX(1)';
      return;
    }

    const spawnSparks = () => {
      const host = sparksRef.current;
      if (!host || host.childElementCount) return;
      for (let i = 0; i < 12; i++) {
        const s = document.createElement('span');
        const sz = 2 + Math.random() * 2.5;
        s.style.cssText = 'position:absolute;bottom:' + (Math.random() * 30) + '%;left:' + (20 + Math.random() * 60) + '%;width:' + sz.toFixed(1) + 'px;height:' + sz.toFixed(1) + 'px;border-radius:50%;background:radial-gradient(circle,rgba(246,227,154,.95),rgba(226,58,52,.3));box-shadow:0 0 6px rgba(246,183,74,.7);--dx:' + (Math.random() * 30 - 15).toFixed(0) + 'px;animation:o-spark ' + (2 + Math.random() * 2).toFixed(1) + 's ease-out ' + (Math.random() * 2.5).toFixed(1) + 's infinite;';
        host.appendChild(s);
      }
    };

    let done = false;
    const run = () => {
      if (done) return;
      done = true;
      rises.forEach((el, i) => {
        el.animate(
          [{ opacity: 0, transform: 'translateY(38px)' }, { opacity: 1, transform: 'translateY(0)' }],
          { duration: 800, delay: i * 120, easing: RISE_EASE, fill: 'both' });
      });
      if (strike) {
        setTimeout(() => {
          strike.animate(
            [{ transform: 'rotate(-3deg) scaleX(0)' }, { transform: 'rotate(-3deg) scaleX(1)' }],
            { duration: 500, easing: STRIKE_EASE, fill: 'both' });
        }, 650);
      }
      // after the strike lands, the punch line catches an ember glow + throws sparks
      setTimeout(() => {
        if (punchRef.current) punchRef.current.style.animation = 'ember 2.8s ease-in-out infinite';
        spawnSparks();
      }, 1200);
    };

    const io = new IntersectionObserver((ents) => {
      ents.forEach((e) => { if (e.isIntersecting) { run(); io.disconnect(); } });
    }, { threshold: 0.35 });
    io.observe(root);
    return () => io.disconnect();
  }, []);

  return (
    <section
      id="story"
      ref={rootRef}
      style={{
        position: 'relative',
        background: 'radial-gradient(120% 90% at 78% 8%,#241713 0%,#171310 46%,#120f0d 100%)',
        padding: 'clamp(80px,12vh,140px) clamp(24px,6vw,80px)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
        fontFamily: "'Space Grotesk',system-ui,sans-serif", overflow: 'hidden',
      }}
    >
      {/* ambient ember field + carried-down gold dust + top seam fade (behind content) */}
      <div ref={ambientRef} aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: -1 }} />
      <div ref={dustRef} aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '46%', overflow: 'hidden', pointerEvents: 'none', zIndex: -1 }} />
      <span aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '46vh', background: 'linear-gradient(180deg,#120f0d 0%,#120f0d 20%,rgba(18,15,13,.55) 55%,transparent 100%)', pointerEvents: 'none', zIndex: -1 }} />

      {/* eyebrow */}
      <p data-rise style={{
        opacity: 0, margin: 0, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600,
        fontSize: '13px', letterSpacing: '.1em', textTransform: 'uppercase', color: '#C6A24C',
      }}>The origin</p>

      {/* headline with strike-through on "work" */}
      <h2 data-rise className="fp-head" style={{
        opacity: 0, margin: 'clamp(24px,4vh,38px) 0 0',
        fontFamily: "'Anton',sans-serif", textTransform: 'uppercase',
        fontSize: 'clamp(48px,8.5vw,96px)', lineHeight: 0.86, letterSpacing: '-.02em', color: '#EDE4D3',
      }}>
        Beauty shouldn't feel<br />like{' '}
        <span style={{ position: 'relative', display: 'inline-block', color: '#8f8578' }}>
          work
          <span ref={strikeRef} aria-hidden="true" style={{
            position: 'absolute', left: '-4%', right: '-4%', top: '52%',
            height: 'clamp(5px,.7vw,9px)', background: '#E23A34',
            transform: 'rotate(-3deg) scaleX(0)', transformOrigin: 'left',
          }} />
        </span>
      </h2>

      {/* gold-gradient punch line — catches an ember glow after the strike */}
      <p id="story-punch" ref={punchRef} data-rise className="fp-head" style={{
        position: 'relative',
        opacity: 0, margin: 'clamp(14px,2.4vh,22px) 0 0',
        fontFamily: "'Anton',sans-serif", textTransform: 'uppercase',
        fontSize: 'clamp(52px,9.2vw,104px)', lineHeight: 0.86,
        background: 'linear-gradient(180deg,#F6E39A,#A9761B)',
        WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
      }}>{ORIGIN_PUNCH}<span ref={sparksRef} aria-hidden="true" style={{ position: 'absolute', inset: '-30% 0 0', pointerEvents: 'none' }} /></p>

      {/* supporting copy */}
      <p data-rise style={{
        opacity: 0, margin: 'clamp(30px,5vh,44px) 0 0', maxWidth: '52ch',
        fontSize: 'clamp(16px,1.9vw,20px)', lineHeight: 1.6, color: '#cfc4b2',
      }}>
        Self-care quietly became a chore. But you never skipped the first warm cup, so we folded the actives right there.
      </p>
    </section>
  );
}
