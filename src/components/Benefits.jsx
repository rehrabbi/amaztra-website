import { useEffect, useRef, useState } from 'react';

const EASE = 'cubic-bezier(.16,1,.3,1)';

const prefersReduce = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Content knob from the handoff (posterWord): 'Glow.' | 'Compounds.' | 'Radiance.'
const POSTER_WORD = 'Glow.';

// Drifting coffee beans beside the poster word (geometry from the handoff).
const BEANS = [
  { left: '14%', top: '24px', w: '27px', h: '18px', bg: '#3a2417', inset: true, r: '-20deg', dur: '5s', delay: '0s' },
  { left: '40%', top: '96px', w: '31px', h: '20px', bg: '#2a190f', inset: true, r: '18deg', dur: '6s', delay: '.8s' },
  { left: '62%', top: '44px', w: '23px', h: '15px', bg: '#46291a', r: '-8deg', dur: '5.5s', delay: '.4s' },
  { left: '78%', top: '120px', w: '25px', h: '17px', bg: '#33200f', r: '26deg', dur: '6.4s', delay: '1.1s' },
  { left: '26%', top: '150px', w: '20px', h: '13px', bg: '#40261a', r: '-30deg', dur: '5.8s', delay: '.2s' },
  { left: '54%', top: '186px', w: '28px', h: '18px', bg: '#2a190f', r: '10deg', dur: '6.1s', delay: '1.4s' },
  { left: '88%', top: '70px', w: '18px', h: '12px', bg: '#46291a', r: '-14deg', dur: '5.3s', delay: '.6s' },
];
const STEAM = [
  { left: '34%', h: '64px', bg: 'rgba(20,18,16,.5)', dur: '3s', delay: '0s' },
  { left: '52%', h: '74px', bg: 'rgba(20,18,16,.5)', dur: '3s', delay: '1s' },
  { left: '68%', h: '58px', bg: 'rgba(20,18,16,.45)', dur: '3.4s', delay: '.5s' },
];
const WEEKS = [
  { left: '9.375%', label: 'WEEK 1', body: 'The habit clicks.' },
  { left: '50%', label: 'WEEK 4', body: 'Radiance & bounce show up.' },
  { left: '90.625%', label: 'WEEK 12', body: 'Defense compounds.', gold: true },
];

/**
 * Payoff — a red "Glow." poster (with drifting beans + steam) stacked over a
 * results timeline. The curve draws in with scroll progress and the three dots,
 * which sit exactly on the line, fade in as progress passes them; week labels are
 * centered under each dot. Reduced motion shows the full timeline at rest.
 */
