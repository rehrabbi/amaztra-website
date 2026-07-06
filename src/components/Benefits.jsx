import { useEffect, useRef } from 'react';

const EASE = 'cubic-bezier(.23,1,.32,1)';
const prefersReduce = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Line icons reused from the ingredient idiom: 24x24, 1.7 stroke, round caps.
const ICONS = {
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" /><path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" /><path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
    </>
  ),
  droplet: <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C7 11.1 6 13 6 15a7 7 0 0 0 6 7z" />,
  shield: (
    <>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
};

const BENEFITS = [
  { icon: 'sun', title: 'Radiance', body: 'Glutathione and vitamin C support the kind of lit-from-within clarity you usually chase with serums.' },
  { icon: 'droplet', title: 'Bounce', body: 'Collagen supports skin elasticity and structure, for that fresh, plump feel that builds over time.' },
  { icon: 'shield', title: 'Defense', body: 'Astaxanthin and N-acetyl cysteine help shield skin cells from the everyday oxidative stress of city life.' },
];

function Icon({ name }) {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#E23A34"
      strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
      style={{ display: 'block' }}>
      {ICONS[name]}
    </svg>
  );
}

/**
 * Benefits — "what you'll notice". Three bordered cards in the page's reveal
 * idiom. Language stays soft and supportive (brand-building, not medical claims).
 * Grid auto-fits to three columns and stacks on mobile; reduced motion at rest.
 */
export default function Benefits() {
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
      id="benefits"
      ref={rootRef}
      style={{
        position: 'relative',
        padding: 'clamp(72px,11vh,150px) clamp(20px,5vw,46px)',
        background: 'linear-gradient(180deg,#141210,#17110e)',
        fontFamily: "'Space Grotesk',system-ui,sans-serif",
        overflow: 'hidden',
      }}
    >
      <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
        {/* eyebrow */}
        <p data-reveal style={{
          opacity: 0, margin: 0, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600,
          fontSize: '13px', letterSpacing: '.04em', textTransform: 'uppercase', color: '#C6A24C',
        }}>The payoff</p>

        {/* headline */}
        <h2 data-reveal data-reveal-delay=".08" style={{
          opacity: 0, margin: 'clamp(20px,3vh,30px) 0 0', maxWidth: '16ch',
          fontFamily: "'Anton',sans-serif", fontWeight: 400, textTransform: 'uppercase',
          fontSize: 'clamp(42px,6.4vw,92px)', lineHeight: 0.92, letterSpacing: '-.015em', color: '#EDE4D3',
        }}>
          Glow that <span style={{ color: '#E23A34' }}>compounds.</span>
        </h2>

        <p data-reveal data-reveal-delay=".14" style={{
          opacity: 0, margin: 'clamp(18px,2.6vh,26px) 0 0', maxWidth: '48ch',
          fontFamily: "'Space Grotesk',sans-serif", fontSize: 'clamp(16px,1.7vw,20px)',
          lineHeight: 1.55, color: '#cfc4b2',
        }}>
          Not an overnight fix. A small daily habit whose effects add up, the way good ones do.
        </p>

        {/* benefit cards */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 'clamp(20px,2.4vw,32px)', marginTop: 'clamp(48px,7vh,80px)',
        }}>
          {BENEFITS.map((b, i) => (
            <div
              key={b.title}
              data-reveal
              data-reveal-delay={(0.2 + i * 0.12).toFixed(2)}
              style={{
                opacity: 0,
                padding: 'clamp(26px,3vw,36px)',
                borderRadius: '4px',
                border: '1px solid rgba(237,228,211,.12)',
                background: 'rgba(237,228,211,.02)',
              }}
            >
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '54px', height: '54px', borderRadius: '50%',
                background: 'rgba(23,17,14,.9)', border: '1px solid rgba(198,162,76,.5)',
                boxShadow: '0 8px 22px rgba(0,0,0,.5), 0 0 20px rgba(226,58,52,.2)',
              }}>
                <Icon name={b.icon} />
              </span>

              <h3 style={{
                margin: '22px 0 0', fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800,
                fontSize: 'clamp(24px,2.6vw,32px)', lineHeight: 1.05, letterSpacing: '-.01em', color: '#EDE4D3',
              }}>{b.title}</h3>

              <p style={{
                margin: '12px 0 0', fontFamily: "'Space Grotesk',sans-serif",
                fontSize: 'clamp(15px,1.5vw,17px)', lineHeight: 1.6, color: '#cfc4b2',
              }}>{b.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
