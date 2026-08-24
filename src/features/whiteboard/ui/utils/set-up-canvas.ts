export function setupCanvas(
    canvas: HTMLCanvasElement,
    width: number,
    height: number,
): CanvasRenderingContext2D | null {
    if (width <= 0 || height <= 0) return null;

    const dpr = window.devicePixelRatio || 1;
    const nextWidth = Math.round(width * dpr);
    const nextHeight = Math.round(height * dpr);

    const needsResize = canvas.width !== nextWidth || canvas.height !== nextHeight;

    const ctx = canvas.getContext("2d");
    if(!ctx) return null;

   if(needsResize) {
    canvas.width = nextWidth;
    canvas.height = nextHeight;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);
   }

    return ctx;
}