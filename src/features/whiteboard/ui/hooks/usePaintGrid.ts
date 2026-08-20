import { useEffect } from "react";
import { setupCanvas } from "../utils/set-up-canvas";
import { COLORS } from "../../../../core/styles/colors";

export const usePaintGrid = ({
    canvasRef,
    width,
    height,
}: {
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    width: number;
    height: number;
}) => {
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = setupCanvas(canvas, width, height);

        ctx.clearRect(0, 0, width, height);
        ctx.strokeStyle = COLORS.gridLinesColor;
        ctx.lineWidth = 1;

        for (let x = 0; x < width; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }

        for (let y = 0; y < height; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
    }, [canvasRef, width, height]);
};