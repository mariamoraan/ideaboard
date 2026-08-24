import type { Note } from "@features/whiteboard/domain/note";
import { useEffect, useRef } from "react";
import { setupCanvas } from "../utils/set-up-canvas";
import { paintNote } from "../utils/paint-note";
import { dirtyFromVisibleChange, noteBounds, rectsIntersect } from "@features/whiteboard/domain/notes-geometry";

export const usePaintNotes = ({
    canvasRef,
    width,
    height,
    notes,
    ghostNoteId,
}: {
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    width: number;
    height: number;
    notes: Note[];
    ghostNoteId: string | null;
}) => {

    const prevRef = useRef<{
    visibleNotes: Note[];
    width: number;
    height: number;
    } | null>(null);


    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = setupCanvas(canvas, width, height);
        if(!ctx) return;

        const visibleNotes = notes.filter(note => note.id !== ghostNoteId);
        const needsFull = !prevRef?.current || prevRef.current.width !== width || prevRef.current.height !== height;
        
        const dirty = needsFull
        ? { x: 0, y: 0, width: width, height: height }
        : dirtyFromVisibleChange(prevRef.current.visibleNotes, visibleNotes);

        if(!dirty) return;

        ctx.save();
        ctx.beginPath();
        ctx.rect(dirty.x, dirty.y, dirty.width, dirty.height);
        ctx.clip(); // Clip to the dirty rect so repainting doesn't bleed outside the cleared area

        ctx.clearRect(dirty.x, dirty.y, dirty.width, dirty.height);
        visibleNotes.forEach((n) => {
            if (rectsIntersect(noteBounds(n), dirty)) {
            paintNote(ctx, n);
            }
        });

        prevRef.current = {visibleNotes, width, height};
        ctx.restore();
    }, [canvasRef, width, height, notes, ghostNoteId]);
}