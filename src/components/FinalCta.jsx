import { useEffect, useRef } from 'react';
import { POUCH, LINKS } from '../data.js';

const EASE = 'cubic-bezier(.23,1,.32,1)';
const prefersReduce = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// monochrome film grain, matches the split-door texture so the last screen and
// the first share a surface
const GRAIN =
  "url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22140%22 height=%22140%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%222%22 stitchTiles=%22stitch%22/><feColorMatrix type=%22saturate%22 values=%220%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/></svg>')";

// rising gold dust motes, now spread through the full-height stage
const DUST = [
  { left: '16%', bottom: '9%', size: 3, dx: '18px', dur: '11s', delay: '0s' },
  { left: '33%', bottom: '28%', size: 2, dx: '-14px', dur: '13s', delay: '1.5s' },
  { left: '49%', bottom: '13%', size: 3, dx: '22px', dur: '10s', delay: '.8s' },
  { left: '63%', bottom: '40%', size: 2, dx: '-18px', dur: '14s', delay: '2.4s' },
  { left: '78%', bottom: '18%', size: 3, dx: '20px', dur: '12s', delay: '1.1s' },
  { left: '88%', bottom: '34%', size: 2, dx: '-12px', dur: '13.5s', delay: '3s' },
];

// soft steam wisps rising off the pouch (positions relative to the pouch column)
const STEAM = [
  { left: '34%', w: '11px', h: '120px', dur: '7s', delay: '0s' },
  { left: '52%', w: '14px', h: '150px', dur: '8.6s', delay: '2.3s' },
  { left: '46%', w: '9px', h: '104px', dur: '7.8s', delay: '4.4s' },
];

// headline words with a staggered float; "waiting." is the gold accent word
const WORDS = [
  { t: 'Your', delay: '0s', sep: ' ' },
  { t: 'cup', delay: '.3s', sep: 'br' },
  { t: 'is', delay: '.6s', sep: ' ' },
  { t: 'waiting.', delay: '.9s', sep: '', accent: true },
];

/**
 * Final CTA — "Spotlight Stage". The stage fills the viewport: a drifting warm
 * spotlight, a dawn glow rising off the floor, gold dust in the air, the pouch
 * glowing on a reflective floor with steam curling up, and a faint AMAZTRA
 * wordmark across the floor that bookends the split doors from the top of the
 * page. Reveal-on-scroll; all ambient motion stops under reduced motion. No
 * footer sits beneath it.
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

      <div id="cta-morning" style={{ position: 'relative', background: '#0d0b0a', padding: 'clamp(64px,9vh,110px) clamp(28px,6vw,80px)', minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'clamp(30px,6vw,80px)', overflow: 'hidden', flexWrap: 'wrap' }}>
        {/* dawn glow rising off the floor */}
        <span aria-hidden="true" style={{ position: 'absolute', left: '50%', bottom: 0, width: 'min(150%,1400px)', height: '58%', transform: 'translateX(-50%)', background: 'radial-gradient(120% 100% at 50% 116%,rgba(246,183,74,.22),rgba(226,58,52,.10) 34%,transparent 62%)', pointerEvents: 'none', zIndex: 0 }} />

        {/* faint stage-floor wordmark, bookending the split doors from the top of the page */}
        <span aria-hidden="true" style={{ position: 'absolute', left: '50%', bottom: 'clamp(10px,3vh,42px)', transform: 'translateX(-50%)', fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 'clamp(96px,20vw,320px)', letterSpacing: '.08em', lineHeight: 1, whiteSpace: 'nowrap', color: 'rgba(237,228,211,.035)', pointerEvents: 'none', userSelect: 'none', zIndex: 0 }}>AMAZTRA</span>

        {/* moving warm spotlight */}
        <span aria-hidden="true" style={{ position: 'absolute', width: '560px', height: '560px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(246,183,74,.28),transparent 60%)', filter: 'blur(34px)', animation: reduce ? 'none' : 'cta-sweep 12s ease-in-out infinite', zIndex: 0 }} />

        {/* rising gold dust */}
        {DUST.map((d, i) => (
          <span key={i} aria-hidden="true" style={{ position: 'absolute', left: d.left, bottom: d.bottom, width: `${d.size}px`, height: `${d.size}px`, borderRadius: '50%', background: '#F6E39A', boxShadow: '0 0 6px rgba(246,227,154,.8)', '--dx': d.dx, animation: reduce ? 'none' : `cta-dust ${d.dur} ease-in-out ${d.delay} infinite`, zIndex: 0 }} />
        ))}

        {/* film grain over the whole stage */}
        <span aria-hidden="true" style={{ position: 'absolute', inset: 0, backgroundImage: GRAIN, opacity: 0.05, mixBlendMode: 'screen', pointerEvents: 'none', zIndex: 1 }} />

        {/* vignette */}
        <span aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', boxShadow: 'inset 0 0 200px 40px rgba(0,0,0,.7)', zIndex: 1 }} />

        {/* pouch on a reflective floor, steam curling up */}
        <div data-reveal style={{ opacity: reduce ? 1 : 0, position: 'relative', zIndex: 2, flexShrink: 0, width: 'clamp(150px,20vw,200px)' }}>
          {/* steam */}
          {STEAM.map((s, i) => (
            <span key={i} aria-hidden="true" style={{ position: 'absolute', left: s.left, bottom: '78%', width: s.w, height: s.h, borderRadius: '999px', background: 'linear-gradient(to top,rgba(237,228,211,0),rgba(237,228,211,.16),rgba(237,228,211,0))', filter: 'blur(6px)', opacity: reduce ? 0 : 1, transformOrigin: 'bottom center', animation: reduce ? 'none' : `cta-steam ${s.dur} ease-in-out infinite`, animationDelay: s.delay, pointerEvents: 'none', zIndex: 1 }} />
          ))}
          <span aria-hidden="true" style={{ position: 'absolute', left: '50%', top: '50%', width: '300px', height: '300px', transform: 'translate(-50%,-50%)', borderRadius: '50%', background: 'radial-gradient(circle,rgba(246,183,74,.4),rgba(226,58,52,.16) 42%,transparent 66%)', filter: 'blur(14px)', animation: reduce ? 'none' : 'cta-pulse 5s ease-in-out infinite', zIndex: 0 }} />
          <img src={POUCH} alt="AMAZTRA pouch" style={{ position: 'relative', display: 'block', width: '100%', filter: 'drop-shadow(0 28px 40px rgba(0,0,0,.6))', animation: reduce ? 'none' : 'cta-float 9s ease-in-out infinite', zIndex: 2 }} />
          {/* floor reflection */}
          <img src={POUCH} alt="" aria-hidden="true" style={{ position: 'absolute', left: 0, top: '99%', width: '100%', transform: 'scaleY(-1)', opacity: 0.14, filter: 'blur(2px)', WebkitMaskImage: 'linear-gradient(to bottom,rgba(0,0,0,.7),transparent 66%)', maskImage: 'linear-gradient(to bottom,rgba(0,0,0,.7),transparent 66%)', pointerEvents: 'none', zIndex: 0 }} />
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
