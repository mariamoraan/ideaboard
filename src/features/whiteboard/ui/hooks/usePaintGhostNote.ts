import type { Note } from "@features/whiteboard/domain/note";
import { useEffect, useRef } from "react";
import { setupCanvas } from "../utils/set-up-canvas";
import { paintNote } from "../utils/paint-note";
import type { Rect } from "@features/whiteboard/domain/rect";
import { noteBounds, unionRects } from "@features/whiteboard/domain/notes-geometry";

export const usePaintGhostNote = ({
    canvasRef,
    width,
    height,
    ghostNote,
}: {
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    width: number;
    height: number;
    ghostNote: Note | null;
}) => {

    const prevBoundsRef = useRef<Rect | null>(null);
    const pendingNoteRef = useRef<Note | null>(null);
    const rafIdRef = useRef<number | null>(null);


    useEffect(() => {
        pendingNoteRef.current = ghostNote;
        if (rafIdRef.current !== null) return;

        rafIdRef.current = requestAnimationFrame(() => {
            rafIdRef.current = null;
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = setupCanvas(canvas, width, height);
            if (!ctx) return;

            const note = pendingNoteRef.current;

            if (!note) {
                const prev = prevBoundsRef.current;
                if (prev) ctx.clearRect(prev.x, prev.y, prev.width, prev.height);
                prevBoundsRef.current = null;
                return;
            }

            const next = noteBounds(note);
            const dirty = prevBoundsRef.current ? unionRects(prevBoundsRef.current, next) : next;
            ctx.clearRect(dirty.x, dirty.y, dirty.width, dirty.height);
            paintNote(ctx, note);
            prevBoundsRef.current = next;
        });

        return () => {
            if (rafIdRef.current !== null) {
                cancelAnimationFrame(rafIdRef.current);
                rafIdRef.current = null;
            }
        };

    }, [ghostNote, width, height]);
}