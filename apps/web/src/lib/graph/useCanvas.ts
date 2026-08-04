import { useCallback, useEffect, useRef, useState } from 'react';

export interface Viewport {
    x: number;
    y: number;
    scale: number;
}

const MIN_SCALE = 0.15;
const MAX_SCALE = 2.5;

export function useCanvas() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, scale: 1 });
    const [isPanning, setIsPanning] = useState(false);
    const panStart = useRef({ x: 0, y: 0, vx: 0, vy: 0 });
    const pinchStart = useRef<{ dist: number; scale: number } | null>(null);

    const zoomAt = useCallback((clientX: number, clientY: number, factor: number) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        const px = clientX - rect.left;
        const py = clientY - rect.top;

        setViewport((v) => {
            const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, v.scale * factor));
            const ratio = next / v.scale;
            return {
                scale: next,
                x: px - (px - v.x) * ratio,
                y: py - (py - v.y) * ratio,
            };
        });
    }, []);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        function onWheel(e: WheelEvent) {
            e.preventDefault();
            const factor = e.deltaY > 0 ? 0.92 : 1.08;
            zoomAt(e.clientX, e.clientY, factor);
        }

        el.addEventListener('wheel', onWheel, { passive: false });
        return () => el.removeEventListener('wheel', onWheel);
    }, [zoomAt]);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        function dist(t: TouchList) {
            return Math.hypot(t[1].clientX - t[0].clientX, t[1].clientY - t[0].clientY);
        }
        function mid(t: TouchList) {
            return { x: (t[0].clientX + t[1].clientX) / 2, y: (t[0].clientY + t[1].clientY) / 2 };
        }

        function onTouchStart(e: TouchEvent) {
            if (e.touches.length === 2) {
                e.preventDefault();
                setViewport((v) => {
                    pinchStart.current = { dist: dist(e.touches), scale: v.scale };
                    return v;
                });
            }
        }

        function onTouchMove(e: TouchEvent) {
            if (e.touches.length === 2 && pinchStart.current) {
                e.preventDefault();
                const factor = dist(e.touches) / pinchStart.current.dist;
                const rect = el.getBoundingClientRect();
                const m = mid(e.touches);
                const px = m.x - rect.left;
                const py = m.y - rect.top;

                setViewport((v) => {
                    const next = Math.min(2.5, Math.max(0.15, pinchStart.current!.scale * factor));
                    const ratio = next / v.scale;
                    return { scale: next, x: px - (px - v.x) * ratio, y: py - (py - v.y) * ratio };
                });
            }
        }

        function onTouchEnd(e: TouchEvent) {
            if (e.touches.length < 2) pinchStart.current = null;
        }

        el.addEventListener('touchstart', onTouchStart, { passive: false });
        el.addEventListener('touchmove', onTouchMove, { passive: false });
        el.addEventListener('touchend', onTouchEnd);
        return () => {
            el.removeEventListener('touchstart', onTouchStart);
            el.removeEventListener('touchmove', onTouchMove);
            el.removeEventListener('touchend', onTouchEnd);
        };
    }, []);

    const onPointerDown = useCallback(
        (e: React.PointerEvent) => {
            if (e.button !== 0) return;
            const target = e.target as HTMLElement;
            if (target.closest('[data-node]')) return; // pas de pan si on clique une carte
            setIsPanning(true);
            panStart.current = { x: e.clientX, y: e.clientY, vx: viewport.x, vy: viewport.y };
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        },
        [viewport.x, viewport.y],
    );

    const onPointerMove = useCallback(
        (e: React.PointerEvent) => {
            if (!isPanning) return;
            const dx = e.clientX - panStart.current.x;
            const dy = e.clientY - panStart.current.y;
            setViewport((v) => ({ ...v, x: panStart.current.vx + dx, y: panStart.current.vy + dy }));
        },
        [isPanning],
    );

    const onPointerUp = useCallback((e: React.PointerEvent) => {
        setIsPanning(false);
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    }, []);

    const fitToBounds = useCallback(
        (bounds: { minX: number; maxX: number; minY: number; maxY: number }, padding = 80) => {
            const el = containerRef.current;
            if (!el) return;
            const w = el.clientWidth;
            const h = el.clientHeight;
            const bw = bounds.maxX - bounds.minX;
            const bh = bounds.maxY - bounds.minY;
            if (bw <= 0 || bh <= 0) return;

            const scale = Math.min(
                MAX_SCALE,
                Math.max(MIN_SCALE, Math.min((w - padding * 2) / bw, (h - padding * 2) / bh)),
            );
            setViewport({
                scale,
                x: w / 2 - ((bounds.minX + bounds.maxX) / 2) * scale,
                y: h / 2 - ((bounds.minY + bounds.maxY) / 2) * scale,
            });
        },
        [],
    );

    const zoomBy = useCallback(
        (factor: number) => {
            const el = containerRef.current;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            zoomAt(rect.left + el.clientWidth / 2, rect.top + el.clientHeight / 2, factor);
        },
        [zoomAt],
    );

    const centerOn = useCallback((x: number, y: number, scale?: number) => {
        const el = containerRef.current;
        if (!el) return;
        setViewport((v) => {
            const s = scale ?? Math.max(v.scale, 0.85);
            return { scale: s, x: el.clientWidth / 2 - x * s, y: el.clientHeight / 2 - y * s };
        });
    }, []);

    return {
        containerRef,
        viewport,
        isPanning,
        handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerLeave: onPointerUp },
        fitToBounds,
        zoomBy,
        centerOn,
    };
}