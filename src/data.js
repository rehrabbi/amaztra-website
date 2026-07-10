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

// Outbound links used by the final CTA.
// TODO: replace SHOP_URL with the real AMAZTRA store URL.
export const LINKS = {
  shop: 'https://example.com/shop',
};
