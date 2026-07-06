import { useEffect, useRef } from 'react';

const prefersReduce = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// SAMPLE spec from the handoff. Replace with the verified label before publishing.
const FACTS = [
  { name: 'Collagen', value: '5 g' },
  { name: 'NAC', value: '200 mg' },
  { name: 'Glutathione', value: '250 mg' },
  { name: 'Vitamin C', value: '100% DV', dark: true },
  { name: 'Polypodium', value: '240 mg' },
  { name: 'Astaxanthin', value: '4 mg' },
];

/**
 * What's inside — ingredient transparency styled like packaging. A brand-toned
 * espresso machine dispenses coffee into a glass cup that fills once, on view.
 * Kraft Supplement Facts card on the left. Reduced motion shows the cup already
 * full at rest with no looping motion.
 */
export default function WhatsInside() {
  const rootRef = useRef(null);
  const liquidRef = useRef(null);
  const streamRef = useRef(null);
  const steamRef = useRef(null);
  const rippleRef = useRef(null);
  const timers = useRef([]);
  const reduce = prefersReduce();

  useEffect(() => {
    if (reduce) return; // rendered full at rest below
    const root = rootRef.current;
    if (!root) return;

    let done = false;
    const wait = (ms) => new Promise((r) => timers.current.push(setTimeout(r, ms)));
    const run = async () => {
      if (done) return;
      done = true;
      const liquid = liquidRef.current, stream = streamRef.current;
      const steam = steamRef.current, ripple = rippleRef.current;
      await wait(650); // let the cup sit fully visible first
      if (stream) stream.style.opacity = '1';
      if (ripple) {
        ripple.style.transition = 'bottom 2.4s cubic-bezier(.4,0,.2,1), opacity .3s ease';
        ripple.style.opacity = '0.55';
        ripple.style.bottom = '85%';
      }
      if (liquid) {
        liquid.style.transition = 'height 2.4s cubic-bezier(.4,0,.2,1)';
        liquid.style.height = '90%';
      }
      await wait(2500);
      if (stream) stream.style.opacity = '0';
      if (ripple) ripple.style.opacity = '0';
      if (steam) steam.style.opacity = '0.6';
    };

    const io = new IntersectionObserver((ents) => {
      ents.forEach((e) => { if (e.isIntersecting) { run(); io.disconnect(); } });
    }, { threshold: 0.55 });
    io.observe(root);

    const t = timers.current;
    return () => { io.disconnect(); t.forEach(clearTimeout); };
  }, [reduce]);

  const steamBar = (left, h, delay) => ({
    position: 'absolute', left, bottom: 0, width: '4px', height: h, borderRadius: '3px',
    background: 'linear-gradient(180deg,rgba(237,228,211,.6),transparent)', transformOrigin: 'bottom',
    animation: reduce ? 'none' : `fp-steam 2.8s ease-out ${delay} infinite`,
  });
  const goldDot = (left, top, faded) => ({
    position: 'absolute', left, top, width: '6px', height: '6px', borderRadius: '50%',
    background: faded ? 'rgba(198,162,76,.5)' : '#C6A24C',
  });

  return (
    <section
      id="whats-inside"
      ref={rootRef}
      style={{
        background: 'linear-gradient(180deg,#d8c8a8,#c9b791)',
        padding: 'clamp(72px,11vh,130px) clamp(24px,6vw,80px)',
        fontFamily: "'Space Grotesk',system-ui,sans-serif", overflow: 'hidden',
      }}
    >
      <div style={{
        maxWidth: '1180px', margin: '0 auto', display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
        gap: 'clamp(32px,6vw,72px)', alignItems: 'center',
      }}>
        {/* left: copy + facts card */}
        <div>
          <p style={{
            margin: 0, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: '13px',
            letterSpacing: '.1em', textTransform: 'uppercase', color: '#8a5f1c',
          }}>Read the label</p>
          <h2 style={{
            margin: '18px 0 0', fontFamily: "'Anton',sans-serif", textTransform: 'uppercase',
            fontSize: 'clamp(48px,7.4vw,86px)', lineHeight: 0.86, letterSpacing: '-.015em', color: '#221a12',
          }}>Peel it <span style={{ color: '#C11A22' }}>back.</span></h2>
          <p style={{
            margin: '22px 0 32px', maxWidth: '38ch', fontSize: 'clamp(16px,1.9vw,20px)',
            lineHeight: 1.6, color: '#4a3c28',
          }}>
            The receipt for your glow, wrapped around the cup. Six actives, printed where you can't miss them.
          </p>

          <div style={{
            background: '#efe6d4', border: '1px solid rgba(122,84,22,.35)', borderRadius: '10px',
            padding: 'clamp(20px,3vw,26px) clamp(22px,3vw,30px)', maxWidth: '620px',
            boxShadow: '0 12px 26px rgba(60,40,16,.2)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
              <span style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 'clamp(20px,2.6vw,24px)', letterSpacing: '.1em', color: '#221a12' }}>AMAZTRA</span>
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: '11px', letterSpacing: '.14em', color: '#8a5f1c' }}>SUPPLEMENT FACTS &middot; 1 SACHET</span>
            </div>
            <div style={{ height: '4px', background: '#8a5f1c', marginBottom: '8px' }} />
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 clamp(28px,4vw,48px)',
              fontFamily: "'Space Mono',monospace", fontSize: 'clamp(12px,1.5vw,14px)',
            }}>
              {FACTS.map((f, i) => (
                <div key={f.name} style={{
                  display: 'flex', justifyContent: 'space-between', padding: '8px 0',
                  borderBottom: i < 4 ? '1px dotted rgba(60,40,16,.35)' : 'none',
                }}>
                  <span style={{ color: '#221a12' }}>{f.name}</span>
                  <span style={{ color: f.dark ? '#221a12' : '#6b5a44' }}>{f.value}</span>
                </div>
              ))}
            </div>
            <p style={{ margin: '14px 0 0', fontFamily: "'Space Mono',monospace", fontSize: '10.5px', color: '#8a5f1c' }}>
              Stir into your morning coffee &middot; ~80 mg caffeine
            </p>
          </div>
        </div>

        {/* right: espresso machine that pours into the cup */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div aria-hidden="true" style={{ position: 'relative', width: '300px', height: '400px', filter: 'drop-shadow(0 22px 30px rgba(60,40,16,.4))' }}>
            {/* head unit */}
            <div style={{ position: 'absolute', left: '34px', top: '6px', width: '232px', height: '86px', borderRadius: '18px', background: 'linear-gradient(180deg,#40352d,#241a14)', border: '3px solid #14100d', boxShadow: 'inset 0 3px 0 rgba(237,228,211,.08)', zIndex: 2 }} />
            {/* display screen */}
            <div style={{ position: 'absolute', left: '98px', top: '24px', width: '150px', height: '52px', borderRadius: '10px', background: 'linear-gradient(180deg,#1a241c,#111813)', border: '2px solid rgba(198,162,76,.6)', overflow: 'hidden', zIndex: 3 }}>
              <span style={{ position: 'absolute', left: '14px', top: '16px', width: '16px', height: '15px', border: '2px solid #C6A24C', borderRadius: '2px 2px 6px 6px' }} />
              <span style={{ position: 'absolute', left: '38px', top: '14px', width: '14px', height: '18px', border: '2px solid #C6A24C', borderRadius: '3px 3px 5px 5px' }} />
              <span style={goldDot('82px', '16px')} /><span style={goldDot('94px', '16px')} /><span style={goldDot('106px', '16px')} />
              <span style={goldDot('82px', '28px', true)} /><span style={goldDot('94px', '28px', true)} /><span style={goldDot('106px', '28px', true)} />
              <span style={{ position: 'absolute', left: '60px', bottom: '5px', width: '5px', height: '5px', borderRadius: '50%', background: '#1F8A5B' }} />
              <span style={{ position: 'absolute', left: '74px', bottom: '5px', width: '5px', height: '5px', borderRadius: '50%', background: '#1F8A5B' }} />
            </div>
            {/* side buttons + indicator */}
            <span style={{ position: 'absolute', left: '52px', top: '26px', width: '11px', height: '11px', borderRadius: '50%', background: '#1a1310', boxShadow: 'inset 0 1px 2px rgba(0,0,0,.6)', zIndex: 3 }} />
            <span style={{ position: 'absolute', left: '52px', top: '44px', width: '11px', height: '11px', borderRadius: '50%', background: '#1a1310', zIndex: 3 }} />
            <span style={{ position: 'absolute', left: '52px', top: '62px', width: '11px', height: '11px', borderRadius: '50%', background: '#1a1310', zIndex: 3 }} />
            <span style={{ position: 'absolute', right: '44px', top: '40px', width: '12px', height: '12px', borderRadius: '50%', background: '#E2903A', boxShadow: '0 0 8px rgba(226,144,58,.6)', zIndex: 3 }} />
            {/* body */}
            <div style={{ position: 'absolute', left: '46px', top: '80px', width: '208px', height: '156px', borderRadius: '12px', background: 'linear-gradient(180deg,#4a3e35,#2a201a)', border: '3px solid #14100d', zIndex: 1 }} />
            {/* group head + portafilter */}
            <div style={{ position: 'absolute', left: '126px', top: '150px', width: '48px', height: '46px', borderRadius: '6px', background: '#141210', border: '2px solid #14100d', zIndex: 3 }} />
            <span style={{ position: 'absolute', left: '172px', top: '164px', width: '64px', height: '15px', borderRadius: '0 8px 8px 0', background: '#1a1310', zIndex: 3 }} />
            <span style={{ position: 'absolute', left: '224px', top: '160px', width: '14px', height: '24px', borderRadius: '4px', background: '#1a1310', zIndex: 3 }} />
            <span style={{ position: 'absolute', left: '143px', top: '192px', width: '14px', height: '16px', borderRadius: '0 0 5px 5px', background: '#0f0c0a', zIndex: 3 }} />
            {/* dispense stream */}
            <span ref={streamRef} style={{ position: 'absolute', left: '148px', top: '206px', width: '4px', height: '48px', borderRadius: '2px', background: 'repeating-linear-gradient(180deg,#6f4a22 0 7px,#4a3320 7px 14px)', backgroundSize: '100% 20px', animation: reduce ? 'none' : 'fp-flow .45s linear infinite', opacity: 0, transition: 'opacity .25s ease', zIndex: 4 }} />
            {/* base / drip tray + beans */}
            <div style={{ position: 'absolute', left: '40px', top: '330px', width: '220px', height: '30px', borderRadius: '8px', background: 'linear-gradient(180deg,#40352d,#1a1310)', border: '3px solid #14100d', zIndex: 2 }} />
            <span style={{ position: 'absolute', left: '96px', top: '322px', width: '16px', height: '11px', borderRadius: '50%', background: '#5a3a20', transform: 'rotate(-20deg)', zIndex: 3 }} />
            <span style={{ position: 'absolute', left: '108px', top: '326px', width: '16px', height: '11px', borderRadius: '50%', background: '#4a2f1a', transform: 'rotate(15deg)', zIndex: 3 }} />
            {/* glass cup */}
            <div style={{ position: 'absolute', left: '114px', top: '256px', width: '78px', height: '76px', zIndex: 3 }}>
              <span style={{ position: 'absolute', right: '-15px', top: '16px', width: '16px', height: '36px', border: '3px solid rgba(237,228,211,.55)', borderLeft: 'none', borderRadius: '0 13px 13px 0' }} />
              <div style={{ position: 'absolute', inset: 0, border: '2.5px solid rgba(237,228,211,.55)', borderRadius: '8px 8px 15px 15px', background: 'linear-gradient(100deg,rgba(237,228,211,.12),rgba(237,228,211,.04))', overflow: 'hidden' }}>
                <span ref={liquidRef} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: reduce ? '90%' : '8%', background: 'linear-gradient(180deg,#5a3a20,#2e1c10)', transition: 'height .12s linear' }} />
                <span ref={rippleRef} style={{ position: 'absolute', left: '50%', bottom: '8%', width: '52px', height: '6px', borderRadius: '50%', background: 'rgba(214,150,70,.6)', transform: 'translateX(-50%)', opacity: 0, transition: 'opacity .3s ease', animation: reduce ? 'none' : 'fp-rpulse 1.1s ease-in-out infinite' }} />
                <div style={{ position: 'absolute', left: 0, right: 0, top: '44%', textAlign: 'center', zIndex: 2 }}>
                  <span style={{ fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: '12px', letterSpacing: '.05em', background: 'linear-gradient(180deg,#F6E39A,#C99A34)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>AMAZTRA</span>
                </div>
              </div>
              <span ref={steamRef} style={{ position: 'absolute', left: 0, right: 0, top: '-18px', height: '44px', opacity: reduce ? 0.6 : 0, transition: 'opacity .6s ease' }}>
                <span style={steamBar('38%', '34px', '0s')} />
                <span style={steamBar('52%', '40px', '.9s')} />
                <span style={steamBar('64%', '34px', '.45s')} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
