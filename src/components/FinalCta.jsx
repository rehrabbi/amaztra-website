import { useEffect, useRef, useState } from 'react';
import { POUCH, LINKS } from '../data.js';

const EASE = 'cubic-bezier(.23,1,.32,1)';
const prefersReduce = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const STARS = [
  { l: '12%', t: '20%', s: 3, d: '3s', delay: '0s' },
  { l: '30%', t: '12%', s: 2, d: '2.5s', delay: '.7s' },
  { l: '46%', t: '22%', s: 2, d: '2.9s', delay: '1.1s' },
  { l: '20%', t: '38%', s: 2, d: '3.3s', delay: '.3s' },
  { l: '62%', t: '16%', s: 3, d: '2.7s', delay: '.9s' },
  { l: '72%', t: '40%', s: 2, d: '3.1s', delay: '1.4s' },
  { l: '84%', t: '24%', s: 2, d: '2.6s', delay: '.5s' },
  { l: '38%', t: '52%', s: 2, d: '3.4s', delay: '.2s' },
];
const CLOUDS = [
  { l: '8%', t: '22%', w: 80, h: 22, o: 0.55, sh: '22px -8px 0 -4px rgba(255,248,235,.55), -18px 2px 0 -6px rgba(255,248,235,.5)', d: '7s', delay: '0s' },
  { l: '60%', t: '14%', w: 60, h: 16, o: 0.45, sh: '16px -6px 0 -3px rgba(255,248,235,.45)', d: '9s', delay: '1.2s' },
  { l: '30%', t: '58%', w: 70, h: 18, o: 0.3, sh: '20px -6px 0 -4px rgba(255,248,235,.3)', d: '8s', delay: '.6s' },
];

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#F6E39A" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" fill="#F6E39A" />
      <path d="M12 3v1.6M12 19.4V21M4.5 4.5l1.1 1.1M18.4 18.4l1.1 1.1M3 12h1.6M19.4 12H21M4.5 19.5l1.1-1.1M18.4 5.6l1.1-1.1" />
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true">
      <path d="M17 13.6A6 6 0 1 1 10.4 7 4.7 4.7 0 0 0 17 13.6Z" fill="#cfc4b2" />
    </svg>
  );
}

const COPY = {
  day: {
    eyebrow: 'WAKE TO',
    head: (<>A softer,<br />brighter <span style={{ color: '#FFF6E6' }}>you.</span></>),
    body: 'No rush, no pressure. Just the cup you already love.',
  },
  night: {
    eyebrow: 'AS THE DAY WINDS DOWN',
    head: (<>Leave a little<br />glow for <span style={{ color: '#F6E39A' }}>tomorrow.</span></>),
    body: 'The softest ritual you can set for yourself.',
  },
};

/**
 * Final CTA: one closing scene with a day/night toggle. Day: sun, clouds, warm
 * dawn. Night: moon, stars, deep indigo. The product, copy and one soft CTA carry
 * through both moods. Reveal-on-scroll; ambient motion off under reduced-motion.
 * Closes the page; there is no footer beneath it.
 */
