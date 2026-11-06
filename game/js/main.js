import { TUNING } from './config.js';
import { createGame } from './game.js';
import { createRenderer } from './renderer.js';
import { initStage } from './stage.js';

const byId = (id) => document.getElementById(id);

const stage = initStage({ root: byId('root'), stage: byId('stage') });

const renderer = await createRenderer(byId('game'));
const game = createGame();
renderer.draw(game);

// Shown only once every image is in, so nothing appears half-built.
byId('stage').classList.add('is-ready');

let lastFrameTime = 0;

const frame = (now) => {
  game.update(Math.min((now - lastFrameTime) / 1000, TUNING.maxFrameTime));
  lastFrameTime = now;
  renderer.draw(game);
  stage.setBorderSlide(game.borderSlide());
  if (game.phase === 'playing') requestAnimationFrame(frame);
};

window.addEventListener('pointerdown', (event) => {
  event.preventDefault();
  const isFirstTap = game.phase === 'start';
  game.tap();

  if (isFirstTap) {
    byId('headline').classList.add('is-hidden');
    byId('gesture').classList.add('is-hidden');
    lastFrameTime = performance.now();
    requestAnimationFrame(frame);
  }
});
