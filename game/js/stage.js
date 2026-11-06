import { BACKDROP, BACKDROP_ENDCARD, STAGE } from './config.js';

// One half of the backdrop: hard colour bands, positioned to line up with the scaled stage.
const bandGradient = (bands, top, scale, borderSlide) => {
  let start = '0px';
  const stops = bands.map(([color, endY, movesWithBorder], index) => {
    const isLast = index === bands.length - 1;
    const y = movesWithBorder ? endY - borderSlide : endY;
    const end = isLast ? '100%' : `${top + y * scale}px`;
    const stop = `${color} ${start} ${end}`;
    start = end;
    return stop;
  });
  return `linear-gradient(${stops.join(', ')})`;
};

// Scales the fixed 360x640 stage to fit the visible viewport without distortion.
// Spare space around it is filled by the backdrop, so the ad always looks full screen.
export function initStage({ root, stage }) {
  let top = 0;
  let scale = 1;
  let borderSlide = 0;
  let backdrop = BACKDROP;

  const paintBackdrop = () => {
    root.style.background = [
      `${bandGradient(backdrop.left, top, scale, borderSlide)} left / 50% 100% no-repeat`,
      `${bandGradient(backdrop.right, top, scale, borderSlide)} right / 50% 100% no-repeat`,
    ].join(', ');
  };

  const fit = () => {
    // visualViewport follows mobile toolbars; innerHeight can include hidden areas.
    const viewportWidth = window.visualViewport?.width ?? window.innerWidth;
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
    scale = Math.min(viewportWidth / STAGE.width, viewportHeight / STAGE.height);

    const left = (viewportWidth - STAGE.width * scale) / 2;
    top = (viewportHeight - STAGE.height * scale) / 2;

    root.style.height = `${viewportHeight}px`;
    stage.style.transform = `translate(${left}px, ${top}px) scale(${scale})`;
    paintBackdrop();
  };

  window.addEventListener('resize', fit);
  window.addEventListener('orientationchange', fit);
  window.visualViewport?.addEventListener('resize', fit);
  fit();

  return {
    setBorderSlide(slide) {
      if (slide === borderSlide) return;
      borderSlide = slide;
      paintBackdrop();
    },
    setEndcardBackdrop(isEndcard) {
      backdrop = isEndcard ? BACKDROP_ENDCARD : BACKDROP;
      paintBackdrop();
    },
  };
}
