// All positions are CSS px on the 360x640 design stage, measured from the design
// PNGs (design px / 2). Sprites are stored by their centre so scaling and rotation
// don't move them.

export const STAGE = { width: 360, height: 640 };

export const NAVY = '#0b1e49';
export const WHITE = '#ffffff';
const BORDER_DARK = '#d89c95';
const BORDER_LIGHT = '#ffd9d3';

export const LOGO_BAR_HEIGHT = 58;

// The gut, texture and obstacles are hidden above this line (the navy header).
export const HEADER_BOTTOM = 168.5;

export const GUT = {
  src: 'assets/01_game/gameplay.png',
  width: 2528,
  height: 640,
  startOffset: 2, // the start design shows the gut scrolled by 2px
};

export const PLAYER = {
  src: 'assets/01_game/player.png',
  x: 76.5,
  y: 279,
  width: 42,
  height: 41,
};

// The start screen shows the first four obstacles, so `x` is a position in the
// world and they scroll away like any other obstacle once the run begins.
export const OBSTACLES = [
  { id: 'bac6', src: 'assets/01_game/bac6.png', x: 110.75, y: 346.75, width: 34, height: 32.3 },
  { id: 'txt1', src: 'assets/01_game/txt1.png', x: 110.75, y: 417.25, width: 21.8, height: 89.1 },
  { id: 'bac2', src: 'assets/01_game/bac2.png', x: 285.25, y: 366.25, width: 19.45, height: 69.7, rotation: 7.25 },
  { id: 'txt2', src: 'assets/01_game/txt2.png', x: 318.5, y: 445, width: 32.5, height: 107.9, rotation: 0.5 },
];

// The texture is 720px wide at 2x and wraps horizontally.
export const TEXTURE = { src: 'assets/01_game/bg_texture.png', x: -84.5, y: 78.5, width: 360, height: 640 };
export const BORDER_SRC = 'assets/border.png';

// Colour bands at the left and right stage edges, as [colour, end y]. They continue
// the border sideways on short viewports, and above and below it on tall ones.
export const BACKDROP = {
  left: [[WHITE, 58], [NAVY, 168.5], [BORDER_DARK, 181], [BORDER_LIGHT, 223], [NAVY, 574], [BORDER_LIGHT, 615], [BORDER_DARK, 640]],
  right: [[WHITE, 58], [NAVY, 168.5], [BORDER_DARK, 190.5], [BORDER_LIGHT, 226], [NAVY, 572], [BORDER_LIGHT, 616.5], [BORDER_DARK, 640]],
};
