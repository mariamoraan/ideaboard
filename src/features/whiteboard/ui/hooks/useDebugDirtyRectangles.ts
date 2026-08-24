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
import { COLORS } from "@core/styles/colors";

const DRAG_TRAIL_MAX = 20;
const DRAG_BASE_ALPHA = 0.8;

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

const paintContentDirty = (ctx: CanvasRenderingContext2D, rect: Rect) => {
    paintDirtyRectangles(
        ctx,
        snapRectToPixels(rect),
        COLORS.dirtyRectangles.content,
    );
};

const getDragTrailOpacity = (age: number) => 1 - age / DRAG_TRAIL_MAX;

const paintDragDirtyWithOpacity = (
    ctx: CanvasRenderingContext2D,
    rect: Rect,
    opacityFactor: number,
) => {
    if (opacityFactor <= 0) return;

    paintDirtyRectangles(
        ctx,
        snapRectToPixels(rect),
        `rgba(242, 240, 232, ${DRAG_BASE_ALPHA * opacityFactor})`,
    );
};

const unionAllRects = (rects: Rect[]): Rect | null => {
    if (rects.length === 0) return null;
    return rects.reduce((acc, rect) => unionRects(acc, rect));
};

const pushDragTrailFrame = (trail: Rect[], frame: Rect): Rect[] =>
    [frame, ...trail].slice(0, DRAG_TRAIL_MAX);

const clearDragTrailArea = (ctx: CanvasRenderingContext2D, trail: Rect[]) => {
    const area = unionAllRects(trail);
    if (area) clearCanvasArea(ctx, area);
};

const paintDragTrail = (ctx: CanvasRenderingContext2D, trail: Rect[]) => {
    trail.forEach((rect, age) => {
        paintDragDirtyWithOpacity(ctx, rect, getDragTrailOpacity(age));
    });
};

const restoreContentOverlay = (
    ctx: CanvasRenderingContext2D,
    prevContentPaintedRef: React.MutableRefObject<Rect | null>,
) => {
    if (!prevContentPaintedRef.current) return;

    clearCanvasArea(ctx, prevContentPaintedRef.current);
    paintContentDirty(ctx, prevContentPaintedRef.current);
};

const repaintContentOverlay = (
    ctx: CanvasRenderingContext2D,
    prevSnapshot: ContentSnapshot,
    visibleNotes: Note[],
    prevContentPaintedRef: React.MutableRefObject<Rect | null>,
) => {
    const contentDirty = dirtyFromVisibleChange(
        prevSnapshot.visibleNotes,
        visibleNotes,
    );
    if (!contentDirty) return;

    if (prevContentPaintedRef.current) {
        clearCanvasArea(ctx, prevContentPaintedRef.current);
    }

    paintContentDirty(ctx, contentDirty);
    prevContentPaintedRef.current = contentDirty;
};

const clearGhostDragOverlay = (
    ctx: CanvasRenderingContext2D,
    prevDragTrailRef: React.MutableRefObject<Rect[]>,
    prevContentPaintedRef: React.MutableRefObject<Rect | null>,
) => {
    const hadTrail = prevDragTrailRef.current.length > 0;

    if (hadTrail) {
        clearDragTrailArea(ctx, prevDragTrailRef.current);
        restoreContentOverlay(ctx, prevContentPaintedRef);
    }

    prevDragTrailRef.current = [];
};

const repaintGhostDragOverlay = (
    ctx: CanvasRenderingContext2D,
    ghostNote: Note,
    prevDragTrailRef: React.MutableRefObject<Rect[]>,
    prevContentPaintedRef: React.MutableRefObject<Rect | null>,
) => {
    const prevTrail = prevDragTrailRef.current;

    clearDragTrailArea(ctx, prevTrail);
    restoreContentOverlay(ctx, prevContentPaintedRef);

    const nextTrail = pushDragTrailFrame(prevTrail, noteBounds(ghostNote));
    paintDragTrail(ctx, nextTrail);
    prevDragTrailRef.current = nextTrail;
};

export const useDebugDirtyRectangles = ({
    canvasRef,
    width,
    height,
    ghostNote,
    notes,
}: UseDebugDirtyRectanglesParams) => {
    const prevDragTrailRef = useRef<Rect[]>([]);
    const prevContentSnapshotRef = useRef<ContentSnapshot | null>(null);
    const prevContentPaintedRef = useRef<Rect | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = setupCanvas(canvas, width, height);
        if (!ctx) return;

        const ghostNoteId = ghostNote?.id ?? null;
        const visibleNotes = getVisibleNotes(notes, ghostNoteId);
        const prevSnapshot = prevContentSnapshotRef.current;
        const needsFullRepaint = hasCanvasSizeChanged(
            prevSnapshot,
            width,
            height,
        );

        if (needsFullRepaint) {
            ctx.clearRect(0, 0, width, height);
            prevDragTrailRef.current = [];
            prevContentPaintedRef.current = null;
        }

        if (prevSnapshot && !needsFullRepaint) {
            repaintContentOverlay(
                ctx,
                prevSnapshot,
                visibleNotes,
                prevContentPaintedRef,
            );
        }

        prevContentSnapshotRef.current = { visibleNotes, width, height };

        if (!ghostNote) {
            clearGhostDragOverlay(
                ctx,
                prevDragTrailRef,
                prevContentPaintedRef,
            );
            return;
        }

        repaintGhostDragOverlay(
            ctx,
            ghostNote,
            prevDragTrailRef,
            prevContentPaintedRef,
        );
    }, [canvasRef, width, height, ghostNote, notes]);
};
