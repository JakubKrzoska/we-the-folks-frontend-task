import { AUDIO } from './config.js';

// Silence that MP3 encoding adds at both ends would be an audible gap in the loop.
const findAudibleRange = (buffer) => {
  const threshold = 0.001;
  const channel = buffer.getChannelData(0);
  const first = channel.findIndex((sample) => Math.abs(sample) > threshold);
  if (first === -1) return { start: 0, end: buffer.duration };
  let last = channel.length - 1;
  while (last > first && Math.abs(channel[last]) <= threshold) last -= 1;
  return { start: first / buffer.sampleRate, end: last / buffer.sampleRate };
};

export function createAudio() {
  const AudioContextClass = window.AudioContext ?? window.webkitAudioContext;
  const context = new AudioContextClass();
  const master = context.createGain();
  master.connect(context.destination);

  const effects = context.createGain();
  effects.gain.value = AUDIO.effectsVolume;
  effects.connect(master);

  const buffers = new Map();
  const oneShots = new Set();
  let music = null;
  let wantsMusic = false;
  let isHeld = false; // true while paused, so a tap on mute can't bring the sound back

  const startMusic = () => {
    wantsMusic = true;
    const buffer = buffers.get('music');
    if (!buffer || music) return; // no buffer yet: loading calls this again when it arrives

    const source = context.createBufferSource();
    const gain = context.createGain();
    const { start, end } = findAudibleRange(buffer);
    source.buffer = buffer;
    source.loop = true;
    source.loopStart = start;
    source.loopEnd = end;
    gain.gain.value = AUDIO.musicVolume;
    source.connect(gain).connect(master);
    source.start(0, start);
    music = { source, gain };
  };

  const stopMusic = (fadeTime = AUDIO.musicFadeTime) => {
    wantsMusic = false;
    if (!music) return;
    const { source, gain } = music;
    const now = context.currentTime;
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(0, now + fadeTime);
    source.stop(now + fadeTime);
    music = null;
  };

  // A sound that hasn't loaded is skipped, so the ad still works without audio.
  Object.entries(AUDIO.files).forEach(async ([name, src]) => {
    try {
      const response = await fetch(src);
      const buffer = await context.decodeAudioData(await response.arrayBuffer());
      buffers.set(name, buffer);
      if (name === 'music' && wantsMusic) startMusic();
    } catch {
      buffers.delete(name);
    }
  });

  return {
    startMusic,
    stopMusic,

    play(name) {
      const buffer = buffers.get(name);
      if (!buffer) return;
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(effects);
      source.onended = () => oneShots.delete(source);
      source.start();
      oneShots.add(source);
    },

    stopAll() {
      stopMusic(0.05);
      oneShots.forEach((source) => source.stop());
      oneShots.clear();
    },

    // Called from taps. Browsers only allow audio to begin from a user gesture.
    unlock() {
      if (!isHeld && context.state !== 'running') context.resume();
    },

    setMuted(isMuted) {
      master.gain.setTargetAtTime(isMuted ? 0 : 1, context.currentTime, 0.01);
    },

    hold() {
      isHeld = true;
      context.suspend();
    },

    release() {
      isHeld = false;
      context.resume();
    },
  };
}
