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

export default function App() {
  const [introDone, setIntroDone] = useState(false);

  // one scroll = one section, with the covered handoffs between the special boundaries
  useEffect(() => initNavigator(), []);

  return (
    <div style={{ background: '#141210' }}>
      {!introDone && <Intro onExit={() => setIntroDone(true)} />}
      <Hero introDone={introDone} />
      <Story />
      <Ritual />
      <Ingredients />
      <WhatsInside />
      <Benefits />
      <Faq />
      <FinalCta />
    </div>
  );
}
