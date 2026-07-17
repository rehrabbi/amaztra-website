import { useEffect, useRef } from 'react';

const prefersReduce = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function Check({ boxRef }) {
  return (
    <span ref={boxRef} data-rbox style={{
      width: '24px', height: '24px', borderRadius: '5px', border: '2px solid rgba(198,162,76,.55)',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <svg data-rcheck viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#141210"
        strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0 }}>
        <path d="m5 12 5 5 9-9" />
      </svg>
    </span>
  );
}

/**
 * Ritual — the morning reframed as a one-time "order" you keep. On view the copy
 * blur-rises in (staggered), the order card feeds out of a printer slot, then the
 * Brew / Sip checkboxes pop-fill gold in sequence; the Glow row shows loading dots.
 * A warm spotlight, film grain, gold steam and roasted beans drift through the
 * background. Reduced motion shows the filled state at rest.
 */
export default function Ritual() {
  const rootRef = useRef(null);
  const brewRef = useRef(null);
  const sipRef = useRef(null);
  const cardRef = useRef(null);
  const ambientRef = useRef(null);
  const timers = useRef([]);
  const reduce = prefersReduce();

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const words = [...root.querySelectorAll('.rt-w')];

    // ambient — gold steam wisps + roasted beans drifting up (spotlight + grain are static)
    if (!reduce) {
      const host = ambientRef.current;
      if (host && !host.querySelector('[data-steam]')) {
        for (let i = 0; i < 7; i++) {
          const s = document.createElement('span');
          s.setAttribute('data-steam', '');
          const w = 4 + Math.random() * 4, h = 90 + Math.random() * 90;
          s.style.cssText = 'position:absolute;bottom:-20px;left:' + (8 + Math.random() * 84) + '%;width:' + w.toFixed(1) + 'px;height:' + h.toFixed(0) + 'px;border-radius:6px;background:linear-gradient(180deg,rgba(198,162,76,.16),transparent);filter:blur(3px);transform-origin:bottom;--dx:' + (Math.random() * 60 - 30).toFixed(0) + 'px;animation:rt-steam ' + (7 + Math.random() * 6).toFixed(1) + 's ease-in ' + (Math.random() * 7).toFixed(1) + 's infinite;';
          host.appendChild(s);
        }
        for (let i = 0; i < 13; i++) {
          const b = document.createElement('span');
          b.setAttribute('data-bean', '');
          const w = 11 + Math.random() * 10;
          const r = (Math.random() * 60 - 30).toFixed(0), r2 = (Math.random() * 220 - 110).toFixed(0);
          b.style.cssText = 'position:absolute;bottom:-40px;left:' + (Math.random() * 100) + '%;width:' + w.toFixed(0) + 'px;height:' + (w * 0.66).toFixed(0) + 'px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#4a2c17,#2a190f);box-shadow:inset 0 0 0 1px rgba(0,0,0,.3);--dx:' + (Math.random() * 80 - 40).toFixed(0) + 'px;--r:' + r + 'deg;--r2:' + r2 + 'deg;animation:rt-bean ' + (10 + Math.random() * 8).toFixed(1) + 's linear ' + (Math.random() * 10).toFixed(1) + 's infinite;';
          const seam = document.createElement('span');
          seam.style.cssText = 'position:absolute;left:50%;top:12%;bottom:12%;width:1.5px;background:rgba(0,0,0,.4);transform:translateX(-50%);border-radius:2px;';
          b.appendChild(seam);
          host.appendChild(b);
        }
      }
    }

    const fill = (box, pop) => {
      if (!box) return;
      box.style.background = '#C6A24C';
      const c = box.querySelector('[data-rcheck]');
      if (c) c.style.opacity = '1';
      if (pop) {
        box.style.animation = 'none';
        void box.offsetWidth;
        box.style.animation = 'fp-pop .5s cubic-bezier(.2,1.5,.35,1) both';
      }
    };

    if (reduce) {
      words.forEach((el) => { el.style.opacity = '1'; });
      fill(brewRef.current, false); fill(sipRef.current, false);
      return;
    }

    let done = false;
    const run = () => {
      if (done) return;
      done = true;
      words.forEach((el, i) => el.animate(
        [{ opacity: 0, transform: 'translateY(30px)', filter: 'blur(6px)' }, { opacity: 1, transform: 'translateY(0)', filter: 'blur(0px)' }],
        { duration: 760, delay: i * 130, easing: 'cubic-bezier(.2,1.05,.3,1)', fill: 'both' }));
      if (cardRef.current) {
        cardRef.current.style.animation = 'none';
        void cardRef.current.offsetWidth;
        cardRef.current.style.animation = 'ritual-feed .9s cubic-bezier(.2,1,.3,1) both';
      }
      timers.current.push(setTimeout(() => fill(brewRef.current, true), 1050));
      timers.current.push(setTimeout(() => fill(sipRef.current, true), 1550));
    };
    const io = new IntersectionObserver((ents) => {
      ents.forEach((e) => { if (e.isIntersecting) { run(); io.disconnect(); } });
    }, { threshold: 0.45 });
    io.observe(root);

    const t = timers.current;
    return () => { io.disconnect(); t.forEach(clearTimeout); };
  }, [reduce]);

  const row = { display: 'flex', alignItems: 'center', gap: '14px', padding: '13px 0' };
  const loadingDot = (delay) => ({
    width: '4px', height: '4px', borderRadius: '50%', background: '#C6A24C',
    animation: reduce ? 'none' : `fp-dots 1.1s infinite ${delay}s`,
  });

  return (
    <section
      id="ritual"
      ref={rootRef}
      className="fullpage"
      style={{
        position: 'relative',
        background: 'radial-gradient(120% 80% at 50% 0%,#1c1512 0%,#141210 52%)',
        padding: 'clamp(72px,11vh,130px) clamp(24px,6vw,80px)',
        fontFamily: "'Space Grotesk',system-ui,sans-serif", overflow: 'hidden',
      }}
    >
      {/* ambient — feathered spotlight + film grain (static); steam + beans spawned in JS */}
      <div ref={ambientRef} id="ritual-ambient" aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <span style={{ position: 'absolute', left: '-30%', top: '-30%', width: '120%', height: '150%', borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(246,183,74,.16), rgba(246,183,74,.06) 42%, transparent 72%)', filter: 'blur(20px)', animation: 'rt-spot 13s ease-in-out infinite' }} />
        <span className="am-noise" style={{ opacity: 0.08 }} />
        {/* top seam-fade — starts at Story's bottom colour so Story -> Ritual reads as one space */}
        <span style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '32vh', background: 'linear-gradient(180deg,#141210 0%,#141210 16%,rgba(20,18,16,.55) 55%,transparent 100%)', pointerEvents: 'none' }} />
      </div>

      <div style={{
        position: 'relative', zIndex: 1,
        maxWidth: '1180px', margin: '0 auto', display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
        gap: 'clamp(32px,6vw,72px)', alignItems: 'center',
      }}>
        {/* left: copy */}
        <div>
          <p className="rt-w" style={{
            margin: 0, opacity: 0, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: '13px',
            letterSpacing: '.1em', textTransform: 'uppercase', color: '#C6A24C',
          }}>The ritual</p>
          <h2 className="fp-head" style={{
            margin: '22px 0 0', fontFamily: "'Anton',sans-serif", textTransform: 'uppercase',
            fontSize: 'clamp(44px,6.6vw,80px)', lineHeight: 0.9, letterSpacing: '.01em', color: '#EDE4D3',
          }}>
            <span className="rt-w" style={{ display: 'inline-block', opacity: 0 }}>A ritual<span style={{ color: '#C6A24C' }}>,</span></span><br />
            <span className="rt-w" style={{ display: 'inline-block', opacity: 0 }}>not a </span><span id="ritual-routine" className="rt-w" style={{ display: 'inline-block', opacity: 0, backgroundImage: 'linear-gradient(100deg,#E23A34 0%,#ff7a54 45%,#E23A34 70%)', backgroundSize: '200% 100%', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', animation: 'rt-shimmer 4.5s linear infinite' }}>routine.</span>
          </h2>
          <p className="rt-w" style={{
            margin: '26px 0 0', opacity: 0, maxWidth: '40ch', fontSize: 'clamp(16px,1.9vw,20px)',
            lineHeight: 1.55, color: '#cfc4b2',
          }}>
            The same cup you already reach for every morning. Order it once, keep it forever. The actives are already in.
          </p>
        </div>

        {/* right: order card — feeds out of a printer slot */}
        <div style={{ overflow: 'hidden', borderRadius: '14px' }}>
          <div ref={cardRef} id="ritual-card" style={{
            border: '1px solid rgba(237,228,211,.16)', borderRadius: '14px', overflow: 'hidden',
            background: 'rgba(237,228,211,.02)', boxShadow: '0 20px 44px rgba(0,0,0,.5)', width: '100%',
          }}>
            <div style={{
              background: '#E23A34', padding: '16px 22px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ fontFamily: "'Anton',sans-serif", fontSize: '22px', color: '#141210', letterSpacing: '.04em' }}>AMAZTRA</span>
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '13px', color: '#141210' }}>ORDER #01</span>
            </div>

            <div style={{ padding: '28px 24px', fontFamily: "'Space Mono',monospace", fontSize: '16px' }}>
              <div style={row}>
                <Check boxRef={brewRef} />
                <span style={{ color: '#EDE4D3' }}>BREW &middot; your way</span>
              </div>
              <div style={row}>
                <Check boxRef={sipRef} />
                <span style={{ color: '#EDE4D3' }}>SIP &middot; slow</span>
              </div>
              <div style={row}>
                <span style={{
                  width: '24px', height: '24px', borderRadius: '5px', border: '2px solid rgba(198,162,76,.4)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <span style={{ display: 'flex', gap: '3px' }}>
                    <span style={loadingDot(0)} />
                    <span style={loadingDot(0.2)} />
                    <span style={loadingDot(0.4)} />
                  </span>
                </span>
                <span style={{ color: '#cfc4b2' }}>GLOW &middot; loading</span>
              </div>
              <div style={{
                marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed rgba(237,228,211,.16)',
                display: 'flex', justifyContent: 'space-between', color: '#8f8578', fontSize: '14px',
              }}>
                <span>ACTIVES</span><span style={{ color: '#C6A24C' }}>already in</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
