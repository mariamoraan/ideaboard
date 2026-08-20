import { ContentLayer } from '../../components/content-layer/content-layer';
import { InteractionLayer } from '../../components/interaction-layer/interaction-layer';
import { StaticLayer } from '../../components/static-layer/static-layer';
import './whiteboard-page.scss'

export const WhiteboardPage = () => {
  return (
    <div className="whiteboard-page">
        <StaticLayer />
        <ContentLayer />
        <InteractionLayer />
    </div>
  );
};