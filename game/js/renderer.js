import {
  BORDER_SLIDE,
  BORDER_SPLIT,
  BORDER_SRC,
  GUT,
  HEADER_BOTTOM,
  LOGO_BAR_HEIGHT,
  NAVY,
  OBSTACLES,
  PLAYER,
  STAGE,
  TEXTURE,
  TUNING,
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
    // `game.scroll` is how far the world has moved left, in stage px.
    draw(game) {
      ctx.fillStyle = NAVY;
      ctx.fillRect(0, 0, STAGE.width, STAGE.height);

      // White under logo.png: stops navy bleeding through its soft top and bottom rows
      // and through the stage's anti-aliased edge at fractional scales.
      ctx.fillStyle = WHITE;
      ctx.fillRect(0, 0, STAGE.width, LOGO_BAR_HEIGHT);

      const slide = game.borderSlide();
      const playfieldTop = HEADER_BOTTOM - slide;

      ctx.save();
      ctx.beginPath();
      ctx.rect(0, playfieldTop, STAGE.width, STAGE.height - playfieldTop);
      ctx.clip();
      // Two tiles cover the screen; the right one starts wherever the left one ends.
      const textureX = TEXTURE.x - game.scroll * TUNING.textureParallax;
      // The texture's offset only suits the start screen; it rises with the border.
      const textureY = TEXTURE.y * (1 - slide / BORDER_SLIDE);
      const wrappedX = ((textureX % TEXTURE.width) + TEXTURE.width) % TEXTURE.width;
      [wrappedX - TEXTURE.width, wrappedX].forEach((x) => {
        ctx.drawImage(images.get(TEXTURE.src), x, textureY, TEXTURE.width, TEXTURE.height);
      });
      ctx.drawImage(images.get(GUT.src), -GUT.startOffset - game.scroll, 0, GUT.width, GUT.height);
      OBSTACLES.forEach((obstacle) => drawSprite(obstacle, obstacle.x - game.scroll, obstacle.y));
      drawSprite({ ...PLAYER, rotation: game.tilt() }, PLAYER.x, game.playerY);
      ctx.restore();

      // Top and bottom bands are drawn separately because only the top one moves.
      const border = images.get(BORDER_SRC);
      const split = BORDER_SPLIT * (border.height / STAGE.height);
      ctx.drawImage(border, 0, 0, border.width, split, 0, -slide, STAGE.width, BORDER_SPLIT);
      ctx.drawImage(
        border,
        0,
        split,
        border.width,
        border.height - split,
        0,
        BORDER_SPLIT,
        STAGE.width,
        STAGE.height - BORDER_SPLIT,
      );
    },
  };
}
