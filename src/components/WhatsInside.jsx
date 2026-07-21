import { useEffect, useRef, useState } from 'react';

const prefersReduce = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const EASE = 'cubic-bezier(.23,1,.32,1)';

// Real nutrition panel from the product label (per 16 g sachet).
const SERVING = { size: '16 g', per: '1 sachet', count: '10 sachets', net: '160 g' };

// Accurate recreation of the pack's printed Nutrition Facts (Philippine REVRNI format)
const NF = {
  servingSize: '1 sachet (16 g)',
  servings: '10 sachets',
  rows: [
    { name: 'Calories (kcal) 72', extra: 'Calories from fat 22', pct: '<3%', head: true },
    { name: 'Total Fat', value: '2 g' },
    { name: 'Saturated Fat', value: '2 g', sub: true },
    { name: 'Unsaturated Fat', value: '0 g', sub: true },
    { name: 'Trans Fat', value: '0 g', sub: true },
    { name: 'Cholesterol', value: '0 mg' },
    { name: 'Sodium', value: '1 mg' },
    { name: 'Total Carbohydrates', value: '11 g' },
    { name: 'Dietary Fiber', value: '3 g', sub: true },
    { name: 'Sugar', value: '0 g', sub: true },
    { name: 'Protein', value: '3 g', pct: '5%' },
  ],
  footnote: '*Percent REVRNI values are based on the Recommended Energy and Nutrient Intakes Philippines, 2015 Edition for Male aged 19-29 years old.',
};
const INGREDIENTS = 'Non-Dairy Creamer [Glucose Syrup, Hydrogenated Vegetable Fat (Palm Kernel oil), Stabilizers (Dipotassium Phosphate, Sodium Tripolyphosphate), Sodium Caseinate, Emulsifiers (Mono & Diglycerides of Fatty Acids, Sodium Stearoyl Lactylate), Anti-Caking Agent (Silicon Dioxide), and Color (Riboflavin)], Coffee Powder, Maltodextrin (filler), Caramel Flavor (artificial food flavor), Stevia Leaves Powder (Stevia rebaudiana bertoni), Glutathione, Collagen (Fish), Sodium Ascorbate, Polypodium Leucotomos Leaf Extract, N-Acetyl Cysteine, and Astaxanthin.';
const LABEL_BLOCKS = [
  { h: 'Allergen Information', b: 'May contain milk derivatives. Contains Fish.' },
  { h: 'Directions', b: 'Empty one sachet into a cup. Add 150 ml hot water. Stir well to dissolve. Serve and enjoy!' },
  { h: 'Precaution', b: 'For adult use only. Not intended for children, pregnant, and lactating women.' },
  { h: 'Storage', b: 'Store in a cool dry place away from direct sunlight, moisture and heat.' },
  { h: 'Manufactured for', b: 'AMAZING PHARMA CORPORATION · Unit 2 Onicare Bldg., Block 22 Lot 1C Villa Consolacion Subd., Brgy. San Jose, Antipolo City, Rizal.' },
];

function NutritionFactsBox() {
  const line = '1px solid #17110e';
  return (
    <div style={{ border: '2px solid #17110e', background: '#fff', color: '#17110e', padding: '12px 14px', fontFamily: "'Arial','Helvetica',sans-serif", lineHeight: 1.2 }}>
      <div style={{ fontWeight: 800, fontSize: '22px', letterSpacing: '-.01em', borderBottom: line, paddingBottom: '3px' }}>Nutrition Facts</div>
      <div style={{ fontSize: '12px', padding: '4px 0 0' }}>Serving Size: {NF.servingSize}</div>
      <div style={{ fontSize: '12px', padding: '1px 0 5px', borderBottom: '6px solid #17110e' }}>No. of Servings per container: {NF.servings}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, padding: '4px 0', borderBottom: line }}>
        <span>Amount per serving</span><span>%REVRNI*</span>
      </div>
      {NF.rows.map((r, i) => (
        <div key={r.name} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '10px',
          fontSize: '12.5px', padding: '5px 0',
          paddingLeft: r.sub ? '16px' : 0,
          borderBottom: r.head ? '6px solid #17110e' : (i < NF.rows.length - 1 ? line : 'none') }}>
          <span style={{ fontWeight: r.sub ? 400 : 700 }}>
            {r.head ? <span style={{ fontWeight: 800 }}>{r.name}</span> : r.name}
            {r.extra ? <span style={{ fontWeight: 400, marginLeft: '10px' }}>{r.extra}</span> : null}
            {r.value ? <span style={{ fontWeight: 400 }}>&nbsp;{r.value}</span> : null}
          </span>
          <span style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{r.pct || ''}</span>
        </div>
      ))}
      <div style={{ fontSize: '9.5px', lineHeight: 1.35, color: '#3a2c1a', paddingTop: '7px' }}>{NF.footnote}</div>
    </div>
  );
}

