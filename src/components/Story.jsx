import { useEffect, useRef } from 'react';

const EASE = 'cubic-bezier(.16,1,.3,1)';
const prefersReduce = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const ORIGIN_PUNCH = 'it should brew.';

/**
 * Origin — "Editorial Depth". Two columns: a vertical "THE ORIGIN" rail and the
 * stacked headline on the left, the looping brew clip masking in from the right.
 * On view the eyebrow fades in, the headline lines flip up out of their clips, a
 * red strike wipes across "work", the gold punch line rises and catches an ember
 * glow with sparks, and the media reveals bottom-up. Ambient embers drift up the
 * panel. Type matches the site: Anton headline/punch, Space Mono rail, Space
 * Grotesk body. The video is a marked placeholder slot — a real mp4 at
 * assets/video/brew.mp4 will play automatically. Reduced motion shows all at rest.
 */
export default function Story() {
  const rootRef = useRef(null);
  const emberRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce = prefersReduce();
    const eyebrow = root.querySelector('[data-eyebrow]');
    const cws = [...root.querySelectorAll('.story-cw')];
    const strike = root.querySelector('[data-strike]');
    const punch = root.querySelector('[data-punch]');
    const desc = root.querySelector('[data-desc]');
    const media = root.querySelector('[data-media]');
    const vid = root.querySelector('[data-media] video');
    const sparks = root.querySelector('[data-sparks]');
    const timers = [];

    if (!reduce) {
      const host = emberRef.current;
      if (host && !host.childElementCount) {
        for (let i = 0; i < 14; i++) {
          const s = document.createElement('span');
          const sz = 2 + Math.random() * 3.5, gold = Math.random() > 0.4;
          s.style.cssText = 'position:absolute;bottom:-10px;left:' + (Math.random() * 100) + '%;width:' + sz.toFixed(1) + 'px;height:' + sz.toFixed(1) + 'px;border-radius:50%;background:' + (gold ? 'radial-gradient(circle,rgba(246,183,74,.9),transparent)' : 'radial-gradient(circle,rgba(226,58,52,.85),transparent)') + ';box-shadow:0 0 7px ' + (gold ? 'rgba(246,183,74,.55)' : 'rgba(226,58,52,.5)') + ';--dx:' + (Math.random() * 80 - 40).toFixed(0) + 'px;animation:o-embed ' + (9 + Math.random() * 8).toFixed(1) + 's ease-in-out ' + (Math.random() * 9).toFixed(1) + 's infinite;';
          host.appendChild(s);
        }
      }
    }

    const spawnSparks = () => {
      if (!sparks || sparks.childElementCount) return;
      for (let i = 0; i < 12; i++) {
        const s = document.createElement('span');
        const sz = 2 + Math.random() * 2.5;
        s.style.cssText = 'position:absolute;bottom:' + (Math.random() * 30) + '%;left:' + (20 + Math.random() * 60) + '%;width:' + sz.toFixed(1) + 'px;height:' + sz.toFixed(1) + 'px;border-radius:50%;background:radial-gradient(circle,rgba(246,227,154,.95),rgba(226,58,52,.3));box-shadow:0 0 6px rgba(246,183,74,.7);--dx:' + (Math.random() * 30 - 15).toFixed(0) + 'px;animation:o-spark ' + (2 + Math.random() * 2).toFixed(1) + 's ease-out ' + (Math.random() * 2.5).toFixed(1) + 's infinite;';
        sparks.appendChild(s);
      }
    };

    const showAll = () => {
      if (eyebrow) eyebrow.style.opacity = '1';
      cws.forEach((el) => { el.style.transform = 'none'; el.style.opacity = '1'; });
      if (strike) strike.style.transform = 'rotate(-3deg) scaleX(1)';
      if (punch) punch.style.opacity = '1';
      if (desc) desc.style.opacity = '1';
      if (media) media.style.clipPath = 'inset(0 0 0 0)';
    };
    if (reduce) { showAll(); return; }

    const hide = () => {
      [eyebrow, punch, strike, desc, media, ...cws].forEach((el) => { if (el) el.getAnimations().forEach((a) => a.cancel()); });
      timers.forEach(clearTimeout); timers.length = 0;
      if (eyebrow) eyebrow.style.opacity = '0';
      cws.forEach((el) => { el.style.transform = 'translateY(110%)'; el.style.opacity = '0'; });
      if (strike) strike.style.transform = 'rotate(-3deg) scaleX(0)';
      if (punch) { punch.style.opacity = '0'; punch.style.animation = 'none'; }
      if (desc) desc.style.opacity = '0';
      if (media) media.style.clipPath = 'inset(0 0 100% 0)';
      if (vid) { vid.getAnimations().forEach((a) => a.cancel()); vid.style.transform = 'scale(1.14)'; }
    };

    const play = () => {
      hide();
      if (eyebrow) eyebrow.animate([{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'none' }], { duration: 1400, delay: 300, easing: EASE, fill: 'both' });
      if (media) media.animate([{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 2000, delay: 300, easing: EASE, fill: 'both' });
      if (vid) vid.animate([{ transform: 'scale(1.14)' }, { transform: 'scale(1)' }], { duration: 3200, delay: 300, easing: EASE, fill: 'both' });
      cws.forEach((el, i) => el.animate([
        { opacity: 0, transform: 'translateY(110%)' },
        { opacity: 1, transform: 'translateY(0)' },
      ], { duration: 1400, delay: 700 + i * 260, easing: 'cubic-bezier(.2,1,.3,1)', fill: 'both' }));
      if (strike) timers.push(setTimeout(() => strike.animate([{ transform: 'rotate(-3deg) scaleX(0)' }, { transform: 'rotate(-3deg) scaleX(1)' }], { duration: 820, easing: EASE, fill: 'both' }), 2100));
      if (punch) {
        punch.animate([{ opacity: 0, transform: 'translateY(28px) scale(.955)' }, { opacity: 1, transform: 'none' }], { duration: 1500, delay: 2300, easing: 'cubic-bezier(.2,1.1,.3,1)', fill: 'both' });
        timers.push(setTimeout(() => { punch.style.animation = 'ember 3.4s ease-in-out infinite'; spawnSparks(); }, 3700));
      }
      if (desc) desc.animate([{ opacity: 0, transform: 'translateY(22px)' }, { opacity: 1, transform: 'none' }], { duration: 1400, delay: 2800, easing: EASE, fill: 'both' });
    };

    hide();
    const io = new IntersectionObserver((ents) => ents.forEach((e) => {
      if (e.isIntersecting && e.intersectionRatio >= 0.4) { play(); io.disconnect(); }
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
        minHeight: '100svh',
        background: 'transparent',
        padding: 'clamp(64px,9vh,120px) clamp(24px,6vw,80px)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        textAlign: 'left', fontFamily: "'Space Grotesk',system-ui,sans-serif", overflow: 'hidden',
      }}
    >
      {/* warm spotlight carried up from Ritual so the two beats share one light */}
      <span aria-hidden="true" style={{ position: 'absolute', left: '-20%', top: '-32%', width: '110%', height: '140%', borderRadius: '50%', background: 'radial-gradient(closest-side,rgba(246,183,74,.15),rgba(246,183,74,.05) 44%,transparent 72%)', filter: 'blur(20px)', pointerEvents: 'none', zIndex: 0, animation: 'rt-spot 13s ease-in-out infinite' }} />
      {/* ambient ember field + top seam fade */}
      <div ref={emberRef} aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }} />
      <span aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '46vh', background: 'linear-gradient(180deg,#141210 0%,#141210 20%,rgba(20,18,16,.55) 55%,transparent 100%)', pointerEvents: 'none', zIndex: 0 }} />

      <div className="story-grid" style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr .82fr', alignItems: 'center', gap: 0 }}>
        {/* left: rail + stacked headline + punch + desc */}
        <div style={{ position: 'relative', zIndex: 2, minWidth: 0, display: 'flex', gap: 'clamp(18px,2vw,26px)' }}>
          <span data-eyebrow className="story-rail" style={{ opacity: 0, writingMode: 'vertical-rl', transform: 'rotate(180deg)', alignSelf: 'flex-start', paddingTop: '4px', fontFamily: "'Space Mono',monospace", fontSize: '12px', letterSpacing: '.24em', textTransform: 'uppercase', color: '#C6A24C', whiteSpace: 'nowrap' }}>The origin</span>

          <div style={{ minWidth: 0 }}>
            <h2 style={{ margin: 0, fontFamily: "'Anton',sans-serif", textTransform: 'uppercase', fontSize: 'clamp(40px,5.4vw,66px)', lineHeight: 1.16, letterSpacing: '-.02em', color: '#EDE4D3' }}>
              <span style={{ display: 'block', overflow: 'hidden' }}><span className="story-cw" style={{ display: 'inline-block', opacity: 0, transform: 'translateY(110%)' }}>Beauty</span></span>
              <span style={{ display: 'block', overflow: 'hidden' }}><span className="story-cw" style={{ display: 'inline-block', opacity: 0, transform: 'translateY(110%)' }}>shouldn&rsquo;t</span></span>
              <span style={{ display: 'block', overflow: 'hidden' }}>
                <span className="story-cw" style={{ display: 'inline-block', opacity: 0, transform: 'translateY(110%)' }}>
                  feel like{' '}
                  <span style={{ position: 'relative', color: '#8f8578' }}>
                    work
                    <span data-strike aria-hidden="true" style={{ position: 'absolute', left: '-4%', right: '-4%', top: '52%', height: 'clamp(5px,.7vw,9px)', background: '#E23A34', transform: 'rotate(-3deg) scaleX(0)', transformOrigin: 'left' }} />
                  </span>
                </span>
              </span>
            </h2>

            <p id="story-punch" data-punch style={{ opacity: 0, position: 'relative', margin: 'clamp(16px,2.4vh,26px) 0 0', fontFamily: "'Anton',sans-serif", textTransform: 'uppercase', fontSize: 'clamp(48px,6.4vw,84px)', lineHeight: 0.9, letterSpacing: '-.01em', background: 'linear-gradient(180deg,#F6E39A,#A9761B)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', zIndex: 3 }}>
              {ORIGIN_PUNCH}
              <span data-sparks aria-hidden="true" style={{ position: 'absolute', inset: '-30% 0 0', pointerEvents: 'none' }} />
            </p>

            <p data-desc style={{ opacity: 0, margin: 'clamp(24px,4vh,36px) 0 0', maxWidth: '38ch', fontSize: 'clamp(15px,1.6vw,18px)', lineHeight: 1.6, color: '#cfc4b2' }}>
              Self-care quietly became a chore. But you never skipped the first warm cup, so we folded the actives right there.
            </p>
          </div>
        </div>

        {/* right: brew clip masking in, pulled left so the punch line overlaps its frame */}
        <div className="story-media-wrap" style={{ position: 'relative', zIndex: 1, minWidth: 0, height: 'clamp(380px,58vh,520px)', marginLeft: 'clamp(-96px,-6vw,-64px)' }}>
          <span aria-hidden="true" style={{ position: 'absolute', inset: '-12%', borderRadius: '50%', background: 'radial-gradient(circle,rgba(226,58,52,.3),rgba(246,183,74,.12) 46%,transparent 70%)', filter: 'blur(34px)', pointerEvents: 'none', animation: 'glow-pulse 6s ease-in-out infinite' }} />
          <div data-media className="story-media" style={{ position: 'relative', height: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(246,227,154,.22)', boxShadow: '0 34px 70px rgba(0,0,0,.55)', background: 'linear-gradient(160deg,#2a1c15,#171310)', clipPath: 'inset(0 0 100% 0)' }}>
            <video src="assets/video/brew.mp4" poster="assets/video/brew-poster.jpg" autoPlay loop muted playsInline preload="metadata" tabIndex={-1} aria-hidden="true" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            <span aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', boxShadow: 'inset 0 0 60px rgba(0,0,0,.35)', borderRadius: 'inherit' }} />          </div>
        </div>
      </div>
    </section>
  );
}
