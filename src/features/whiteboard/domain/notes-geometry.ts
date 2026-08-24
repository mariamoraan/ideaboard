import type { Note } from "./note";
import type { Point } from "./point";
import type { Rect } from "./rect";

const DEG_TO_RAD = Math.PI / 180;
const SHADOW_PAD = 16;

export function hitTestNote(note: Note, point: Point): boolean {
    const centerX = note.x + note.width / 2;
    const centerY = note.y + note.height / 2;
    const radians = (note.rotation ?? 0) * DEG_TO_RAD;
    // Turn the note so that it is straight.
    const local = rotatePoint(point.x, point.y, centerX, centerY, -radians);

    return (
        local.x >= note.x &&
        local.x <= note.x + note.width &&
        local.y >= note.y &&
        local.y <= note.y + note.height
    );
}

export function  getNoteAtPoint(notes: Note[], point: Point): Note | null {
    for (let i = notes.length - 1; i >= 0; i--) {
        if (hitTestNote(notes[i], point)) {
        return notes[i];
        }
    }
    return null;
}

export function rotatePoint(
    x: number,
    y: number,
    centerX: number,
    centerY: number,
    radians: number,
    ): { x: number; y: number } {
    const dx = x - centerX;
    const dy = y - centerY;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);

    return {
        x: centerX + dx * cos - dy * sin,
        y: centerY + dx * sin + dy * cos,
    };
}

export function noteBounds(note: Note): Rect {
    const rotation = (note.rotation ?? 0) * DEG_TO_RAD;
    const cx = note.x + note.width / 2;
    const cy = note.y + note.height / 2;

    const hw = note.width / 2;
    const hh = note.height / 2;
    const corners = [
        { x: -hw, y: -hh },
        { x:  hw, y: -hh },
        { x:  hw, y:  hh },
        { x: -hw, y:  hh },
    ];

    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const c of corners) {
        const x = cx + c.x * cos - c.y * sin;
        const y = cy + c.x * sin + c.y * cos;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
    }
    return {
        x: minX - SHADOW_PAD,
        y: minY - SHADOW_PAD,
        width: maxX - minX + SHADOW_PAD * 2,
        height: maxY - minY + SHADOW_PAD * 2,
    };
}

export function unionRects(a: Rect, b: Rect): Rect {
    const x = Math.min(a.x, b.x);
    const y = Math.min(a.y, b.y);
    const right = Math.max(a.x + a.width, b.x + b.width);
    const bottom = Math.max(a.y + a.height, b.y + b.height);
    return { x, y, width: right - x, height: bottom - y };
}

export function rectsIntersect(a: Rect, b: Rect): boolean {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

export function dirtyFromVisibleChange(prev: Note[], next: Note[]): Rect | null {
    const prevMap = new Map(prev.map((n) => [n.id, n]));
    const nextMap = new Map(next.map((n) => [n.id, n]));
    let dirty: Rect | null = null;
    
    const add = (r: Rect) => {
        dirty = dirty ? unionRects(dirty, r) : r;
    };

    for (const [id, note] of prevMap) {
        if (!nextMap.has(id))  {
            add(noteBounds(note)); // deleted note
        }
    }

    for (const [id, note] of nextMap) {
        const old = prevMap.get(id);
        if (!old) {
            add(noteBounds(note)); // added note
        } else if (
            old.x !== note.x ||
            old.y !== note.y ||
            old.width !== note.width ||
            old.height !== note.height ||
            old.rotation !== note.rotation ||
            old.color !== note.color ||
            old.text !== note.text
        ) {
            add(unionRects(noteBounds(old), noteBounds(note))); // moved, resized, rotated, etc. note
        }
    }

    return dirty;
}