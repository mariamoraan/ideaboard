import { useRef } from 'react';
import './debug-layer.scss';
import { useDebugDirtyRectangles } from '../../hooks/useDebugDirtyRectangles';
import type { Note } from '@features/whiteboard/domain/note';

interface Props {
    width: number;
    height: number;
    ghostNote: Note | null;
    notes: Note[];
}

export const DebugLayer: React.FC<Props> = ({ 
    width, 
    height, 
    ghostNote,
    notes
}) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    useDebugDirtyRectangles({ canvasRef, width, height, ghostNote, notes });
    return (
        <canvas className="debug-layer" ref={canvasRef} />
    );
};