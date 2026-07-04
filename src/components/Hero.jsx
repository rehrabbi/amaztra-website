import { useEffect, useRef } from 'react';
import { POUCH } from '../data.js';

/**
 * Cinematic hero. As you scroll through one hero-height, each masthead word
 * lifts straight up and fades one by one, and the product pouch fades away in
 * place. The intro loader sliding up is what reveals the hero, so nothing here
 * re-animates on entry (that caused a visible opacity snap / flash).
 */
export default function Hero() {
  const heroRef = useRef(null);
  const pouchRef = useRef(null);
  const wordsRef = useRef([]);

  const setWord = (i) => (el) => { wordsRef.current[i] = el; };

  // scroll-linked scatter (always active)
  useEffect(() => {
    const onScroll = () => {
      const y = window.pageYOffset || 0;
      const h = (heroRef.current ? heroRef.current.offsetHeight : window.innerHeight) || 1;
      const p = Math.max(0, Math.min(1, y / h)); // 0 at top, 1 after one hero-height
      const words = wordsRef.current;
      const n = 4;
      words.forEach((el, i) => {
        if (!el) return;
        const start = (i / (n - 1)) * 0.5;
        const local = Math.max(0, Math.min(1, (p - start) / 0.5));
        const e = local * local * (3 - 2 * local); // smoothstep
        el.style.transform = 'translateY(' + (-e * 60).toFixed(1) + 'vh)';
        el.style.opacity = (1 - e).toFixed(3);
      });
      if (pouchRef.current) {
        const pl = Math.max(0, Math.min(1, (p - 0.35) / 0.5));
        const e = pl * pl * (3 - 2 * pl);
        pouchRef.current.style.transform = 'translate(0,calc(-50% - ' + (e * 4).toFixed(1) + 'vh))';
        pouchRef.current.style.opacity = (1 - e).toFixed(3);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section
      id="top"
      ref={heroRef}
      style={{
        position: 'relative', minHeight: '100svh', display: 'flex', flexDirection: 'column',
        justifyContent: 'flex-start', padding: 'clamp(32px,6vh,64px) clamp(20px,5vw,46px) 40px',
        overflow: 'hidden',
        background: 'radial-gradient(120% 90% at 82% 8%, #241713 0%, #171310 46%, #120f0d 100%)',
      }}
    >
      {/* floating wordmark, quiet — no nav bar */}
      <div className="am-rise" style={{
        animationDelay: '0s', textAlign: 'center', width: '100%',
        fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 'clamp(30px,4vw,54px)',
        letterSpacing: '.14em',
        background: 'linear-gradient(180deg,#F6E39A 0%,#E1BC5C 38%,#C99A34 62%,#A9761B 100%)',
        WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
      }}>AMAZTRA</div>

      <span aria-hidden="true" className="am-noise" style={{ opacity: 0.05 }} />

      {/* masthead + product */}
      <div className="hero-stage" style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center', marginTop: '12px' }}>
        <h1 className="hero-title" style={{
          margin: 0, fontFamily: "'Anton',sans-serif", fontWeight: 400, textTransform: 'uppercase',
          lineHeight: 0.82, letterSpacing: '-.015em', fontSize: 'clamp(72px,15.5vw,232px)', color: '#EDE4D3',
        }}>
          <span ref={setWord(0)} style={{ display: 'block', willChange: 'transform,opacity' }}>Beauty</span>
          <span className="hero-row" style={{ display: 'flex', gap: '.22em' }}>
            <span ref={setWord(1)} style={{ display: 'inline-block', color: '#E23A34', willChange: 'transform,opacity' }}>you</span>
            <span ref={setWord(2)} style={{ display: 'inline-block', color: '#E23A34', willChange: 'transform,opacity' }}>can</span>
          </span>
          <span ref={setWord(3)} style={{ display: 'block', willChange: 'transform,opacity' }}>brew</span>
        </h1>

        {/* product stage */}
        <div ref={pouchRef} className="hero-pouch" style={{
          position: 'absolute', right: 'clamp(-24px,1vw,40px)', top: '50%',
          transform: 'translateY(-50%)', width: 'clamp(380px,48vw,680px)', willChange: 'transform,opacity',
        }}>
          <span aria-hidden="true" style={{
            position: 'absolute', inset: '4% 6% 10%', borderRadius: '50%',
            background: 'radial-gradient(circle at 52% 44%, rgba(193,26,34,.45), transparent 64%)',
            filter: 'blur(40px)',
          }} />
          <img src={POUCH} alt="AMAZTRA coffee pouch" style={{
            position: 'relative', width: '100%',
            filter: 'drop-shadow(0 40px 54px rgba(0,0,0,.6))',
            animation: 'am-float 9s ease-in-out infinite',
          }} />
        </div>
      </div>

      {/* footer row of hero */}
      <div className="am-rise" style={{
        animationDelay: '.62s', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        gap: '28px', flexWrap: 'wrap', borderTop: '1px solid rgba(237,228,211,.14)',
        paddingTop: '24px', marginTop: '8px',
      }}>
        <p style={{
          margin: 0, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 400,
          fontSize: 'clamp(17px,1.9vw,22px)', lineHeight: 1.5, color: '#cfc4b2', maxWidth: '460px',
        }}>
          Glutathione, collagen &amp; astaxanthin: the antioxidants you'd take as capsules, folded into the coffee you already love.
        </p>
      </div>
    </section>
  );
}
