
import React from 'react';

interface PatternEmojiProps {
  children: React.ReactNode;
  hasPatternPatch: boolean;
  contrast: number;
  fontSize: number;
  onClick: () => void;
  className?: string;
}

const PatternEmoji: React.FC<PatternEmojiProps> = ({ children, hasPatternPatch, contrast, fontSize, onClick, className = '' }) => {
    const containerStyle: React.CSSProperties = {
        position: 'relative',
        fontSize: `${fontSize}px`,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'opacity 0.1s ease-in-out',
        opacity: contrast,
    };

    const overlayStyle: React.CSSProperties = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: `repeating-linear-gradient(
            45deg,
            rgba(0, 0, 0, 0.3), 
            rgba(0, 0, 0, 0.3) 3px,
            transparent 3px,
            transparent 6px
        )`,
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
        pointerEvents: 'none',
    };

    return (
        <div
            onClick={onClick}
            style={containerStyle}
            className={className}
        >
            <span>{children}</span>
            {hasPatternPatch && <span style={overlayStyle}>{children}</span>}
        </div>
    );
};

export default PatternEmoji;
