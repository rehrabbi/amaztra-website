import { useEffect, useRef, useState } from 'react';
import { ING, ANGLES, POUCH } from '../data.js';

const R = 42; // desktop orbit radius, percent

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

function Icon({ name, color = '#E23A34', size = 26 }) {
  const def = ICONS[name];
  return (
    <svg
      viewBox="0 0 24 24" width={size} height={size} fill="none"
      stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" style={{ display: 'block' }}
    >
      {def.circle && <circle cx={def.circle[0]} cy={def.circle[1]} r={def.circle[2]} />}
      {def.paths.map((d, i) => <path key={i} d={d} />)}
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
    transform: `translate(-50%,-50%)${active ? ' scale(1.08)' : ''}`,
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
    background: active ? '#E23A34' : 'rgba(237,228,211,.05)',
    color: active ? '#fff' : 'rgba(237,228,211,.82)',
    border: active ? '1px solid #E23A34' : '1px solid rgba(237,228,211,.2)',
    boxShadow: active ? '0 10px 30px rgba(226,58,52,.35)' : 'none',
    zIndex: active ? 3 : 2,
  };
}

function auraStyle(active) {
  return {
    position: 'absolute', left: '50%', top: '50%', width: '130px', height: '130px',
    transform: `translate(-50%,-50%) scale(${active ? 1 : 0.4})`,
    borderRadius: '50%',
    background: 'radial-gradient(circle,rgba(226,58,52,.55),rgba(198,162,76,.16) 54%,transparent 72%)',
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
  const hoveringRef = useRef(false);

  const ring1Ref = useRef(null);
  const ring2Ref = useRef(null);
  const pouchRef = useRef(null);

  // auto-cycle + ring/pouch animation loop
  useEffect(() => {
    const t0 = performance.now();
    const cycle = setInterval(() => {
      if (!hoveringRef.current) setActive((v) => (v + 1) % ING.length);
    }, 3400);

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

    return () => { clearInterval(cycle); cancelAnimationFrame(raf); };
  }, []);

  // scroll-triggered reveals
  useEffect(() => {
    const io = new IntersectionObserver((ents) => {
      ents.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const delay = parseFloat(el.getAttribute('data-reveal-delay') || '0') * 1000;
        el.animate(
          [{ opacity: 0, transform: 'translateY(46px)' }, { opacity: 1, transform: 'translateY(0)' }],
          { duration: 950, delay, easing: 'cubic-bezier(.23,1,.32,1)', fill: 'both' });
        io.unobserve(el);
      });
    }, { threshold: 0.18 });
    document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const cur = ING[active];

  return (
    <section id="ingredients" style={{
      position: 'relative', padding: 'clamp(72px,10vh,140px) clamp(20px,5vw,46px)',
      background: 'linear-gradient(180deg,#120f0d,#17110e)', overflow: 'hidden',
      fontFamily: "'Space Grotesk',system-ui,sans-serif",
    }}>
      <div style={{
        display: 'grid', gridTemplateColumns: 'minmax(0,0.9fr) minmax(0,1.1fr)',
        gap: 'clamp(28px,5vw,80px)', alignItems: 'center', maxWidth: '1240px', margin: '0 auto',
      }}>
        {/* LEFT: heading + editorial detail card */}
        <div data-reveal style={{ opacity: 0 }}>
          <h2 style={{
            margin: 0, fontFamily: "'Anton',sans-serif", fontWeight: 400, textTransform: 'uppercase',
            fontSize: 'clamp(40px,5.5vw,78px)', lineHeight: 0.9, letterSpacing: '-.01em', color: '#EDE4D3',
          }}>Six actives,<br />one cup.</h2>

          <div style={{
            marginTop: 'clamp(28px,4vh,44px)', borderTop: '1px solid rgba(237,228,211,.16)',
            paddingTop: '26px', minHeight: '210px',
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <span style={{
                fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: '15px',
                letterSpacing: '.02em', color: '#C6A24C',
              }}>{cur.s}</span>
            </div>
            <h3 style={{
              margin: '12px 0 0', fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800,
              fontSize: 'clamp(30px,3.8vw,52px)', lineHeight: 1.02, letterSpacing: '-.01em', color: '#EDE4D3',
            }}>{cur.k}</h3>
            <p style={{
              margin: '16px 0 0', fontFamily: "'Space Grotesk',sans-serif", fontSize: 'clamp(15px,1.5vw,18px)',
              lineHeight: 1.6, color: '#cfc4b2', maxWidth: '440px',
            }}>{cur.d}</p>
          </div>
        </div>

        {/* RIGHT: orbit stage */}
        <div
          data-reveal
          data-reveal-delay=".15"
          onMouseEnter={() => { hoveringRef.current = true; }}
          onMouseLeave={() => { hoveringRef.current = false; }}
          style={{ position: 'relative', aspectRatio: '1', width: '100%', maxWidth: '560px', margin: '0 auto', opacity: 0 }}
        >
          {/* rotating rings */}
          <div ref={ring1Ref} style={{ position: 'absolute', inset: '4%', border: '1px dashed rgba(237,228,211,.18)', borderRadius: '50%' }} />
          <div ref={ring2Ref} style={{ position: 'absolute', inset: '18%', border: '1px solid rgba(226,58,52,.22)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', inset: '31%', borderRadius: '50%', background: 'radial-gradient(circle,rgba(226,58,52,.16),transparent 70%)' }} />

          {/* center pouch */}
          <div ref={pouchRef} style={{ position: 'absolute', left: '50%', top: '50%', width: '30%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }}>
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
    flex: 1, padding: '10px 0', border: 0, cursor: 'pointer', borderRadius: '2px',
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
    transform: `translate(-50%,-50%)${active ? ' scale(1.06)' : ''}`,
    display: 'flex', alignItems: 'center', gap: active ? '6px' : '0',
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

  return (
    <section id="ingredients" style={{
      background: 'linear-gradient(180deg,#120f0d,#17110e)',
      padding: 'clamp(44px,7vh,72px) clamp(20px,6vw,26px)',
      fontFamily: "'Space Grotesk',system-ui,sans-serif",
    }}>
      <h2 style={{
        margin: 0, fontFamily: "'Anton',sans-serif", fontWeight: 400, textTransform: 'uppercase',
        fontSize: 'clamp(40px,13vw,52px)', lineHeight: 0.9, letterSpacing: '-.01em', color: '#EDE4D3',
      }}>Six actives,<br />one cup.</h2>

      {/* segmented toggle */}
      <div style={{
        display: 'flex', gap: '4px', marginTop: '24px', padding: '4px', borderRadius: '3px',
        background: 'rgba(237,228,211,.05)', border: '1px solid rgba(237,228,211,.14)',
      }}>
        <button type="button" onClick={() => setView('orbit')} style={tabStyle(view === 'orbit')}>Orbit</button>
        <button type="button" onClick={() => setView('list')} style={tabStyle(view === 'list')}>List</button>
      </div>

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
                <button key={ing.k} type="button" onClick={() => setActive(idx)} style={mobileNodeStyle(idx, isActive)}>
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
    </section>
  );
}

/* ========================================================= */

export default function Ingredients() {
  const isMobile = useIsMobile(767);
  return isMobile ? <IngredientsMobile /> : <IngredientsDesktop />;
}