/**
 * Read the label — "Peel it back." An editorial calorie block and a tap-to-zoom
 * shot of the pack's back open a modal recreating the real printed label:
 * an accurate Nutrition Facts panel, the full ingredients list, and the
 * allergen / directions / precaution / storage / manufacturer blocks.
 */
export default function WhatsInside() {
  const rootRef = useRef(null);
  const pouchRef = useRef(null);
  const peelRef = useRef(null);
  const backRef = useRef(null);
  const calRef = useRef(null);
  const ambientRef = useRef(null);
  const [open, setOpen] = useState(false);
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
          [{ opacity: 0, transform: 'translateY(38px)' }, { opacity: 1, transform: 'translateY(0)' }],
          { duration: 900, delay, easing: EASE, fill: 'both' });
        io.unobserve(el);
      });
    }, { threshold: 0.2 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [reduce]);

  // peel headline + calorie count-up + roasted-bean drift, all on scroll
  useEffect(() => {
    if (reduce) return;
    // ambient roasted beans drifting up behind type + pouch
    const host = ambientRef.current;
    if (host && !host.childElementCount) {
      for (let i = 0; i < 13; i++) {
        const b = document.createElement('span');
        const w = 11 + Math.random() * 10;
        b.style.cssText = 'position:absolute;bottom:-44px;left:' + (Math.random() * 100) + '%;width:' + w.toFixed(0) + 'px;height:' + (w * 0.66).toFixed(0) + 'px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#4a2c17,#2a190f);box-shadow:inset 0 0 0 1px rgba(0,0,0,.3);--dx:' + (Math.random() * 80 - 40).toFixed(0) + 'px;--r:' + (Math.random() * 60 - 30).toFixed(0) + 'deg;--r2:' + (Math.random() * 220 - 110).toFixed(0) + 'deg;animation:wi-bean ' + (11 + Math.random() * 8).toFixed(1) + 's linear ' + (Math.random() * 11).toFixed(1) + 's infinite;';
        const seam = document.createElement('span');
        seam.style.cssText = 'position:absolute;left:50%;top:12%;bottom:12%;width:1.5px;background:rgba(0,0,0,.4);transform:translateX(-50%);border-radius:2px;';
        b.appendChild(seam);
        host.appendChild(b);
      }
    }
    // "Peel it" lifts like a label, then "back." stamps in
    const peel = peelRef.current, back = backRef.current;
    let io1 = null, io2 = null;
    if (peel && back) {
      io1 = new IntersectionObserver((ents) => ents.forEach((e) => {
        if (!e.isIntersecting) return;
        peel.style.animation = 'none'; back.style.animation = 'none'; void peel.offsetWidth;
        peel.style.animation = 'wi-peel 1s cubic-bezier(.2,1.05,.3,1) both';
        back.style.animation = 'wi-stamp .7s cubic-bezier(.2,1.5,.35,1) .85s both';
        io1.disconnect();
      }), { threshold: 0.5 });
      io1.observe(peel);
    }
    // "72" counts up when it enters view
    const cal = calRef.current;
    if (cal) {
      cal.textContent = '0';
      io2 = new IntersectionObserver((ents) => ents.forEach((e) => {
        if (!e.isIntersecting) return;
        const target = 72, dur = 1300, t0 = performance.now();
        const stepFn = (now) => {
          const p = Math.min(1, (now - t0) / dur);
          const eo = 1 - Math.pow(1 - p, 3);
          cal.textContent = Math.round(eo * target);
          if (p < 1) requestAnimationFrame(stepFn);
        };
        requestAnimationFrame(stepFn);
        io2.disconnect();
      }), { threshold: 0.6 });
      io2.observe(cal);
    }
    return () => { if (io1) io1.disconnect(); if (io2) io2.disconnect(); };
  }, [reduce]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    if (open) {
      document.addEventListener('keydown', onKey);
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
    }
  }, [open]);

  const tilt = (e) => {
    if (open || reduce) return;
    const c = pouchRef.current; if (!c) return;
    const r = c.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    c.style.transform = `perspective(1100px) rotateY(${px * 9}deg) rotateX(${-py * 9}deg) translateY(-6px) scale(1.02)`;
  };
  const untilt = () => { const c = pouchRef.current; if (c) c.style.transform = 'none'; };

  return (
    <section id="whats-inside" ref={rootRef} className="fullpage" style={{
        position: 'relative', background: 'linear-gradient(180deg,#d8c8a8,#c9b791)',
        padding: 'clamp(72px,11vh,130px) clamp(24px,6vw,80px)',
        fontFamily: "'Space Grotesk',system-ui,sans-serif", overflow: 'hidden' }}>
      {/* roasted-bean drift behind everything */}
      <div ref={ambientRef} id="wi-ambient" aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{
        position: 'relative', zIndex: 1,
        maxWidth: '1180px', margin: '0 auto', display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))',
        gap: 'clamp(32px,6vw,72px)', alignItems: 'center' }}>

        <div data-reveal style={{ opacity: 0 }}>
          <p style={{ margin: 0, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: '13px', letterSpacing: '.1em', textTransform: 'uppercase', color: '#8a5f1c' }}>Read the label</p>
          <h2 className="fp-head" style={{ margin: '18px 0 0', fontFamily: "'Anton',sans-serif", textTransform: 'uppercase', fontSize: 'clamp(48px,7.4vw,86px)', lineHeight: 0.86, letterSpacing: '-.015em', color: '#221a12' }}><span id="wi-peelit" ref={peelRef} style={{ display: 'inline-block', transformOrigin: 'top center', marginRight: '.24em' }}>Peel it</span><span id="wi-back" ref={backRef} style={{ display: 'inline-block', color: '#C11A22' }}>back</span></h2>
          <p style={{ margin: '22px 0 32px', maxWidth: '40ch', fontSize: 'clamp(16px,1.9vw,20px)', lineHeight: 1.6, color: '#4a3c28' }}>
            Six actives, real coffee, and nothing to hide. Every ingredient and the full nutrition panel are printed right on the pack. Tap it to read the whole label.
          </p>
          <div style={{ margin: '0 0 32px', maxWidth: '380px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <span id="wi-cal" ref={calRef} style={{ fontFamily: "'Anton',sans-serif", fontSize: 'clamp(96px,15vw,150px)', lineHeight: 0.8, letterSpacing: '-.02em', color: '#221a12' }}>72</span>
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '13px', letterSpacing: '.1em', color: '#8a5f1c', marginTop: '14px', lineHeight: 1.5 }}>kcal<br />per<br />sachet</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 26px', marginTop: '18px', fontFamily: "'Space Mono',monospace" }}>
              {[['Fat', '2 g'], ['Carbs', '11 g'], ['Sugar', '0 g'], ['Protein', '3 g']].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderTop: '1px solid rgba(122,84,22,.35)', fontSize: '13.5px', color: '#221a12' }}>
                  <span style={{ color: '#8a5f1c' }}>{k}</span><span>{v}</span>
                </div>
              ))}
            </div>
          </div>
          <button type="button" onClick={() => setOpen(true)} style={{
            display: 'inline-flex', alignItems: 'center', gap: '11px', padding: '15px 26px', minHeight: '44px',
            border: '1px solid #17110e', borderRadius: '3px', cursor: 'pointer',
            fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: '15px', letterSpacing: '.01em',
            color: '#efe6d4', background: '#17110e', boxShadow: '0 12px 26px rgba(60,40,16,.28)' }}>
            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="#F6E39A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
            </svg>
            Read the full label
          </button>
        </div>

        <div data-reveal data-reveal-delay=".12" style={{ opacity: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'clamp(6px,1vw,12px)' }}>
          <button type="button" ref={pouchRef} onClick={() => setOpen(true)} onMouseMove={tilt} onMouseLeave={untilt}
            aria-label="Open the AMAZTRA nutrition facts and label"
            style={{ position: 'relative', border: 0, background: 'none', padding: 0, cursor: 'pointer',
              transition: 'transform .3s ease', transformStyle: 'preserve-3d', display: 'block', width: 'min(360px,82vw)' }}>
            <span aria-hidden="true" style={{ position: 'absolute', left: '50%', top: '54%', width: '86%', height: '70%', transform: 'translate(-50%,-50%)', borderRadius: '50%', background: 'radial-gradient(circle, rgba(193,26,34,.32), transparent 66%)', filter: 'blur(30px)', zIndex: 0 }} />
            <img src="assets/img/pouch/back-full.png" alt="Back of the AMAZTRA pouch showing ingredients and nutrition facts" style={{ position: 'relative', zIndex: 1, width: '100%', display: 'block', filter: 'drop-shadow(0 26px 34px rgba(60,40,16,.45))', animation: reduce ? 'none' : 'am-float 9s ease-in-out infinite' }} />
            <span aria-hidden="true" style={{
              position: 'absolute', zIndex: 2, right: '50%', bottom: '8%', transform: 'translateX(50%)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <span style={{ position: 'relative', width: '58px', height: '58px', borderRadius: '50%',
                background: 'radial-gradient(circle at 38% 32%, rgba(52,40,30,.9), rgba(23,17,14,.82))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 10px 30px rgba(23,17,14,.4), inset 0 1px 0 rgba(246,227,154,.12)',
                animation: reduce ? 'none' : 'tz-press 2.6s ease-in-out infinite' }}>
                {reduce ? null : <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid rgba(23,17,14,.4)', animation: 'tz-ring 2.2s ease-out infinite' }} />}
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#F6E39A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3M11 8v6M8 11h6" /></svg>
              </span>
              <span style={{ display: 'flex', gap: '7px' }}>
                {[0, 1, 2].map((d) => (
                  <span key={d} style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#17110e', opacity: 0.3, animation: reduce ? 'none' : `tz-dot 1.5s ease-in-out ${d * 0.2}s infinite` }} />
                ))}
              </span>
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '10px', letterSpacing: '.2em', textTransform: 'uppercase', color: '#5a3a20' }}>Tap to zoom</span>
            </span>
          </button>
        </div>
      </div>

      {open && (
        // id + inline display let the scroll navigator stand down while the label is open
        <div id="label-modal" onClick={() => setOpen(false)} role="dialog" aria-modal="true" aria-label="AMAZTRA product label" style={{
            position: 'fixed', inset: 0, zIndex: 70, display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            padding: 'clamp(16px,4vh,48px) clamp(14px,4vw,40px)', overflowY: 'auto',
            background: 'rgba(12,10,9,.86)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
            animation: reduce ? 'none' : 'am-rise .3s ease' }}>
          <div onClick={(e) => e.stopPropagation()} style={{
              position: 'relative', width: 'min(920px,100%)', margin: 'auto',
              background: '#f4ede0', borderRadius: '14px', overflow: 'hidden',
              boxShadow: '0 40px 90px rgba(0,0,0,.6)', border: '1px solid rgba(122,84,22,.3)',
              animation: reduce ? 'none' : 'nf-pop .45s cubic-bezier(.34,1.4,.5,1)' }}>
            <div style={{ background: '#C11A22', padding: '18px 26px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: '18px', letterSpacing: '.14em', color: '#F6E39A' }}>AMAZTRA</div>
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: '10px', letterSpacing: '.24em', color: 'rgba(255,246,230,.85)', textTransform: 'uppercase', marginTop: '3px' }}>What's on the pack</div>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" style={{
                width: '40px', height: '40px', borderRadius: '50%', border: '1px solid rgba(246,227,154,.5)',
                background: 'rgba(23,17,14,.25)', color: '#F6E39A', fontSize: '22px', lineHeight: 1, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&times;</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 'clamp(22px,3vw,34px)', padding: 'clamp(24px,3.4vw,36px)' }}>
              <div>
                <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: '15px', letterSpacing: '.02em', color: '#221a12', textTransform: 'uppercase' }}>Ingredients</div>
                <p style={{ margin: '9px 0 0', fontSize: '13px', lineHeight: 1.62, color: '#4a3c28' }}>{INGREDIENTS}</p>
                {LABEL_BLOCKS.map((blk) => (
                  <div key={blk.h} style={{ marginTop: '18px' }}>
                    <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: '13px', letterSpacing: '.02em', color: '#221a12', textTransform: 'uppercase' }}>{blk.h}</div>
                    {blk.h === 'Manufactured for' ? (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginTop: '8px' }}>
                        <img src="assets/img/apc-logo.png" alt="Amazing Pharma Corporation logo" style={{ width: '52px', height: '52px', flexShrink: 0, objectFit: 'contain' }} />
                        <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.55, color: '#4a3c28' }}>{blk.b}</p>
                      </div>
                    ) : (
                      <p style={{ margin: '6px 0 0', fontSize: '13px', lineHeight: 1.55, color: '#4a3c28' }}>{blk.b}</p>
                    )}
                  </div>
                ))}
              </div>
              <div>
                <NutritionFactsBox />
                <div style={{ marginTop: '16px', fontFamily: "'Space Mono',monospace", fontSize: '11px', color: '#6b5a44', lineHeight: 1.7 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}><span style={{ color: '#8a5f1c' }}>LOT NO.</span><span>FR-4000015851134</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}><span style={{ color: '#8a5f1c' }}>MFG. DATE</span><span>22 JUN 2025</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}><span style={{ color: '#8a5f1c' }}>EXPIRY DATE</span><span>22 DEC 2027</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}><span style={{ color: '#8a5f1c' }}>NET WT</span><span>{SERVING.net} · {SERVING.count} &times; {SERVING.size}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
