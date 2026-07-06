import { useEffect, useRef, useState } from 'react';

const EASE = 'cubic-bezier(.23,1,.32,1)';
const prefersReduce = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const FAQS = [
  { q: 'Does it taste like a supplement?', a: "No. It tastes like good coffee, because that's what it is. The actives are blended in without the chalky, capsule aftertaste." },
  { q: 'How much caffeine is in a cup?', a: "About the same as a regular coffee. It's coffee first, so you get the morning lift you'd expect and nothing jittery on top." },
  { q: 'When should I drink it?', a: 'Whenever you have your first cup. Consistency matters more than timing, so slot it into the routine you already keep.' },
  { q: 'How long until I notice anything?', a: 'Skin renews slowly. The actives are designed to work over weeks of daily sipping, not overnight, so give it a season.' },
  { q: 'Is it only for women?', a: "Not at all. Antioxidant support and collagen are for anyone who drinks coffee and would like it to quietly do a little more." },
];

function Chevron({ open }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#C6A24C"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
      style={{
        display: 'block', flexShrink: 0,
        transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .35s ' + EASE,
      }}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

/**
 * FAQ — an accessible single-open accordion answering the common objections
 * (taste, caffeine, timing, results, who it's for). Reveal-on-scroll matches the
 * rest of the page; the open panel expands via max-height, at rest under reduced motion.
 */
export default function Faq() {
  const rootRef = useRef(null);
  const [open, setOpen] = useState(0);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const els = root.querySelectorAll('[data-reveal]');

    if (prefersReduce()) {
      els.forEach((el) => { el.style.opacity = '1'; el.style.transform = 'none'; });
      return;
    }

    const io = new IntersectionObserver((ents) => {
      ents.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const delay = parseFloat(el.getAttribute('data-reveal-delay') || '0') * 1000;
        el.animate(
          [{ opacity: 0, transform: 'translateY(34px)' }, { opacity: 1, transform: 'translateY(0)' }],
          { duration: 900, delay, easing: EASE, fill: 'both' });
        io.unobserve(el);
      });
    }, { threshold: 0.15 });

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section
      id="faq"
      ref={rootRef}
      style={{
        position: 'relative',
        padding: 'clamp(72px,11vh,150px) clamp(20px,5vw,46px)',
        background: 'linear-gradient(180deg,#17110e,#141210)',
        fontFamily: "'Space Grotesk',system-ui,sans-serif",
        overflow: 'hidden',
      }}
    >
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>
        {/* eyebrow */}
        <p data-reveal style={{
          opacity: 0, margin: 0, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600,
          fontSize: '13px', letterSpacing: '.04em', textTransform: 'uppercase', color: '#C6A24C',
        }}>Good to know</p>

        {/* headline */}
        <h2 data-reveal data-reveal-delay=".08" style={{
          opacity: 0, margin: 'clamp(20px,3vh,30px) 0 0', maxWidth: '16ch',
          fontFamily: "'Anton',sans-serif", fontWeight: 400, textTransform: 'uppercase',
          fontSize: 'clamp(42px,6.4vw,92px)', lineHeight: 0.92, letterSpacing: '-.015em', color: '#EDE4D3',
        }}>
          The <span style={{ color: '#E23A34' }}>questions</span> you'd ask.
        </h2>

        {/* accordion */}
        <div data-reveal data-reveal-delay=".16" style={{ opacity: 0, marginTop: 'clamp(40px,6vh,60px)' }}>
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={i} style={{
                borderTop: '1px solid rgba(237,228,211,.14)',
                borderBottom: i === FAQS.length - 1 ? '1px solid rgba(237,228,211,.14)' : 'none',
              }}>
                <button
                  type="button"
                  className="tap"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: '20px', padding: 'clamp(20px,3vh,28px) 0', minHeight: '44px',
                    background: 'none', border: 0, cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <span style={{
                    fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700,
                    fontSize: 'clamp(18px,2.1vw,24px)', lineHeight: 1.25, letterSpacing: '-.01em',
                    color: isOpen ? '#EDE4D3' : 'rgba(237,228,211,.82)', transition: 'color .3s',
                  }}>{item.q}</span>
                  <Chevron open={isOpen} />
                </button>

                <div style={{
                  maxHeight: isOpen ? '260px' : '0', overflow: 'hidden',
                  transition: 'max-height .4s ' + EASE + ', opacity .3s ease',
                  opacity: isOpen ? 1 : 0,
                }}>
                  <p style={{
                    margin: 0, padding: '0 40px clamp(22px,3vh,28px) 0',
                    fontFamily: "'Space Grotesk',sans-serif", fontSize: 'clamp(15px,1.6vw,18px)',
                    lineHeight: 1.6, color: '#cfc4b2',
                  }}>{item.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
