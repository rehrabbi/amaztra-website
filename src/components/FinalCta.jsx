import { useEffect, useRef } from 'react';
import { POUCH, LINKS } from '../data.js';

const EASE = 'cubic-bezier(.23,1,.32,1)';
const prefersReduce = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// rising gold dust motes — positions, drift and timing from the design reference
const DUST = [
  { left: '22%', bottom: '6%', size: 3, dx: '18px', dur: '9s', delay: '0s' },
  { left: '44%', bottom: '2%', size: 2, dx: '-14px', dur: '10.5s', delay: '1.5s' },
  { left: '60%', bottom: '8%', size: 3, dx: '22px', dur: '8.5s', delay: '0.8s' },
  { left: '76%', bottom: '4%', size: 2, dx: '-20px', dur: '11s', delay: '2.4s' },
];

// headline words with a staggered float; "waiting." is the gold accent word
const WORDS = [
  { t: 'Your', delay: '0s', sep: ' ' },
  { t: 'cup', delay: '.3s', sep: 'br' },
  { t: 'is', delay: '.6s', sep: ' ' },
  { t: 'waiting.', delay: '.9s', sep: '', accent: true },
];

/**
 * Final CTA — "Spotlight Reveal". A dark stage with a drifting warm spotlight,
 * rising gold dust and a glowing, floating pouch; the copy and one gold button
 * close the page. Reveal-on-scroll; all ambient motion is off under reduced
 * motion. There is no footer beneath it.
 */
export default function FinalCta() {
  const rootRef = useRef(null);
  const reduce = prefersReduce();

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const els = root.querySelectorAll('[data-reveal]');
    if (reduce) { els.forEach((el) => { el.style.opacity = '1'; el.style.transform = 'none'; }); return; }
    const io = new IntersectionObserver((ents) => {
      ents.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const delay = parseFloat(el.getAttribute('data-reveal-delay') || '0') * 1000;
        el.animate(
          [{ opacity: 0, transform: 'translateY(30px)' }, { opacity: 1, transform: 'translateY(0)' }],
          { duration: 900, delay, easing: EASE, fill: 'both' });
        io.unobserve(el);
      });
    }, { threshold: 0.2 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [reduce]);

  return (
    <section id="brew" ref={rootRef} className="fullpage" style={{ position: 'relative', overflow: 'hidden', fontFamily: "'Space Grotesk',system-ui,sans-serif" }}>
      {/* top seam fade — bridges the dark FAQ section into the CTA */}
      <span aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 'clamp(120px,18vh,220px)', background: 'linear-gradient(180deg,#141210 0%,rgba(20,18,16,0) 100%)', pointerEvents: 'none', zIndex: 6 }} />

      <div id="cta-morning" style={{ position: 'relative', background: '#0d0b0a', padding: 'clamp(64px,9vh,110px) clamp(28px,6vw,80px)', minHeight: '520px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'clamp(30px,6vw,80px)', overflow: 'hidden', flexWrap: 'wrap' }}>
        {/* moving warm spotlight */}
        <span aria-hidden="true" style={{ position: 'absolute', width: '560px', height: '560px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(246,183,74,.28),transparent 60%)', filter: 'blur(34px)', animation: reduce ? 'none' : 'cta-sweep 12s ease-in-out infinite', zIndex: 0 }} />

        {/* rising gold dust */}
        {DUST.map((d, i) => (
          <span key={i} aria-hidden="true" style={{ position: 'absolute', left: d.left, bottom: d.bottom, width: `${d.size}px`, height: `${d.size}px`, borderRadius: '50%', background: '#F6E39A', boxShadow: '0 0 6px rgba(246,227,154,.8)', '--dx': d.dx, animation: reduce ? 'none' : `cta-dust ${d.dur} ease-in-out ${d.delay} infinite`, zIndex: 0 }} />
        ))}

        {/* vignette */}
        <span aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', boxShadow: 'inset 0 0 200px 40px rgba(0,0,0,.7)', zIndex: 1 }} />

        {/* pouch */}
        <div data-reveal style={{ opacity: reduce ? 1 : 0, position: 'relative', zIndex: 2, flexShrink: 0, width: 'clamp(150px,20vw,200px)' }}>
          <span aria-hidden="true" style={{ position: 'absolute', left: '50%', top: '50%', width: '300px', height: '300px', transform: 'translate(-50%,-50%)', borderRadius: '50%', background: 'radial-gradient(circle,rgba(246,183,74,.4),rgba(226,58,52,.16) 42%,transparent 66%)', filter: 'blur(14px)', animation: reduce ? 'none' : 'cta-pulse 5s ease-in-out infinite' }} />
          <img src={POUCH} alt="AMAZTRA pouch" style={{ position: 'relative', display: 'block', width: '100%', filter: 'drop-shadow(0 28px 40px rgba(0,0,0,.6))', animation: reduce ? 'none' : 'cta-float 9s ease-in-out infinite' }} />
        </div>

        {/* copy + CTA */}
        <div data-reveal data-reveal-delay=".1" style={{ opacity: reduce ? 1 : 0, position: 'relative', zIndex: 2, maxWidth: '440px' }}>
          <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: '13px', letterSpacing: '.1em', textTransform: 'uppercase', color: '#C6A24C' }}>ONE LAST SIP</span>
          <h2 className="fp-head" style={{ margin: '16px 0 0', fontFamily: "'Anton',sans-serif", textTransform: 'uppercase', fontSize: 'clamp(46px,5.6vw,74px)', lineHeight: 0.86, letterSpacing: '-.01em', color: '#F3E8D3' }}>
            {WORDS.map((w, i) => (
              <span key={i}>
                <span style={{ display: 'inline-block', ...(w.accent ? { color: '#F6B74A' } : null), animation: reduce ? 'none' : `cta-lfloat 5s ease-in-out ${w.delay} infinite` }}>{w.t}</span>
                {w.sep === 'br' ? <br /> : w.sep}
              </span>
            ))}
          </h2>
          <p style={{ margin: '20px 0 0', fontSize: '16px', lineHeight: 1.7, color: '#c9bca9' }}>Six actives, real coffee, nothing to hide. Start the ritual you&rsquo;ll actually keep.</p>
          <a href={LINKS.shop} target="_blank" rel="noopener noreferrer" className="cta-btn" style={{ position: 'relative', overflow: 'hidden', marginTop: '30px', display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '17px 34px', minHeight: '44px', borderRadius: '4px', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 'clamp(15px,1.6vw,17px)', color: '#17110e', background: 'linear-gradient(180deg,#F6E39A 0%,#E1BC5C 44%,#C99A34 70%,#A9761B 100%)', boxShadow: '0 14px 34px rgba(0,0,0,.45)', whiteSpace: 'nowrap' }}>
            Come brew with us
            <span aria-hidden="true" className="cta-arrow" style={{ fontSize: '1.1em', lineHeight: 1 }}>&rarr;</span>
            <span aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, width: '40%', height: '100%', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,.5),transparent)', animation: reduce ? 'none' : 'cta-bshine 5s ease-in-out infinite' }} />
          </a>
        </div>
      </div>
    </section>
  );
}
