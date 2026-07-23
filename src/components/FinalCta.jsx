import { useEffect, useRef } from 'react';
import { LINKS } from '../data.js';

const EASE = 'cubic-bezier(.23,1,.32,1)';
const prefersReduce = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// monochrome film grain, matches the split-door texture so the last screen and
// the first share a surface
const GRAIN =
  "url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22140%22 height=%22140%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%222%22 stitchTiles=%22stitch%22/><feColorMatrix type=%22saturate%22 values=%220%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/></svg>')";

// rising gold dust motes spread across the stage
const DUST = [
  { left: '12%', bottom: '8%', size: 3, dx: '18px', dur: '11s', delay: '0s' },
  { left: '26%', bottom: '26%', size: 2, dx: '-14px', dur: '13s', delay: '1.5s' },
  { left: '44%', bottom: '12%', size: 3, dx: '22px', dur: '10s', delay: '.8s' },
  { left: '58%', bottom: '34%', size: 2, dx: '-18px', dur: '14s', delay: '2.4s' },
  { left: '72%', bottom: '16%', size: 3, dx: '20px', dur: '12s', delay: '1.1s' },
  { left: '86%', bottom: '30%', size: 2, dx: '-12px', dur: '13.5s', delay: '3s' },
];

/**
 * Final CTA — "Formula Map". A dark blueprint stage: gold-lettered payoff line
 * with a shining "Beauty from Within", a model resting on the call-to-action
 * button, and the pouch + sachet floating on the right. Everything reveals on
 * scroll and keeps a soft ambient life (drifting spotlight, gold dust, headline
 * sheen, pouch bob, sachet sway, button shine). All motion stops under
 * prefers-reduced-motion.
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
        const dx = el.getAttribute('data-reveal-x');
        const from = dx ? `translateX(${dx})` : 'translateY(34px)';
        el.animate(
          [{ opacity: 0, transform: from }, { opacity: 1, transform: 'none' }],
          { duration: 1000, delay, easing: EASE, fill: 'both' });
        io.unobserve(el);
      });
    }, { threshold: 0.18 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [reduce]);

  return (
    <section id="brew" ref={rootRef} className="fullpage" style={{ position: 'relative', overflow: 'hidden', background: '#0b0908', fontFamily: "'Space Grotesk',system-ui,sans-serif" }}>
      <style>{`
        @keyframes cta2-shine { to { background-position:220% 0; } }
        @keyframes cta2-bob { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-10px); } }
        @keyframes cta2-sway { 0%,100% { transform:rotate(-8deg) translateY(0); } 50% { transform:rotate(-6.4deg) translateY(-6px); } }
        @keyframes cta2-gpulse { 0%,100% { opacity:.45; } 50% { opacity:.85; } }
        @media (prefers-reduced-motion: reduce) { #brew [data-anim] { animation:none !important; } }
      `}</style>

      {/* top seam fade — bridges the dark FAQ section into the CTA */}
      <span aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 'clamp(120px,18vh,220px)', background: 'linear-gradient(180deg,#141210 0%,rgba(11,9,8,0) 100%)', pointerEvents: 'none', zIndex: 6 }} />

      {/* blueprint grid */}
      <span aria-hidden="true" style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(198,162,76,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(198,162,76,.05) 1px,transparent 1px)', backgroundSize: '46px 46px', pointerEvents: 'none', zIndex: 0 }} />

      {/* dawn glow rising off the floor */}
      <span aria-hidden="true" style={{ position: 'absolute', left: '50%', bottom: 0, width: 'min(150%,1500px)', height: '60%', transform: 'translateX(-50%)', background: 'radial-gradient(120% 100% at 50% 116%,rgba(246,183,74,.20),rgba(226,58,52,.09) 34%,transparent 62%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* drifting warm spotlight */}
      <span aria-hidden="true" data-anim style={{ position: 'absolute', width: '560px', height: '560px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(246,183,74,.16),transparent 60%)', filter: 'blur(40px)', animation: reduce ? 'none' : 'cta-sweep 14s ease-in-out infinite', zIndex: 0 }} />

      {/* rising gold dust */}
      {DUST.map((d, i) => (
        <span key={i} aria-hidden="true" data-anim style={{ position: 'absolute', left: d.left, bottom: d.bottom, width: `${d.size}px`, height: `${d.size}px`, borderRadius: '50%', background: '#F6E39A', boxShadow: '0 0 6px rgba(246,227,154,.8)', '--dx': d.dx, animation: reduce ? 'none' : `cta-dust ${d.dur} ease-in-out ${d.delay} infinite`, zIndex: 0 }} />
      ))}

      {/* film grain + vignette */}
      <span aria-hidden="true" style={{ position: 'absolute', inset: 0, backgroundImage: GRAIN, opacity: 0.05, mixBlendMode: 'screen', pointerEvents: 'none', zIndex: 1 }} />
      <span aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', boxShadow: 'inset 0 0 220px 50px rgba(0,0,0,.7)', zIndex: 1 }} />

      <div className="two-col" style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: '1240px', margin: '0 auto', padding: 'clamp(56px,8vh,110px) clamp(28px,6vw,80px)', display: 'grid', gridTemplateColumns: '1.05fr .95fr', alignItems: 'center', gap: 'clamp(30px,5vw,70px)' }}>

        {/* LEFT — copy, model + button */}
        <div style={{ position: 'relative' }}>
          <span data-reveal style={{ display: 'inline-block', opacity: reduce ? 1 : 0, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: '13px', letterSpacing: '.1em', textTransform: 'uppercase', color: '#C6A24C' }}>One last sip</span>
          <h2 data-reveal data-reveal-delay=".08" className="fp-head" style={{ opacity: reduce ? 1 : 0, margin: '16px 0 0', fontFamily: "'Anton',sans-serif", textTransform: 'uppercase', fontWeight: 400, fontSize: 'clamp(46px,5.6vw,74px)', lineHeight: 0.9, letterSpacing: '-.005em', color: '#EDE4D3' }}>
            Six actives.<br />
            <span data-anim style={{ background: 'linear-gradient(100deg,#C99A34 0%,#F6E39A 22%,#FFF3C6 38%,#E1BC5C 56%,#C99A34 78%)', backgroundSize: '220% 100%', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', animation: reduce ? 'none' : 'cta2-shine 4.5s linear infinite' }}>Beauty from Within</span>
          </h2>
          <p data-reveal data-reveal-delay=".16" style={{ opacity: reduce ? 1 : 0, margin: '20px 0 0', maxWidth: '320px', fontSize: '16px', lineHeight: 1.7, color: '#c9bca9' }}>Six actives, real coffee. Beauty you can brew and take.</p>

          <div data-reveal data-reveal-delay=".24" style={{ opacity: reduce ? 1 : 0, position: 'relative', display: 'inline-block', marginTop: 'clamp(240px,27vw,320px)' }}>
            <span aria-hidden="true" data-anim style={{ position: 'absolute', left: '50%', bottom: '100%', marginBottom: '-150px', transform: 'translateX(-50%)', width: '320px', height: '300px', borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(246,183,74,.16),rgba(226,58,52,.06) 46%,transparent 70%)', filter: 'blur(16px)', animation: reduce ? 'none' : 'cta2-gpulse 6s ease-in-out infinite', zIndex: 0 }} />
            <img src="assets/img/model-cut.png" alt="Woman enjoying an AMAZTRA coffee" style={{ position: 'absolute', left: '50%', bottom: '100%', marginBottom: '-8px', transform: 'translateX(-50%)', height: 'clamp(240px,27vw,320px)', width: 'auto', filter: 'drop-shadow(0 22px 30px rgba(0,0,0,.55))', pointerEvents: 'none', zIndex: 2 }} />
            <a href={LINKS.shop} target="_blank" rel="noopener noreferrer" className="cta-btn" style={{ position: 'relative', overflow: 'hidden', display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '16px 32px', minHeight: '44px', borderRadius: '3px', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 'clamp(15px,1.6vw,17px)', color: '#F6E39A', background: 'rgba(11,9,8,.5)', border: '1px solid #C6A24C', whiteSpace: 'nowrap', zIndex: 1 }}>
              Come brew with us
              <span aria-hidden="true" className="cta-arrow" style={{ fontSize: '1.1em', lineHeight: 1 }}>&rarr;</span>
              <span aria-hidden="true" data-anim style={{ position: 'absolute', top: 0, left: 0, width: '40%', height: '100%', background: 'linear-gradient(90deg,transparent,rgba(246,227,154,.4),transparent)', animation: reduce ? 'none' : 'cta-bshine 5s ease-in-out infinite' }} />
            </a>
          </div>
        </div>

        {/* RIGHT — pouch + sachet */}
        <div data-reveal data-reveal-delay=".2" data-reveal-x="40px" className="col-aside" style={{ opacity: reduce ? 1 : 0, position: 'relative', justifySelf: 'center', width: 'clamp(280px,32vw,440px)', height: 'clamp(380px,44vw,540px)' }}>
          <span aria-hidden="true" style={{ position: 'absolute', left: '50%', top: '46%', transform: 'translate(-50%,-50%)', width: '110%', height: '80%', borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(246,183,74,.18),rgba(226,58,52,.07) 45%,transparent 70%)', filter: 'blur(18px)', zIndex: 0 }} />
          <img src="assets/img/pouch-new.png" alt="AMAZTRA coffee pouch" data-anim style={{ position: 'absolute', left: '16%', top: 0, width: '68%', filter: 'drop-shadow(0 26px 36px rgba(0,0,0,.6))', animation: reduce ? 'none' : 'cta2-bob 9s ease-in-out infinite', zIndex: 2 }} />
          <img src="assets/img/sachet-new.png" alt="AMAZTRA instant coffee sachet" data-anim style={{ position: 'absolute', left: '0%', top: '66%', width: '84%', transformOrigin: 'center', transform: 'rotate(-8deg)', filter: 'drop-shadow(0 18px 24px rgba(0,0,0,.6))', animation: reduce ? 'none' : 'cta2-sway 8s ease-in-out infinite', zIndex: 3 }} />
        </div>
      </div>
    </section>
  );
}
