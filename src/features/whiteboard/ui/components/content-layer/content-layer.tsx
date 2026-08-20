import type { Note } from '@features/whiteboard/domain/note';
import './content-layer.scss'
import { usePaintNotes } from '../../hooks/usePaintNotes';
import { useRef } from 'react';

interface Props {
  width: number;
  height: number;
  notes: Note[];
}

export const ContentLayer: React.FC<Props> = ({ 
  width, 
  height, 
  notes 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  usePaintNotes({ canvasRef, width, height, notes });
  return <canvas ref={canvasRef} className="content-layer" />;
};