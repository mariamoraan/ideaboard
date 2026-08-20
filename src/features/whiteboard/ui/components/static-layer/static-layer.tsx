import { useRef } from 'react';
import './static-layer.scss'
import { usePaintGrid } from '../../hooks/usePaintGrid';

interface StaticLayerProps {
  width: number;
  height: number;
}

export const StaticLayer: React.FC<StaticLayerProps> = ({ 
  width, 
  height 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  usePaintGrid({ canvasRef, width, height });
  return <canvas className="static-layer" ref={canvasRef} />;
};