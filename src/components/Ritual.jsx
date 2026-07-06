import { useEffect, useRef } from 'react';

const EASE = 'cubic-bezier(.23,1,.32,1)';
const prefersReduce = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Line icons in the ingredient-icon idiom: 24x24, 1.7 stroke, round caps, gold.
const ICONS = {
  coffee: (
    <>
      <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
      <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
      <line x1="6" y1="2" x2="6" y2="4" />
      <line x1="10" y1="2" x2="10" y2="4" />
      <line x1="14" y1="2" x2="14" y2="4" />
    </>
  ),
  heart: <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" /><path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" /><path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
    </>
  ),
};

const STEPS = [
  { n: '01', icon: 'coffee', title: 'Brew', body: 'Make your cup the way you always do, hot or over ice. The actives are already folded in.' },
  { n: '02', icon: 'heart', title: 'Sip', body: 'Take the same slow, unhurried moment you look forward to every morning. Nothing new to remember.' },
  { n: '03', icon: 'sun', title: 'Glow', body: 'Let glutathione, collagen and astaxanthin work from within, cup after cup, day after day.' },
];

function Icon({ name }) {
  return (
    <svg viewBox="0 0 24 24" width="27" height="27" fill="none" stroke="#C6A24C"
      strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
      style={{ display: 'block' }}>
      {ICONS[name]}
    </svg>
  );
}

/**
 * The Ritual — brew / sip / glow. Three staggered steps in the ingredient-icon
 * idiom, reveal-on-scroll to match the rest of the page. Grid auto-fits to three
 * columns on desktop and stacks on mobile; reduced motion shows all at rest.
 */
export default function Ritual() {
  const rootRef = useRef(null);

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
    }, { threshold: 0.2 });

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section
      id="ritual"
      ref={rootRef}
      style={{
        position: 'relative',
        padding: 'clamp(72px,11vh,150px) clamp(20px,5vw,46px)',
        background: 'radial-gradient(120% 80% at 50% 0%, #1c1512 0%, #141210 52%)',
        fontFamily: "'Space Grotesk',system-ui,sans-serif",
        overflow: 'hidden',
      }}
    >
      <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
        {/* eyebrow */}
        <p data-reveal style={{
          opacity: 0, margin: 0, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600,
          fontSize: '13px', letterSpacing: '.04em', textTransform: 'uppercase', color: '#C6A24C',
        }}>The ritual</p>

        {/* headline */}
        <h2 data-reveal data-reveal-delay=".08" style={{
          opacity: 0, margin: 'clamp(20px,3vh,30px) 0 0', maxWidth: '16ch',
          fontFamily: "'Anton',sans-serif", fontWeight: 400, textTransform: 'uppercase',
          fontSize: 'clamp(42px,6.4vw,92px)', lineHeight: 0.92, letterSpacing: '-.015em', color: '#EDE4D3',
        }}>
          A ritual, not a <span style={{ color: '#E23A34' }}>routine.</span>
        </h2>

        <p data-reveal data-reveal-delay=".14" style={{
          opacity: 0, margin: 'clamp(18px,2.6vh,26px) 0 0', maxWidth: '46ch',
          fontFamily: "'Space Grotesk',sans-serif", fontSize: 'clamp(16px,1.7vw,20px)',
          lineHeight: 1.55, color: '#cfc4b2',
        }}>
          The same cup you already reach for every morning, quietly doing more.
        </p>

        {/* steps */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 'clamp(28px,4vw,52px)', marginTop: 'clamp(48px,7vh,80px)',
        }}>
          {STEPS.map((step, i) => (
            <div
              key={step.n}
              data-reveal
              data-reveal-delay={(0.2 + i * 0.12).toFixed(2)}
              style={{ opacity: 0, position: 'relative' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: '60px', height: '60px', borderRadius: '50%', flexShrink: 0,
                  background: 'rgba(23,17,14,.9)', border: '1px solid rgba(198,162,76,.5)',
                  boxShadow: '0 8px 22px rgba(0,0,0,.5), 0 0 20px rgba(226,58,52,.18)',
                }}>
                  <Icon name={step.icon} />
                </span>
                <span aria-hidden="true" style={{
                  fontFamily: "'Anton',sans-serif", fontSize: 'clamp(34px,4vw,46px)', lineHeight: 1,
                  color: 'rgba(198,162,76,.28)', letterSpacing: '.02em',
                }}>{step.n}</span>
              </div>

              <h3 style={{
                margin: '22px 0 0', fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800,
                fontSize: 'clamp(26px,3vw,36px)', lineHeight: 1.02, letterSpacing: '-.01em', color: '#EDE4D3',
              }}>{step.title}</h3>

              <p style={{
                margin: '12px 0 0', fontFamily: "'Space Grotesk',sans-serif",
                fontSize: 'clamp(15px,1.5vw,17px)', lineHeight: 1.6, color: '#cfc4b2', maxWidth: '34ch',
              }}>{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
