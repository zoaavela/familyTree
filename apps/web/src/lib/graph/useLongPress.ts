import { useRef } from 'react';

const DELAY = 480;
const MOVE_TOLERANCE = 10;

export function useLongPress(onLongPress: (x: number, y: number) => void) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const start = useRef({ x: 0, y: 0 });
  const fired = useRef(false);

  function onTouchStart(e: React.TouchEvent) {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    start.current = { x: t.clientX, y: t.clientY };
    fired.current = false;
    timer.current = setTimeout(() => {
      fired.current = true;
      onLongPress(t.clientX, t.clientY);
    }, DELAY);
  }

  function onTouchMove(e: React.TouchEvent) {
    const t = e.touches[0];
    if (!t) return;
    const dx = Math.abs(t.clientX - start.current.x);
    const dy = Math.abs(t.clientY - start.current.y);
    if (dx > MOVE_TOLERANCE || dy > MOVE_TOLERANCE) {
      if (timer.current) clearTimeout(timer.current);
    }
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (timer.current) clearTimeout(timer.current);
    if (fired.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  return { onTouchStart, onTouchMove, onTouchEnd };
}
