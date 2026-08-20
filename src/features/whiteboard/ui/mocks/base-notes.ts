import { COLORS } from "@core/styles/colors";
import type { Note } from "@features/whiteboard/domain/note";

/** Design canvas size the BASE_NOTES coordinates are authored against. */
export const BASE_BOARD = {
    width: 1728,
    height: 992,
} as const;

export const BASE_NOTES: Note[] = [
    {
        id: 'note-1',
        x: 100,
        y: 100,
        text: 'Welcome',
        color: COLORS.notes.color1,
        width: 100,
        height: 100,
        rotation: -5,
    },
    {
        id: 'note-2',
        x: 220,
        y: 100,
        text: 'To',
        color: COLORS.notes.color2,
        width: 100,
        height: 100,
        rotation: 5,
    },
    {
        id: 'note-3',
        x: 160,
        y: 220,
        text: 'IdeaBoard',
        color: COLORS.notes.color3,
        width: 100,
        height: 100,
        rotation: 0,
    },

    {
        id: 'note-4',
        x: 600,
        y: 500,
        text: 'Welcome',
        color: COLORS.notes.color4,
        width: 100,
        height: 100,
        rotation: -5,
    },
    {
        id: 'note-5',
        x: 720,
        y: 500,
        text: 'To',
        color: COLORS.notes.color1,
        width: 100,
        height: 100,
        rotation: 5,
    },
    {
        id: 'note-6',
        x: 660,
        y: 620,
        text: 'IdeaBoard',
        color: COLORS.notes.color2,
        width: 100,
        height: 100,
        rotation: 0,
    },
]