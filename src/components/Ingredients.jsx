import { useEffect, useRef, useState } from 'react';
import { ING, ANGLES, POUCH } from '../data.js';

const R = 42; // desktop orbit radius, percent
const EASE = 'cubic-bezier(.23,1,.32,1)';
const prefersReduce = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Per-ingredient line icons, matched to what each active delivers.
const ICONS = {
  sun: {
    circle: [12, 12, 4],
    paths: ['M12 2v2', 'M12 20v2', 'm4.93 4.93 1.41 1.41', 'm17.66 17.66 1.41 1.41', 'M2 12h2', 'M20 12h2', 'm6.34 17.66-1.41 1.41', 'm19.07 4.93-1.41 1.41'],
  },
  droplet: { paths: ['M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C7 11.1 6 13 6 15a7 7 0 0 0 6 7z'] },
  shield: { paths: ['M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z', 'm9 12 2 2 4-4'] },
  bolt: { paths: ['M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z'] },
  flame: { paths: ['M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z'] },
  leaf: { paths: ['M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z', 'M2 21c0-3 1.85-5.36 5.08-6'] },
};
const ICON_FOR = ['sun', 'droplet', 'shield', 'bolt', 'flame', 'leaf'];

// Icon SVGs, animated while visible (only the active node shows one).
function Icon({ name, color = '#E23A34', size = 26 }) {
  const fb = { transformBox: 'fill-box' };
  const paths = ICONS[name].paths;
  let kids;

  if (name === 'sun') {
    kids = [
      <circle key="c" cx={12} cy={12} r={4} style={{ ...fb, transformOrigin: 'center', animation: 'ico-sun-core 2.6s ease-in-out infinite' }} />,
      <g key="rays" style={{ ...fb, transformOrigin: 'center', animation: 'ico-sun-rays 14s linear infinite' }}>
        {paths.map((d, i) => <path key={i} d={d} />)}
      </g>,
    ];
  } else if (name === 'droplet') {
    kids = [<g key="g" style={{ ...fb, transformOrigin: 'center', animation: 'ico-bob 2.4s ease-in-out infinite' }}>{paths.map((d, i) => <path key={i} d={d} />)}</g>];
  } else if (name === 'shield') {
    kids = [
      <path key="0" d={paths[0]} style={{ ...fb, transformOrigin: 'center', animation: 'ico-shine 3s ease-in-out infinite' }} />,
      <path key="1" d={paths[1]} style={{ strokeDasharray: 16, animation: 'ico-draw 3s ease-in-out infinite' }} />,
    ];
  } else if (name === 'bolt') {
    kids = [<g key="g" style={{ ...fb, transformOrigin: 'center', animation: 'ico-bolt 1.7s ease-in-out infinite' }}>{paths.map((d, i) => <path key={i} d={d} />)}</g>];
  } else if (name === 'flame') {
    kids = [
      <path key="0" d={paths[0]} style={{ ...fb, transformOrigin: 'center bottom', animation: 'ico-flame .7s ease-in-out infinite alternate' }} />,
      <path key="core" d="M12 20a3 3 0 0 0 3-3c0-1.6-1.2-2.6-1.6-3.6-.6 1-1.4 1.7-2.2 2.4-.7.6-1.2 1.3-1.2 2.2a2 2 0 0 0 2 2z" fill={color} stroke="none" style={{ ...fb, transformOrigin: 'center bottom', animation: 'ico-flame-core .5s ease-in-out infinite alternate' }} />,
    ];
  } else { // leaf
    kids = [<g key="g" style={{ ...fb, transformOrigin: 'center bottom', animation: 'ico-sway 2.6s ease-in-out infinite alternate' }}>{paths.map((d, i) => <path key={i} d={d} />)}</g>];
  }

  return (
    <svg
      className="am-ico" viewBox="0 0 24 24" width={size} height={size} fill="none"
      stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" style={{ display: 'block', overflow: 'visible' }}
    >
      {kids}
    </svg>
  );
}

