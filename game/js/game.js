import { findHit, playerCircle } from './collision.js';
import { BORDER_SLIDE, PLAYER, PLAYFIELD, SCROLL_END, TUNING } from './config.js';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const easeOutQuad = (progress) => 1 - (1 - progress) ** 2;
const easeInOutQuad = (progress) =>
  progress < 0.5 ? 2 * progress ** 2 : 1 - (2 - 2 * progress) ** 2 / 2;

// The rules of the game, with no drawing or browser code, so they can be tested alone.
export function createGame() {
  const initialState = () => ({
    phase: 'start', // start -> playing -> won or failed
    scroll: 0,
    playerY: PLAYER.y,
    velocity: 0,
    elapsed: 0,
    hitObstacle: null,
  });

  const game = initialState();

  // Every value that changes during a run lives in initialState, so this leaves nothing behind.
  game.reset = () => Object.assign(game, initialState());

  // 0 to 1 over the opening moment of the run.
  const rampUp = () => easeOutQuad(Math.min(game.elapsed / TUNING.rampUpTime, 1));

  const gravity = () =>
    TUNING.gravity * (TUNING.startGravity + (1 - TUNING.startGravity) * rampUp());

  const scrollSpeed = () => {
    const brake = clamp(
      (SCROLL_END - game.scroll) / TUNING.brakeDistance,
      TUNING.minBrakeSpeed,
      1,
    );
    return TUNING.scrollSpeed * rampUp() * brake;
  };

  game.tap = () => {
    if (game.phase !== 'start' && game.phase !== 'playing') return;
    game.phase = 'playing';
    game.velocity = TUNING.jumpVelocity;
  };

  game.update = (deltaTime) => {
    if (game.phase !== 'playing') return;
    game.elapsed += deltaTime;

    // Includes the acceleration term, so the arc is the same at any frame rate.
    const acceleration = gravity();
    game.playerY += game.velocity * deltaTime + 0.5 * acceleration * deltaTime ** 2;
    game.velocity = Math.min(game.velocity + acceleration * deltaTime, TUNING.maxFallSpeed);

    game.scroll = Math.min(game.scroll + scrollSpeed() * deltaTime, SCROLL_END);

    game.hitObstacle = findHit(playerCircle(game.scroll, game.playerY));
    const leftPlayfield = game.playerY < PLAYFIELD.top || game.playerY > PLAYFIELD.bottom;

    if (game.hitObstacle || leftPlayfield) game.phase = 'failed';
    else if (game.scroll === SCROLL_END) game.phase = 'won';
  };

  game.tilt = () => clamp(game.velocity / TUNING.maxFallSpeed, -1, 1) * TUNING.maxTilt;

  // How far the top border has moved up, in stage px.
  game.borderSlide = () =>
    BORDER_SLIDE * easeInOutQuad(Math.min(game.elapsed / TUNING.borderSlideTime, 1));

  return game;
}
