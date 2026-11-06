import { PLAYER } from './config.js';
import { createRenderer } from './renderer.js';
import { initStage } from './stage.js';

const byId = (id) => document.getElementById(id);

initStage({ root: byId('root'), stage: byId('stage') });

const renderer = await createRenderer(byId('game'));
renderer.draw({ scroll: 0, playerY: PLAYER.y });

// Shown only once every image is in, so nothing appears half-built.
byId('stage').classList.add('is-ready');
