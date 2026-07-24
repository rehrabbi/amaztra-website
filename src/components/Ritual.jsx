import { useEffect, useRef, useState } from 'react';

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
function RitualDesktop() {
  const rootRef = useRef(null);
  const brewRef = useRef(null);
  const sipRef = useRef(null);
  const cardRef = useRef(null);
  const glowRef = useRef(null);
  const mediaRef = useRef(null);
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
        box.style.animation = 'fp-pop .42s cubic-bezier(.2,1.5,.35,1) both';
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
      const mv = mediaRef.current ? mediaRef.current.querySelector('video') : null;
      if (mediaRef.current) mediaRef.current.animate(
        [{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0 0)' }],
        { duration: 2000, delay: 300, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both' });
      if (mv) mv.animate([{ transform: 'scale(1.12)' }, { transform: 'scale(1)' }],
        { duration: 3000, delay: 300, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both' });
      words.forEach((el, i) => el.animate(
        [{ opacity: 0, transform: 'translateY(30px)', filter: 'blur(6px)' }, { opacity: 1, transform: 'translateY(0)', filter: 'blur(0px)' }],
        { duration: 1300, delay: 300 + i * 200, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both' }));
      timers.current.push(setTimeout(() => {
        if (cardRef.current) {
          cardRef.current.style.transform = '';
          cardRef.current.style.opacity = '1';
          cardRef.current.style.animation = 'none';
          void cardRef.current.offsetWidth;
          cardRef.current.style.animation = 'ritual-feed 1.1s cubic-bezier(.2,1,.3,1) both';
        }
      }, 1200));
      // brew + sip pop in, then the GLOW row appears only once both have landed
      timers.current.push(setTimeout(() => fill(brewRef.current, true), 2100));
      timers.current.push(setTimeout(() => fill(sipRef.current, true), 2450));
      timers.current.push(setTimeout(() => {
        if (glowRef.current) glowRef.current.animate(
          [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }],
          { duration: 620, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both' });
      }, 2850));
    };
    if (cardRef.current) cardRef.current.style.transform = 'translateY(-104%)';
    const io = new IntersectionObserver((ents) => {
      ents.forEach((e) => { if (e.isIntersecting) { run(); io.disconnect(); } });
    }, { rootMargin: '-40% 0px -40% 0px', threshold: 0 });
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
        background: '#141210',
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

      <div className="rt-grid" style={{
        position: 'relative', zIndex: 1,
        maxWidth: '1180px', margin: '0 auto', display: 'grid',
        gridTemplateColumns: 'minmax(0,.82fr) minmax(0,1fr)',
        gap: 'clamp(32px,6vw,72px)', alignItems: 'center',
      }}>
        {/* left: the morning ritual clip — portrait, loops muted; poster stands in if autoplay is refused */}
        <div ref={mediaRef} className="rt-media" style={{
          position: 'relative', width: '100%', maxWidth: '440px', margin: '0 auto',
          aspectRatio: '3 / 4', borderRadius: '18px', overflow: 'hidden',
          border: '1px solid rgba(246,227,154,.18)', boxShadow: '0 30px 64px rgba(0,0,0,.5)',
          background: 'linear-gradient(160deg,#2a1c15,#171310)',
          clipPath: reduce ? 'none' : 'inset(0 0 100% 0)',
        }}>
          <span aria-hidden="true" style={{ position: 'absolute', inset: '-14%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(226,58,52,.26), rgba(246,183,74,.1) 46%, transparent 70%)', filter: 'blur(34px)', pointerEvents: 'none', zIndex: 0 }} />
          <video src="assets/video/ritual-scene.mp4" poster="assets/video/ritual-scene-poster.jpg"
            autoPlay={!reduce} loop muted playsInline preload="metadata" tabIndex={-1} aria-hidden="true"
            style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          <span aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', boxShadow: 'inset 0 0 60px rgba(0,0,0,.4)', borderRadius: 'inherit' }} />        </div>

        {/* right: copy stacked over the order card */}
        <div>
          <p className="rt-w" style={{
            margin: 0, opacity: 0, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: '13px',
            letterSpacing: '.1em', textTransform: 'uppercase', color: '#C6A24C',
          }}>The ritual</p>
          <h2 className="fp-head" style={{
            margin: '18px 0 0', fontFamily: "'Anton',sans-serif", textTransform: 'uppercase',
            fontSize: 'clamp(40px,5.4vw,66px)', lineHeight: 0.9, letterSpacing: '.01em', color: '#EDE4D3',
          }}>
            <span className="rt-w" style={{ display: 'inline-block', opacity: 0 }}>A ritual<span style={{ color: '#C6A24C' }}>,</span></span><br />
            <span className="rt-w" style={{ display: 'inline-block', opacity: 0 }}>not a </span><span id="ritual-routine" className="rt-w" style={{ display: 'inline-block', opacity: 0, backgroundImage: 'linear-gradient(100deg,#E23A34 0%,#ff7a54 45%,#E23A34 70%)', backgroundSize: '200% 100%', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', animation: 'rt-shimmer 4.5s linear infinite' }}>routine.</span>
          </h2>
          <p className="rt-w" style={{
            margin: '20px 0 0', opacity: 0, maxWidth: '46ch', fontSize: 'clamp(15px,1.7vw,18px)',
            lineHeight: 1.55, color: '#cfc4b2',
          }}>
            The same cup you already reach for every morning. Order it once, keep it forever. The actives are already in.
          </p>

          {/* order card — feeds out of a printer slot */}
          <div style={{ overflow: 'hidden', borderRadius: '14px', marginTop: 'clamp(26px,4vh,36px)' }}>
            <div ref={cardRef} id="ritual-card" style={{
              border: '1px solid rgba(237,228,211,.16)', borderRadius: '14px', overflow: 'hidden',
              background: 'rgba(237,228,211,.02)', boxShadow: '0 20px 44px rgba(0,0,0,.5)', width: '100%',
              opacity: reduce ? 1 : 0,
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
              <div ref={glowRef} style={{ ...row, opacity: reduce ? 1 : 0 }}>
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
          {/* /order card */}
        </div>
        {/* /right column */}
      </div>
      {/* /rt-grid */}
    </div>
    </section>
  );
}

/* ============================ MOBILE (2c — Cinematic receipt) ============================ */

function useIsMobile(bp = 767) {
  const q = `(max-width:${bp}px)`;
  const [m, setM] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(q).matches);
  useEffect(() => {
    const mq = window.matchMedia(q);
    const on = () => setM(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [q]);
  return m;
}

function RitualMobile() {
  const rootRef = useRef(null);
  const mediaRef = useRef(null);
  const ebRef = useRef(null);
  const headRef = useRef(null);
  const descRef = useRef(null);
  const cardRef = useRef(null);
  const brewRef = useRef(null);
  const sipRef = useRef(null);
  const glowRef = useRef(null);
  const reduce = prefersReduce();

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const media = mediaRef.current, eb = ebRef.current, head = headRef.current, desc = descRef.current, card = cardRef.current, brew = brewRef.current, sip = sipRef.current, glow = glowRef.current;
    const EO = 'cubic-bezier(.16,1,.3,1)';
    const POP = 'cubic-bezier(.2,1.5,.35,1)';
    const showAll = () => {
      [eb, head, desc, card, brew, sip, glow].forEach((el) => { if (el) { el.style.opacity = '1'; el.style.transform = 'none'; } });
      if (media) media.style.clipPath = 'inset(0 0 0 0)';
    };
    if (reduce) { showAll(); return; }
    const hide = () => {
      [eb, head, desc, card].forEach((el) => { if (el) el.style.opacity = '0'; });
      [brew, sip].forEach((el) => { if (el) { el.style.opacity = '0'; el.style.transform = 'scale(0)'; } });
      if (glow) glow.style.opacity = '0';
      if (media) media.style.clipPath = 'inset(0 0 100% 0)';
    };
    const play = () => {
      if (media) media.animate([{ clipPath: 'inset(0 0 100% 0)', transform: 'scale(1.12)' }, { clipPath: 'inset(0 0 0 0)', transform: 'scale(1)' }], { duration: 1800, delay: 200, easing: EO, fill: 'both' });
      if (eb) eb.animate([{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { duration: 800, delay: 500, easing: EO, fill: 'both' });
      // no blur here: a filtered ancestor breaks background-clip:text on "routine."
      if (head) head.animate([{ opacity: 0, transform: 'translateY(22px)' }, { opacity: 1, transform: 'none' }], { duration: 1000, delay: 700, easing: EO, fill: 'both' });
      if (desc) desc.animate([{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'none' }], { duration: 900, delay: 950, easing: EO, fill: 'both' });
      if (card) card.animate([{ opacity: 0, transform: 'translateY(40px)' }, { opacity: 1, transform: 'none' }], { duration: 1100, delay: 1050, easing: 'cubic-bezier(.2,1,.3,1)', fill: 'both' });
      if (brew) brew.animate([{ opacity: 0, transform: 'scale(0)' }, { opacity: 1, transform: 'scale(1.3)', offset: 0.7 }, { opacity: 1, transform: 'scale(1)' }], { duration: 500, delay: 1900, easing: POP, fill: 'both' });
      if (sip) sip.animate([{ opacity: 0, transform: 'scale(0)' }, { opacity: 1, transform: 'scale(1.3)', offset: 0.7 }, { opacity: 1, transform: 'scale(1)' }], { duration: 500, delay: 2200, easing: POP, fill: 'both' });
      if (glow) glow.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 620, delay: 2550, easing: EO, fill: 'both' });
    };
    hide();
    const io = new IntersectionObserver((ents) => ents.forEach((e) => { if (e.isIntersecting) { play(); io.disconnect(); } }), { rootMargin: '-30% 0px -30% 0px', threshold: 0 });
    io.observe(root);
    return () => io.disconnect();
  }, [reduce]);

  const dot = (d) => ({ width: '4px', height: '4px', borderRadius: '50%', background: '#C6A24C', animation: reduce ? 'none' : `rm-dots 1.1s infinite ${d}s` });
  const boxS = { width: '22px', height: '22px', borderRadius: '5px', background: '#C6A24C', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 };
  const rowS = { display: 'flex', alignItems: 'center', gap: '12px', padding: '7px 0' };
  const CheckSvg = () => (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#141210" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5 9-9" /></svg>
  );

  return (
    <section id="ritual" ref={rootRef} className="fullpage" style={{ position: 'relative', minHeight: '100svh', overflow: 'hidden', background: '#141210', fontFamily: "'Space Grotesk',system-ui,sans-serif" }}>
      <style>{`@keyframes rm-dots{0%,80%,100%{opacity:.25;transform:translateY(0)}40%{opacity:1;transform:translateY(-3px)}}@keyframes rm-shimmer{0%{background-position:0 0}100%{background-position:200% 0}}`}</style>
      <div ref={mediaRef} aria-hidden="true" style={{ position: 'absolute', inset: 0, clipPath: reduce ? 'none' : 'inset(0 0 100% 0)' }}>
        <video src="assets/video/ritual-scene.mp4" poster="assets/video/ritual-scene-poster.jpg" autoPlay={!reduce} loop muted playsInline preload="metadata" tabIndex={-1} aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
      <span aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(18,15,13,.6) 0%,rgba(18,15,13,.12) 30%,rgba(18,15,13,.55) 60%,rgba(18,15,13,.94) 100%)' }} />

      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, padding: 'clamp(48px,8vh,72px) clamp(24px,7vw,34px) 0' }}>
        <span ref={ebRef} style={{ opacity: reduce ? 1 : 0, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: '13px', letterSpacing: '.1em', textTransform: 'uppercase', color: '#C6A24C' }}>The ritual</span>
        <h2 ref={headRef} style={{ opacity: reduce ? 1 : 0, margin: '14px 0 0', fontFamily: "'Anton',sans-serif", textTransform: 'uppercase', fontSize: 'clamp(38px,11vw,52px)', lineHeight: 0.94, letterSpacing: '-.01em', color: '#EDE4D3', textShadow: '0 2px 18px rgba(0,0,0,.6)' }}>A ritual,<br />not a <span style={{ display: 'inline-block', lineHeight: 1.06, paddingBottom: '.08em', backgroundImage: 'linear-gradient(100deg,#E23A34,#ff7a54 45%,#E23A34 70%)', backgroundSize: '200% 100%', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', textShadow: 'none', animation: reduce ? 'none' : 'rm-shimmer 4.5s linear infinite' }}>routine.</span></h2>
      </div>

      <div style={{ position: 'absolute', left: 'clamp(22px,6vw,26px)', right: 'clamp(22px,6vw,26px)', bottom: 'clamp(30px,5vh,44px)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <p ref={descRef} style={{ opacity: reduce ? 1 : 0, margin: 0, fontSize: 'clamp(14px,4vw,16px)', lineHeight: 1.55, color: '#e9e0d0', textShadow: '0 1px 10px rgba(0,0,0,.7)' }}>The same cup you already reach for every morning. Order it once, keep it forever. The actives are already in.</p>
        <div ref={cardRef} style={{ opacity: reduce ? 1 : 0, borderRadius: '16px', overflow: 'hidden', background: 'rgba(20,18,16,.55)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(237,228,211,.18)', boxShadow: '0 24px 50px rgba(0,0,0,.5)' }}>
        <div style={{ background: 'rgba(226,58,52,.92)', padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: "'Anton',sans-serif", fontSize: '18px', color: '#141210', letterSpacing: '.04em' }}>AMAZTRA</span>
          <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '12px', color: '#141210' }}>ORDER #01</span>
        </div>
        <div style={{ padding: '16px 18px', fontFamily: "'Space Mono',monospace", fontSize: '14px' }}>
          <div style={rowS}>
            <span ref={brewRef} style={{ ...boxS, opacity: reduce ? 1 : 0 }}><CheckSvg /></span>
            <span style={{ color: '#EDE4D3' }}>BREW &middot; your way</span>
          </div>
          <div style={rowS}>
            <span ref={sipRef} style={{ ...boxS, opacity: reduce ? 1 : 0 }}><CheckSvg /></span>
            <span style={{ color: '#EDE4D3' }}>SIP &middot; slow</span>
          </div>
          <div ref={glowRef} style={{ ...rowS, opacity: reduce ? 1 : 0 }}>
            <span style={{ width: '22px', height: '22px', borderRadius: '5px', border: '2px solid rgba(198,162,76,.4)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ display: 'flex', gap: '3px' }}><span style={dot(0)} /><span style={dot(0.2)} /><span style={dot(0.4)} /></span>
            </span>
            <span style={{ color: '#cfc4b2' }}>GLOW &middot; loading</span>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}

export default function Ritual() {
  const isMobile = useIsMobile(767);
  return isMobile ? <RitualMobile /> : <RitualDesktop />;
}
