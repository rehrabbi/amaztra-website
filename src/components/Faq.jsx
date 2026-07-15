import { useEffect, useRef } from 'react';

const prefersReduce = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Conversation, answers written without em dashes.
const CONV = [
  { o: 'Does it taste like a supplement?' }, { i: 'Nope. It tastes like good coffee, no chalky aftertaste.' },
  { o: 'How much caffeine is in a cup?' }, { i: 'About the same as a regular coffee. Nothing jittery.' },
  { o: 'When should I drink it?' }, { i: 'With your first cup. Consistency beats timing.' },
  { o: 'How long until I notice?' }, { i: 'Give it a season of daily sips.' },
  { o: 'Is it only for women?' }, { i: 'Not at all. For anyone who drinks coffee.' },
];

/**
 * Good to know (FAQ) — objection handling as an SMS thread. On view the phone
 * plays a self-running conversation (typing dots, bubbles pop in, timestamps);
 * a replay button re-runs it. Reduced motion renders the full thread at rest.
 */
export default function Faq() {
  const rootRef = useRef(null);
  const threadRef = useRef(null);
  const timers = useRef([]);
  const chatting = useRef(false);
  const playRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current, th = threadRef.current;
    if (!root || !th) return;
    const reduce = prefersReduce();
    const wait = (ms) => new Promise((r) => timers.current.push(setTimeout(r, ms)));

    const bubble = (out, text, stamp, instant) => {
      const w = document.createElement('div');
      w.style.cssText = 'position:relative;align-self:' + (out ? 'flex-end' : 'flex-start') + ';max-width:82%;';
      if (!instant) {
        const ring = document.createElement('span');
        ring.style.cssText = 'position:absolute;inset:0;border-radius:15px;border:2px solid ' +
          (out ? '#E23A34' : 'rgba(237,228,211,.4)') + ';animation:fp-ring .5s ease-out forwards;pointer-events:none;';
        w.appendChild(ring);
      }
      const b = document.createElement('div');
      b.style.cssText = 'background:' + (out ? '#E23A34' : 'rgba(237,228,211,.08)') + ';color:' +
        (out ? '#141210' : '#EDE4D3') + ';border-radius:' + (out ? '15px 15px 4px 15px' : '15px 15px 15px 4px') +
        ';padding:10px 13px;font-size:13px;line-height:1.4;' + (instant ? '' : 'animation:fp-msgin .4s cubic-bezier(.2,1.2,.4,1) both;');
      b.textContent = text;
      const t = document.createElement('p');
      t.style.cssText = 'margin:3px 5px 0;font-family:Space Mono,monospace;font-size:9px;color:#8f8578;text-align:' + (out ? 'right' : 'left') + ';';
      t.textContent = stamp;
      w.appendChild(b); w.appendChild(t);
      th.appendChild(w); th.scrollTop = th.scrollHeight;
    };

    const typing = async () => {
      const w = document.createElement('div');
      w.style.cssText = 'align-self:flex-start;background:rgba(237,228,211,.08);border-radius:15px 15px 15px 4px;padding:11px 14px;display:flex;gap:5px;animation:fp-msgin .3s both;';
      for (let k = 0; k < 3; k++) {
        const d = document.createElement('span');
        d.style.cssText = 'width:6px;height:6px;border-radius:50%;background:#8f8578;animation:fp-dots 1s infinite ' + (k * 0.2) + 's;';
        w.appendChild(d);
      }
      th.appendChild(w); th.scrollTop = th.scrollHeight;
      await wait(1000); w.remove();
    };

    const playChat = async (instant) => {
      if (!instant && chatting.current) return;
      chatting.current = true; th.innerHTML = '';
      let min = 2;
      for (const m of CONV) {
        const stamp = '8:' + String(min).padStart(2, '0') + ' AM';
        if (m.o) { bubble(true, m.o, stamp, instant); if (!instant) await wait(750); }
        else { if (!instant) await typing(); bubble(false, m.i, stamp, instant); if (!instant) await wait(650); }
        min++;
      }
      chatting.current = false;
    };
    playRef.current = () => playChat(false);

    if (reduce) { playChat(true); return; }

    const io = new IntersectionObserver((ents) => {
      ents.forEach((e) => { if (e.isIntersecting) { playChat(false); io.disconnect(); } });
    }, { threshold: 0.55 });
    io.observe(root);

    const t = timers.current;
    return () => { io.disconnect(); t.forEach(clearTimeout); };
  }, []);

  // left copy blur-rises in, staggered, on scroll (the chat panel is untouched)
  useEffect(() => {
    if (prefersReduce()) return;
    const root = rootRef.current;
    if (!root) return;
    const words = [...root.querySelectorAll('.faq-w')];
    if (!words.length) return;
    const run = () => words.forEach((el, i) => el.animate(
      [{ opacity: 0, transform: 'translateY(30px)', filter: 'blur(6px)' }, { opacity: 1, transform: 'none', filter: 'blur(0px)' }],
      { duration: 800, delay: i * 120, easing: 'cubic-bezier(.2,1.05,.3,1)', fill: 'both' }));
    const io = new IntersectionObserver((ents) => ents.forEach((e) => { if (e.isIntersecting) { run(); io.disconnect(); } }), { threshold: 0.35 });
    io.observe(words[0]);
    return () => io.disconnect();
  }, []);

  return (
    <section
      id="faq"
      ref={rootRef}
      style={{
        position: 'relative',
        background: 'linear-gradient(180deg,#17110e,#141210)',
        padding: 'clamp(72px,11vh,130px) clamp(24px,6vw,80px)',
        fontFamily: "'Space Grotesk',system-ui,sans-serif", overflow: 'hidden',
      }}
    >
      {/* ambient ghost chat bubbles drifting behind the left copy */}
      <div id="faq-ambient" aria-hidden="true" style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 'min(46%,560px)', zIndex: 0, pointerEvents: 'none' }}>
        <span style={{ position: 'absolute', left: '6%', top: '20%', maxWidth: '60%', background: 'rgba(237,228,211,.05)', border: '1px solid rgba(237,228,211,.06)', borderRadius: '14px 14px 14px 3px', padding: '9px 13px', fontSize: '12px', color: '#8f8578', animation: 'faq-bub 5s ease-in-out 0s infinite' }}>Will it keep me up at night?</span>
        <span style={{ position: 'absolute', left: '16%', top: '42%', maxWidth: '60%', background: 'rgba(226,58,52,.09)', border: '1px solid rgba(226,58,52,.12)', borderRadius: '14px 14px 14px 3px', padding: '9px 13px', fontSize: '12px', color: '#8f8578', animation: 'faq-bub 6s ease-in-out 1.2s infinite' }}>Does the collagen really work?</span>
        <span style={{ position: 'absolute', left: '9%', top: '63%', background: 'rgba(237,228,211,.05)', border: '1px solid rgba(237,228,211,.06)', borderRadius: '14px 14px 14px 3px', padding: '10px 14px', display: 'inline-flex', gap: '4px', animation: 'faq-bub 5.5s ease-in-out .6s infinite' }}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#8f8578', animation: 'faq-dot 1s infinite 0s' }} />
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#8f8578', animation: 'faq-dot 1s infinite .2s' }} />
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#8f8578', animation: 'faq-dot 1s infinite .4s' }} />
        </span>
      </div>
      <div style={{
        position: 'relative', zIndex: 1,
        maxWidth: '1180px', margin: '0 auto', display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
        gap: 'clamp(32px,6vw,80px)', alignItems: 'center', justifyItems: 'center',
      }}>
        {/* left: copy */}
        <div>
          <p className="faq-w" style={{
            margin: 0, opacity: 0, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: '13px',
            letterSpacing: '.1em', textTransform: 'uppercase', color: '#C6A24C',
          }}>Good to know</p>
          <h2 className="fp-head" style={{
            margin: '18px 0 0', fontFamily: "'Anton',sans-serif", textTransform: 'uppercase',
            fontSize: 'clamp(44px,6.6vw,80px)', lineHeight: 0.9, letterSpacing: '-.015em', color: '#EDE4D3',
          }}><span className="faq-w" style={{ display: 'inline-block', opacity: 0 }}>The <span className="faq-shimw">questions</span></span><br /><span className="faq-w" style={{ display: 'inline-block', opacity: 0 }}>you'd ask.</span></h2>
          <p className="faq-w" style={{
            margin: '24px 0 0', opacity: 0, maxWidth: '38ch', fontSize: 'clamp(16px,1.9vw,20px)',
            lineHeight: 1.6, color: '#cfc4b2',
          }}>
            Taste, caffeine, timing, results, who it's for, texted straight back, no digging.
          </p>
        </div>

        {/* right: phone mock */}
        <div style={{
          justifySelf: 'center', width: '372px', maxWidth: '100%', background: '#050505',
          border: '1px solid rgba(237,228,211,.14)', borderRadius: '44px', padding: '12px',
          boxShadow: '0 24px 60px rgba(0,0,0,.6)',
        }}>
          <div
            onMouseEnter={() => { if (threadRef.current) threadRef.current.style.overflowY = 'auto'; }}
            onMouseLeave={() => { if (threadRef.current) threadRef.current.style.overflowY = 'hidden'; }}
            style={{ background: '#141210', borderRadius: '34px', overflow: 'hidden' }}
          >
            {/* header */}
            <div style={{
              padding: '14px 20px 12px', textAlign: 'center',
              borderBottom: '1px solid rgba(237,228,211,.08)', background: 'rgba(237,228,211,.02)',
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                fontFamily: "'Space Mono',monospace", fontSize: '11px', color: '#cfc4b2', marginBottom: '12px',
              }}>
                <span>8:02</span>
                <button
                  type="button"
                  onClick={() => playRef.current && playRef.current()}
                  aria-label="Replay conversation"
                  style={{
                    background: 'none', border: 0, padding: '11px 8px', margin: '-11px -8px',
                    minHeight: '44px', display: 'inline-flex', alignItems: 'center', cursor: 'pointer',
                  }}
                >
                  <span aria-hidden="true" className="tap" style={{
                    fontFamily: "'Space Mono',monospace", fontSize: '10px', color: '#C6A24C',
                    border: '1px solid rgba(198,162,76,.5)', borderRadius: '999px', padding: '3px 9px',
                    display: 'inline-flex', alignItems: 'center',
                  }}>&#8635; replay</span>
                </button>
              </div>
              <span style={{
                display: 'inline-flex', width: '44px', height: '44px', borderRadius: '50%',
                background: 'linear-gradient(180deg,#F6E39A,#A9761B)', alignItems: 'center',
                justifyContent: 'center', fontFamily: "'Cinzel',serif", fontWeight: 700, color: '#141210', fontSize: '18px',
              }}>A</span>
              <p style={{ margin: '6px 0 0', fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 700, fontSize: '15px', color: '#EDE4D3' }}>AMAZTRA</p>
            </div>

            {/* thread (populated by playChat). Scrollable on hover, keyboard focus, or touch (see index.css). */}
            <div
              ref={threadRef}
              id="wc-thread"
              tabIndex={0}
              role="log"
              aria-label="AMAZTRA conversation, scrollable"
              onFocus={() => { if (threadRef.current) threadRef.current.style.overflowY = 'auto'; }}
              onBlur={() => { if (threadRef.current) threadRef.current.style.overflowY = 'hidden'; }}
              style={{
                height: '560px', overflowY: 'hidden', overflowX: 'hidden', padding: '18px 16px 8px',
                display: 'flex', flexDirection: 'column', gap: '9px',
              }}
            />

            {/* input row */}
            <div style={{ padding: '0 16px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ flex: 1, border: '1px solid rgba(237,228,211,.14)', borderRadius: '999px', padding: '8px 14px', fontSize: '12px', color: '#8f8578' }}>Text message&hellip;</span>
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#E23A34" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
