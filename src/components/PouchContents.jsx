import { useEffect, useRef } from 'react';

/*
 * PouchContents — "Three, framed" section
 * Behavior: hover = tilt/parallax · click = expand-in-row with details · click × = collapse.
 */

const EASE = 'cubic-bezier(.23,1,.32,1)';
const prefersReduce = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const PC_ITEMS = [
  {
    n: '01', img: '/assets/img/journey/sachet_cut.png', alt: 'AMAZTRA sachet',
    label: 'The Sachet', title: 'One stick, one cup',
    imgStyle: { width: '112%', maxWidth: 'none', filter: 'drop-shadow(0 20px 26px rgba(60,40,16,.3))' },
    wrapStyle: { transform: 'rotate(-7deg)' },
    bg: 'linear-gradient(180deg,#f4ede0,#e7dbc4)',
    expScale: 'translateY(-96px) scale(.92)',
    blurb: 'Tear the top, pour into your cup. Freshness sealed until the moment you brew.',
    details: [{ k: 'Format', v: 'Single-serve stick' }, { k: 'Net weight', v: '16 g' }],
  },
  {
    n: '02', img: '/assets/img/journey/powder_cut.png', alt: 'AMAZTRA coffee powder',
    label: 'The Blend', title: 'Coffee + 6 actives',
    imgStyle: { width: '82%', filter: 'drop-shadow(0 14px 20px rgba(60,40,16,.28))' },
    bg: 'linear-gradient(180deg,#efe4c9,#ddceaa)',
    blurb: 'Rich instant coffee carrying six skin-loving actives in every scoop.',
    details: [{ k: 'Base', v: 'Instant coffee' }, { k: 'Actives', v: '6 compounds' }],
  },
  {
    n: '03', img: '/assets/img/journey/coffee_cut.png', alt: 'AMAZTRA finished coffee',
    label: 'The Cup', title: 'Beauty you can brew',
    imgStyle: { height: '290px', filter: 'drop-shadow(0 18px 24px rgba(60,40,16,.3))' },
    bg: 'linear-gradient(180deg,#f1e7dc,#e2d0c0)',
    blurb: 'Stir into hot water for a smooth, creamy brew — no chalky aftertaste.',
    details: [{ k: 'Serve', v: 'Hot or iced' }, { k: 'Ready in', v: '≈ 1 min' }],
  },
];