function BenefitsDesktop() {
  const pathRef = useRef(null);
  const wrapRef = useRef(null);
  const embersRef = useRef(null);
  const sectionRef = useRef(null);
  const typeRef = useRef(null);
  const dotRefs = [useRef(null), useRef(null), useRef(null)];
  const reduce = prefersReduce();
  const [live, setLive] = useState(false);

  // The whole timeline card plays as ONE deterministic entrance the moment the
  // section scrolls into view (rAF poll — reliable under the hero scroll setup):
  // poster masks in, card blur-rises, the curve draws, week markers pop in
  // sequence, the “…and it compounds.” heading springs up, subline types out.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const red = section.querySelector('.bx-red');
    const tl = section.querySelector('.bx-tl');
    const path = pathRef.current;
    const dots = dotRefs.map((r) => r.current);
    const words = [...section.querySelectorAll('.cmp-w')];
    const type = typeRef.current;
    const EO = 'cubic-bezier(.2,1,.3,1)';
    const len = path ? path.getTotalLength() : 0;
    const full = type ? type.textContent : '';

    // ember trail along the curve (ambient, static)
    const embers = embersRef.current;
    if (embers && path && !embers.childElementCount) {
      const N = 22;
      for (let i = 0; i < N; i++) {
        const pt = path.getPointAtLength((i / (N - 1)) * len);
        const s = document.createElement('span');
        const sz = 2.5 + Math.random() * 2.5;
        const gold = pt.x > 480;
        s.style.cssText = 'position:absolute;left:' + (pt.x / 960 * 100).toFixed(2) + '%;top:' + (pt.y / 150 * 100).toFixed(2) + '%;width:' + sz.toFixed(1) + 'px;height:' + sz.toFixed(1) + 'px;margin:-' + (sz / 2).toFixed(1) + 'px 0 0 -' + (sz / 2).toFixed(1) + 'px;border-radius:50%;background:radial-gradient(circle,#FFF3C6,' + (gold ? 'rgba(246,183,74,.3)' : 'rgba(226,58,52,.3)') + ');box-shadow:0 0 7px ' + (gold ? 'rgba(246,183,74,.85)' : 'rgba(226,58,52,.7)') + ';--dx:' + (Math.random() * 16 - 8).toFixed(0) + 'px;animation:tl-ember ' + (1.8 + Math.random() * 1.8).toFixed(1) + 's ease-out ' + (Math.random() * 3).toFixed(1) + 's infinite;';
        embers.appendChild(s);
      }
    }

    if (reduce) {
      setLive(true);
      if (red) red.style.clipPath = 'none';
      if (tl) { tl.style.opacity = '1'; tl.style.filter = 'none'; }
      if (path) path.style.strokeDashoffset = '0';
      dots.forEach((d) => { if (d) d.style.opacity = '1'; });
      words.forEach((w) => { w.style.opacity = '1'; });
      if (type) type.textContent = full;
      return;
    }

    // hidden starting state
    if (red) red.style.clipPath = 'inset(0 0 100% 0)';
    if (tl) { tl.style.opacity = '0'; tl.style.filter = 'blur(6px)'; }
    if (path) { path.style.strokeDasharray = String(len); path.style.strokeDashoffset = String(len); }
    dots.forEach((d) => { if (d) d.style.opacity = '0'; });
    words.forEach((w) => { w.style.opacity = '0'; });
    if (type) { type.style.width = '0'; type.style.borderRight = '2px solid #C6A24C'; type.textContent = ''; }

    let fired = false, raf = 0, drawRaf = 0, typeRaf = 0, timer = 0;
    const play = () => {
      if (fired) return; fired = true;
      setLive(true);   // poster neon glow + letter wave
      if (red) { red.style.clipPath = 'inset(0 0 0 0)'; red.animate([{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 1600, delay: 200, easing: EO, fill: 'backwards' }); }
      if (tl) { tl.style.opacity = '1'; tl.style.filter = 'none'; tl.animate([{ opacity: 0, transform: 'translateY(34px)', filter: 'blur(6px)' }, { opacity: 1, transform: 'none', filter: 'blur(0px)' }], { duration: 1300, delay: 550, easing: EASE, fill: 'backwards' }); }
      // heading springs up word by word; the red word keeps glowing
      words.forEach((w, i) => { w.style.opacity = '1'; w.animate([{ opacity: 0, transform: 'translateY(80%)' }, { opacity: 1, transform: 'translateY(-8%)', offset: 0.72 }, { opacity: 1, transform: 'translateY(0)' }], { duration: 1050, delay: 900 + i * 160, easing: 'cubic-bezier(.2,1.1,.3,1)', fill: 'backwards' }); });
      if (words[1]) words[1].style.animation = 'cmp-glow 3s ease-in-out 2.3s infinite';
      // curve draws over time; each week marker pops as the line reaches it
      const thr = [0.14, 0.5, 0.9];
      const popped = [false, false, false];
      const drawDur = 1700, drawDelay = 1200, t0 = performance.now();
      const drawStep = (now) => {
        const p = Math.max(0, Math.min(1, (now - t0 - drawDelay) / drawDur));
        if (path) path.style.strokeDashoffset = (len * (1 - p)).toFixed(1);
        dots.forEach((el, i) => {
          if (!el) return;
          el.style.opacity = Math.max(0, Math.min(1, (p - thr[i]) / 0.06)).toFixed(3);
          if (!popped[i] && p >= thr[i]) {
            popped[i] = true;
            el.style.transformBox = 'fill-box'; el.style.transformOrigin = 'center';
            const a = el.animate([{ transform: 'scale(0)' }, { transform: 'scale(1.45)', offset: 0.6 }, { transform: 'scale(1)' }], { duration: 520, easing: 'cubic-bezier(.2,1.5,.35,1)', fill: 'both' });
            a.onfinish = () => { a.cancel(); };
          }
        });
        if (p < 1) drawRaf = requestAnimationFrame(drawStep);
      };
      drawRaf = requestAnimationFrame(drawStep);
      // subline types itself out after the heading lands
      if (type) {
        timer = setTimeout(() => {
          type.style.width = 'auto';
          const total = full.length, dur = 1900, s0 = performance.now();
          const stepFn = (now) => {
            const q = Math.min(1, (now - s0) / dur);
            type.textContent = full.slice(0, Math.round(q * total));
            if (q < 1) typeRaf = requestAnimationFrame(stepFn);
            else type.style.animation = 'cmp-caret .8s step-end infinite';
          };
          type.textContent = ''; type.style.paddingRight = '2px';
          typeRaf = requestAnimationFrame(stepFn);
        }, 1400);
      }
    };

    const poll = () => {
      if (fired) return;
      const r = section.getBoundingClientRect();
      const vh = window.innerHeight || 0;
      if (r.top < vh * 0.6 && r.bottom > vh * 0.4) { play(); return; }
      raf = requestAnimationFrame(poll);
    };
    raf = requestAnimationFrame(poll);
    return () => { cancelAnimationFrame(raf); cancelAnimationFrame(drawRaf); cancelAnimationFrame(typeRaf); clearTimeout(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);





  return (
    <section id="benefits" ref={sectionRef} className="fullpage" style={{
      position: 'relative', background: 'radial-gradient(120% 100% at 82% 12%,#1c1512,#141210 60%)',
      padding: 'clamp(48px,7vh,80px) clamp(24px,6vw,80px)', overflow: 'hidden',
    }}>
      <div className="bx-row" style={{ maxWidth: '1180px', margin: '0 auto', display: 'flex', alignItems: 'center' }}>
        {/* the payoff card — the glow itself: a portrait clip with the wordmark laid over
            a red wash at the foot, so the promised result is shown, not just named */}
        <div className="bx-red" style={{
          position: 'relative', zIndex: 2, width: '42%', aspectRatio: '4 / 5',
          background: '#E23A34', borderRadius: '16px', overflow: 'hidden',
          boxShadow: '0 30px 60px rgba(0,0,0,.45), 0 0 0 1px rgba(246,227,154,.35)',
        }}>
          <video src="assets/video/glow-scene.mp4" poster="assets/video/glow-scene-poster.jpg"
            autoPlay={!reduce} loop muted playsInline preload="metadata" tabIndex={-1} aria-hidden="true"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block', zIndex: 0 }} />
          {/* red wash — clear at the top so the clip reads, solid at the foot to seat the text */}
          <span aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
            background: 'linear-gradient(180deg, rgba(226,58,52,0) 0%, rgba(226,58,52,0) 40%, rgba(226,58,52,.66) 66%, #E23A34 88%)' }} />          {/* wordmark block seated over the wash */}
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 2, padding: 'clamp(22px,3vw,36px)' }}>
            <p style={{
              margin: 0, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: '13px',
              letterSpacing: '.1em', textTransform: 'uppercase', color: '#141210',
            }}>The payoff</p>
            <h2 className="fp-head" style={{
              margin: 'clamp(8px,1.4vh,14px) 0 clamp(8px,1.2vh,12px)', fontFamily: "'Anton',sans-serif",
              textTransform: 'uppercase', fontSize: 'clamp(56px,8vw,104px)', lineHeight: 0.74,
              letterSpacing: '-.03em', color: '#141210',
              animation: (reduce || !live) ? 'none' : 'glow-neon 6s ease-in-out infinite',
            }}>{POSTER_WORD.split('').map((ch, i) => (
              <span key={i} className="glow-ltr" style={{ display: 'inline-block', animation: (reduce || !live) ? 'none' : `glow-wave 3.2s ease-in-out ${(i * 0.12).toFixed(2)}s infinite` }}>{ch}</span>
            ))}</h2>
            <p style={{
              margin: 0, fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800,
              fontSize: 'clamp(15px,1.8vw,19px)', lineHeight: 1.2, color: '#141210',
            }}>A small daily habit whose effects add up, the way good ones do.</p>
          </div>
        </div>

        {/* the compounding timeline — tucked behind the payoff card's right edge */}
        <div className="bx-tl" style={{
          position: 'relative', zIndex: 1, marginLeft: 'clamp(-56px,-4vw,-40px)', width: '66%',
          background: 'rgba(237,228,211,.03)', border: '1px solid rgba(237,228,211,.12)', borderRadius: '16px',
          padding: 'clamp(30px,3.4vw,40px) clamp(28px,3vw,38px) clamp(30px,3.4vw,40px) clamp(60px,6vw,84px)',
        }}>
          <h3 className="fp-head" style={{
            margin: '0 0 8px', fontFamily: "'Anton',sans-serif", textTransform: 'uppercase',
            fontSize: 'clamp(28px,4.2vw,38px)', lineHeight: 0.9, color: '#EDE4D3',
          }}><span className="cmp-w" style={{ display: 'inline-block', opacity: 1 }}>&hellip;and it&nbsp;</span><span className="cmp-w" style={{ display: 'inline-block', opacity: 1, color: '#E23A34' }}>compounds.</span></h3>
          <p style={{ margin: '0 0 clamp(24px,3.4vh,34px)', fontSize: 'clamp(14px,1.6vw,16px)', color: '#8f8578' }}>
            <span id="cmp-type" ref={typeRef} style={{ display: 'inline-block', whiteSpace: 'nowrap', overflow: 'hidden', verticalAlign: 'bottom', maxWidth: '100%' }}>The longer you sip, the more it shows.</span>
          </p>

          <div ref={wrapRef} style={{ position: 'relative' }}>
            <div style={{ position: 'relative', height: 'clamp(120px,17vh,160px)' }}>
              <div ref={embersRef} id="tl-embers" aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none', zIndex: 2 }} />
              <svg viewBox="0 0 960 150" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
                <defs>
                  <linearGradient id="fp-g" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#E23A34" />
                    <stop offset="1" stopColor="#C6A24C" />
                  </linearGradient>
                </defs>
                <path d="M90,130 C250,122 330,94 480,84 S720,44 870,24" fill="none" stroke="rgba(237,228,211,.1)" strokeWidth="4" strokeLinecap="round" />
                <path ref={pathRef} d="M90,130 C250,122 330,94 480,84 S720,44 870,24" fill="none" stroke="url(#fp-g)" strokeWidth="4" strokeLinecap="round" />
                <circle ref={dotRefs[0]} cx="90" cy="130" r="7" fill="#E23A34" opacity="0" />
                <circle ref={dotRefs[1]} cx="480" cy="84" r="7" fill="#E23A34" opacity="0" />
                <circle ref={dotRefs[2]} cx="870" cy="24" r="9" fill="#C6A24C" opacity="0" style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: reduce ? 'none' : 'tl-dotpulse 1.8s ease-in-out infinite' }} />
              </svg>
            </div>

            <div className="week-labels" style={{ position: 'relative', height: '74px', marginTop: '12px' }}>
              {WEEKS.map((w) => (
                <div key={w.label} className="week-label" style={{ position: 'absolute', left: w.left, top: 0, transform: 'translateX(-50%)', textAlign: 'center', width: '150px' }}>
                  <p style={{
                    margin: 0, fontFamily: "'Anton',sans-serif", fontSize: 'clamp(22px,3vw,26px)',
                    ...(w.gold
                      ? { background: 'linear-gradient(180deg,#F6E39A,#A9761B)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }
                      : { color: '#EDE4D3' }),
                  }}>{w.label}</p>
                  <p style={{ margin: '6px 0 0', fontSize: 'clamp(13px,1.5vw,15px)', lineHeight: 1.4, color: '#cfc4b2' }}>{w.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================ MOBILE (5a poster + 5d chart) ============================ */

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

function BenefitsMobile() {
  const rootRef = useRef(null);
  const posterRef = useRef(null);
  const eyebrowRef = useRef(null);
  const glowRef = useRef(null);
  const sublineRef = useRef(null);
  const cardRef = useRef(null);
  const pathRef = useRef(null);
  const travRef = useRef(null);
  const d0 = useRef(null), d1 = useRef(null), d2 = useRef(null);
  const labelRefs = [useRef(null), useRef(null), useRef(null)];
  const reduce = prefersReduce();

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const poster = posterRef.current, path = pathRef.current, trav = travRef.current;
    const dots = [d0.current, d1.current, d2.current];
    const labels = labelRefs.map((r) => r.current);
    const EO = 'cubic-bezier(.16,1,.3,1)';
    const len = path ? path.getTotalLength() : 0;

    const showAll = () => {
      [eyebrowRef.current, glowRef.current, sublineRef.current, cardRef.current, ...labels].forEach((el) => { if (el) { el.style.opacity = '1'; el.style.transform = 'none'; } });
      if (poster) poster.style.clipPath = 'inset(0 0 0 0)';
      if (path) path.style.strokeDashoffset = '0';
      dots.forEach((el) => { if (el) el.style.opacity = '1'; });
    };
    if (reduce) { showAll(); return; }

    // hidden start
    [eyebrowRef.current, glowRef.current, sublineRef.current, cardRef.current, ...labels].forEach((el) => { if (el) el.style.opacity = '0'; });
    if (poster) poster.style.clipPath = 'inset(0 0 100% 0)';
    if (path) { path.style.strokeDasharray = String(len); path.style.strokeDashoffset = String(len); }
    dots.forEach((el) => { if (el) el.style.opacity = '0'; });

    let fired = false, raf = 0;
    const play = () => {
      if (fired) return; fired = true;
      if (poster) { poster.style.clipPath = 'inset(0 0 0 0)'; poster.animate([{ clipPath: 'inset(0 0 100% 0)', transform: 'scale(1.08)' }, { clipPath: 'inset(0 0 0 0)', transform: 'scale(1)' }], { duration: 1500, delay: 200, easing: EO, fill: 'both' }); }
      if (eyebrowRef.current) eyebrowRef.current.animate([{ opacity: 0, transform: 'translateY(-10px)' }, { opacity: 1, transform: 'none' }], { duration: 700, delay: 500, easing: EO, fill: 'both' });
      [glowRef.current, sublineRef.current].forEach((el, i) => { if (el) el.animate([{ opacity: 0, transform: 'translateY(20px)' }, { opacity: 1, transform: 'none' }], { duration: 800, delay: 700 + i * 150, easing: EO, fill: 'both' }); });
      if (cardRef.current) cardRef.current.animate([{ opacity: 0, transform: 'translateY(34px)', filter: 'blur(6px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }], { duration: 1000, delay: 900, easing: EO, fill: 'both' });
      // curve draw + traveling marker
      const drawDur = 1700, drawDelay = 1200, t0 = performance.now();
      const thr = [0.02, 0.5, 0.96];
      const popped = [false, false, false];
      const step = (now) => {
        const p = Math.max(0, Math.min(1, (now - t0 - drawDelay) / drawDur));
        if (path) path.style.strokeDashoffset = String(len * (1 - p));
        if (trav && path) { const pt = path.getPointAtLength(p * len); trav.setAttribute('cx', pt.x); trav.setAttribute('cy', pt.y); }
        dots.forEach((el, i) => {
          if (!el) return;
          if (!popped[i] && p >= thr[i]) {
            popped[i] = true; el.style.opacity = '1'; el.style.transformBox = 'fill-box'; el.style.transformOrigin = 'center';
            el.animate([{ transform: 'scale(0)' }, { transform: 'scale(1.45)', offset: 0.6 }, { transform: 'scale(1)' }], { duration: 520, easing: 'cubic-bezier(.2,1.5,.35,1)', fill: 'both' });
          }
        });
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
      labels.forEach((el, i) => { if (el) el.animate([{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { duration: 700, delay: 1500 + i * 300, easing: EO, fill: 'both' }); });
    };
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { play(); io.disconnect(); } }), { rootMargin: '-30% 0px -30% 0px', threshold: 0 });
    io.observe(root);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [reduce]);

  // The gradient has to sit on each letter. They are inline-block so they build their
  // own boxes, and a background-clip:text on the heading never reaches them, which left
  // every letter transparent with nothing painted behind it.
  const GOLD = {
    backgroundImage: 'linear-gradient(180deg,#FFF3C6,#F6E39A 34%,#C99A34)',
    WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
  };
  const glowLetter = (ch, i) => (
    <span key={i} style={{ display: 'inline-block', ...GOLD, animation: reduce ? 'none' : `glow-wave 3.2s ease-in-out ${(i * 0.12).toFixed(2)}s infinite` }}>{ch}</span>
  );

  return (
    <section id="benefits" ref={rootRef} className="fullpage" style={{ position: 'relative', minHeight: '100svh', background: 'radial-gradient(120% 100% at 50% 8%,#1c1512,#141210 60%)', overflow: 'hidden', padding: 'clamp(48px,8vh,80px) clamp(22px,6vw,28px) clamp(40px,6vh,60px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '18px', fontFamily: "'Space Grotesk',system-ui,sans-serif" }}>
      {/* poster slot — payoff eyebrow at top, glow scene, no red bleed */}
      <div ref={posterRef} style={{ position: 'relative', width: '100%', aspectRatio: '5/4', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 26px 50px rgba(0,0,0,.45), 0 0 0 1px rgba(246,227,154,.25)', clipPath: reduce ? 'none' : 'inset(0 0 100% 0)' }}>
        <video src="assets/video/glow-scene.mp4" poster="assets/video/glow-scene-poster.jpg" autoPlay={!reduce} loop muted playsInline preload="metadata" tabIndex={-1} aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        <span aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '30%', background: 'linear-gradient(180deg,rgba(20,15,13,.72),transparent)' }} />
        <span aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '62%', background: 'linear-gradient(180deg,transparent,rgba(20,15,13,.55) 45%,rgba(20,15,13,.9))' }} />
        <p ref={eyebrowRef} style={{ position: 'absolute', top: '18px', left: '20px', margin: 0, opacity: reduce ? 1 : 0, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: '12px', letterSpacing: '.14em', textTransform: 'uppercase', color: '#F6E39A' }}>The payoff</p>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '22px' }}>
          <h2 ref={glowRef} style={{ margin: '0 0 6px', opacity: reduce ? 1 : 0, fontFamily: "'Anton',sans-serif", textTransform: 'uppercase', fontSize: '92px', lineHeight: 0.74, letterSpacing: '-.03em', filter: 'drop-shadow(0 2px 18px rgba(246,183,74,.45))' }}>{'Glow'.split('').map(glowLetter)}<span style={{ display: 'inline-block', ...GOLD }}>.</span></h2>
          <p ref={sublineRef} style={{ margin: 0, opacity: reduce ? 1 : 0, fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: '15px', lineHeight: 1.25, color: '#EDE4D3', textShadow: '0 1px 10px rgba(0,0,0,.6)' }}>A small daily habit whose effects add up, the way good ones do.</p>
        </div>
      </div>

      {/* compounding chart (5d) with WEEK 1 / 4 / 12 + 5a captions */}
      <div ref={cardRef} style={{ opacity: reduce ? 1 : 0, background: 'rgba(237,228,211,.03)', border: '1px solid rgba(237,228,211,.12)', borderRadius: '16px', padding: '24px 20px' }}>
        <h3 style={{ margin: 0, fontFamily: "'Anton',sans-serif", textTransform: 'uppercase', fontSize: '32px', lineHeight: 0.9, color: '#EDE4D3' }}>&hellip;and it <span style={{ color: '#E23A34' }}>compounds.</span></h3>
        <p style={{ margin: '8px 0 20px', fontSize: '13.5px', color: '#8f8578' }}>The longer you sip, the more it shows.</p>
        <div style={{ position: 'relative', height: '190px' }}>
          <span style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '1px', background: 'rgba(237,228,211,.08)' }} />
          <span style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: '1px', background: 'rgba(237,228,211,.08)' }} />
          <span style={{ position: 'absolute', left: 0, right: 0, bottom: '18px', height: '1px', background: 'rgba(237,228,211,.14)' }} />
          <svg viewBox="0 0 320 190" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
            <defs><linearGradient id="bm-g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#E23A34" /><stop offset="1" stopColor="#C6A24C" /></linearGradient></defs>
            <path d="M22,162 C94,152 138,116 188,100 S288,42 300,26" fill="none" stroke="rgba(237,228,211,.1)" strokeWidth="4" strokeLinecap="round" />
            <path ref={pathRef} d="M22,162 C94,152 138,116 188,100 S288,42 300,26" fill="none" stroke="url(#bm-g)" strokeWidth="4" strokeLinecap="round" />
            <circle ref={d0} cx="22" cy="162" r="6" fill="#E23A34" opacity="0" />
            <circle ref={d1} cx="188" cy="100" r="6" fill="#E23A34" opacity="0" />
            <circle ref={d2} cx="300" cy="26" r="8" fill="#C6A24C" opacity="0" style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: reduce ? 'none' : 'tl-dotpulse 1.8s ease-in-out infinite' }} />
            <circle ref={travRef} cx="22" cy="162" r="6" fill="#FFF3C6" style={{ filter: 'drop-shadow(0 0 6px rgba(246,227,154,.9))' }} />
          </svg>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginTop: '14px' }}>
          {WEEKS.map((w, i) => (
            <div key={w.label} ref={labelRefs[i]} style={{ opacity: reduce ? 1 : 0 }}>
              <p style={{ margin: 0, fontFamily: "'Anton',sans-serif", fontSize: '22px', ...(w.gold ? { background: 'linear-gradient(180deg,#F6E39A,#A9761B)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' } : { color: '#EDE4D3' }) }}>{w.label}</p>
              <p style={{ margin: '4px 0 0', fontSize: '12px', lineHeight: 1.35, color: '#cfc4b2' }}>{w.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Benefits() {
  const isMobile = useIsMobile(767);
  return isMobile ? <BenefitsMobile /> : <BenefitsDesktop />;
}
