// Active ingredients shown in the orbit.
// k = name, s = subtitle, b = benefit chip, d = description.
export const ING = [
  { k: 'Glutathione',       s: 'Supports healthy-looking radiance', b: 'Brightens & evens tone', d: 'Brightens and evens skin tone from within, and defends cells against everyday oxidative stress.' },
  { k: 'Collagen',          s: 'Supports skin elasticity',          b: 'Firms & plumps skin',   d: 'Supports skin structure, elasticity and that fresh, bouncy feel over time.' },
  { k: 'Astaxanthin',       s: 'Antioxidant support',               b: 'Shields from stress',   d: 'A remarkably potent antioxidant that helps protect skin from oxidative damage.' },
  { k: 'Vitamin C',         s: 'Supports collagen formation',       b: 'Boosts collagen',       d: "Powers your body's natural collagen formation and adds antioxidant support." },
  { k: 'N-Acetyl Cysteine', s: 'Supports glutathione production',   b: 'Fuels antioxidants',    d: 'Feeds your natural antioxidant system, helping glutathione do its work.' },
  { k: 'Polypodium',        s: 'Plant-based skin support',          b: 'Botanical defense',     d: 'A plant-based extract traditionally used to help support and protect skin.' },
];

export const ANGLES = [-90, -30, 30, 90, 150, 210];

export const POUCH = 'assets/img/pouch/1-front-cut.png';

// Draggable front-to-sides spin sequence (built from the two studio clips:
// left side -> front -> right side). front is the resting front frame.
export const SPIN = {
  dir: 'assets/spin/',
  base: 'f',
  ext: 'webp',
  pad: 3,
  count: 93,
  front: 41,
  w: 657,
  h: 843,
};

export const spinFrame = (i) =>
  `${SPIN.dir}${SPIN.base}${String(i).padStart(SPIN.pad, '0')}.${SPIN.ext}`;

// Drag-to-spin capsule box. Cut from the studio turntable clip (background keyed,
// turntable disc removed, lateral drift stabilised). The take covers ~336deg — a
// small unfilmed wedge sits at the front, between the last frame and the first.
// So the sequence is a bounded range (never wrapping across that gap) that rests
// on a three-quarter view (front + side). From rest, dragging one way flattens
// toward the front, the other way spins the long way around. front = rest frame.
export const BOXSPIN = {
  dir: 'assets/boxspin/',
  base: 'b',
  ext: 'webp',
  pad: 3,
  count: 80,
  front: 12,
  w: 498,
  h: 655,
};

export const boxFrame = (i) =>
  `${BOXSPIN.dir}${BOXSPIN.base}${String(i).padStart(BOXSPIN.pad, '0')}.${BOXSPIN.ext}`;

// Outbound links used by the final CTA.
// TODO: replace SHOP_URL with the real AMAZTRA store URL.
export const LINKS = {
  shop: 'https://example.com/shop',
};
