import { useEffect, useRef } from 'react';
import { POUCH, LINKS } from '../data.js';

const EASE = 'cubic-bezier(.23,1,.32,1)';
const prefersReduce = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Final CTA — the cinematic close. Floating pouch over a red glow, a confident
 * closing line, and one soft gold button out to the shop (no price on the page).
 * A slim brand footer sits beneath. Reveal-on-scroll; at rest under reduced motion.
 */
export default function FinalCta() {
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
          { duration: 950, delay, easing: EASE, fill: 'both' });
        io.unobserve(el);
      });
    }, { threshold: 0.2 });

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section
      id="brew"
      ref={rootRef}
      style={{
        position: 'relative',
        padding: 'clamp(84px,13vh,170px) clamp(20px,5vw,46px) 0',
        background: 'radial-gradient(120% 90% at 50% 22%, #241713 0%, #171310 48%, #0c0a09 100%)',
        fontFamily: "'Space Grotesk',system-ui,sans-serif",
        overflow: 'hidden', textAlign: 'center',
      }}
    >
      <span aria-hidden="true" className="am-noise" style={{ opacity: 0.05 }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '760px', margin: '0 auto' }}>
        {/* floating pouch over a red glow */}
        <div data-reveal style={{ opacity: 0, position: 'relative', width: 'clamp(180px,26vw,300px)', margin: '0 auto' }}>
          <span aria-hidden="true" style={{
            position: 'absolute', inset: '2% 4% 12%', borderRadius: '50%',
            background: 'radial-gradient(circle at 50% 46%, rgba(193,26,34,.5), transparent 64%)',
            filter: 'blur(38px)',
          }} />
          <img src={POUCH} alt="AMAZTRA coffee pouch" style={{
            position: 'relative', width: '100%',
            filter: 'drop-shadow(0 34px 46px rgba(0,0,0,.6))',
            animation: 'am-float 9s ease-in-out infinite',
          }} />
        </div>

        {/* eyebrow */}
        <p data-reveal data-reveal-delay=".06" style={{
          opacity: 0, margin: 'clamp(28px,4vh,44px) 0 0',
          fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: '13px',
          letterSpacing: '.04em', textTransform: 'uppercase', color: '#C6A24C',
        }}>Ready when you are</p>

        {/* headline */}
        <h2 data-reveal data-reveal-delay=".12" style={{
          opacity: 0, margin: 'clamp(18px,2.6vh,26px) auto 0', maxWidth: '15ch',
          fontFamily: "'Anton',sans-serif", fontWeight: 400, textTransform: 'uppercase',
          fontSize: 'clamp(44px,7vw,104px)', lineHeight: 0.9, letterSpacing: '-.015em', color: '#EDE4D3',
        }}>
          Pour yourself something <span style={{ color: '#E23A34' }}>better.</span>
        </h2>

        {/* subtext */}
        <p data-reveal data-reveal-delay=".18" style={{
          opacity: 0, margin: 'clamp(18px,2.6vh,26px) auto 0', maxWidth: '48ch',
          fontFamily: "'Space Grotesk',sans-serif", fontSize: 'clamp(16px,1.7vw,20px)',
          lineHeight: 1.55, color: '#cfc4b2',
        }}>
          Six actives, one cup, and the same ritual you already love. Come see what a better morning tastes like.
        </p>

        {/* CTA button */}
        <div data-reveal data-reveal-delay=".24" style={{ opacity: 0, marginTop: 'clamp(30px,4.5vh,48px)' }}>
          <a
            href={LINKS.shop}
            target="_blank"
            rel="noopener noreferrer"
            className="cta-btn"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '12px',
              padding: '18px 34px', minHeight: '44px', borderRadius: '3px',
              fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600,
              fontSize: 'clamp(15px,1.6vw,18px)', letterSpacing: '.02em', color: '#17110e',
              background: 'linear-gradient(180deg,#F6E39A 0%,#E1BC5C 44%,#C99A34 70%,#A9761B 100%)',
              boxShadow: '0 14px 34px rgba(226,58,52,.22), 0 0 0 1px rgba(246,227,154,.28)',
            }}
          >
            Come brew with us
            <span aria-hidden="true" className="cta-arrow" style={{ fontSize: '1.1em', lineHeight: 1 }}>&rarr;</span>
          </a>

          <p style={{
            margin: 'clamp(16px,2.4vh,22px) 0 0', fontFamily: "'Space Grotesk',sans-serif",
            fontSize: '13px', letterSpacing: '.04em', color: 'rgba(237,228,211,.5)',
          }}>
            Beauty from within, poured daily.
          </p>
        </div>

        {/* slim brand footer */}
        <footer data-reveal data-reveal-delay=".3" style={{
          opacity: 0, marginTop: 'clamp(64px,10vh,120px)',
          borderTop: '1px solid rgba(237,228,211,.12)',
          padding: 'clamp(26px,4vh,38px) 0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: '10px',
        }}>
          <span style={{
            fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 'clamp(18px,2.4vw,26px)',
            letterSpacing: '.16em',
            background: 'linear-gradient(180deg,#F6E39A 0%,#E1BC5C 40%,#C99A34 66%,#A9761B 100%)',
            WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
          }}>AMAZTRA</span>
          <span style={{
            fontFamily: "'Space Grotesk',sans-serif", fontSize: '12px',
            letterSpacing: '.06em', color: 'rgba(237,228,211,.4)',
          }}>&copy; {new Date().getFullYear()} AMAZTRA. Beauty you can brew.</span>
        </footer>
      </div>
    </section>
  );
}
