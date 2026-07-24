import { useEffect, useRef, useState } from 'react';
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
function FinalCtaDesktop() {
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
    const els = [...root.querySelectorAll('[data-reveal]')];
    if (reduce) { els.forEach((el) => { el.style.opacity = '1'; el.style.transform = 'none'; }); return; }
    // Reveal the whole section at once when it reaches the centre band. Observing
    // the section (not each element) is essential: the button sits at the foot of
    // the last section, which can never scroll to centre on its own, so a per-element
    // trigger would leave it hidden forever.
    const revealAll = () => {
      els.forEach((el) => {
        const delay = parseFloat(el.getAttribute('data-reveal-delay') || '0') * 1000;
        const dx = el.getAttribute('data-reveal-x');
        const from = dx ? `translateX(${dx})` : 'translateY(34px)';
        el.style.opacity = '1';
        el.animate(
          [{ opacity: 0, transform: from }, { opacity: 1, transform: 'none' }],
          { duration: 1000, delay, easing: EASE, fill: 'backwards' });
      });
    };
    const io = new IntersectionObserver((ents) => {
      ents.forEach((e) => { if (e.isIntersecting) { revealAll(); io.disconnect(); } });
    }, { rootMargin: '-40% 0px -40% 0px', threshold: 0 });
    io.observe(root);
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
          <div data-reveal data-reveal-delay=".22" onMouseMove={parallax} onMouseLeave={parallaxReset} style={{ opacity: reduce ? 1 : 0, position: 'relative', width: 'min(580px,100%)', height: 'clamp(240px,28vw,340px)', margin: 'clamp(8px,1.2vh,14px) 0' }}>
            <span aria-hidden="true" style={{ position: 'absolute', left: '42%', top: '52%', transform: 'translate(-50%,-50%)', width: '120%', height: '110%', borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(246,183,74,.16),rgba(226,58,52,.06) 46%,transparent 70%)', filter: 'blur(16px)', zIndex: 0 }} />
            <span ref={pouchWrapRef} style={{ position: 'absolute', left: 0, bottom: 0, height: '100%', transition: 'transform .3s ease', zIndex: 2 }}>
              <img src="assets/img/pouch-new.png" alt="AMAZTRA coffee pouch" data-anim style={{ display: 'block', height: '100%', width: 'auto', filter: 'drop-shadow(0 22px 30px rgba(0,0,0,.6))', animation: reduce ? 'none' : 'cta2-bob 9s ease-in-out infinite' }} />
            </span>
            <span ref={sachetWrapRef} style={{ position: 'absolute', left: '32%', bottom: '2%', width: '72%', transition: 'transform .3s ease', zIndex: 4 }}>
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

/* ============================ MOBILE (7c cinematic + 7a cluster/motion) ============================ */

function useIsMobile(bp = 767) {
  const q = `(max-width:${bp}px)`;
  const [m, setM] = useState(() => typeof window !== 'undefined' && window.matchMedia(q).matches);
  useEffect(() => {
    const mq = window.matchMedia(q);
    const on = () => setM(mq.matches);
    on(); mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [q]);
  return m;
}

function FinalCtaMobile() {
  const rootRef = useRef(null);
  const modelRef = useRef(null);
  const reduce = prefersReduce();

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const model = modelRef.current;
    const els = [...root.querySelectorAll('[data-r]')];
    const EO = 'cubic-bezier(.16,1,.3,1)';
    if (reduce) {
      els.forEach((el) => { el.style.opacity = '1'; el.style.transform = 'none'; });
      if (model) model.style.clipPath = 'inset(0 0 0 0)';
      return;
    }
    els.forEach((el) => { el.style.opacity = '0'; });
    if (model) model.style.clipPath = 'inset(0 0 100% 0)';
    let fired = false;
    const play = () => {
      if (fired) return; fired = true;
      if (model) { model.style.clipPath = 'inset(0 0 0 0)'; model.animate([{ clipPath: 'inset(0 0 100% 0)', transform: 'translateX(-50%) scale(1.08)' }, { clipPath: 'inset(0 0 0 0)', transform: 'translateX(-50%) scale(1)' }], { duration: 1600, delay: 200, easing: EO, fill: 'both' }); }
      els.forEach((el) => {
        const d = parseFloat(el.getAttribute('data-r') || '0') * 1000;
        el.style.opacity = '1';
        el.animate([{ opacity: 0, transform: 'translateY(26px)', filter: 'blur(6px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }], { duration: 1000, delay: d, easing: EO, fill: 'both' });
      });
    };
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { play(); io.disconnect(); } }), { rootMargin: '-25% 0px -25% 0px', threshold: 0 });
    io.observe(root);
    return () => io.disconnect();
  }, [reduce]);

  return (
    <section id="brew" ref={rootRef} className="fullpage" style={{ position: 'relative', minHeight: '100svh', overflow: 'hidden', background: '#141210', fontFamily: "'Space Grotesk',system-ui,sans-serif" }}>
      <style>{`@keyframes fm-shine{0%{background-position:0 0}100%{background-position:220% 0}}@keyframes fm-btnshine{0%{transform:translateX(-140%) skewX(-18deg)}60%,100%{transform:translateX(300%) skewX(-18deg)}}@keyframes fm-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}@keyframes fm-sway{0%,100%{transform:rotate(-8deg) translateY(0)}50%{transform:rotate(-6deg) translateY(-6px)}}`}</style>
      <span aria-hidden="true" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: 0, width: '100%', height: '78%', background: 'radial-gradient(ellipse at 50% 82%,rgba(246,183,74,.2),rgba(226,58,52,.08) 46%,transparent 72%)', filter: 'blur(24px)' }} />
      {/* drifting spotlight + rising gold dust, matching the desktop CTA ambience */}
      <span aria-hidden="true" style={{ position: 'absolute', left: '50%', top: '30%', transform: 'translate(-50%,-50%)', width: '420px', height: '420px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(246,183,74,.16),transparent 60%)', filter: 'blur(38px)', animation: reduce ? 'none' : 'cta-sweep 14s ease-in-out infinite', pointerEvents: 'none', zIndex: 0 }} />
      {DUST.map((d, i) => (
        <span key={i} aria-hidden="true" style={{ position: 'absolute', left: d.left, bottom: d.bottom, width: `${d.size}px`, height: `${d.size}px`, borderRadius: '50%', background: '#F6E39A', boxShadow: '0 0 6px rgba(246,227,154,.8)', '--dx': d.dx, animation: reduce ? 'none' : `cta-dust ${d.dur} ease-in-out ${d.delay} infinite`, pointerEvents: 'none', zIndex: 0 }} />
      ))}
      <img ref={modelRef} src="assets/img/model-cut.png" alt="Woman enjoying an AMAZTRA coffee" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: 0, height: '82%', width: 'auto', filter: 'drop-shadow(0 22px 40px rgba(0,0,0,.6))', clipPath: reduce ? 'none' : 'inset(0 0 100% 0)', pointerEvents: 'none' }} />
      <span aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '34%', background: 'linear-gradient(180deg,#141210 8%,rgba(20,15,13,.4) 60%,transparent)' }} />
      <span aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '54%', background: 'linear-gradient(180deg,transparent,rgba(20,15,13,.55) 46%,#141210)' }} />

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', padding: 'calc(env(safe-area-inset-top,0px) + 52px) 26px 34px' }}>
        {/* text block — top */}
        <span data-r="0.2" style={{ opacity: reduce ? 1 : 0, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: '13px', letterSpacing: '.1em', textTransform: 'uppercase', color: '#C6A24C' }}>One last sip</span>
        <h2 data-r="0.35" style={{ opacity: reduce ? 1 : 0, margin: '12px 0 0', fontFamily: "'Anton',sans-serif", textTransform: 'uppercase', fontWeight: 400, fontSize: 'clamp(46px,14vw,60px)', lineHeight: 0.9, letterSpacing: '-.005em', color: '#EDE4D3', textShadow: '0 2px 20px rgba(0,0,0,.5)' }}>Six actives.<br /><span style={{ background: 'linear-gradient(100deg,#C99A34 0%,#F6E39A 22%,#FFF3C6 38%,#E1BC5C 56%,#C99A34 78%)', backgroundSize: '220% 100%', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', textShadow: 'none', animation: reduce ? 'none' : 'cta2-shine 4.5s linear infinite' }}>Beauty from Within</span></h2>

        {/* spacer lets the model read through */}
        <div style={{ flex: 1, minHeight: '20px' }} />

        {/* floating pouch + sachet (7a), just above the button */}
        <div data-r="0.55" style={{ opacity: reduce ? 1 : 0, position: 'relative', width: 'min(460px,100%)', height: '270px', margin: '0 0 10px' }}>
          <span aria-hidden="true" style={{ position: 'absolute', left: '42%', top: '52%', transform: 'translate(-50%,-50%)', width: '120%', height: '110%', borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(246,183,74,.16),rgba(226,58,52,.06) 46%,transparent 70%)', filter: 'blur(14px)' }} />
          <img src="assets/img/pouch-new.png" alt="AMAZTRA pouch" style={{ position: 'absolute', left: 0, bottom: 0, height: '100%', width: 'auto', filter: 'drop-shadow(0 18px 26px rgba(0,0,0,.6))', animation: reduce ? 'none' : 'fm-bob 9s ease-in-out infinite' }} />
          <img src="assets/img/sachet-new.png" alt="AMAZTRA sachet" style={{ position: 'absolute', left: '32%', bottom: '2%', width: '72%', transformOrigin: 'center', filter: 'drop-shadow(0 16px 22px rgba(0,0,0,.7))', animation: reduce ? 'none' : 'fm-sway 8s ease-in-out infinite' }} />
        </div>

        <a data-r="0.7" href={LINKS.shop} target="_blank" rel="noopener noreferrer" style={{ opacity: reduce ? 1 : 0, position: 'relative', overflow: 'hidden', alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '16px 30px', minHeight: '44px', borderRadius: '3px', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: '16px', color: '#F6E39A', background: 'rgba(11,9,8,.6)', border: '1px solid #C6A24C', whiteSpace: 'nowrap' }}>
          Come brew with us<span aria-hidden="true" style={{ fontSize: '1.1em', lineHeight: 1 }}>&rarr;</span>
          <span aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, width: '40%', height: '100%', background: 'linear-gradient(90deg,transparent,rgba(246,227,154,.4),transparent)', animation: reduce ? 'none' : 'fm-btnshine 5s ease-in-out 1.6s infinite' }} />
        </a>
      </div>
    </section>
  );
}

export default function FinalCta() {
  const isMobile = useIsMobile(767);
  return isMobile ? <FinalCtaMobile /> : <FinalCtaDesktop />;
}

