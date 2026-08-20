import { CollaboratorCursor } from '../collaborator-cursor/collaborator-cursor';
import avatarPlaceholder from "@assets/avatar.jpg";
import './interaction-layer.scss'
import { COLORS } from '@core/styles/colors';

interface Props {
  mousePosition: { x: number; y: number };
}

export const InteractionLayer: React.FC<Props> = ({ mousePosition }) => {
  return (
    <div className="interaction-layer">
      <CollaboratorCursor
      x={mousePosition.x} 
      y={mousePosition.y} 
      color={COLORS.cursor.color1}
      name="Maria" 
      avatarSrc={avatarPlaceholder} 
      />
    </div>
  );
};