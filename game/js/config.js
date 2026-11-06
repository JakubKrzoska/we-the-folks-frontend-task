// All positions are CSS px on the 360x640 design stage, measured from the design
// PNGs (design px / 2). Sprites are stored by their centre so scaling and rotation
// don't move them.

export const STAGE = { width: 360, height: 640 };

export const AUDIO = {
  files: {
    music: 'assets/audio/music.mp3',
    crash: 'assets/audio/crash.mp3',
    fail: 'assets/audio/fail.mp3',
    applause: 'assets/audio/applause.mp3',
    cheer: 'assets/audio/cheer.mp3',
  },
  musicVolume: 0.30,
  effectsVolume: 0.30,
  musicFadeTime: 0.25,
};

export const NAVY = '#0b1e49';
export const WHITE = '#ffffff';
const BORDER_DARK = '#d89c95';
const BORDER_LIGHT = '#ffd9d3';

export const LOGO_BAR_HEIGHT = 58;

// On the start screen the gut, texture and obstacles are hidden above this line.
export const HEADER_BOTTOM = 168.5;

// When the run starts the top border slides up under the logo bar, which gives the
// freed header space to the game.
export const BORDER_SLIDE = HEADER_BOTTOM - LOGO_BAR_HEIGHT;

// border.png holds both bands; everything above this y is the top band.
export const BORDER_SPLIT = 320;

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
  // The body is wide and low; the narrow tip at the top doesn't count.
  hitbox: { offsetY: 5, radius: 15 },
};

// Leaving these lines ends the run. They are for the player's centre, at the point
// where the border visibly starts to cover it.
export const PLAYFIELD = { top: 100, bottom: 582 };

// A hitbox is a capsule: a line from a to b with a radius, in px from the sprite's
// centre before rotation. The values are fitted to each sprite's visible pixels and
// sit slightly inside them, so a hit always looks like a hit.
//
// The first four are on the start screen, at the design's positions and sizes. `x` is
// a position in the world, so they scroll away like the rest. Spacing tightens gently
// towards the end, which is the difficulty ramp.
export const OBSTACLES = [
  { id: 'bac6', x: 110.75, y: 346.75, width: 34.0, height: 32.3, hitbox: { ax: 7.7, ay: -4.2, bx: -6.3, by: 5.4, radius: 7.5 } }, // blue bacterium
  { id: 'txt1', x: 110.75, y: 417.25, width: 21.8, height: 89.1, hitbox: { ax: 1.8, ay: -34.2, bx: 0.3, by: 34.2, radius: 7.7 } }, // Stress
  { id: 'bac2', x: 285.25, y: 366.25, width: 19.45, height: 69.7, rotation: 7.25, hitbox: { ax: -0.7, ay: -26.5, bx: 0.1, by: 25.2, radius: 6.7 } }, // yellow worm
  { id: 'txt2', x: 318.5, y: 445, width: 32.5, height: 107.9, rotation: 0.5, hitbox: { ax: 4.6, ay: -39.9, bx: -1.4, by: 37.2, radius: 12.1 } }, // Tabu
  { id: 'txt3', x: 510, y: 210, width: 23.5, height: 60.5, hitbox: { ax: 1.4, ay: -18.0, bx: 0.5, by: 19.8, radius: 9.2 } }, // Blut
  { id: 'bac1', x: 690, y: 420, width: 62.5, height: 59.5, hitbox: { ax: 4.0, ay: -1.1, bx: -4.1, by: 0.8, radius: 22.5 } }, // virus
  { id: 'txt7', x: 865, y: 200, width: 29.5, height: 81.5, hitbox: { ax: 0.8, ay: -25.4, bx: -1.0, by: 27.4, radius: 11.9 } }, // Fett
  { id: 'bac3', x: 1030, y: 470, width: 79.0, height: 28.0, hitbox: { ax: -27.5, ay: -0.6, bx: 27.2, by: 3.3, radius: 9.3 } }, // pink worm
  { id: 'txt4', x: 1195, y: 260, width: 29.0, height: 84.5, hitbox: { ax: 1.2, ay: -30.5, bx: -1.2, by: 31.1, radius: 9.1 } }, // Chips
  { id: 'txt6', x: 1355, y: 440, width: 20.5, height: 144.5, hitbox: { ax: -0.9, ay: -63.1, bx: 0.9, by: 64.5, radius: 5.9 } }, // Fertiggerichte
  { id: 'bac4', x: 1505, y: 180, width: 69.0, height: 34.0, hitbox: { ax: -25.3, ay: -7.8, bx: 23.7, by: 10.5, radius: 7.1 } }, // yellow worm
  { id: 'txt8', x: 1655, y: 235, width: 18.5, height: 153.0, hitbox: { ax: -0.5, ay: -67.6, bx: 1.7, by: 67.5, radius: 6.2 } }, // Couch-Potato
  { id: 'bac5', x: 1800, y: 470, width: 53.5, height: 43.5, hitbox: { ax: -12.3, ay: -5.1, bx: 8.6, by: 8.6, radius: 10.8 } }, // bean
  { id: 'txt9', x: 1945, y: 430, width: 25.5, height: 156.5, hitbox: { ax: 0.5, ay: -67.7, bx: 2.9, by: 67.9, radius: 8.2 } }, // Bauchweh
  { id: 'txt5', x: 2090, y: 230, width: 30.0, height: 181.0, hitbox: { ax: -0.8, ay: -78.3, bx: 0.6, by: 76.9, radius: 9.4 } }, // Süßigkeiten
].map((obstacle) => ({ ...obstacle, src: `assets/01_game/${obstacle.id}.png` }));

