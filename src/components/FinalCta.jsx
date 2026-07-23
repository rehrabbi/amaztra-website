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
  const pouchWrapRef = useRef(null);
  const sachetWrapRef = useRef(null);
  const reduce = prefersReduce();

  // cursor parallax on the product cluster: pouch drifts a little, sachet more (depth)
  const parallax = (e) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    if (pouchWrapRef.current) pouchWrapRef.current.style.transform = `translate(${(px * 16).toFixed(1)}px,${(py * 12).toFixed(1)}px)`;
    if (sachetWrapRef.current) sachetWrapRef.current.style.transform = `translate(${(px * 32).toFixed(1)}px,${(py * 24).toFixed(1)}px)`;
  };
  const parallaxReset = () => {
    if (pouchWrapRef.current) pouchWrapRef.current.style.transform = 'translate(0,0)';
    if (sachetWrapRef.current) sachetWrapRef.current.style.transform = 'translate(0,0)';
  };

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
    }, { rootMargin: '-40% 0px -40% 0px', threshold: 0 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [reduce]);

  return (
    <section id="brew" ref={rootRef} className="fullpage" style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(180deg,#17110e,#141210)', fontFamily: "'Space Grotesk',system-ui,sans-serif" }}>
      <style>{`
        @keyframes cta2-shine { to { background-position:220% 0; } }
        @keyframes cta2-bob { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-10px); } }
        @keyframes cta2-sway { 0%,100% { transform:rotate(-8deg) translateY(0); } 50% { transform:rotate(-6.4deg) translateY(-6px); } }
        @keyframes cta2-gpulse { 0%,100% { opacity:.45; } 50% { opacity:.85; } }
        @media (prefers-reduced-motion: reduce) { #brew [data-anim] { animation:none !important; } }
      `}</style>

      {/* top seam fade — bridges the dark FAQ section into the CTA (behind content) */}
      <span aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 'clamp(120px,18vh,220px)', background: 'linear-gradient(180deg,#141210 0%,rgba(11,9,8,0) 100%)', pointerEvents: 'none', zIndex: 1 }} />

      {/* flat gradient background to read the same as the FAQ section (no grid / glow / vignette) */}

      {/* model — big, on the right, connected to the section floor */}
      <span aria-hidden="true" style={{ position: 'absolute', right: 'max(0px, calc((100vw - 1330px) / 2))', bottom: 0, width: 'clamp(360px,42vw,620px)', height: 'clamp(300px,40vh,560px)', background: 'radial-gradient(ellipse at 60% 90%,rgba(246,183,74,.20),rgba(226,58,52,.08) 46%,transparent 72%)', filter: 'blur(24px)', pointerEvents: 'none', zIndex: 1 }} />
      <img data-reveal data-reveal-delay=".18" data-reveal-x="46px" src="assets/img/model-cut.png" alt="Woman enjoying an AMAZTRA coffee" className="cta-model" style={{ opacity: reduce ? 1 : 0, position: 'absolute', right: 'max(20px, calc((100vw - 1200px) / 2))', bottom: 0, height: 'clamp(440px,58vw,820px)', width: 'auto', filter: 'drop-shadow(0 26px 40px rgba(0,0,0,.6))', pointerEvents: 'none', zIndex: 2 }} />

      <div className="two-col" style={{ position: 'relative', zIndex: 3, width: '100%', maxWidth: '1240px', margin: '0 auto', minHeight: 'clamp(620px,92vh,940px)', padding: 'clamp(56px,8vh,110px) clamp(28px,6vw,80px) 0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

        {/* copy, product cluster, then the button — all kept to the left */}
        <div style={{ position: 'relative', maxWidth: '560px' }}>
          <span data-reveal style={{ display: 'inline-block', opacity: reduce ? 1 : 0, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: '13px', letterSpacing: '.1em', textTransform: 'uppercase', color: '#C6A24C' }}>One last sip</span>
          <h2 data-reveal data-reveal-delay=".08" className="fp-head" style={{ opacity: reduce ? 1 : 0, margin: '16px 0 0', fontFamily: "'Anton',sans-serif", textTransform: 'uppercase', fontWeight: 400, fontSize: 'clamp(46px,5.6vw,74px)', lineHeight: 0.9, letterSpacing: '-.005em', color: '#EDE4D3' }}>
            Six actives.<br />
            <span data-anim style={{ background: 'linear-gradient(100deg,#C99A34 0%,#F6E39A 22%,#FFF3C6 38%,#E1BC5C 56%,#C99A34 78%)', backgroundSize: '220% 100%', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', animation: reduce ? 'none' : 'cta2-shine 4.5s linear infinite' }}>Beauty from Within</span>
          </h2>
          <p data-reveal data-reveal-delay=".16" style={{ opacity: reduce ? 1 : 0, margin: '20px 0 0', maxWidth: '320px', fontSize: '16px', lineHeight: 1.7, color: '#c9bca9' }}>Six actives, real coffee. Beauty you can brew and take.</p>

          {/* pouch + sachet cluster, between the headline and the button */}
          <div data-reveal data-reveal-delay=".22" onMouseMove={parallax} onMouseLeave={parallaxReset} style={{ opacity: reduce ? 1 : 0, position: 'relative', width: 'min(400px,80%)', height: 'clamp(150px,17vw,200px)', margin: 'clamp(14px,2vh,24px) 0' }}>
            <span aria-hidden="true" style={{ position: 'absolute', left: '42%', top: '52%', transform: 'translate(-50%,-50%)', width: '120%', height: '110%', borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(246,183,74,.16),rgba(226,58,52,.06) 46%,transparent 70%)', filter: 'blur(16px)', zIndex: 0 }} />
            <span ref={pouchWrapRef} style={{ position: 'absolute', left: 0, bottom: 0, height: '100%', transition: 'transform .3s ease', zIndex: 2 }}>
              <img src="assets/img/pouch-new.png" alt="AMAZTRA coffee pouch" data-anim style={{ display: 'block', height: '100%', width: 'auto', filter: 'drop-shadow(0 22px 30px rgba(0,0,0,.6))', animation: reduce ? 'none' : 'cta2-bob 9s ease-in-out infinite' }} />
            </span>
            <span ref={sachetWrapRef} style={{ position: 'absolute', left: '34%', bottom: '2%', width: '64%', transition: 'transform .3s ease', zIndex: 4 }}>
              <img src="assets/img/sachet-new.png" alt="AMAZTRA instant coffee sachet" data-anim style={{ display: 'block', width: '100%', transformOrigin: 'center', transform: 'rotate(-8deg)', filter: 'drop-shadow(0 20px 26px rgba(0,0,0,.7))', animation: reduce ? 'none' : 'cta2-sway 8s ease-in-out infinite' }} />
            </span>
          </div>

          <a data-reveal data-reveal-delay=".3" href={LINKS.shop} target="_blank" rel="noopener noreferrer" className="cta-btn" style={{ opacity: reduce ? 1 : 0, position: 'relative', overflow: 'hidden', display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '16px 32px', minHeight: '44px', borderRadius: '3px', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 'clamp(15px,1.6vw,17px)', color: '#F6E39A', background: 'rgba(11,9,8,.5)', border: '1px solid #C6A24C', whiteSpace: 'nowrap' }}>
            Come brew with us
            <span aria-hidden="true" className="cta-arrow" style={{ fontSize: '1.1em', lineHeight: 1 }}>&rarr;</span>
            <span aria-hidden="true" data-anim style={{ position: 'absolute', top: 0, left: 0, width: '40%', height: '100%', background: 'linear-gradient(90deg,transparent,rgba(246,227,154,.4),transparent)', animation: reduce ? 'none' : 'cta-bshine 5s ease-in-out infinite' }} />
          </a>
        </div>
      </div>
    </section>
  );
}
