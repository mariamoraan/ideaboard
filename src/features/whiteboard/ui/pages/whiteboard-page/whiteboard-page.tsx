import { useState } from 'react';
import useWindowDimensions from '../../../../../core/hooks/use-window-dimensions';
import { ContentLayer } from '../../components/content-layer/content-layer';
import { InteractionLayer } from '../../components/interaction-layer/interaction-layer';
import { StaticLayer } from '../../components/static-layer/static-layer';
import './whiteboard-page.scss'

export const WhiteboardPage = () => {
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({x: 0, y: 0})
  const { width, height } = useWindowDimensions();

  function handleMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  return (
    <div 
    className="whiteboard-page"
    onMouseMove={handleMouseMove}
    >
        <StaticLayer width={width} height={height} />
        <ContentLayer />
        <InteractionLayer mousePosition={mousePosition} />
    </div>
  );
};