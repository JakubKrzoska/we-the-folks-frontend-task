import { BORDER_SLIDE, PLAYER, SCROLL_END, TUNING } from './config.js';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const easeOutQuad = (progress) => 1 - (1 - progress) ** 2;
const easeInOutQuad = (progress) =>
  progress < 0.5 ? 2 * progress ** 2 : 1 - (2 - 2 * progress) ** 2 / 2;

// The rules of the game, with no drawing or browser code, so they can be tested alone.
export function createGame() {
  const game = {
    phase: 'start', // start -> playing -> finished
    scroll: 0,
    playerY: PLAYER.y,
    velocity: 0,
    elapsed: 0,
  };

  const scrollSpeed = () => {
    const rampUp = easeOutQuad(Math.min(game.elapsed / TUNING.rampUpTime, 1));
    const brake = clamp(
      (SCROLL_END - game.scroll) / TUNING.brakeDistance,
      TUNING.minBrakeSpeed,
      1,
    );
    return TUNING.scrollSpeed * rampUp * brake;
  };

  game.tap = () => {
    if (game.phase === 'finished') return;
    game.phase = 'playing';
    game.velocity = TUNING.jumpVelocity;
  };

  game.update = (deltaTime) => {
    if (game.phase !== 'playing') return;
    game.elapsed += deltaTime;

    // Includes the acceleration term, so the arc is the same at any frame rate.
    game.playerY += game.velocity * deltaTime + 0.5 * TUNING.gravity * deltaTime ** 2;
    game.velocity = Math.min(game.velocity + TUNING.gravity * deltaTime, TUNING.maxFallSpeed);

    game.scroll = Math.min(game.scroll + scrollSpeed() * deltaTime, SCROLL_END);
    if (game.scroll === SCROLL_END) game.phase = 'finished';
  };

  game.tilt = () => clamp(game.velocity / TUNING.maxFallSpeed, -1, 1) * TUNING.maxTilt;

  // How far the top border has moved up, in stage px.
  game.borderSlide = () =>
    BORDER_SLIDE * easeInOutQuad(Math.min(game.elapsed / TUNING.borderSlideTime, 1));

  return game;
}
