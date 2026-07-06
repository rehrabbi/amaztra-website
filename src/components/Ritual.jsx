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
 * Ritual — the morning reframed as a one-time "order" you keep. On view the Brew
 * then Sip checkboxes pop-fill gold in sequence; the Glow row shows loading dots.
 * Grid auto-fits to two columns and stacks on mobile. Reduced motion shows the
 * filled state at rest.
 */
export default function Ritual() {
  const rootRef = useRef(null);
  const brewRef = useRef(null);
  const sipRef = useRef(null);
  const timers = useRef([]);
  const reduce = prefersReduce();

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

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

    if (reduce) { fill(brewRef.current, false); fill(sipRef.current, false); return; }

    let done = false;
    const run = () => {
      if (done) return;
      done = true;
      timers.current.push(setTimeout(() => fill(brewRef.current, true), 250));
      timers.current.push(setTimeout(() => fill(sipRef.current, true), 850));
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
      style={{
        background: 'radial-gradient(120% 80% at 50% 0%,#1c1512 0%,#141210 52%)',
        padding: 'clamp(72px,11vh,130px) clamp(24px,6vw,80px)',
        fontFamily: "'Space Grotesk',system-ui,sans-serif", overflow: 'hidden',
      }}
    >
      <div style={{
        maxWidth: '1180px', margin: '0 auto', display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
        gap: 'clamp(32px,6vw,72px)', alignItems: 'center',
      }}>
        {/* left: copy */}
        <div>
          <p style={{
            margin: 0, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: '13px',
            letterSpacing: '.1em', textTransform: 'uppercase', color: '#C6A24C',
          }}>The ritual</p>
          <h2 style={{
            margin: '22px 0 0', fontFamily: "'Anton',sans-serif", textTransform: 'uppercase',
            fontSize: 'clamp(44px,6.6vw,80px)', lineHeight: 0.9, letterSpacing: '-.015em', color: '#EDE4D3',
          }}>A ritual, not<br />a <span style={{ color: '#E23A34' }}>routine.</span></h2>
          <p style={{
            margin: '26px 0 0', maxWidth: '40ch', fontSize: 'clamp(16px,1.9vw,20px)',
            lineHeight: 1.55, color: '#cfc4b2',
          }}>
            The same cup you already reach for every morning. Order it once, keep it forever. The actives are already in.
          </p>
        </div>

        {/* right: order card */}
        <div style={{
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
    </section>
  );
}
