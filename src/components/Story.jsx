import { useEffect, useRef } from 'react';

const RISE_EASE = 'cubic-bezier(.2,1.15,.3,1)';
const STRIKE_EASE = 'cubic-bezier(.23,1,.32,1)';
const prefersReduce = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Content knob from the handoff (originPunch): 'it should brew.' | 'it should pour.' | 'just add coffee.'
const ORIGIN_PUNCH = 'it should brew.';

/**
 * Origin — kinetic brand-story opener. On view the lines rise in (staggered),
 * then a red strike wipes across "work"; the punch line is gold-gradient. Motion
 * fires once via IntersectionObserver. Reduced motion shows everything at rest.
 */
export default function Story() {
  const rootRef = useRef(null);
  const strikeRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const rises = [...root.querySelectorAll('[data-rise]')];
    const strike = strikeRef.current;

    if (prefersReduce()) {
      rises.forEach((el) => { el.style.opacity = '1'; el.style.transform = 'none'; });
      if (strike) strike.style.transform = 'rotate(-3deg) scaleX(1)';
      return;
    }

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
        background: 'radial-gradient(120% 90% at 78% 8%,#241713 0%,#171310 46%,#120f0d 100%)',
        padding: 'clamp(80px,12vh,140px) clamp(24px,6vw,80px)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
        fontFamily: "'Space Grotesk',system-ui,sans-serif", overflow: 'hidden',
      }}
    >
      {/* eyebrow */}
      <p data-rise style={{
        opacity: 0, margin: 0, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600,
        fontSize: '13px', letterSpacing: '.1em', textTransform: 'uppercase', color: '#C6A24C',
      }}>The origin</p>

      {/* headline with strike-through on "work" */}
      <p data-rise style={{
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
      </p>

      {/* gold-gradient punch line */}
      <p data-rise style={{
        opacity: 0, margin: 'clamp(14px,2.4vh,22px) 0 0',
        fontFamily: "'Anton',sans-serif", textTransform: 'uppercase',
        fontSize: 'clamp(52px,9.2vw,104px)', lineHeight: 0.86,
        background: 'linear-gradient(180deg,#F6E39A,#A9761B)',
        WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
      }}>{ORIGIN_PUNCH}</p>

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
