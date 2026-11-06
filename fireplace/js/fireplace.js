const ad = document.getElementById('ad');
const part = ad.dataset.part;

// Where each part's top-left corner sits in layout.png, and that file's scale.
// Measured by matching the supplied layers against it.
const LAYOUT_SCALE = 0.975;
const LAYOUT_SIZE = { width: 1684, height: 1018 };
const LAYOUT_ORIGIN = {
  left: { x: 28, y: 50 },
  top: { x: 343, y: 50 },
  right: { x: 1351, y: 50 },
};

function showDebugLayout() {
  const origin = LAYOUT_ORIGIN[part];
  const overlay = document.createElement('div');
  overlay.className = 'debug-layout';
  overlay.style.backgroundSize = `${LAYOUT_SIZE.width / LAYOUT_SCALE}px ${LAYOUT_SIZE.height / LAYOUT_SCALE}px`;
  overlay.style.backgroundPosition = `${-origin.x / LAYOUT_SCALE}px ${-origin.y / LAYOUT_SCALE}px`;
  ad.append(overlay);
}

// Start time of each step, in seconds. All parts share these, which is what coordinates them.
const INTRO = {
  background: 0,
  logo: 0.5,
  product: 1,
  panel: 2.2,
  copy: 2.6,
  headline: 2.6,
  cta: 3.9,
};
const PRODUCT_SLIDE = { left: -340, right: 340 };
const PRODUCT_TILT = { left: -8, right: 8 };

// gsap.from() plays from these values to whatever the CSS says, so the intro always lands on
// the measured layout. Parts only animate what they contain.
function buildIntro() {
  const intro = gsap.timeline({ paused: true });

  intro
    .from('.bg', { scale: 1.08, duration: 4.5, ease: 'power2.out' }, INTRO.background)
    .from('.bg', { opacity: 0, duration: 0.8, ease: 'none' }, INTRO.background);

  if (part === 'top') {
    intro.from('.headline', {
      y: 24, autoAlpha: 0, duration: 0.6, stagger: 0.35, ease: 'power3.out',
    }, INTRO.headline);
    return intro;
  }

  intro
    .from('.logo', { scale: 0.8, autoAlpha: 0, duration: 0.8, ease: 'back.out(1.6)' }, INTRO.logo)
    .from('.product', {
      x: PRODUCT_SLIDE[part], rotation: PRODUCT_TILT[part], duration: 1.3, ease: 'power3.out',
    }, INTRO.product)
    .from('.panel', { y: 50, autoAlpha: 0, duration: 0.7, ease: 'power2.out' }, INTRO.panel)
    .from('.copy', { y: 16, autoAlpha: 0, duration: 0.6, ease: 'power2.out' }, INTRO.copy)
    .from('.cta', { scale: 0.7, autoAlpha: 0, duration: 0.6, ease: 'back.out(2)' }, INTRO.cta);

  return intro;
}

async function start() {
  const images = [...ad.querySelectorAll('img')];
  await Promise.all(images.map((image) => image.decode().catch(() => {})));

  const intro = buildIntro();
  ad.classList.add('is-ready');
  intro.play();
}

if (new URLSearchParams(location.search).has('debug')) showDebugLayout();
start();
