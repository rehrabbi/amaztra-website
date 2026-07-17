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
  const embersRef = useRef(null);
  const sectionRef = useRef(null);
  const typeRef = useRef(null);
  const dotRefs = [useRef(null), useRef(null), useRef(null)];
  const videoRef = useRef(null);
  const panelRef = useRef(null);
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

    // ember trail — 22 motes placed along the curve, warming red -> gold toward WK12
    const embers = embersRef.current;
    if (embers && !embers.childElementCount) {
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

    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);

  // "...and it compounds." springs up, glows red, then the subtext types itself out
  useEffect(() => {
    if (reduce) return;
    const section = sectionRef.current;
    if (!section) return;
    const words = [...section.querySelectorAll('.cmp-w')];
    const type = typeRef.current;
    const red = words[1];
    if (!words.length) return;
    const full = type ? type.textContent : '';
    if (type) { type.style.width = '0'; type.style.borderRight = '2px solid #C6A24C'; }
    let raf = 0, timer = 0;
    const run = () => {
      words.forEach((w, i) => w.animate(
        [{ opacity: 0, transform: 'translateY(80%)' }, { opacity: 1, transform: 'translateY(-8%)', offset: 0.72 }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: 1050, delay: 120 + i * 160, easing: 'cubic-bezier(.2,1.1,.3,1)', fill: 'both' }));
      if (red) red.style.animation = 'cmp-glow 3s ease-in-out 1.4s infinite';
      if (type) {
        timer = setTimeout(() => {
          type.style.width = 'auto';
          const total = full.length, dur = 1900, t0 = performance.now();
          const stepFn = (now) => {
            const p = Math.min(1, (now - t0) / dur);
            type.textContent = full.slice(0, Math.round(p * total));
            if (p < 1) raf = requestAnimationFrame(stepFn);
            else type.style.animation = 'cmp-caret .8s step-end infinite';
          };
          type.textContent = '';
          type.style.borderRight = '2px solid #C6A24C';
          type.style.paddingRight = '2px';
          raf = requestAnimationFrame(stepFn);
        }, 700);
      }
    };
    const io = new IntersectionObserver((ents) => ents.forEach((e) => { if (e.isIntersecting) { run(); io.disconnect(); } }), { threshold: 0.4 });
    io.observe(words[0]);
    return () => { io.disconnect(); cancelAnimationFrame(raf); clearTimeout(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);

  // scroll-scrub the reveal panel, smoothed: scroll sets a target time and the frame eases
  // toward it each rAF, so the pan glides as the page moves rather than snapping frame to
  // frame. Forward into centre, frozen on the last frame past centre, reversed on scroll up.
  useEffect(() => {
    const v = videoRef.current, panel = panelRef.current;
    if (!v || !panel) return;
    const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);

    if (reduce) { // reduced motion: hold the final glowing frame, no scrubbing
      const hold = () => { try { v.currentTime = Math.max(0, (v.duration || 0) - 0.05); } catch { /* ignore */ } };
      if (v.readyState >= 1) hold(); else v.addEventListener('loadedmetadata', hold, { once: true });
      return;
    }

    // prime the decoder (esp. iOS) so currentTime seeks actually render, then keep it paused
    v.muted = true;
    const prime = () => { const p = v.play(); if (p && p.then) p.then(() => v.pause()).catch(() => {}); else { try { v.pause(); } catch { /* ignore */ } } };
    if (v.readyState >= 2) prime(); else v.addEventListener('canplay', prime, { once: true });

    const SMOOTH = 0.05;            // lower = smoother/looser, higher = snappier
    let shown = 0, target = 0, raf = 0, running = false;

    const measure = () => {
      const dur = v.duration || 0;
      if (!dur) return;
      const vh = window.innerHeight || 1;
      const r = panel.getBoundingClientRect();
      const centerY = r.top + r.height / 2;
      const progress = clamp01((vh - centerY) / (vh / 2)); // 0 entering -> 1 at centre, then frozen
      target = progress * (dur - 0.03);
    };
    const tick = () => {
      shown += (target - shown) * SMOOTH;
      if (Math.abs(target - shown) < 0.004) { shown = target; running = false; }
      try { v.currentTime = shown; } catch { /* ignore */ }
      if (running) raf = requestAnimationFrame(tick);
    };
    const ensure = () => { if (!running) { running = true; raf = requestAnimationFrame(tick); } };
    const onScroll = () => { measure(); ensure(); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    const init = () => { measure(); shown = target; try { v.currentTime = shown; } catch { /* ignore */ } };
    if (v.readyState >= 1) init(); else v.addEventListener('loadedmetadata', init, { once: true });

    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, [reduce]);

  return (
    <section id="benefits" ref={sectionRef} className="fullpage" style={{
      position: 'relative', background: 'radial-gradient(120% 100% at 82% 12%,#1c1512,#141210 60%)',
      padding: 'clamp(48px,7vh,80px) clamp(24px,6vw,80px)', overflow: 'hidden',
    }}>
      <div className="bx-row" style={{ maxWidth: '1180px', margin: '0 auto', display: 'flex', alignItems: 'center' }}>
        {/* the payoff card — sits over the timeline card, carrying the scrubbed reveal */}
        <div className="bx-red" style={{
          position: 'relative', zIndex: 2, width: '42%', background: '#E23A34', borderRadius: '16px',
          padding: 'clamp(28px,3vw,40px)',
          boxShadow: '0 30px 70px rgba(226,58,52,.28), 0 0 0 1px rgba(246,227,154,.35)',
        }}>
          <p style={{
            margin: 0, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: '13px',
            letterSpacing: '.1em', textTransform: 'uppercase', color: '#141210',
          }}>The payoff</p>
          <h2 className="fp-head" style={{
            margin: 'clamp(14px,2vh,22px) 0 clamp(10px,1.4vh,16px)', fontFamily: "'Anton',sans-serif",
            textTransform: 'uppercase', fontSize: 'clamp(64px,9vw,120px)', lineHeight: 0.74,
            letterSpacing: '-.03em', color: '#141210',
            animation: reduce ? 'none' : 'glow-neon 6s ease-in-out infinite',
          }}>{POSTER_WORD.split('').map((ch, i) => (
            <span key={i} className="glow-ltr" style={{ display: 'inline-block', animation: reduce ? 'none' : `glow-wave 3.2s ease-in-out ${(i * 0.12).toFixed(2)}s infinite` }}>{ch}</span>
          ))}</h2>
          <p style={{
            margin: 0, fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 800,
            fontSize: 'clamp(16px,1.9vw,20px)', lineHeight: 1.2, color: '#141210',
          }}>A small daily habit whose effects add up, the way good ones do.</p>

          {/* scroll-scrubbed reveal — the pan-up tracks scroll; no frame, the edges feather
              into the red card so it blends in rather than sitting in a box */}
          <div ref={panelRef} style={{ position: 'relative', width: '100%', margin: 'clamp(18px,2.4vh,26px) 0 0', aspectRatio: '3 / 2' }}>
            <video ref={videoRef} src="assets/video/glow.mp4" poster="assets/video/glow-poster.jpg"
              muted playsInline preload="auto" tabIndex={-1} aria-hidden="true"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
                WebkitMaskImage: 'radial-gradient(ellipse 82% 86% at 50% 44%, #000 46%, transparent 90%)',
                maskImage: 'radial-gradient(ellipse 82% 86% at 50% 44%, #000 46%, transparent 90%)' }} />
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
