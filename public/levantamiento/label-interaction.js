// Screen-space label selection and tap tracking. Coordinates use CSS pixels.
export function labelAtPoint(labels, x, y) {
  for (let i = labels.length - 1; i >= 0; i--) {
    const label = labels[i];
    if (Math.hypot(x - label.x, y - label.y) <= label.radius) return label.value;
  }
  return null;
}

export function createLabelTap(maxMove = 7) {
  const active = new Set();
  let candidate = null;
  let multiTouch = false;
  return {
    down(id, x, y) {
      active.add(id);
      if (active.size === 1 && !multiTouch) candidate = {id, x, y};
      else { candidate = null; multiTouch = true; }
    },
    move(id, x, y) {
      if (candidate?.id === id && Math.hypot(x - candidate.x, y - candidate.y) > maxMove) candidate = null;
    },
    up(id, x, y) {
      const tap = !multiTouch && candidate?.id === id && Math.hypot(x - candidate.x, y - candidate.y) <= maxMove;
      active.delete(id);
      candidate = null;
      if (!active.size) multiTouch = false;
      return Boolean(tap);
    },
    cancel(id) {
      active.delete(id);
      candidate = null;
      if (!active.size) multiTouch = false;
    }
  };
}
