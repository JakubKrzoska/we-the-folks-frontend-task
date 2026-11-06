import { TUNING } from './config.js';
import { createGame } from './game.js';
import { createRenderer } from './renderer.js';
import { initStage } from './stage.js';

const byId = (id) => document.getElementById(id);

const stage = initStage({ root: byId('root'), stage: byId('stage') });

const debug = new URLSearchParams(window.location.search).get('debug') === '1';
const renderer = await createRenderer(byId('game'), { debug });
const game = createGame();
renderer.draw(game);

// Shown only once every image is in, so nothing appears half-built.
byId('stage').classList.add('is-ready');

const startScreenItems = [byId('headline'), byId('gesture')];
const endcards = [byId('fail-card'), byId('win-card')];

let lastFrameTime = 0;
let endcardTimer = null;

const showEndcard = () => {
  byId(game.phase === 'won' ? 'win-card' : 'fail-card').classList.add('is-visible');
  stage.setEndcardBackdrop(true);
  byId('stage').classList.add('has-endcard');
};

const frame = (now) => {
  game.update(Math.min((now - lastFrameTime) / 1000, TUNING.maxFrameTime));
  lastFrameTime = now;
  renderer.draw(game);
  stage.setBorderSlide(game.borderSlide());

  if (game.phase === 'playing') requestAnimationFrame(frame);
  else endcardTimer = setTimeout(showEndcard, TUNING.endcardDelay * 1000);
};

const restart = () => {
  clearTimeout(endcardTimer);
  game.reset();
  endcards.forEach((card) => card.classList.remove('is-visible'));
  startScreenItems.forEach((item) => item.classList.remove('is-hidden'));
  stage.setEndcardBackdrop(false);
  byId('stage').classList.remove('has-endcard');
  stage.setBorderSlide(game.borderSlide());
  renderer.draw(game);
};

const openLanding = () => {
  const clickTag = window.clickTag || 'https://example.com/landing';
  window.open(clickTag, '_blank', 'noopener');
};

window.addEventListener('pointerdown', (event) => {
  if (game.phase !== 'start' && game.phase !== 'playing') return;
  event.preventDefault();

  const isFirstTap = game.phase === 'start';
  game.tap();

  if (isFirstTap) {
    startScreenItems.forEach((item) => item.classList.add('is-hidden'));
    lastFrameTime = performance.now();
    requestAnimationFrame(frame);
  }
});

byId('replay').addEventListener('click', restart);
document.querySelectorAll('.js-clickout').forEach((button) => {
  button.addEventListener('click', openLanding);
});
