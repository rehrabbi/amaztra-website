import { useState } from 'react';
import Intro from './components/Intro.jsx';
import Hero from './components/Hero.jsx';
import Ingredients from './components/Ingredients.jsx';

export default function App() {
  const [introDone, setIntroDone] = useState(false);

  return (
    <div style={{ background: '#141210' }}>
      {!introDone && <Intro onExit={() => setIntroDone(true)} />}
      <Hero />
      <Ingredients />
    </div>
  );
}
