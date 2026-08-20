import type { Note } from "@features/whiteboard/domain/note";

export const paintNote = (ctx: CanvasRenderingContext2D, note: Note) => {
    const rotation = note.rotation ?? 0;
    const centerX = note.x + note.width / 2;
    const centerY = note.y + note.height / 2;
  
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-note.width / 2, -note.height / 2);
  
    ctx.shadowColor = "rgba(0, 0, 0, 0.14)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 4;
  
    ctx.fillStyle = note.color;
    ctx.beginPath();
    ctx.roundRect(0, 0, note.width, note.height, 3);
    ctx.fill();
  
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  
    const fontSize = Math.max(11, note.width * 0.11);
    ctx.fillStyle = "#2d2a26";
    ctx.font = `600 ${fontSize}px system-ui, -apple-system, sans-serif`;
    ctx.fillText(note.text, fontSize * 0.75, fontSize * 1.35);
  
    ctx.restore();
}