// The texture is 720px wide at 2x and wraps horizontally.
export const TEXTURE = { src: 'assets/01_game/bg_texture.png', x: -84.5, y: 78.5, width: 360, height: 640 };
export const BORDER_SRC = 'assets/border.png';

// Colour bands at the left and right stage edges, as [colour, end y, moves with the
// top border]. They continue the border sideways on short viewports, and above and
// below it on tall ones.
export const BACKDROP = {
  left: [[WHITE, 58], [NAVY, 168.5, true], [BORDER_DARK, 181, true], [BORDER_LIGHT, 223, true], [NAVY, 574], [BORDER_LIGHT, 615], [BORDER_DARK, 640]],
  right: [[WHITE, 58], [NAVY, 168.5, true], [BORDER_DARK, 190.5, true], [BORDER_LIGHT, 226, true], [NAVY, 572], [BORDER_LIGHT, 616.5], [BORDER_DARK, 640]],
};

// Feel of the game. Speeds are in stage px per second.
export const TUNING = {
  gravity: 1200,
  startGravity: 0.5, // share of gravity right after the first tap, the "get ready" moment
  jumpVelocity: -340,
  maxFallSpeed: 560,
  scrollSpeed: 150,
  rampUpTime: 1, // seconds to reach full scroll speed after the first tap
  borderSlideTime: 0.5, // seconds for the top border to slide up
  brakeDistance: 80, // px before the end of the gut where scrolling slows down
  minBrakeSpeed: 0.1, // share of full speed kept while braking, so it still arrives
  textureParallax: 0.6, // the texture moves slower than the gut to add depth
  maxTilt: 22, // degrees
  maxFrameTime: 1 / 20, // a slow frame or tab switch never skips further than this
  endcardDelay: 0.6, // seconds to take in the crash or the finish before the endcard
};

// How far the world scrolls before the right end of the gut reaches the screen edge.
export const SCROLL_END = GUT.width - STAGE.width - GUT.startOffset;

// Behind the endcards the header colours continue and everything else is navy.
const ENDCARD_BANDS = [[WHITE, LOGO_BAR_HEIGHT], [NAVY, STAGE.height]];
export const BACKDROP_ENDCARD = { left: ENDCARD_BANDS, right: ENDCARD_BANDS };
