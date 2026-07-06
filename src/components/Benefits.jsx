import { useEffect, useRef } from 'react';

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
export default function Benefits() {
  const pathRef = useRef(null);
  const wrapRef = useRef(null);
  const dotRefs = [useRef(null), useRef(null), useRef(null)];
  const reduce = prefersReduce();

  useEffect(() => {
    const path = pathRef.current, wrap = wrapRef.current;
    const dots = dotRefs.map((r) => r.current);
    if (!path || !wrap) return;
    const len = path.getTotalLength();

    if (reduce) {
      path.style.strokeDashoffset = '0';
      dots.forEach((d) => { if (d) d.style.opacity = '1'; });
      return;
    }

    path.style.strokeDasharray = String(len);
    path.style.strokeDashoffset = String(len);
    const thr = [0.14, 0.5, 0.9];
    const clamp01 = (v) => Math.max(0, Math.min(1, v));
    let queued = false;
    const compute = () => {
      queued = false;
      const vh = window.innerHeight || 1;
      const r = wrap.getBoundingClientRect();
      const p = clamp01((vh * 0.9 - r.top) / (vh * 0.62));
      path.style.strokeDashoffset = (len * (1 - p)).toFixed(1);
      dots.forEach((el, i) => { if (el) el.style.opacity = clamp01((p - thr[i]) / 0.1).toFixed(3); });
    };
    const onScroll = () => { if (queued) return; queued = true; requestAnimationFrame(compute); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    compute();
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);

  return (
    <section id="benefits" style={{ overflow: 'hidden' }}>
      {/* block A: poster */}
      <div style={{ background: '#E23A34', padding: 'clamp(56px,8vh,72px) clamp(24px,6vw,80px)' }}>
        <div style={{
          maxWidth: '1180px', margin: '0 auto', display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 'clamp(24px,4vw,56px)', alignItems: 'center',
        }}>
          <div>
            <p style={{
              margin: 0, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: '13px',
              letterSpacing: '.1em', textTransform: 'uppercase', color: '#141210',
            }}>The payoff</p>
            <p className="fp-head" style={{
              margin: 'clamp(22px,3.5vh,36px) 0 clamp(10px,1.6vh,16px)', fontFamily: "'Anton',sans-serif",
              textTransform: 'uppercase', fontSize: 'clamp(96px,20vw,220px)', lineHeight: 0.74,
              letterSpacing: '-.03em', color: '#141210',
            }}>{POSTER_WORD}</p>
            <p style={{
              margin: 0, maxWidth: '56ch', fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800,
              fontSize: 'clamp(18px,2.4vw,24px)', lineHeight: 1.2, color: '#141210',
            }}>A small daily habit whose effects add up, the way good ones do.</p>
          </div>

          {/* drifting beans + steam */}
          <div aria-hidden="true" style={{ position: 'relative', height: '260px', minWidth: 0 }}>
            {BEANS.map((b, i) => (
              <span key={i} style={{
                position: 'absolute', left: b.left, top: b.top, width: b.w, height: b.h, borderRadius: '50%',
                background: b.bg, boxShadow: b.inset ? 'inset 0 0 0 1px rgba(0,0,0,.25)' : 'none',
                '--r': b.r, animation: reduce ? 'none' : `po-drift ${b.dur} ease-in-out ${b.delay} infinite`,
              }} />
            ))}
            <span style={{ position: 'absolute', left: '70%', bottom: '12px', width: '7px', height: '8px', borderRadius: '50%', background: 'rgba(20,18,16,.5)' }} />
            <span style={{ position: 'absolute', left: '20%', top: '70px', width: '6px', height: '7px', borderRadius: '50%', background: 'rgba(20,18,16,.4)' }} />
            {STEAM.map((s, i) => (
              <span key={`s${i}`} style={{
                position: 'absolute', left: s.left, bottom: '14px', width: '6px', height: s.h, borderRadius: '4px',
                background: `linear-gradient(180deg,${s.bg},transparent)`, transformOrigin: 'bottom',
                animation: reduce ? 'none' : `po-steam ${s.dur} ease-out ${s.delay} infinite`,
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* block B: timeline */}
      <div style={{ background: 'linear-gradient(180deg,#141210,#17110e)', padding: 'clamp(56px,8vh,72px) clamp(24px,6vw,80px)' }}>
        <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
          <p className="fp-head" style={{
            margin: '0 0 8px', fontFamily: "'Anton',sans-serif", textTransform: 'uppercase',
            fontSize: 'clamp(30px,4.6vw,40px)', lineHeight: 0.9, color: '#EDE4D3',
          }}>&hellip;and it <span style={{ color: '#E23A34' }}>compounds.</span></p>
          <p style={{ margin: '0 0 clamp(28px,4vh,36px)', fontSize: 'clamp(15px,1.8vw,17px)', color: '#8f8578' }}>
            The longer you sip, the more it shows.
          </p>

          <div ref={wrapRef} style={{ position: 'relative' }}>
            <div style={{ position: 'relative', height: 'clamp(120px,17vh,160px)' }}>
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
                <circle ref={dotRefs[2]} cx="870" cy="24" r="9" fill="#C6A24C" opacity="0" />
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
