# AMAZTRA

A cinematic single-page site for AMAZTRA, an antioxidant coffee blend. Built with
**Vite + React 18**.

## Highlights

- Cinematic intro loader with a 00 to 100 counter and a scroll-to-enter gesture
- Hero masthead with scroll-linked per-word motion and a floating product pouch
- Interactive ingredients orbit: rotating rings, an auto-cycling active ingredient,
  and molecule popouts on hover, focus or click

## Stack

- Vite 5 (dev server + build)
- React 18 (`createRoot`)
- No CSS framework: global resets and keyframes live in `src/index.css`, the rest
  is scoped inline styles

## Structure

```
.
  index.html              # fonts + root mount
  src/
    main.jsx              # React entry
    App.jsx               # intro gate + page composition
    data.js               # ingredient data, angles, molecule + pouch paths
    index.css             # resets, keyframes, shared helpers
    components/
      Intro.jsx           # loader: 00->100 counter, scroll-to-enter, slide-off
      Hero.jsx            # masthead with scroll-linked per-word motion
      Ingredients.jsx     # rotating orbit, auto-cycling active ingredient
  public/assets/          # pouch images + molecule SVGs
```

## Run

```bash
npm install
npm run dev      # http://localhost:5502
```

Build for production:

```bash
npm run build
npm run preview
```

Note: fonts (Anton, Archivo, Cinzel, Space Mono) load from Google Fonts, so the
first paint needs a network connection.
