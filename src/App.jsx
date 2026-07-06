import { useState } from 'react';
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

  return (
    <div style={{ background: '#141210' }}>
      {!introDone && <Intro onExit={() => setIntroDone(true)} />}
      <Hero />
      <Ingredients />
      <Story />
      <Ritual />
      <WhatsInside />
      <Benefits />
      <Faq />
      <FinalCta />
    </div>
  );
}
