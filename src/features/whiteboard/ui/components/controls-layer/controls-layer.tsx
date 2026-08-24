import './controls-layer.scss';
import { cn } from '@core/styles/cn';

interface Props {
    isDebugMode: boolean;
    setIsDebugMode: React.Dispatch<React.SetStateAction<boolean>>;
}
export const ControlsLayer: React.FC<Props> = ({ isDebugMode, setIsDebugMode }) => {
    return (
        <div className="controls-layer">
            <div className="controls-layer__controls">
                <button 
                className={cn('controls-layer__controls__button', { 'controls-layer__controls__button--active': isDebugMode })} 
                onClick={() => setIsDebugMode(!isDebugMode)}
                >
                    {isDebugMode ? 'Disable Debug Mode' : 'Enable Debug Mode'}
                </button>
            </div>
        </div>
    );
}