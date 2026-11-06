import { createAnimations } from './animations.js';
import { createAudio } from './audio.js';
import { TUNING } from './config.js';
import { createGame } from './game.js';
import { createRenderer } from './renderer.js';
import { initStage } from './stage.js';

const byId = (id) => document.getElementById(id);

const stage = initStage({ root: byId('root'), stage: byId('stage') });

const debug = new URLSearchParams(window.location.search).get('debug') === '1';
const renderer = await createRenderer(byId('game'), { debug });
const game = createGame();
const audio = createAudio();
const animations = createAnimations({
  gesture: byId('gesture'),
  headline: byId('headline'),
  canvas: byId('game'),
  game,
  redraw: () => renderer.draw(game),
});
renderer.draw(game);

// Shown only once every image is in, so nothing appears half-built.
byId('stage').classList.add('is-ready');
animations.playIntro();

const startScreenItems = [byId('headline'), byId('gesture')];
const endcards = [byId('fail-card'), byId('win-card')];

let lastFrameTime = 0;
let frameRequest = null;
let endcardTimer = null;
let isEndcardPending = false;
let isWaitingToResume = false;
let isMuted = false;

const showEndcard = () => {
  isEndcardPending = false;
  const hasWon = game.phase === 'won';
  const card = byId(hasWon ? 'win-card' : 'fail-card');
  card.classList.add('is-visible');
  animations.playEndcard(card, hasWon);
  stage.setEndcardBackdrop(true);
  byId('stage').classList.add('has-endcard');

  if (hasWon) {
    audio.play('applause');
    audio.play('cheer');
  } else {
    audio.play('fail');
  }
};

const endRun = () => {
  audio.stopMusic();
  if (game.phase === 'failed') audio.play('crash');
  isEndcardPending = true;
  const delay = game.phase === 'won' ? TUNING.winCardDelay : TUNING.failCardDelay;
  endcardTimer = setTimeout(showEndcard, delay * 1000);
};

const frame = (now) => {
  game.update(Math.min((now - lastFrameTime) / 1000, TUNING.maxFrameTime));
  lastFrameTime = now;
  renderer.draw(game);
  stage.setBorderSlide(game.borderSlide());

  if (game.phase === 'playing') frameRequest = requestAnimationFrame(frame);
  else endRun();
};

const runLoop = () => {
  lastFrameTime = performance.now();
  frameRequest = requestAnimationFrame(frame);
};

const restart = () => {
  clearTimeout(endcardTimer);
  isEndcardPending = false;
  audio.stopAll();
  animations.clearEndcard();
  game.reset();
  endcards.forEach((card) => card.classList.remove('is-visible'));
  startScreenItems.forEach((item) => item.classList.remove('is-hidden'));
  stage.setEndcardBackdrop(false);
  byId('stage').classList.remove('has-endcard');
  stage.setBorderSlide(game.borderSlide());
  renderer.draw(game);
  animations.playIntro();
};

const openLanding = () => {
  const clickTag = window.clickTag || 'https://example.com/landing';
  window.open(clickTag, '_blank', 'noopener');
};

// Hidden tab: everything stops where it is.
const pause = () => {
  cancelAnimationFrame(frameRequest);
  clearTimeout(endcardTimer);
  audio.hold();
  animations.pause();
};

// Back again. A run waits for a tap instead of dropping the player straight away.
const resume = () => {
  animations.resume();
  if (game.phase === 'playing') {
    isWaitingToResume = true;
    byId('gesture').classList.remove('is-hidden');
    return;
  }
  audio.release();
  if (isEndcardPending) showEndcard();
};

const resumeRun = () => {
  isWaitingToResume = false;
  byId('gesture').classList.add('is-hidden');
  audio.release();
  runLoop();
};

window.addEventListener('pointerdown', (event) => {
  audio.unlock();
  if (event.target.closest('button')) return;
  if (game.phase !== 'start' && game.phase !== 'playing') return;
  event.preventDefault();

  const isFirstTap = game.phase === 'start';
  if (isFirstTap) animations.stopIntro();
  game.tap();

  if (isFirstTap) {
    startScreenItems.forEach((item) => item.classList.add('is-hidden'));
    audio.startMusic();
    runLoop();
  } else if (isWaitingToResume) {
    resumeRun();
  }
});

// On touch screens Safari only unlocks audio when the finger lifts.
['pointerup', 'touchend'].forEach((type) => window.addEventListener(type, audio.unlock));

document.addEventListener('visibilitychange', () => {
  if (document.hidden) pause();
  else resume();
});

byId('replay').addEventListener('click', restart);
document.querySelectorAll('.js-clickout').forEach((button) => {
  button.addEventListener('click', openLanding);
});

byId('mute').addEventListener('click', (event) => {
  isMuted = !isMuted;
  audio.setMuted(isMuted);
  event.currentTarget.setAttribute('aria-pressed', String(isMuted));
});
