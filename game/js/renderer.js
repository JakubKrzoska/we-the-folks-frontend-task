import {
  BORDER_SRC,
  GUT,
  HEADER_BOTTOM,
  LOGO_BAR_HEIGHT,
  NAVY,
  OBSTACLES,
  PLAYER,
  STAGE,
  TEXTURE,
  WHITE,
} from './config.js';

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Could not load ${src}`));
    image.src = src;
  });

export async function createRenderer(canvas) {
  // Assets are 2x, so the backing canvas is twice the stage size.
  const pixelRatio = 2;
  canvas.width = STAGE.width * pixelRatio;
  canvas.height = STAGE.height * pixelRatio;
  const ctx = canvas.getContext('2d');
  ctx.scale(pixelRatio, pixelRatio);

  const sources = [GUT.src, PLAYER.src, TEXTURE.src, BORDER_SRC, ...OBSTACLES.map((o) => o.src)];
  const images = new Map(
    await Promise.all(sources.map(async (src) => [src, await loadImage(src)])),
  );

  const drawSprite = (sprite, x, y) => {
    ctx.save();
    ctx.translate(x, y);
    if (sprite.rotation) ctx.rotate((sprite.rotation * Math.PI) / 180);
    ctx.drawImage(
      images.get(sprite.src),
      -sprite.width / 2,
      -sprite.height / 2,
      sprite.width,
      sprite.height,
    );
    ctx.restore();
  };

  return {
    // `scroll` is how far the world has moved left, in stage px.
    draw({ scroll, playerY }) {
      ctx.fillStyle = NAVY;
      ctx.fillRect(0, 0, STAGE.width, STAGE.height);

      // White under logo.png: stops navy bleeding through its soft top and bottom rows
      // and through the stage's anti-aliased edge at fractional scales.
      ctx.fillStyle = WHITE;
      ctx.fillRect(0, 0, STAGE.width, LOGO_BAR_HEIGHT);

      ctx.save();
      ctx.beginPath();
      ctx.rect(0, HEADER_BOTTOM, STAGE.width, STAGE.height - HEADER_BOTTOM);
      ctx.clip();
      [TEXTURE.x, TEXTURE.x + TEXTURE.width].forEach((x) => {
        ctx.drawImage(images.get(TEXTURE.src), x, TEXTURE.y, TEXTURE.width, TEXTURE.height);
      });
      ctx.drawImage(images.get(GUT.src), -GUT.startOffset - scroll, 0, GUT.width, GUT.height);
      OBSTACLES.forEach((obstacle) => drawSprite(obstacle, obstacle.x - scroll, obstacle.y));
      drawSprite(PLAYER, PLAYER.x, playerY);
      ctx.restore();

      ctx.drawImage(images.get(BORDER_SRC), 0, 0, STAGE.width, STAGE.height);
    },
  };
}
