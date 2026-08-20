import type { Note } from "@features/whiteboard/domain/note";
import { useEffect } from "react";
import { setupCanvas } from "../utils/set-up-canvas";
import { paintNote } from "../utils/paint-note";

export const usePaintNotes = ({
    canvasRef,
    width,
    height,
    notes,
}: {
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    width: number;
    height: number;
    notes: Note[];
}) => {


    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = setupCanvas(canvas, width, height);
        ctx.clearRect(0, 0, width, height);
        notes.forEach(note => paintNote(ctx, note));
    }, [canvasRef, width, height, notes]);
}