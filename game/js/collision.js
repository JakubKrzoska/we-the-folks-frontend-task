import { OBSTACLES, PLAYER } from './config.js';

// Turns a hitbox point into world coordinates, including the sprite's rotation.
const toWorld = (obstacle, x, y) => {
  const angle = ((obstacle.rotation ?? 0) * Math.PI) / 180;
  return {
    x: obstacle.x + x * Math.cos(angle) - y * Math.sin(angle),
    y: obstacle.y + x * Math.sin(angle) + y * Math.cos(angle),
  };
};

// Calculated once: the capsules never change, only the scroll does.
export const OBSTACLE_CAPSULES = OBSTACLES.map((obstacle) => ({
  obstacle,
  a: toWorld(obstacle, obstacle.hitbox.ax, obstacle.hitbox.ay),
  b: toWorld(obstacle, obstacle.hitbox.bx, obstacle.hitbox.by),
  radius: obstacle.hitbox.radius,
}));

const squaredDistanceToSegment = (point, a, b) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSquared = dx * dx + dy * dy;
  // Where along the line the nearest point is: 0 is a, 1 is b.
  const t = lengthSquared
    ? Math.min(Math.max(((point.x - a.x) * dx + (point.y - a.y) * dy) / lengthSquared, 0), 1)
    : 0;
  return (point.x - a.x - t * dx) ** 2 + (point.y - a.y - t * dy) ** 2;
};

// The player's collision circle, in world coordinates.
export const playerCircle = (scroll, playerY) => ({
  x: PLAYER.x + scroll,
  y: playerY + PLAYER.hitbox.offsetY,
  radius: PLAYER.hitbox.radius,
});

// A circle touches a capsule when it is closer to the line than their two radii.
export const findHit = (circle) =>
  OBSTACLE_CAPSULES.find(({ a, b, radius }) => {
    const reach = circle.radius + radius;
    return squaredDistanceToSegment(circle, a, b) < reach * reach;
  })?.obstacle ?? null;
