import { useEffect, useRef, useState } from 'react';
import { ING, ANGLES, MOL, POUCH } from '../data.js';

const R = 42; // orbit radius, percent

function nodeStyle(idx, active) {
  const a = (ANGLES[idx] * Math.PI) / 180;
  const x = Math.cos(a) * R;
  const y = Math.sin(a) * R;
  return {
    position: 'absolute',
    left: `calc(50% + ${x}%)`,
    top: `calc(50% + ${y}%)`,
    transform: `translate(-50%,-50%)${active ? ' scale(1.08)' : ''}`,
    fontFamily: "'Space Mono',monospace",
    fontSize: '11px',
    letterSpacing: '.08em',
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

export default function Ingredients() {
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
                fontFamily: "'Space Mono',monospace", fontSize: '12px', letterSpacing: '.16em',
                textTransform: 'uppercase', color: '#C6A24C',
              }}>{cur.s}</span>
            </div>
            <h3 style={{
              margin: '12px 0 0', fontFamily: "'Anton',sans-serif", fontWeight: 400,
              textTransform: 'uppercase', fontSize: 'clamp(30px,3.6vw,50px)', lineHeight: 1,
              letterSpacing: '.01em', color: '#EDE4D3',
            }}>{cur.k}</h3>
            <p style={{
              margin: '16px 0 0', fontFamily: "'Archivo',sans-serif", fontSize: 'clamp(15px,1.5vw,18px)',
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

          {/* active connector */}
          <div style={{
            position: 'absolute', left: '50%', top: '50%', height: '1.5px', width: '38%',
            transformOrigin: 'left center', transform: `rotate(${ANGLES[active]}deg)`,
            background: 'linear-gradient(90deg,rgba(226,58,52,0),rgba(226,58,52,.8))', pointerEvents: 'none',
          }} />

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
                  <img
                    src={`assets/mol/${MOL[idx]}.svg`}
                    alt={`${ing.k} molecule`}
                    style={{ display: 'block', margin: '0 auto 9px', height: '64px', width: 'auto', maxWidth: '220px', filter: 'drop-shadow(0 6px 12px rgba(0,0,0,.55))' }}
                  />
                  <span style={{ display: 'inline-block', background: '#17110e', border: '1px solid #C6A24C', borderRadius: '3px', padding: '7px 11px', boxShadow: '0 12px 28px rgba(0,0,0,.5)' }}>
                    <span style={{ display: 'block', fontFamily: "'Space Mono',monospace", fontSize: '8px', letterSpacing: '.16em', color: '#C6A24C' }}>BENEFIT</span>
                    <span style={{ display: 'block', fontFamily: "'Archivo',sans-serif", fontWeight: 700, fontSize: '12px', color: '#EDE4D3', whiteSpace: 'nowrap' }}>{ing.b}</span>
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
