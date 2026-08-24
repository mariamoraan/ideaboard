import type { Rect } from "@features/whiteboard/domain/rect";

export const paintDirtyRectangles = (
    ctx: CanvasRenderingContext2D, 
    dirty: Rect, 
    color: string = "rgba(0, 0, 0, 0.14)"
) => {
    ctx.save();
    ctx.beginPath();
    ctx.rect(dirty.x, dirty.y, dirty.width, dirty.height);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
}