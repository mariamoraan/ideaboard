import { CollaboratorCursor } from '../collaborator-cursor/collaborator-cursor';
import avatarPlaceholder from "@assets/avatar.jpg";
import './interaction-layer.scss'
import { COLORS } from '@core/styles/colors';
import type { Point } from '@features/whiteboard/domain/point';
import type { Note } from '@features/whiteboard/domain/note';
import { useRef } from 'react';
import { usePaintGhostNote } from '../../hooks/usePaintGhostNote';
import { cn } from '@core/styles/cn';

interface Props {
  width: number;
  height: number;
  mousePosition: Point;
  ghostNote: Note | null;
}

export const InteractionLayer: React.FC<Props> = ({
  width,
  height,
  mousePosition,
  ghostNote,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  usePaintGhostNote({ canvasRef, width, height, ghostNote });
  const isDragging = !!ghostNote;
  return (
    <div className={cn("interaction-layer", { "interaction-layer--dragging": isDragging })}>
      <CollaboratorCursor
      isDragging={isDragging}
      x={mousePosition.x} 
      y={mousePosition.y} 
      color={COLORS.cursor.color1}
      name="Maria" 
      avatarSrc={avatarPlaceholder} 

      />
      <canvas ref={canvasRef} className="ghost-note" />
    </div>
  );
};