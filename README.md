# AMAZTRA

A cinematic single-page site for AMAZTRA, an antioxidant coffee blend (glutathione,
collagen and astaxanthin folded into the coffee you already drink). Built with
**Vite + React 18**, scoped inline styles, and a shared set of keyframes in
`src/index.css`. Every section has one signature motion and a full
`prefers-reduced-motion` fallback.

## The page

The site reads top to bottom as one continuous story:

1. **Intro** loader: gold wordmark, a 00 to 100 counter, and a scroll-to-enter gesture that slides the panel away.
2. **Hero**: "Beauty you can brew" masthead with scroll-linked per-word motion and a product pouch that flies into the ingredients orbit.
3. **Ingredients** orbit: rotating rings and an auto-cycling active ingredient with benefit popouts on hover, focus or click.
4. **Origin** (`Story`): kinetic "Beauty shouldn't feel like work, it should brew." The lines rise in, then a red strike wipes across "work".
5. **Ritual**: the morning reframed as an order card, whose Brew and Sip checkboxes pop-fill in sequence while Glow keeps loading.
6. **What's inside** (`WhatsInside`): a kraft "Supplement Facts" card beside a pure-CSS espresso machine that pours coffee into a glass cup on view.
7. **Payoff** (`Benefits`): a red "GLOW." poster with drifting beans and steam, over a results timeline (Week 1 / 4 / 12) whose curve draws in on scroll.
8. **Good to know** (`Faq`): a phone that plays a self-running SMS conversation with typing dots, a gold scrollbar, and a replay button.
9. **Final CTA**: one closing scene with a day/night toggle. Day is a warm dawn (sun, clouds); night is deep indigo (moon, stars). The copy and mood swap with the toggle, with one soft call to action out to the shop.

## Motion

- Reveal-on-scroll uses `IntersectionObserver` + the Web Animations API (`el.animate`), with `cubic-bezier(.23,1,.32,1)` easing and staggered delays.
- The hero word-scatter and the payoff timeline are scroll-linked (rAF-throttled scroll handlers).
- The espresso cup pours once on view; the phone chat plays once on view and can be replayed.
- All ambient loops and reveals are disabled or shown at rest under `prefers-reduced-motion`.

## Stack

- Vite 5 (dev server + build)
- React 18 (`createRoot`)
- No CSS framework: global resets and keyframes live in `src/index.css`, the rest is scoped inline styles.
- Fonts (Anton, Bricolage Grotesque, Cinzel, Marcellus, Space Grotesk, Space Mono) load from Google Fonts, so the first paint needs a network connection.

## Structure

```
.
  index.html                # fonts + root mount
  src/
    main.jsx                # React entry
    App.jsx                 # intro gate + page composition
    data.js                 # ingredient data, angles, pouch path, outbound links
    index.css               # resets, keyframes, shared helpers, responsive rules
    components/
      Intro.jsx             # loader: 00->100 counter, scroll-to-enter, slide-off
      Hero.jsx              # masthead with scroll-linked per-word motion
      Ingredients.jsx       # rotating orbit, auto-cycling active ingredient
      Story.jsx             # Origin: kinetic headline + red strike
      Ritual.jsx            # order card with sequential checkbox pop-fill
      WhatsInside.jsx       # supplement facts + CSS espresso machine pour
      Benefits.jsx          # Payoff: GLOW poster + scroll-drawn timeline
      Faq.jsx               # Good to know: self-playing phone chat
      FinalCta.jsx          # day/night toggle closing scene
  public/assets/            # pouch images
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

## Notes

- The shop link is a placeholder. Set the real store URL in `src/data.js` (`LINKS.shop`).
- The Supplement Facts figures in `WhatsInside.jsx` are sample values. Replace them with the verified label before publishing.
