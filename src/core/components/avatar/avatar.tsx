import { getInitials } from '@core/utils/get-initials';
import './avatar.scss';
import { cn } from '@core/styles/cn';

interface Props {
    src?: string;
    alt?: string;
    size: 'sm' | 'md' | 'lg';
    name: string;
}

export const Avatar: React.FC<Props> = ({ src, alt, size, name }) => {

    if(src) {
        return (
        <img
        src={src}
        alt={alt}
        className={cn('avatar', `avatar--${size}`)}
        />
        )
    }

    return (
    <span className="avatar avatar--initials">
        {getInitials(name)}
    </span>
    )
};
