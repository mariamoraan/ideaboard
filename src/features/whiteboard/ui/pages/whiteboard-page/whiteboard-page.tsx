import useWindowDimensions from '../../../../../core/hooks/use-window-dimensions';
import { ContentLayer } from '../../components/content-layer/content-layer';
import { InteractionLayer } from '../../components/interaction-layer/interaction-layer';
import { StaticLayer } from '../../components/static-layer/static-layer';
import './whiteboard-page.scss'

export const WhiteboardPage = () => {
  const { width, height } = useWindowDimensions();
  return (
    <div className="whiteboard-page">
        <StaticLayer width={width} height={height} />
        <ContentLayer />
        <InteractionLayer />
    </div>
  );
};