export default function PouchContents() {
  const rootRef = useRef(null);
  const cardRefs = useRef([]);
  const xpRef = useRef(-1); // index of the currently expanded card, or -1

  // Scroll reveal for the heading + row
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const els = root.querySelectorAll('[data-reveal]');
    if (prefersReduce()) { els.forEach((el) => { el.style.opacity = '1'; el.style.transform = 'none'; }); return; }
    const io = new IntersectionObserver((ents) => {
      ents.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const delay = parseFloat(el.getAttribute('data-reveal-delay') || '0') * 1000;
        el.animate(
          [{ opacity: 0, transform: 'translateY(40px)' }, { opacity: 1, transform: 'translateY(0)' }],
          { duration: 900, delay, easing: EASE, fill: 'both' });
        io.unobserve(el);
      });
    }, { threshold: 0.18 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const applyState = (active) => {
    cardRefs.current.forEach((c, idx) => {
      if (!c) return;
      const on = idx === active;
      c.style.flex = on ? '2.4 1 0' : '1 1 0';
      c.style.transform = 'none';
      c.style.boxShadow = on ? '0 40px 76px rgba(60,40,16,.5)' : '0 22px 46px rgba(60,40,16,.32)';
      const img = c.querySelector('.pc-ph');
      if (img) img.style.transform = on ? (c.dataset.expScale || 'translateY(-72px) scale(1.1)') : 'none';
      const det = c.querySelector('[data-detail]');
      if (det) { det.style.opacity = on ? '1' : '0'; det.style.transform = on ? 'translateY(0)' : 'translateY(16px)'; det.style.pointerEvents = on ? 'auto' : 'none'; }
      const front = c.querySelector('[data-front]');
      if (front) front.style.opacity = on ? '0' : '1';
      const close = c.querySelector('[data-close]');
      if (close) { close.style.opacity = on ? '1' : '0'; close.style.pointerEvents = on ? 'auto' : 'none'; }
    });
  };

  const onCardClick = (i) => {
    if (xpRef.current === i) return; // already expanded → no-op
    xpRef.current = i;
    applyState(i);
    const el = cardRefs.current[i];
    if (el && !prefersReduce()) {
      el.animate(
        [{ transform: 'scale(1)' }, { transform: 'scale(.97)', offset: 0.35 }, { transform: 'scale(1.02)', offset: 0.7 }, { transform: 'scale(1)' }],
        { duration: 440, easing: 'cubic-bezier(.34,1.56,.64,1)' });
    }
  };

  const collapse = (e) => { if (e) e.stopPropagation(); xpRef.current = -1; applyState(-1); };

  const tilt = (e, i) => {
    if (xpRef.current !== -1 || prefersReduce()) return;
    const c = cardRefs.current[i]; if (!c) return;
    const r = c.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    c.style.transform = `perspective(900px) rotateY(${px * 10}deg) rotateX(${-py * 10}deg) translateY(-6px)`;
    const img = c.querySelector('.pc-ph');
    if (img) img.style.transform = `translate(${px * 18}px, ${py * 18}px) scale(1.05)`;
  };
  const untilt = (i) => {
    if (xpRef.current !== -1) return;
    const c = cardRefs.current[i]; if (!c) return;
    c.style.transform = 'none';
    const img = c.querySelector('.pc-ph');
    if (img) img.style.transform = 'none';
  };

  return (
    <section id="pouch-contents" ref={rootRef} style={{
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(180deg,#141210,#17110e)',
        padding: 'clamp(72px,11vh,130px) clamp(24px,6vw,80px)',
        fontFamily: "'Space Grotesk',system-ui,sans-serif" }}>
      <span aria-hidden="true" className="am-noise" style={{ opacity: 0.05 }} />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1180px', margin: '0 auto' }}>
        <div data-reveal style={{ opacity: 0, marginBottom: 'clamp(16px,2vh,22px)', maxWidth: '640px' }}>
          <div style={{ fontFamily: "'Marcellus',serif", fontSize: 'clamp(13px,1.5vw,14px)', letterSpacing: '.24em', color: '#C6A24C', textTransform: 'uppercase' }}>In every pouch</div>
          <h2 style={{
            margin: '14px 0 0', fontFamily: "'Anton',sans-serif", fontWeight: 400, textTransform: 'uppercase',
            fontSize: 'clamp(44px,5.6vw,84px)', lineHeight: 0.86, letterSpacing: '-.015em', color: '#EDE4D3' }}>Three, framed.</h2>
        </div>
        <p data-reveal style={{ opacity: 0, margin: '0 0 clamp(32px,4.5vh,48px)', fontSize: 'clamp(14px,1.5vw,16px)', color: '#8f8578' }}>
          Click a card to open it.
        </p>

        <div data-reveal className="pc-row" style={{ opacity: 0 }}>
          {PC_ITEMS.map((it, i) => (
            <div key={it.n} className="pc-card pc-xcard"
              ref={(el) => { cardRefs.current[i] = el; }}
              data-exp-scale={it.expScale}
              role="button" tabIndex={0}
              onClick={() => onCardClick(i)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onCardClick(i); } }}
              onMouseMove={(e) => tilt(e, i)}
              onMouseLeave={() => untilt(i)}
              style={{
                position: 'relative', borderRadius: '14px', overflow: 'hidden', cursor: 'pointer',
                transformStyle: 'preserve-3d', background: it.bg, boxShadow: '0 22px 46px rgba(60,40,16,.32)' }}>
              <span aria-hidden="true" style={{ position: 'absolute', inset: '14px', border: '1px solid rgba(198,162,76,.55)', borderRadius: '8px', pointerEvents: 'none', zIndex: 4 }} />
              <span aria-hidden="true" style={{
                position: 'absolute', top: 0, left: 0, right: 0, textAlign: 'center', userSelect: 'none', zIndex: 1,
                fontFamily: "'Anton',sans-serif", fontSize: 'clamp(180px,22vw,260px)', lineHeight: 1, color: 'rgba(34,26,18,.05)' }}>{it.n}</span>

              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 20px', zIndex: 2, ...(it.wrapStyle || {}) }}>
                <img className="pc-ph" src={it.img} alt={it.alt} style={it.imgStyle} />
              </div>

              {/* close (only visible when expanded) */}
              <button type="button" data-close aria-label="Close" onClick={collapse} style={{
                position: 'absolute', top: '18px', right: '18px', zIndex: 6, width: '34px', height: '34px', borderRadius: '50%',
                border: '1px solid rgba(122,84,22,.5)', background: 'rgba(255,255,255,.5)', color: '#8a5f1c', fontSize: '18px', lineHeight: 1,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: 0, pointerEvents: 'none', transition: 'opacity .3s ease' }}>×</button>

              {/* front caption */}
              <div data-front className="pc-front" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 3, padding: '30px 26px', textAlign: 'center', transition: 'opacity .3s ease', pointerEvents: 'none' }}>
                <div className="pc-front-label" style={{ fontFamily: "'Marcellus',serif", fontSize: '16px', letterSpacing: '.16em', textTransform: 'uppercase', color: '#8a5f1c' }}>{it.label}</div>
                <div className="pc-front-title" style={{ margin: '10px 0 0', fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: '23px', color: '#221a12' }}>{it.title}</div>
              </div>

              {/* detail (revealed on expand) */}
              <div data-detail style={{
                position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 5, padding: '40px 30px 28px',
                background: 'linear-gradient(0deg, rgba(244,237,224,.97) 30%, rgba(244,237,224,.75) 62%, transparent)',
                opacity: 0, transform: 'translateY(16px)', pointerEvents: 'none', transition: 'opacity .4s ease, transform .5s cubic-bezier(.23,1,.32,1)' }}>
                <div style={{ fontFamily: "'Marcellus',serif", fontSize: '13px', letterSpacing: '.18em', textTransform: 'uppercase', color: '#8a5f1c' }}>{it.label}</div>
                <div style={{ margin: '8px 0 0', fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: '25px', lineHeight: 1.04, color: '#221a12' }}>{it.title}</div>
                <p style={{ margin: '12px 0 0', fontSize: '14px', lineHeight: 1.55, color: '#4a3c28' }}>{it.blurb}</p>
                <div style={{ marginTop: '14px' }}>
                  {it.details.map((d, di) => (
                    <div key={d.k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '9px 0', borderTop: di === 0 ? '1px solid rgba(122,84,22,.3)' : '1px solid rgba(122,84,22,.18)' }}>
                      <span style={{ fontSize: '12.5px', color: '#6b5a44' }}>{d.k}</span>
                      <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '12.5px', color: '#221a12' }}>{d.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