// Swap to the mobile layout on phone / small-tablet widths.
function useIsMobile(bp = 767) {
  const query = `(max-width:${bp}px)`;
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return isMobile;
}

/* ============================ DESKTOP ============================ */

function nodeStyle(idx, active) {
  const a = (ANGLES[idx] * Math.PI) / 180;
  const x = Math.cos(a) * R;
  const y = Math.sin(a) * R;
  return {
    position: 'absolute',
    left: `calc(50% + ${x}%)`,
    top: `calc(50% + ${y}%)`,
    transform: 'translate(-50%,-50%) scale(var(--ns))',
    '--ns': active ? 1.08 : 1,
    fontFamily: "'Marcellus',serif",
    fontWeight: 400,
    fontSize: '11px',
    letterSpacing: '.03em',
    textTransform: 'uppercase',
    padding: '10px 15px',
    borderRadius: '2px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'background .3s,color .3s,border-color .3s,transform .3s',
    background: active ? '#E23A34' : 'rgba(23,17,14,.82)',
    color: active ? '#fff' : '#EDE4D3',
    border: active ? '1px solid #E23A34' : '1px solid rgba(23,17,14,.5)',
    boxShadow: active ? '0 10px 30px rgba(226,58,52,.35)' : '0 6px 16px rgba(0,0,0,.28)',
    zIndex: active ? 3 : 2,
  };
}

function auraStyle(active) {
  return {
    position: 'absolute', left: '50%', top: '50%', width: '130px', height: '130px',
    transform: `translate(-50%,-50%) scale(${active ? 1 : 0.4})`,
    borderRadius: '50%',
    background: 'radial-gradient(circle,rgba(198,162,76,.5),rgba(201,154,52,.16) 54%,transparent 72%)',
    opacity: active ? 1 : 0,
    transition: 'opacity .4s ease,transform .45s cubic-bezier(.23,1,.32,1)',
    pointerEvents: 'none', zIndex: 0,
  };
}

function popStyle(active, upper) {
  const ty = active ? '0' : upper ? '-8px' : '8px';
  return {
    position: 'absolute', left: '50%',
    ...(upper ? { top: 'calc(100% + 14px)' } : { bottom: 'calc(100% + 14px)' }),
    transform: `translateX(-50%) translateY(${ty})`,
    opacity: active ? 1 : 0,
    transition: 'opacity .4s ease,transform .45s cubic-bezier(.23,1,.32,1)',
    pointerEvents: 'none', zIndex: 6, textAlign: 'center',
  };
}

function iconWrapStyle(active) {
  return {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: '54px', height: '54px', margin: '0 auto 11px', borderRadius: '50%',
    background: 'rgba(23,17,14,.9)', border: '1px solid rgba(198,162,76,.5)',
    boxShadow: '0 8px 22px rgba(0,0,0,.5), 0 0 20px rgba(226,58,52,.25)',
    transform: active ? 'scale(1)' : 'scale(.7)',
    transition: 'transform .45s cubic-bezier(.23,1,.32,1)',
  };
}

