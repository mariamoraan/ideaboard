export function setupCanvas(
    canvas: HTMLCanvasElement,
    width: number,
    height: number,
): CanvasRenderingContext2D | null {
    if (width <= 0 || height <= 0) return null;

    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    return ctx;
}