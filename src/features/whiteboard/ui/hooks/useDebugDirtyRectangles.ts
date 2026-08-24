import type { Rect } from "@features/whiteboard/domain/rect";
import type { Note } from "@features/whiteboard/domain/note";
import { useEffect, useRef } from "react";
import { paintDirtyRectangles } from "../utils/paint-dirty-rectangles";
import { setupCanvas } from "../utils/set-up-canvas";
import {
    dirtyFromVisibleChange,
    noteBounds,
    unionRects,
} from "@features/whiteboard/domain/notes-geometry";

const DRAG_TRAIL_MAX = 20;
const CONTENT_TRAIL_MAX = 2;
const TRAIL_TTL_MS = 2000;
const DRAG_RELEASE_FADE_MS = 500;
const DRAG_BASE_ALPHA = 0.8;
const CONTENT_BASE_ALPHA = 0.8;

const DRAG_RGB = { r: 242, g: 240, b: 232 };
const CONTENT_RGB = { r: 211, g: 228, b: 242 };

type TrailEntry = {
    rect: Rect;
    createdAt: number;
};

type ContentSnapshot = {
    visibleNotes: Note[];
    width: number;
    height: number;
};

type UseDebugDirtyRectanglesParams = {
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    width: number;
    height: number;
    ghostNote: Note | null;
    notes: Note[];
};

const getVisibleNotes = (notes: Note[], ghostNoteId: string | null) =>
    notes.filter((note) => note.id !== ghostNoteId);

const hasCanvasSizeChanged = (
    snapshot: ContentSnapshot | null,
    width: number,
    height: number,
) => !snapshot || snapshot.width !== width || snapshot.height !== height;

const snapRectToPixels = (rect: Rect): Rect => {
    const x = Math.floor(rect.x);
    const y = Math.floor(rect.y);
    const right = Math.ceil(rect.x + rect.width);
    const bottom = Math.ceil(rect.y + rect.height);
    return { x, y, width: right - x, height: bottom - y };
};

const clearCanvasArea = (ctx: CanvasRenderingContext2D, rect: Rect) => {
    const snapped = snapRectToPixels(rect);
    ctx.clearRect(snapped.x, snapped.y, snapped.width, snapped.height);
};

const getTrailAgeOpacity = (age: number, max: number) => 1 - age / max;

const getTrailTimeOpacity = (entry: TrailEntry, now: number) =>
    Math.max(0, 1 - (now - entry.createdAt) / TRAIL_TTL_MS);

const getEntryOpacity = (entry: TrailEntry, age: number, max: number, now: number) =>
    getTrailAgeOpacity(age, max) * getTrailTimeOpacity(entry, now);

const paintTrailRect = (
    ctx: CanvasRenderingContext2D,
    rect: Rect,
    opacityFactor: number,
    rgb: { r: number; g: number; b: number },
    baseAlpha: number,
) => {
    if (opacityFactor <= 0) return;

    paintDirtyRectangles(
        ctx,
        snapRectToPixels(rect),
        `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${baseAlpha * opacityFactor})`,
    );
};

const getTrailRects = (trail: TrailEntry[]) => trail.map((entry) => entry.rect);

const unionAllRects = (rects: Rect[]): Rect | null => {
    if (rects.length === 0) return null;
    return rects.reduce((acc, rect) => unionRects(acc, rect));
};

const pushTrailFrame = (
    trail: TrailEntry[],
    frame: Rect,
    max: number,
    now: number,
): TrailEntry[] => [{ rect: frame, createdAt: now }, ...trail].slice(0, max);

const pruneExpiredTrail = (trail: TrailEntry[], now: number) =>
    trail.filter((entry) => now - entry.createdAt < TRAIL_TTL_MS);

const paintTrail = (
    ctx: CanvasRenderingContext2D,
    trail: TrailEntry[],
    max: number,
    rgb: { r: number; g: number; b: number },
    baseAlpha: number,
    now: number,
) => {
    trail.forEach((entry, age) => {
        paintTrailRect(
            ctx,
            entry.rect,
            getEntryOpacity(entry, age, max, now),
            rgb,
            baseAlpha,
        );
    });
};

const paintContentTrail = (
    ctx: CanvasRenderingContext2D,
    trail: TrailEntry[],
    now: number,
) => {
    paintTrail(ctx, trail, CONTENT_TRAIL_MAX, CONTENT_RGB, CONTENT_BASE_ALPHA, now);
};

const getDragReleaseOpacity = (releaseStartedAt: number | null, now: number) => {
    if (releaseStartedAt === null) return 1;
    return Math.max(0, 1 - (now - releaseStartedAt) / DRAG_RELEASE_FADE_MS);
};

const paintDragTrail = (
    ctx: CanvasRenderingContext2D,
    trail: TrailEntry[],
    now: number,
    releaseOpacity = 1,
) => {
    trail.forEach((entry, age) => {
        paintTrailRect(
            ctx,
            entry.rect,
            getEntryOpacity(entry, age, DRAG_TRAIL_MAX, now) * releaseOpacity,
            DRAG_RGB,
            DRAG_BASE_ALPHA,
        );
    });
};

const hasActiveTrails = (
    dragTrail: TrailEntry[],
    contentTrail: TrailEntry[],
    now: number,
) =>
    pruneExpiredTrail(dragTrail, now).length > 0 ||
    pruneExpiredTrail(contentTrail, now).length > 0;

