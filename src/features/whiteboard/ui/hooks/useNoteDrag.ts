import type { Offset } from "@features/whiteboard/domain/point";
import type { Note } from "@features/whiteboard/domain/note";
import { useState } from "react";
import { getNoteAtPoint } from "@features/whiteboard/domain/notes-geometry";

export const useNoteDrag = ({
    notes,
    setNotes,
}: {
    notes: Note[];
    setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
}) => {
    const [ghostNote, setGhostNote] = useState<Note | null>(null);
    const [grabOffset, setGrabOffset] = useState<Offset | null>(null);

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        const note = getNoteAtPoint(notes, {x: e.clientX, y: e.clientY});
        if(note) {
            setGrabOffset({x: e.clientX - note.x, y: e.clientY - note.y});
            setGhostNote({...note});
        }
    }
    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if(!ghostNote) return;
        setGhostNote((prev) =>
            prev
              ? {
                  ...prev,
                  x: e.clientX - grabOffset.x,
                  y: e.clientY - grabOffset.y,
                }
              : null
          );
    }
    const handlePointerUp = () => {
        if(!ghostNote) return;
        setNotes(prev => prev.map(note => note.id === ghostNote.id ? ghostNote : note));
        setGhostNote(null);
        setGrabOffset(null);
    }
    const handlePointerCancel = () => {
        setGhostNote(null);
        setGrabOffset(null);
    }

    return {
        ghostNote,
        handlePointerDown,
        handlePointerMove,
        handlePointerUp,
        handlePointerCancel,
    }
}