export default function FinalCta() {
  const rootRef = useRef(null);
  const reduce = prefersReduce();
  const [night, setNight] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const els = root.querySelectorAll('[data-reveal]');
    if (reduce) { els.forEach((el) => { el.style.opacity = '1'; el.style.transform = 'none'; }); return; }
    const io = new IntersectionObserver((ents) => {
      ents.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const delay = parseFloat(el.getAttribute('data-reveal-delay') || '0') * 1000;
        el.animate(
          [{ opacity: 0, transform: 'translateY(30px)' }, { opacity: 1, transform: 'translateY(0)' }],
          { duration: 900, delay, easing: EASE, fill: 'both' });
        io.unobserve(el);
      });
    }, { threshold: 0.2 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [reduce]);

  const steamBar = (left, h, delay) => ({
    position: 'absolute', left, bottom: 0, width: '4px', height: h, borderRadius: '3px',
    background: 'linear-gradient(180deg,rgba(255,255,255,.75),transparent)', transformOrigin: 'bottom',
    animation: reduce ? 'none' : `nm-steam 2.8s ease-out ${delay} infinite`,
  });

  const c = night ? COPY.night : COPY.day;
  const bg = night
    ? 'linear-gradient(180deg,#0b0a12 0%,#15111c 55%,#2a1620 100%)'
    : 'linear-gradient(180deg,#f4b45a 0%,#e88a3f 40%,#3a1d16 100%)';

  return (
    <section id="brew" ref={rootRef} style={{ overflow: 'hidden', fontFamily: "'Space Grotesk',system-ui,sans-serif" }}>
      <div
        className="cta-morning"
        style={{ position: 'relative', background: bg, transition: 'background .9s ease', padding: 'clamp(64px,9vh,96px) clamp(28px,6vw,80px)', minHeight: '460px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'clamp(32px,6vw,72px)', overflow: 'hidden' }}
      >
        {/* day / night toggle (visual pill 74x34 inside a 44px-tall hit area) */}
        <button
          type="button"
          onClick={() => setNight((v) => !v)}
          aria-label={night ? 'Switch to day' : 'Switch to night'}
          aria-pressed={night}
          style={{ position: 'absolute', top: 'clamp(14px,3vw,22px)', left: '50%', transform: 'translateX(-50%)', zIndex: 5, width: '74px', height: '44px', padding: 0, border: 0, background: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <span aria-hidden="true" style={{ position: 'relative', display: 'block', width: '74px', height: '34px', borderRadius: '999px', border: '1px solid rgba(255,255,255,.35)', background: night ? 'rgba(20,18,30,.6)' : 'rgba(58,29,22,.28)', transition: 'background .9s ease', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}>
            <span style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', display: 'inline-flex', opacity: night ? 0.4 : 1, transition: 'opacity .4s ease' }}><SunIcon /></span>
            <span style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', display: 'inline-flex', opacity: night ? 1 : 0.4, transition: 'opacity .4s ease' }}><MoonIcon /></span>
            <span style={{ position: 'absolute', top: '3px', left: night ? '43px' : '3px', width: '26px', height: '26px', borderRadius: '50%', background: night ? 'radial-gradient(circle at 62% 38%,#f3ecd6,#cfc4b2)' : 'radial-gradient(circle at 45% 40%,#FFF3C4,#F6E39A)', boxShadow: night ? '0 0 12px rgba(207,196,178,.5)' : '0 0 12px rgba(246,227,154,.8)', transition: 'left .4s cubic-bezier(.5,1.6,.4,1), background .6s ease' }} />
          </span>
        </button>

        {/* SKY: night = moon + stars, day = sun + clouds */}
        {night ? (
          <>
            <span aria-hidden="true" style={{ position: 'absolute', right: 'clamp(28px,5vw,56px)', top: '52px', width: '58px', height: '58px', borderRadius: '50%', background: 'radial-gradient(circle at 62% 38%,#f3ecd6,#cfc4b2)', boxShadow: 'inset -12px 6px 0 0 rgba(11,10,18,.55), 0 0 26px rgba(207,196,178,.45)', zIndex: 1 }} />
            {STARS.map((s, i) => (
              <span key={i} aria-hidden="true" style={{ position: 'absolute', left: s.l, top: s.t, width: `${s.s}px`, height: `${s.s}px`, borderRadius: '50%', background: '#EDE4D3', zIndex: 1, animation: reduce ? 'none' : `nm-twinkle ${s.d} ease-in-out ${s.delay} infinite` }} />
            ))}
          </>
        ) : (
          <>
            <span aria-hidden="true" style={{ position: 'absolute', right: 'clamp(28px,5vw,56px)', top: '44px', width: '66px', height: '66px', zIndex: 1 }}>
              <span style={{ position: 'absolute', inset: '14px', borderRadius: '50%', background: 'radial-gradient(circle at 45% 40%,#FFF3C4,#F6E39A)', boxShadow: '0 0 30px rgba(246,227,154,.85)' }} />
              <span style={{ position: 'absolute', inset: 0, animation: reduce ? 'none' : 'nm-rays 18s linear infinite' }}>
                {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                  <span key={deg} style={{ position: 'absolute', left: '50%', top: '50%', width: '3px', height: '13px', borderRadius: '2px', background: '#F6E39A', transform: `translate(-50%,-50%) rotate(${deg}deg) translateY(-38px)` }} />
                ))}
              </span>
            </span>
            {CLOUDS.map((cl, i) => (
              <span key={i} aria-hidden="true" style={{ position: 'absolute', left: cl.l, top: cl.t, width: `${cl.w}px`, height: `${cl.h}px`, borderRadius: '999px', background: `rgba(255,248,235,${cl.o})`, boxShadow: cl.sh, zIndex: 1, animation: reduce ? 'none' : `nm-drift ${cl.d} ease-in-out ${cl.delay} infinite` }} />
            ))}
          </>
        )}

        {/* product */}
        <div data-reveal style={{ opacity: reduce ? 1 : 0, position: 'relative', zIndex: 2, flexShrink: 0, width: 'clamp(140px,22vw,170px)', filter: 'drop-shadow(0 22px 30px rgba(0,0,0,.45))' }}>
          <span aria-hidden="true" style={{ position: 'absolute', left: '50%', top: '50%', width: '220px', height: '220px', transform: 'translate(-50%,-50%)', borderRadius: '50%', background: 'radial-gradient(circle at 50% 46%,rgba(193,26,34,.42),transparent 64%)', filter: 'blur(16px)' }} />
          <span aria-hidden="true" style={{ position: 'absolute', left: '18%', right: '30%', top: '-16px', height: '34px', zIndex: 3 }}>
            <span style={steamBar('38%', '28px', '0s')} />
            <span style={steamBar('58%', '34px', '.9s')} />
          </span>
          <img src={POUCH} alt="AMAZTRA pouch" style={{ position: 'relative', display: 'block', width: '100%', animation: reduce ? 'none' : 'cta-float 9s ease-in-out infinite' }} />
        </div>

        {/* copy + CTA */}
        <div data-reveal data-reveal-delay=".1" style={{ opacity: reduce ? 1 : 0, position: 'relative', zIndex: 2 }}>
          <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '11px', letterSpacing: '.3em', color: night ? '#b9a6c9' : '#3a1d0a', transition: 'color .9s ease' }}>{c.eyebrow}</span>
          <h2 className="fp-head" style={{ margin: '18px 0 0', fontFamily: "'Anton',sans-serif", textTransform: 'uppercase', fontSize: 'clamp(40px,5vw,52px)', lineHeight: 0.92, letterSpacing: '-.01em', color: night ? 'rgba(237,228,211,.95)' : '#2b1a10', transition: 'color .9s ease' }}>{c.head}</h2>
          <p style={{ margin: '22px 0 0', maxWidth: '30ch', fontSize: 'clamp(15px,1.6vw,16px)', lineHeight: 1.7, color: night ? '#a99fb5' : '#241309', transition: 'color .9s ease' }}>{c.body}</p>
          <a href={LINKS.shop} target="_blank" rel="noopener noreferrer" className="cta-btn" style={{ marginTop: '30px', display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '17px 32px', minHeight: '44px', borderRadius: '3px', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 'clamp(15px,1.6vw,17px)', color: '#17110e', background: 'linear-gradient(180deg,#F6E39A 0%,#E1BC5C 44%,#C99A34 70%,#A9761B 100%)', boxShadow: '0 14px 34px rgba(226,58,52,.28), 0 0 0 1px rgba(246,227,154,.3)', whiteSpace: 'nowrap' }}>
            Come brew with us
            <span aria-hidden="true" className="cta-arrow" style={{ fontSize: '1.1em', lineHeight: 1 }}>&rarr;</span>
          </a>
        </div>
      </div>
    </section>
  );
}
