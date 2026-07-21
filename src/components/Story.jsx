import { useEffect, useRef } from 'react';

const EASE = 'cubic-bezier(.16,1,.3,1)';
const prefersReduce = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Content knob from the handoff (originPunch): 'it should brew.' | 'it should pour.' | 'just add coffee.'
const ORIGIN_PUNCH = 'it should brew.';

/**
 * Origin — two-column: a vertical "THE ORIGIN" rail and the stacked headline on the
 * left, the looping brew clip overlapping in from the right. On view the whole stage
 * arrives from depth (rotateX + blur), the headline lines flip up one by one, a glint
 * sweeps "Beauty", a red strike wipes across "work", then the punch line lands and
 * catches an ember glow while sparks rise off it. Ambient ember motes drift up the
 * panel and the top seam fades from the section above, so Ingredients -> Origin read
 * as one space. The arrival replays whenever the section is re-entered. Reduced
 * motion shows everything at rest.
 */
export default function Story() {
  const rootRef = useRef(null);
  const stageRef = useRef(null);
  const eyebrowRef = useRef(null);
  const beautyRef = useRef(null);
  const strikeRef = useRef(null);
  const punchRef = useRef(null);
  const descRef = useRef(null);
  const ambientRef = useRef(null);
  const dustRef = useRef(null);
  const sparksRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const stage = stageRef.current;
    const eyebrow = eyebrowRef.current;
    const beauty = beautyRef.current;
    const strike = strikeRef.current;
    const punch = punchRef.current;
    const desc = descRef.current;
    const cws = [...root.querySelectorAll('.story-cw')];
    const reduce = prefersReduce();
    const timers = [];

    // ambient ember field (16 motes) + extended gold dust (24) drifting up the panel
    if (!reduce) {
      const amb = ambientRef.current;
      if (amb && !amb.childElementCount) {
        for (let i = 0; i < 16; i++) {
          const s = document.createElement('span');
          const sz = 2 + Math.random() * 3.5, gold = Math.random() > 0.4;
          s.style.cssText = 'position:absolute;bottom:-10px;left:' + (Math.random() * 100) + '%;width:' + sz.toFixed(1) + 'px;height:' + sz.toFixed(1) + 'px;border-radius:50%;background:' + (gold ? 'radial-gradient(circle,rgba(246,183,74,.9),rgba(201,90,40,.15))' : 'radial-gradient(circle,rgba(226,58,52,.85),transparent)') + ';box-shadow:0 0 7px ' + (gold ? 'rgba(246,183,74,.55)' : 'rgba(226,58,52,.5)') + ';--dx:' + (Math.random() * 80 - 40).toFixed(0) + 'px;animation:o-embed ' + (9 + Math.random() * 8).toFixed(1) + 's ease-in-out ' + (Math.random() * 9).toFixed(1) + 's infinite;';
          amb.appendChild(s);
        }
      }
      const dust = dustRef.current;
      if (dust && !dust.childElementCount) {
        for (let i = 0; i < 24; i++) {
          const s = document.createElement('span');
          const sz = 2 + Math.random() * 3.5;
          s.style.cssText = 'position:absolute;bottom:' + (Math.random() * 45) + '%;left:' + (Math.random() * 100) + '%;width:' + sz.toFixed(1) + 'px;height:' + sz.toFixed(1) + 'px;border-radius:50%;background:radial-gradient(circle,rgba(246,227,154,.95),rgba(201,154,52,.15));box-shadow:0 0 6px rgba(246,227,154,.5);--dx:' + (Math.random() * 60 - 30).toFixed(0) + 'px;animation:hero-dust ' + (6 + Math.random() * 7).toFixed(1) + 's ease-in-out ' + (Math.random() * 6).toFixed(1) + 's infinite;';
          dust.appendChild(s);
        }
      }
    }

    const spawnSparks = () => {
      const host = sparksRef.current;
      if (!host || host.childElementCount) return;
      for (let i = 0; i < 12; i++) {
        const s = document.createElement('span');
        const sz = 2 + Math.random() * 2.5;
        s.style.cssText = 'position:absolute;bottom:' + (Math.random() * 30) + '%;left:' + (20 + Math.random() * 60) + '%;width:' + sz.toFixed(1) + 'px;height:' + sz.toFixed(1) + 'px;border-radius:50%;background:radial-gradient(circle,rgba(246,227,154,.95),rgba(226,58,52,.3));box-shadow:0 0 6px rgba(246,183,74,.7);--dx:' + (Math.random() * 30 - 15).toFixed(0) + 'px;animation:o-spark ' + (2 + Math.random() * 2).toFixed(1) + 's ease-out ' + (Math.random() * 2.5).toFixed(1) + 's infinite;';
        host.appendChild(s);
      }
    };

    const showAll = () => {
      if (stage) { stage.style.opacity = '1'; stage.style.transform = 'none'; stage.style.filter = 'none'; }
      cws.forEach((el) => { el.style.transform = 'none'; });
      if (eyebrow) eyebrow.style.opacity = '1';
      if (desc) desc.style.opacity = '1';
      if (punch) punch.style.opacity = '1';
      if (strike) strike.style.transform = 'rotate(-3deg) scaleX(1)';
    };
    if (reduce) { showAll(); return; }

    const hide = () => {
      [stage, eyebrow, desc, punch, strike, beauty, ...cws].forEach((el) => {
        if (el) el.getAnimations().forEach((a) => a.cancel());
      });
      timers.forEach(clearTimeout);
      timers.length = 0;
      if (stage) { stage.style.opacity = '0'; stage.style.transform = 'perspective(1300px) rotateX(9deg) translateY(46px) scale(.95)'; stage.style.filter = 'blur(6px)'; }
      cws.forEach((el) => { el.style.transform = 'translateY(110%)'; });
      if (eyebrow) eyebrow.style.opacity = '0';
      if (desc) desc.style.opacity = '0';
      if (punch) { punch.style.opacity = '0'; punch.style.animation = 'none'; }
      if (strike) strike.style.transform = 'rotate(-3deg) scaleX(0)';
      if (beauty) beauty.style.animation = 'none';
    };

    const play = () => {
      hide();
      if (stage) stage.animate([
        { opacity: 0, transform: 'perspective(1300px) rotateX(9deg) translateY(46px) scale(.95)', filter: 'blur(6px)' },
        { opacity: 1, transform: 'perspective(1300px) rotateX(0deg) translateY(0) scale(1)', filter: 'blur(0px)' },
      ], { duration: 1600, easing: EASE, fill: 'both' });
      if (eyebrow) eyebrow.animate(
        [{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }],
        { duration: 900, delay: 200, easing: EASE, fill: 'both' });
      cws.forEach((el, i) => el.animate([
        { transform: 'perspective(600px) rotateX(-48deg) translateY(110%)' },
        { transform: 'perspective(600px) rotateX(0deg) translateY(0)' },
      ], { duration: 1050, delay: 360 + i * 110, easing: 'cubic-bezier(.2,1,.3,1)', fill: 'both' }));
      if (beauty) timers.push(setTimeout(() => { beauty.style.animation = 'story-glint 1.3s ease-in-out forwards'; }, 1050));
      if (strike) timers.push(setTimeout(() => strike.animate(
        [{ transform: 'rotate(-3deg) scaleX(0)' }, { transform: 'rotate(-3deg) scaleX(1)' }],
        { duration: 520, easing: EASE, fill: 'both' }), 1150));
      if (punch) {
        punch.animate(
          [{ opacity: 0, transform: 'translateY(26px) scale(.96)' }, { opacity: 1, transform: 'none' }],
          { duration: 1000, delay: 1200, easing: 'cubic-bezier(.2,1.1,.3,1)', fill: 'both' });
        timers.push(setTimeout(() => { punch.style.animation = 'ember 2.8s ease-in-out infinite'; spawnSparks(); }, 2100));
      }
      if (desc) desc.animate(
        [{ opacity: 0, transform: 'translateY(20px)' }, { opacity: 1, transform: 'none' }],
        { duration: 1000, delay: 1400, easing: EASE, fill: 'both' });
    };

    hide();
    let inView = false;
    const io = new IntersectionObserver((ents) => ents.forEach((e) => {
      if (e.isIntersecting && e.intersectionRatio >= 0.4) { if (!inView) { inView = true; play(); } }
      else if (e.intersectionRatio === 0) { if (inView) { inView = false; hide(); } }
    }), { threshold: [0, 0.4] });
    io.observe(root);
    return () => { io.disconnect(); timers.forEach(clearTimeout); };
  }, []);

  return (
    <section
      id="story"
      ref={rootRef}
      className="fullpage"
      style={{
        position: 'relative',
        background: 'radial-gradient(120% 80% at 50% 0%,#1c1512 0%,#141210 52%)',
        padding: 'clamp(64px,9vh,120px) clamp(24px,6vw,80px)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        textAlign: 'left', fontFamily: "'Space Grotesk',system-ui,sans-serif",
        overflow: 'hidden', perspective: '1300px',
      }}
    >
      {/* warm spotlight — the same glow Ritual uses, carried up so Story + Ritual share one light */}
      <span aria-hidden="true" style={{ position: 'absolute', left: '-30%', top: '-38%', width: '120%', height: '150%', borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(246,183,74,.16), rgba(246,183,74,.06) 42%, transparent 72%)', filter: 'blur(20px)', pointerEvents: 'none', zIndex: 0, animation: 'rt-spot 13s ease-in-out infinite' }} />

      {/* ambient ember field + carried-down gold dust + top seam fade (behind content) */}
      <div ref={ambientRef} aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }} />
      <div ref={dustRef} aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '46%', overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }} />
      <span aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '46vh', background: 'linear-gradient(180deg,#141210 0%,#141210 20%,rgba(20,18,16,.55) 55%,transparent 100%)', pointerEvents: 'none', zIndex: 0 }} />

      <div className="story-grid" style={{
        position: 'relative', zIndex: 1, width: '100%', maxWidth: '1200px', margin: '0 auto',
        display: 'grid', gridTemplateColumns: '1fr .82fr', alignItems: 'center', gap: 0,
      }}>
        {/* left: vertical rail + stacked headline; arrives from depth as one plate */}
        <div ref={stageRef} style={{
          position: 'relative', zIndex: 2, minWidth: 0, transformStyle: 'preserve-3d',
          willChange: 'transform,opacity', opacity: 0, display: 'flex', gap: 'clamp(18px,2vw,26px)',
        }}>
          <span ref={eyebrowRef} className="story-rail" style={{
            opacity: 0, writingMode: 'vertical-rl', transform: 'rotate(180deg)', alignSelf: 'flex-start',
            paddingTop: '4px', fontFamily: "'Space Mono',monospace", fontSize: '12px',
            letterSpacing: '.24em', textTransform: 'uppercase', color: '#C6A24C', whiteSpace: 'nowrap',
          }}>The origin</span>

          <div style={{ minWidth: 0 }}>
            {/* each line flips up out of its own clip; "Beauty" catches a glint once it lands */}
            <h2 style={{
              margin: 0, fontFamily: "'Anton',sans-serif", textTransform: 'uppercase',
              fontSize: 'clamp(40px,5.4vw,66px)', lineHeight: 1.16, letterSpacing: '-.02em', color: '#EDE4D3',
            }}>
              <span style={{ display: 'block', overflow: 'hidden' }}>
                <span ref={beautyRef} className="story-cw" style={{
                  display: 'inline-block', transform: 'translateY(110%)',
                  background: 'linear-gradient(100deg,#EDE4D3 0%,#EDE4D3 36%,#F6E39A 50%,#EDE4D3 64%,#EDE4D3 100%)',
                  backgroundSize: '230% 100%', backgroundPosition: '190% 0',
                  WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
                }}>Beauty</span>
              </span>
              <span style={{ display: 'block', overflow: 'hidden' }}>
                <span className="story-cw" style={{ display: 'inline-block', transform: 'translateY(110%)' }}>shouldn't</span>
              </span>
              <span style={{ display: 'block', overflow: 'hidden' }}>
                <span className="story-cw" style={{ display: 'inline-block', transform: 'translateY(110%)' }}>
                  feel like{' '}
                  <span style={{ position: 'relative', color: '#8f8578' }}>
                    work
                    <span ref={strikeRef} aria-hidden="true" style={{
                      position: 'absolute', left: '-4%', right: '-4%', top: '52%',
                      height: 'clamp(5px,.7vw,9px)', background: '#E23A34',
                      transform: 'rotate(-3deg) scaleX(0)', transformOrigin: 'left',
                    }} />
                  </span>
                </span>
              </span>
            </h2>

            {/* gold-gradient punch line — catches an ember glow after the strike */}
            <p id="story-punch" ref={punchRef} style={{
              opacity: 0, position: 'relative', margin: 'clamp(16px,2.4vh,26px) 0 0',
              fontFamily: "'Anton',sans-serif", textTransform: 'uppercase',
              fontSize: 'clamp(48px,6.4vw,84px)', lineHeight: 0.9, letterSpacing: '-.01em',
              background: 'linear-gradient(180deg,#F6E39A,#A9761B)',
              WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', zIndex: 3,
            }}>
              {ORIGIN_PUNCH}
              <span ref={sparksRef} aria-hidden="true" style={{ position: 'absolute', inset: '-30% 0 0', pointerEvents: 'none' }} />
            </p>

            <p ref={descRef} style={{
              opacity: 0, margin: 'clamp(24px,4vh,36px) 0 0', maxWidth: '38ch',
              fontSize: 'clamp(15px,1.6vw,18px)', lineHeight: 1.6, color: '#cfc4b2',
            }}>
              Self-care quietly became a chore. But you never skipped the first warm cup, so we folded the actives right there.
            </p>
          </div>
        </div>

        {/* right: the looping brew clip, pulled left so the punch line overlaps its frame */}
        <div className="story-media-wrap" style={{
          position: 'relative', zIndex: 1, minWidth: 0,
          height: 'clamp(380px,58vh,520px)', marginLeft: 'clamp(-96px,-6vw,-64px)',
        }}>
          <span aria-hidden="true" style={{ position: 'absolute', inset: '-12%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(226,58,52,.3), rgba(246,183,74,.12) 46%, transparent 70%)', filter: 'blur(34px)', pointerEvents: 'none', animation: 'glow-pulse 6s ease-in-out infinite' }} />
          <div className="story-media" style={{
            position: 'relative', height: '100%', borderRadius: '16px', overflow: 'hidden',
            border: '1px solid rgba(246,227,154,.22)', boxShadow: '0 34px 70px rgba(0,0,0,.55)',
            background: 'linear-gradient(160deg,#2a1c15,#171310)',
          }}>
            <video src="assets/video/brew.mp4" poster="assets/video/brew-poster.jpg"
              autoPlay loop muted playsInline preload="metadata" tabIndex={-1} aria-hidden="true"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            <span aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', boxShadow: 'inset 0 0 60px rgba(0,0,0,.35)', borderRadius: 'inherit' }} />
          </div>
        </div>
      </div>
    </section>
  );
}
