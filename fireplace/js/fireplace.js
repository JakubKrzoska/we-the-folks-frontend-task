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

if (new URLSearchParams(location.search).has('debug')) showDebugLayout();