function IngredientsDesktop() {
  const [active, setActive] = useState(0);

  const ring1Ref = useRef(null);
  const ring2Ref = useRef(null);
  const pouchRef = useRef(null);
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const dustRef = useRef(null);
  const subRef = useRef(null);
  const nameRef = useRef(null);
  const descRef = useRef(null);
  const underlineRef = useRef(null);
  const progressRef = useRef(null);
  const firstDetail = useRef(true);
  const progAnimRef = useRef(null);   // current detail progress-bar animation
  const pausedRef = useRef(false);    // true while the user hovers/focuses the orbit

  // pause / resume the progress-driven auto-advance while the user explores
  const pauseCycle = () => { pausedRef.current = true; if (progAnimRef.current) progAnimRef.current.pause(); };
  const resumeCycle = () => { pausedRef.current = false; if (progAnimRef.current) { try { progAnimRef.current.play(); } catch { /* ignore */ } } };

  // ring + center-pouch drift loop (disabled under reduced motion). The ingredient
  // auto-advance is driven by the detail progress bar filling (see the [active] effect).
  useEffect(() => {
    const reduce = prefersReduce();
    if (reduce) return;
    const t0 = performance.now();
    let raf = 0;
    const loop = () => {
      const t = (performance.now() - t0) * 0.001;
      if (ring1Ref.current) ring1Ref.current.style.transform = `rotate(${t * 5}deg)`;
      if (ring2Ref.current) ring2Ref.current.style.transform = `rotate(${-t * 3.5}deg)`;
      if (pouchRef.current)
        pouchRef.current.style.transform =
          `translate(-50%,-50%) translateY(${(Math.sin(t * 0.9) * 9).toFixed(2)}px)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // detail card: stagger sub/name/desc + gold underline wipe + progress sweep on change
  useEffect(() => {
    const reduce = prefersReduce();
    if (reduce) { if (underlineRef.current) underlineRef.current.style.width = '64%'; firstDetail.current = false; return; }
    if (!firstDetail.current) {
      [subRef.current, nameRef.current, descRef.current].forEach((el, k) => {
        if (el) el.animate(
          [{ opacity: 0, transform: 'translateY(14px)', filter: 'blur(5px)' }, { opacity: 1, transform: 'translateY(0)', filter: 'blur(0px)' }],
          { duration: 560, delay: k * 90, easing: EASE, fill: 'both' });
      });
    }
    if (underlineRef.current) underlineRef.current.animate([{ width: '0%' }, { width: '64%' }], { duration: 640, delay: 120, easing: EASE, fill: 'both' });
    if (progressRef.current) {
      if (progAnimRef.current) progAnimRef.current.cancel();
      const bar = progressRef.current.animate([{ width: '0%' }, { width: '100%' }], { duration: 3400, easing: 'linear', fill: 'forwards' });
      bar.onfinish = () => setActive((v) => (v + 1) % ING.length); // bar full -> next ingredient (loops)
      if (pausedRef.current) bar.pause();
      progAnimRef.current = bar;
    }
    firstDetail.current = false;
  }, [active]);

  // center pouch fades in as the section enters (receives the flown hero pouch)
  useEffect(() => {
    const reduce = prefersReduce();
    let queued = false;
    const setO = () => {
      queued = false;
      if (!pouchRef.current) return;
      if (reduce) { pouchRef.current.style.opacity = '1'; return; }
      const vh = window.innerHeight || 1;
      const ir = sectionRef.current ? sectionRef.current.getBoundingClientRect() : { top: 0 };
      const o = Math.max(0, Math.min(1, (vh - ir.top) / (vh * 0.55)));
      pouchRef.current.style.opacity = o.toFixed(3);
    };
    const onScroll = () => { if (queued) return; queued = true; requestAnimationFrame(setO); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    setO();
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, []);

  // scroll-triggered reveals: headings rise; the orbit builds one node at a time
  // (fly out from the pouch, in a fixed order) and the detail card cascades in.
  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;
    const reduce = prefersReduce();
    const stage = stageRef.current;
    const cardEls = [subRef.current, nameRef.current, descRef.current];
    if (!reduce) {
      if (stage) stage.querySelectorAll('.orbit-node').forEach((n) => { n.style.opacity = '0'; });
      cardEls.forEach((el) => { if (el) el.style.opacity = '0'; });
    }
    const EO = 'cubic-bezier(.2,1,.3,1)';
    const runOrbit = () => {
      if (stage) stage.style.opacity = '1';   // reveal the orbit container itself (nodes fly in inside it)
      if (reduce || !stage) {
        if (stage) stage.querySelectorAll('.orbit-node').forEach((n) => { n.style.opacity = '1'; });
        cardEls.forEach((el) => { if (el) el.style.opacity = '1'; });
        return;
      }
      const nodes = [...stage.querySelectorAll('.orbit-node')];
      const sr = stage.getBoundingClientRect();
      const cx = sr.left + sr.width / 2, cy = sr.top + sr.height / 2;
      // appearance order: Glutathione, Polypodium, Collagen, N-Acetyl Cysteine, Astaxanthin, Vitamin C
      [0, 5, 1, 4, 2, 3].forEach((idx, pos) => {
        const n = nodes[idx];
        if (!n) return;
        const nr = n.getBoundingClientRect();
        const dx = (cx - (nr.left + nr.width / 2)).toFixed(1);
        const dy = (cy - (nr.top + nr.height / 2)).toFixed(1);
        const a = n.animate(
          [{ opacity: 0, transform: `translate(-50%,-50%) translate(${dx}px,${dy}px) scale(.35)` },
           { opacity: 1, transform: 'translate(-50%,-50%) scale(1)' }],
          { duration: 1400, delay: 300 + pos * 260, easing: EO, fill: 'both' });
        a.onfinish = () => { a.cancel(); n.style.opacity = '1'; };
      });
      cardEls.forEach((el, k) => {
        if (!el) return;
        const a = el.animate(
          [{ opacity: 0, transform: 'translateX(-28px)', filter: 'blur(4px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }],
          { duration: 1000, delay: 400 + k * 220, easing: EO, fill: 'both' });
        a.onfinish = () => { a.cancel(); el.style.opacity = '1'; };
      });
    };
    const io = new IntersectionObserver((ents) => {
      ents.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        if (el === stage) { io.unobserve(el); return; }   // orbit handled by the section trigger below
        const delay = 200 + parseFloat(el.getAttribute('data-reveal-delay') || '0') * 1000 * 2.2;
        el.animate(
          [{ opacity: 0, transform: 'translateY(40px)' }, { opacity: 1, transform: 'translateY(0)' }],
          { duration: 1300, delay, easing: EASE, fill: 'both' });
        io.unobserve(el);
      });
    }, { rootMargin: '-40% 0px -40% 0px', threshold: 0 });
    root.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));
    // fire the orbit build + card cascade as soon as the section scrolls into view
    let ran = false;
    const maybeRun = () => {
      if (ran) return;
      const r = root.getBoundingClientRect();
      const vh = window.innerHeight || 0;
      if (r.top < vh * 0.6 && r.bottom > vh * 0.4) {
        ran = true; runOrbit(); window.removeEventListener('scroll', maybeRun);
      }
    };
    window.addEventListener('scroll', maybeRun, { passive: true });
    maybeRun();
    return () => { io.disconnect(); window.removeEventListener('scroll', maybeRun); };
  }, []);

  // particle halo — 12 luminous motes orbit the core at varied radii/speeds
  useEffect(() => {
    if (prefersReduce()) return;
    const stage = stageRef.current;
    if (!stage || stage.querySelector('[data-spark]')) return;
    for (let i = 0; i < 12; i++) {
      const arm = document.createElement('span');
      arm.setAttribute('data-spark', '');
      const rad = 26 + Math.random() * 24;
      const dur = 6 + Math.random() * 8;
      const gold = Math.random() > 0.5;
      arm.style.cssText = 'position:absolute;inset:0;z-index:1;pointer-events:none;animation:halo-spin ' + dur.toFixed(1) + 's linear ' + (-Math.random() * dur).toFixed(1) + 's infinite;' + (Math.random() > 0.5 ? '' : 'animation-direction:reverse;');
      const dot = document.createElement('span');
      const sz = 2.5 + Math.random() * 3;
      dot.style.cssText = 'position:absolute;left:50%;top:' + (50 - rad).toFixed(1) + '%;transform:translate(-50%,-50%);width:' + sz.toFixed(1) + 'px;height:' + sz.toFixed(1) + 'px;border-radius:50%;background:rgba(190,140,46,.9);box-shadow:0 0 7px rgba(198,162,76,.6);';
      arm.appendChild(dot);
      stage.appendChild(arm);
    }
  }, []);

  // rising gold-dust field (ambient, carries the hero dust down)
  useEffect(() => {
    if (prefersReduce()) return;
    const host = dustRef.current;
    if (!host || host.childElementCount) return;
    for (let i = 0; i < 24; i++) {
      const s = document.createElement('span');
      const sz = 2 + Math.random() * 3.5;
      s.style.cssText = 'position:absolute;bottom:' + (Math.random() * 45) + '%;left:' + (Math.random() * 100) + '%;width:' + sz.toFixed(1) + 'px;height:' + sz.toFixed(1) + 'px;border-radius:50%;background:radial-gradient(circle,rgba(74,44,23,.8),rgba(122,84,22,.12));box-shadow:0 0 6px rgba(74,44,23,.3);--dx:' + (Math.random() * 60 - 30).toFixed(0) + 'px;animation:hero-dust ' + (6 + Math.random() * 7).toFixed(1) + 's ease-in-out ' + (Math.random() * 6).toFixed(1) + 's infinite;';
      host.appendChild(s);
    }
  }, []);

  const cur = ING[active];

  return (
    <section id="ingredients" ref={sectionRef} className="fullpage" style={{
      position: 'relative', padding: 'clamp(72px,10vh,140px) clamp(20px,5vw,46px)',
      background: '#d3c29c', overflow: 'hidden',
      fontFamily: "'Space Grotesk',system-ui,sans-serif",
    }}>
      {/* seam fades — top from the hero, bottom into Origin — so the sections read as one space */}
      {/* seam fades removed — kraft fills edge to edge */}
      <div ref={dustRef} aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }} />
      <span aria-hidden="true" className="am-noise" style={{ opacity: 0.02, zIndex: 0 }} />

      <div style={{
        position: 'relative', zIndex: 1,
        display: 'grid', gridTemplateColumns: 'minmax(0,0.9fr) minmax(0,1.1fr)',
        gap: 'clamp(28px,5vw,80px)', alignItems: 'center', maxWidth: '1240px', margin: '0 auto',
      }}>
        {/* LEFT: heading + editorial detail card */}
        <div>
          <h2 style={{
            margin: 0, fontFamily: "'Anton',sans-serif", fontWeight: 400, textTransform: 'uppercase',
            fontSize: 'clamp(40px,5.5vw,78px)', lineHeight: 0.9, letterSpacing: '-.01em', color: '#221a12',
          }}>
            <span className="ih-w" data-reveal data-reveal-delay="0" style={{ display: 'inline-block', opacity: 0 }}>Six</span>{' '}
            <span className="ih-w" data-reveal data-reveal-delay=".08" style={{ display: 'inline-block', opacity: 0 }}>actives,</span><br />
            <span className="ih-w" data-reveal data-reveal-delay=".16" style={{ display: 'inline-block', opacity: 0, color: '#C11A22' }}>one</span>{' '}
            <span className="ih-w" data-reveal data-reveal-delay=".24" style={{ display: 'inline-block', opacity: 0, color: '#C11A22' }}>cup.</span>
          </h2>

          <div style={{
            position: 'relative', marginTop: 'clamp(28px,4vh,44px)', borderTop: '1px solid rgba(23,17,14,.2)',
            paddingTop: '26px', minHeight: '210px',
          }}>
            <span ref={progressRef} aria-hidden="true" style={{ position: 'absolute', top: '-1px', left: 0, height: '2px', width: 0, background: 'linear-gradient(90deg,#E23A34,#C6A24C)', boxShadow: '0 0 8px rgba(226,58,52,.5)' }} />
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px' }}>
              <span ref={subRef} style={{
                fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: '15px',
                letterSpacing: '.02em', color: '#8a5f1c',
              }}>{cur.s}</span>
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '13px', letterSpacing: '.1em', color: '#8a5f1c', whiteSpace: 'nowrap' }}>{String(active + 1).padStart(2, '0')}<span style={{ color: '#b3a789' }}> / 06</span></span>
            </div>
            <h3 ref={nameRef} style={{
              margin: '12px 0 0', fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800,
              fontSize: 'clamp(30px,3.8vw,52px)', lineHeight: 1.02, letterSpacing: '-.01em', color: '#221a12',
            }}>{cur.k}</h3>
            <span ref={underlineRef} aria-hidden="true" style={{ display: 'block', height: '2px', width: 0, marginTop: '8px', background: 'linear-gradient(90deg,#8a5f1c,transparent)' }} />
            <p ref={descRef} style={{
              margin: '16px 0 0', fontFamily: "'Space Grotesk',sans-serif", fontSize: 'clamp(15px,1.5vw,18px)',
              lineHeight: 1.6, color: '#4a3c28', maxWidth: '440px',
            }}>{cur.d}</p>
          </div>
        </div>

        {/* RIGHT: orbit stage */}
        <div
          ref={stageRef}
          data-reveal
          data-reveal-delay=".15"
          onMouseEnter={pauseCycle}
          onMouseLeave={resumeCycle}
          onFocus={pauseCycle}
          onBlur={resumeCycle}
          style={{ position: 'relative', aspectRatio: '1', width: '100%', maxWidth: '560px', margin: '0 auto', opacity: 0 }}
        >
          {/* rotating rings */}
          <div ref={ring1Ref} style={{ position: 'absolute', inset: '4%', border: '1px dashed rgba(23,17,14,.22)', borderRadius: '50%' }} />
          <div ref={ring2Ref} style={{ position: 'absolute', inset: '18%', border: '1px solid rgba(198,162,76,.45)', borderRadius: '50%', animation: 'ring-glow 4.5s ease-in-out infinite' }} />
          {/* gold glow, centered directly behind the pouch */}
          <div aria-hidden="true" style={{ position: 'absolute', left: '50%', top: '50%', width: '52%', height: '52%', transform: 'translate(-50%,-50%)', borderRadius: '50%', background: 'radial-gradient(circle,rgba(198,162,76,.34),rgba(201,154,52,.12) 50%,transparent 72%)', filter: 'blur(22px)', zIndex: 1, animation: 'glow-pulse 6s ease-in-out infinite' }} />

          {/* center pouch */}
          <div ref={pouchRef} style={{ position: 'absolute', left: '50%', top: '50%', width: '30%', transform: 'translate(-50%,-50%)', pointerEvents: 'none', zIndex: 2 }}>
            <img src={POUCH} alt="AMAZTRA pouch" style={{ width: '100%', filter: 'drop-shadow(0 18px 30px rgba(0,0,0,.6))' }} />
          </div>

          {/* ingredient nodes */}
          {ING.map((ing, idx) => {
            const isActive = idx === active;
            const upper = Math.sin((ANGLES[idx] * Math.PI) / 180) < 0;
            return (
              <button
                key={ing.k}
                type="button"
                className="orbit-node"
                onMouseEnter={() => setActive(idx)}
                onFocus={() => setActive(idx)}
                onClick={() => setActive(idx)}
                style={nodeStyle(idx, isActive)}
              >
                <span aria-hidden="true" style={auraStyle(isActive)} />
                <span style={popStyle(isActive, upper)}>
                  <span style={iconWrapStyle(isActive)}><Icon name={ICON_FOR[idx]} /></span>
                  <span style={{ display: 'inline-block', background: '#17110e', border: '1px solid #C6A24C', borderRadius: '3px', padding: '9px 14px', boxShadow: '0 12px 28px rgba(0,0,0,.5)' }}>
                    <span style={{ display: 'block', fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 600, fontSize: '13px', color: '#EDE4D3', whiteSpace: 'nowrap' }}>{ing.b}</span>
                  </span>
                </span>
                <span style={{ position: 'relative', zIndex: 2 }}>{ing.k}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============================ MOBILE ============================ */

function tabStyle(active) {
  return {
    flex: 1, padding: '13px 0', border: 0, cursor: 'pointer', borderRadius: '2px',
    fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: '12px',
    letterSpacing: '.1em', textTransform: 'uppercase',
    transition: 'background .25s,color .25s',
    background: active ? '#E23A34' : 'transparent',
    color: active ? '#fff' : 'rgba(237,228,211,.6)',
  };
}

function mobileIconWrap(active, size) {
  return {
    display: active ? 'inline-flex' : 'none', alignItems: 'center', justifyContent: 'center',
    width: `${size}px`, height: `${size}px`, borderRadius: '50%', flexShrink: 0,
    background: 'rgba(23,17,14,.9)', border: '1px solid rgba(198,162,76,.5)',
    boxShadow: '0 6px 18px rgba(0,0,0,.5), 0 0 16px rgba(226,58,52,.25)',
  };
}

function mobileNodeStyle(idx, active) {
  const a = (ANGLES[idx] * Math.PI) / 180;
  const Rm = 40;
  return {
    position: 'absolute',
    left: `calc(50% + ${Math.cos(a) * Rm}%)`,
    top: `calc(50% + ${Math.sin(a) * Rm}%)`,
    transform: 'translate(-50%,-50%) scale(var(--ns))',
    '--ns': active ? 1.06 : 1,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: active ? '6px' : '0',
    fontFamily: "'Marcellus',serif", fontWeight: 400, fontSize: '9px',
    letterSpacing: '.03em', textTransform: 'uppercase',
    padding: '7px 10px', borderRadius: '2px', cursor: 'pointer', whiteSpace: 'nowrap',
    transition: 'all .3s',
    background: active ? '#E23A34' : 'rgba(237,228,211,.05)',
    color: active ? '#fff' : 'rgba(237,228,211,.82)',
    border: active ? '1px solid #E23A34' : '1px solid rgba(237,228,211,.2)',
    boxShadow: active ? '0 8px 22px rgba(226,58,52,.35)' : 'none',
    zIndex: active ? 3 : 2,
  };
}

function IngredientsMobile() {
  const [view, setView] = useState('orbit'); // 'orbit' | 'list'
  const [active, setActive] = useState(0);
  const cur = ING[active];

  const viewRef = useRef(null);
  const firstView = useRef(true);

  // blur-masked crossfade when switching Orbit <-> List
  useEffect(() => {
    if (firstView.current) { firstView.current = false; return; }
    if (prefersReduce() || !viewRef.current) return;
    viewRef.current.animate(
      [{ opacity: 0, filter: 'blur(4px)' }, { opacity: 1, filter: 'blur(0px)' }],
      { duration: 240, easing: EASE, fill: 'none' });
  }, [view]);

  return (
    <section id="ingredients" className="fullpage" style={{
      background: 'linear-gradient(180deg,#120f0d 0%,#17110e 58%,#141210 100%)',
      padding: 'clamp(44px,7vh,72px) clamp(20px,6vw,26px)',
      fontFamily: "'Space Grotesk',system-ui,sans-serif",
    }}>
      <h2 style={{
        margin: 0, fontFamily: "'Anton',sans-serif", fontWeight: 400, textTransform: 'uppercase',
        fontSize: 'clamp(40px,13vw,52px)', lineHeight: 0.9, letterSpacing: '-.01em', color: '#EDE4D3',
      }}>Six actives,<br /><span className="ih-gold" style={{ display: 'inline-block' }}>one cup.</span></h2>

      {/* segmented toggle */}
      <div style={{
        display: 'flex', gap: '4px', marginTop: '24px', padding: '4px', borderRadius: '3px',
        background: 'rgba(237,228,211,.05)', border: '1px solid rgba(237,228,211,.14)',
      }}>
        <button type="button" className="tap" onClick={() => setView('orbit')} style={tabStyle(view === 'orbit')}>Orbit</button>
        <button type="button" className="tap" onClick={() => setView('list')} style={tabStyle(view === 'list')}>List</button>
      </div>

      <div ref={viewRef}>
      {/* ORBIT VIEW */}
      {view === 'orbit' && (
        <div style={{ marginTop: '22px' }}>
          <div style={{ position: 'relative', width: '100%', aspectRatio: '1' }}>
            <div style={{ position: 'absolute', inset: '6%', border: '1px dashed rgba(237,228,211,.18)', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', inset: '22%', border: '1px solid rgba(226,58,52,.22)', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', left: '50%', top: '50%', width: '34%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }}>
              <img src={POUCH} alt="AMAZTRA pouch" style={{ width: '100%', display: 'block', filter: 'drop-shadow(0 14px 24px rgba(0,0,0,.6))' }} />
            </div>
            {ING.map((ing, idx) => {
              const isActive = idx === active;
              return (
                <button key={ing.k} type="button" className="m-node" onClick={() => setActive(idx)} style={mobileNodeStyle(idx, isActive)}>
                  <span style={mobileIconWrap(isActive, 22)}><Icon name={ICON_FOR[idx]} color="#fff" size={14} /></span>
                  <span style={{ position: 'relative', zIndex: 2 }}>{ing.k}</span>
                </button>
              );
            })}
          </div>
          <div style={{ marginTop: '22px', borderTop: '1px solid rgba(237,228,211,.16)', paddingTop: '20px' }}>
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: '14px', letterSpacing: '.02em', color: '#C6A24C' }}>{cur.s}</span>
            <h3 style={{ margin: '10px 0 0', fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: '34px', lineHeight: 1.02, letterSpacing: '-.01em', color: '#EDE4D3' }}>{cur.k}</h3>
            <p style={{ margin: '12px 0 0', fontSize: '15px', lineHeight: 1.55, color: '#cfc4b2' }}>{cur.d}</p>
          </div>
        </div>
      )}

      {/* LIST VIEW */}
      {view === 'list' && (
        <div style={{ marginTop: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
            <img src={POUCH} alt="AMAZTRA pouch" style={{ width: '40%', display: 'block', filter: 'drop-shadow(0 18px 30px rgba(0,0,0,.6))' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {ING.map((ing, idx) => {
              const open = idx === active;
              const activate = () => setActive(idx);
              return (
                <div
                  key={ing.k}
                  className="tap"
                  role="button"
                  tabIndex={0}
                  onClick={activate}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } }}
                  style={{ borderBottom: '1px solid rgba(237,228,211,.12)', paddingBottom: open ? '16px' : '12px', transition: 'padding .3s', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={mobileIconWrap(open, 34)}><Icon name={ICON_FOR[idx]} color="#E23A34" size={18} /></span>
                    <span style={{ flex: 1, fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800, fontSize: '21px', letterSpacing: '-.01em', color: open ? '#EDE4D3' : 'rgba(237,228,211,.7)' }}>{ing.k}</span>
                    <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 500, fontSize: '11px', letterSpacing: '.02em', color: '#C6A24C', textAlign: 'right', maxWidth: '120px', lineHeight: 1.3, display: open ? 'none' : 'block' }}>{ing.b}</span>
                  </div>
                  <p style={{ margin: open ? '12px 0 0' : '0', fontSize: '14px', lineHeight: 1.55, color: '#cfc4b2', maxHeight: open ? '160px' : '0', opacity: open ? 1 : 0, overflow: 'hidden', transition: 'max-height .35s ease, opacity .3s ease, margin .3s' }}>{ing.d}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
      </div>
    </section>
  );
}

/* ========================================================= */

export default function Ingredients() {
  const isMobile = useIsMobile(767);
  return isMobile ? <IngredientsMobile /> : <IngredientsDesktop />;
}
