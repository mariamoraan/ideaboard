import { DraggingIcon, MousePointerIcon } from '@icons';
import './collaborator-cursor.scss';
import { Avatar } from '@core/components/avatar/avatar';

interface Props {
    x: number;
    y: number;
    color: string;
    name: string;
    avatarSrc?: string;
    isDragging?: boolean;
}
export const CollaboratorCursor: React.FC<Props> = ({
    x,
    y,
    color,
    name,
    avatarSrc,
    isDragging,
}) => {
    return (
        <div
            className="collaborator-cursor"
            style={{ transform: `translate(${x}px, ${y}px)` }}
        >
            {isDragging ? <DraggingIcon className="collaborator-cursor__pointer" size={16} /> : <MousePointerIcon className="collaborator-cursor__pointer" size={16} />}
            <div
                className="collaborator-cursor__label"
                style={{ backgroundColor: color }}
            >
                <Avatar src={avatarSrc} alt={name} size="sm" name={name} />
                <span className="collaborator-cursor__label__name">{name}</span>
            </div>
        </div>
    );
};
