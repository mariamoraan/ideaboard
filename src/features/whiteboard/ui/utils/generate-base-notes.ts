import { BASE_BOARD, BASE_NOTES } from "../mocks/base-notes"
import type { Note } from "@features/whiteboard/domain/note"

export const generateBaseNotes = (width: number, height: number): Note[] => {
    const scaleX = width / BASE_BOARD.width
    const scaleY = height / BASE_BOARD.height

    return BASE_NOTES.map(note => ({
        ...note,
        x: note.x * scaleX,
        y: note.y * scaleY,
        width: note.width * scaleX,
        height: note.height * scaleY,
    }))
}
