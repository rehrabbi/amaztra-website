import { useEffect, useState } from 'react';
import { initNavigator } from './nav.js';
import Intro from './components/Intro.jsx';
import Hero from './components/Hero.jsx';
import Ingredients from './components/Ingredients.jsx';
import Story from './components/Story.jsx';
import Ritual from './components/Ritual.jsx';
import WhatsInside from './components/WhatsInside.jsx';
import Benefits from './components/Benefits.jsx';
import Faq from './components/Faq.jsx';
import FinalCta from './components/FinalCta.jsx';

// Preview helper: a sticky "Replay" button pinned to each section. Clicking bumps a
// key so the section remounts, which re-fires its scroll-entrance without a reload.
function Section({ children }) {
  const [k, setK] = useState(0);
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'sticky', top: '14px', height: 0, zIndex: 40, textAlign: 'right', pointerEvents: 'none' }}>
        <button type="button" onClick={() => setK((v) => v + 1)} aria-label="Replay this section's animation"
          style={{ pointerEvents: 'auto', margin: '0 16px', display: 'inline-flex', alignItems: 'center', gap: '7px',
            padding: '8px 14px', borderRadius: '999px', border: '1px solid rgba(198,162,76,.5)',
            background: 'rgba(20,18,16,.72)', WebkitBackdropFilter: 'blur(6px)', backdropFilter: 'blur(6px)',
            color: '#F6E39A', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: '12px',
            letterSpacing: '.08em', textTransform: 'uppercase', cursor: 'pointer' }}>
          <span style={{ fontSize: '14px', lineHeight: 1 }}>&#8635;</span> Replay
        </button>
      </div>
      <div key={k}>{children}</div>
    </div>
  );
}

export default function App() {
  const [introDone, setIntroDone] = useState(false);

  // the hero owns its own scroll-lock; the rest of the site scrolls natively
  useEffect(() => initNavigator(), []);

  return (
    <div style={{ background: '#141210' }}>
      {!introDone && <Intro onExit={() => setIntroDone(true)} />}
      <Hero introDone={introDone} />
      <Section><Story /></Section>
      <Section><Ritual /></Section>
      <Section><Ingredients /></Section>
      <Section><WhatsInside /></Section>
      <Section><Benefits /></Section>
      <Section><Faq /></Section>
      <Section><FinalCta /></Section>
    </div>
  );
}
