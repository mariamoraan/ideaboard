import { CollaboratorCursor } from '../collaborator-cursor/collaborator-cursor';
import avatarPlaceholder from "@assets/avatar.jpg";
import './interaction-layer.scss'

interface Props {
  mousePosition: { x: number; y: number };
}

export const InteractionLayer: React.FC<Props> = ({ mousePosition }) => {
  return (
    <div className="interaction-layer">
      <CollaboratorCursor
      x={mousePosition.x} 
      y={mousePosition.y} 
      color="#763DF2"
      name="Maria" 
      avatarSrc={avatarPlaceholder} 
      />
    </div>
  );
};