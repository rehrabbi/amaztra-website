import { useEffect, useRef } from 'react';

const EASE = 'cubic-bezier(.23,1,.32,1)';
const prefersReduce = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Emphasis tokens — brighten (cream), gold, and red — reused inside the narrative beats.
const hi = { color: '#EDE4D3' };
const gold = { color: '#C6A24C' };
const red = { color: '#E23A34' };

// The origin narrative. Each beat is a step on the drawn gold rail.
const BEATS = [
  <>Somewhere between the serums, the capsules and the ten-step routines, self-care quietly turned into <span style={hi}>a chore</span>.</>,
  <>But there was one ritual you never skipped: the <span style={gold}>first warm cup</span> of the morning.</>,
  <>So we folded the actives (glutathione, collagen, astaxanthin) into the <span style={hi}>coffee you already love</span>.</>,
];

/**
 * Brand story — "The origin". A drawn gold rail with staggered narrative beats,
 * closing on the brand line. Reveal-on-scroll matches the Ingredients convention
 * (IntersectionObserver + WAAPI); under reduced motion everything is shown at rest.
 */
export default function Story() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const els = root.querySelectorAll('[data-reveal]');

    // reduced motion: skip the choreography, show everything at rest
    if (prefersReduce()) {
      els.forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    const io = new IntersectionObserver((ents) => {
      ents.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const delay = parseFloat(el.getAttribute('data-reveal-delay') || '0') * 1000;
        const frames = el.hasAttribute('data-draw')
          ? [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }]
          : [{ opacity: 0, transform: 'translateY(34px)' }, { opacity: 1, transform: 'translateY(0)' }];
        el.animate(frames, { duration: 900, delay, easing: EASE, fill: 'both' });
        io.unobserve(el);
      });
    }, { threshold: 0.28 });

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const last = BEATS.length - 1;

  return (
    <section
      id="story"
      ref={rootRef}
      style={{
        position: 'relative',
        padding: 'clamp(72px,11vh,150px) clamp(20px,5vw,46px)',
        background: 'linear-gradient(180deg,#17110e,#141210)',
        fontFamily: "'Space Grotesk',system-ui,sans-serif",
        overflow: 'hidden',
      }}
    >
      <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
        {/* eyebrow */}
        <p data-reveal style={{
          opacity: 0, margin: 0, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600,
          fontSize: '13px', letterSpacing: '.04em', textTransform: 'uppercase', color: '#C6A24C',
        }}>The origin</p>

        {/* headline */}
        <h2 data-reveal data-reveal-delay=".08" style={{
          opacity: 0, margin: 'clamp(20px,3vh,30px) 0 0', maxWidth: '14ch',
          fontFamily: "'Anton',sans-serif", fontWeight: 400, textTransform: 'uppercase',
          fontSize: 'clamp(42px,6.4vw,92px)', lineHeight: 0.92, letterSpacing: '-.015em', color: '#EDE4D3',
        }}>
          Beauty shouldn't<br />feel like <span style={{ color: '#E23A34' }}>work.</span>
        </h2>

        {/* drawn rail + narrative beats */}
        <div style={{ position: 'relative', maxWidth: '740px', marginTop: 'clamp(40px,6vh,64px)' }}>
          <span
            data-reveal
            data-draw
            aria-hidden="true"
            style={{
              position: 'absolute', left: '5px', top: '8px', bottom: '8px', width: '1px',
              background: 'linear-gradient(180deg,#C6A24C,rgba(198,162,76,.12))',
              transformOrigin: 'top', transform: 'scaleY(0)',
            }}
          />
          {BEATS.map((beat, i) => (
            <div
              key={i}
              data-reveal
              data-reveal-delay={(0.12 + i * 0.12).toFixed(2)}
              style={{
                opacity: 0, position: 'relative', paddingLeft: '34px',
                paddingBottom: i < last ? 'clamp(24px,4vh,40px)' : 0,
              }}
            >
              <span aria-hidden="true" style={{
                position: 'absolute', left: '0', top: '.45em', width: '11px', height: '11px',
                borderRadius: '50%', background: '#E23A34', boxShadow: '0 0 0 4px rgba(226,58,52,.16)',
              }} />
              <p style={{
                margin: 0, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 400,
                fontSize: 'clamp(18px,2.1vw,25px)', lineHeight: 1.5, color: '#cfc4b2',
              }}>{beat}</p>
            </div>
          ))}
        </div>

        {/* closing brand line */}
        <p data-reveal data-reveal-delay=".2" style={{
          opacity: 0, margin: 'clamp(40px,6vh,66px) 0 0',
          fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800,
          fontSize: 'clamp(30px,4.6vw,60px)', lineHeight: 1.04, letterSpacing: '-.01em',
          color: '#EDE4D3', maxWidth: '20ch',
        }}>
          No pills. No extra steps.<br />Just beauty, <span style={{
            background: 'linear-gradient(180deg,#F6E39A 0%,#E1BC5C 40%,#C99A34 66%,#A9761B 100%)',
            WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
          }}>brewed.</span>
        </p>
      </div>
    </section>
  );
}