const repaintAllTrails = (
    ctx: CanvasRenderingContext2D,
    prevDragTrailRef: React.MutableRefObject<TrailEntry[]>,
    prevContentTrailRef: React.MutableRefObject<TrailEntry[]>,
    lastPaintedAreaRef: React.MutableRefObject<Rect | null>,
    dragReleaseStartedAtRef: React.MutableRefObject<number | null>,
    now: number,
) => {
    if (lastPaintedAreaRef.current) {
        clearCanvasArea(ctx, lastPaintedAreaRef.current);
        lastPaintedAreaRef.current = null;
    }

    prevDragTrailRef.current = pruneExpiredTrail(prevDragTrailRef.current, now);
    prevContentTrailRef.current = pruneExpiredTrail(
        prevContentTrailRef.current,
        now,
    );

    const dragReleaseOpacity = getDragReleaseOpacity(
        dragReleaseStartedAtRef.current,
        now,
    );

    if (dragReleaseOpacity <= 0) {
        prevDragTrailRef.current = [];
        dragReleaseStartedAtRef.current = null;
    }

    paintContentTrail(ctx, prevContentTrailRef.current, now);
    paintDragTrail(
        ctx,
        prevDragTrailRef.current,
        now,
        dragReleaseOpacity,
    );

    lastPaintedAreaRef.current = unionAllRects([
        ...getTrailRects(prevDragTrailRef.current),
        ...getTrailRects(prevContentTrailRef.current),
    ]);
};

const updateContentTrail = (
    prevSnapshot: ContentSnapshot,
    visibleNotes: Note[],
    prevContentTrailRef: React.MutableRefObject<TrailEntry[]>,
    now: number,
) => {
    const contentDirty = dirtyFromVisibleChange(
        prevSnapshot.visibleNotes,
        visibleNotes,
    );
    if (!contentDirty) return;

    prevContentTrailRef.current = pushTrailFrame(
        prevContentTrailRef.current,
        contentDirty,
        CONTENT_TRAIL_MAX,
        now,
    );
};

export const useDebugDirtyRectangles = ({
    canvasRef,
    width,
    height,
    ghostNote,
    notes,
}: UseDebugDirtyRectanglesParams) => {
    const prevDragTrailRef = useRef<TrailEntry[]>([]);
    const prevContentTrailRef = useRef<TrailEntry[]>([]);
    const prevContentSnapshotRef = useRef<ContentSnapshot | null>(null);
    const lastPaintedAreaRef = useRef<Rect | null>(null);
    const wasDraggingRef = useRef(false);
    const dragReleaseStartedAtRef = useRef<number | null>(null);

    useEffect(() => {
        let rafId = 0;
        let cancelled = false;
        let needsFullClear = false;

        const syncTrailsFromState = (now: number) => {
            const ghostNoteId = ghostNote?.id ?? null;
            const visibleNotes = getVisibleNotes(notes, ghostNoteId);
            const prevSnapshot = prevContentSnapshotRef.current;
            const needsFullRepaint = hasCanvasSizeChanged(
                prevSnapshot,
                width,
                height,
            );

            if (needsFullRepaint) {
                needsFullClear = true;
                prevDragTrailRef.current = [];
                prevContentTrailRef.current = [];
                lastPaintedAreaRef.current = null;
                dragReleaseStartedAtRef.current = null;
                wasDraggingRef.current = false;
            }

            if (prevSnapshot && !needsFullRepaint) {
                updateContentTrail(
                    prevSnapshot,
                    visibleNotes,
                    prevContentTrailRef,
                    now,
                );
            }

            prevContentSnapshotRef.current = { visibleNotes, width, height };

            if (ghostNote) {
                if (!wasDraggingRef.current && prevDragTrailRef.current.length > 0) {
                    prevDragTrailRef.current = [];
                    dragReleaseStartedAtRef.current = null;
                }

                wasDraggingRef.current = true;
                dragReleaseStartedAtRef.current = null;
                prevDragTrailRef.current = pushTrailFrame(
                    prevDragTrailRef.current,
                    noteBounds(ghostNote),
                    DRAG_TRAIL_MAX,
                    now,
                );
            } else if (
                wasDraggingRef.current &&
                prevDragTrailRef.current.length > 0
            ) {
                dragReleaseStartedAtRef.current = now;
                wasDraggingRef.current = false;
            } else {
                wasDraggingRef.current = false;
            }
        };

        const repaint = (now: number) => {
            if (cancelled) return false;

            const canvas = canvasRef.current;
            if (!canvas) return false;

            const ctx = setupCanvas(canvas, width, height);
            if (!ctx) return false;

            if (needsFullClear) {
                ctx.clearRect(0, 0, width, height);
                needsFullClear = false;
                lastPaintedAreaRef.current = null;
            }

            repaintAllTrails(
                ctx,
                prevDragTrailRef,
                prevContentTrailRef,
                lastPaintedAreaRef,
                dragReleaseStartedAtRef,
                now,
            );

            return (
                hasActiveTrails(
                    prevDragTrailRef.current,
                    prevContentTrailRef.current,
                    now,
                ) || dragReleaseStartedAtRef.current !== null
            );
        };

        const loop = (now: number) => {
            const shouldContinue = repaint(now);
            if (shouldContinue && !cancelled) {
                rafId = requestAnimationFrame(loop);
            }
        };

        syncTrailsFromState(performance.now());
        const shouldContinue = repaint(performance.now());
        if (shouldContinue) {
            rafId = requestAnimationFrame(loop);
        }

        return () => {
            cancelled = true;
            cancelAnimationFrame(rafId);
        };
    }, [canvasRef, width, height, ghostNote, notes]);
};
