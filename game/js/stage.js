import { BACKDROP, STAGE } from './config.js';

// One half of the backdrop: hard colour bands, positioned to line up with the scaled stage.
const bandGradient = (bands, top, scale) => {
  let start = '0px';
  const stops = bands.map(([color, endY], index) => {
    const isLast = index === bands.length - 1;
    const end = isLast ? '100%' : `${top + endY * scale}px`;
    const stop = `${color} ${start} ${end}`;
    start = end;
    return stop;
  });
  return `linear-gradient(${stops.join(', ')})`;
};

// Scales the fixed 360x640 stage to fit the visible viewport without distortion.
// Spare space around it is filled by the backdrop, so the ad always looks full screen.
export function initStage({ root, stage }) {
  const fit = () => {
    // visualViewport follows mobile toolbars; innerHeight can include hidden areas.
    const viewportWidth = window.visualViewport?.width ?? window.innerWidth;
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
    const scale = Math.min(viewportWidth / STAGE.width, viewportHeight / STAGE.height);

    const left = (viewportWidth - STAGE.width * scale) / 2;
    const top = (viewportHeight - STAGE.height * scale) / 2;

    root.style.height = `${viewportHeight}px`;
    root.style.background = [
      `${bandGradient(BACKDROP.left, top, scale)} left / 50% 100% no-repeat`,
      `${bandGradient(BACKDROP.right, top, scale)} right / 50% 100% no-repeat`,
    ].join(', ');
    stage.style.transform = `translate(${left}px, ${top}px) scale(${scale})`;
  };

  window.addEventListener('resize', fit);
  window.addEventListener('orientationchange', fit);
  window.visualViewport?.addEventListener('resize', fit);
  fit();
}
