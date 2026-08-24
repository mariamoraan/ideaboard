import { useState } from 'react';
import useWindowDimensions from '../../../../../core/hooks/use-window-dimensions';
import { ContentLayer } from '../../components/content-layer/content-layer';
import { InteractionLayer } from '../../components/interaction-layer/interaction-layer';
import { StaticLayer } from '../../components/static-layer/static-layer';
import './whiteboard-page.scss'
import type { Note } from '@features/whiteboard/domain/note';
import { generateBaseNotes } from '../../utils/generate-base-notes';
import type { Point } from '@features/whiteboard/domain/point';
import { useNoteDrag } from '../../hooks/useNoteDrag';
import { DebugLayer } from '../../components/debug-layer/debug-layer';
import { ControlsLayer } from '../../components/controls-layer/controls-layer';

export const WhiteboardPage = () => {
  const { width, height } = useWindowDimensions();
  const [mousePosition, setMousePosition] = useState<Point>({x: 0, y: 0});
  const [notes, setNotes] = useState<Note[]>(() => generateBaseNotes(width, height));
  const [isDebugMode, setIsDebugMode] = useState(false);
  
  const { 
    ghostNote, 
    handlePointerDown, 
    handlePointerMove, 
    handlePointerUp, 
    handlePointerCancel 
  } = useNoteDrag({  
    notes, 
    setNotes 
  });


  function handleMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    handlePointerMove(e);
  }

  return (
    <div 
    className="whiteboard-page"
    onPointerDown={handlePointerDown}
    onMouseMove={handleMouseMove}
    onPointerUp={handlePointerUp}
    onPointerCancel={handlePointerCancel}
    >
        <StaticLayer width={width} height={height} />
        <ContentLayer width={width} height={height} notes={notes} ghostNoteId={ghostNote?.id ?? null} />
        {isDebugMode && <DebugLayer width={width} height={height} ghostNote={ghostNote} notes={notes} />}
        <InteractionLayer width={width} height={height} mousePosition={mousePosition} ghostNote={ghostNote} />
        <ControlsLayer isDebugMode={isDebugMode} setIsDebugMode={setIsDebugMode} />
    </div>
  );
};