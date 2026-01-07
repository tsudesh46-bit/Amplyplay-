
import React from 'react';

interface PatternCircleProps {
  size: number;
  contrast: number;
  onClick: (event: React.MouseEvent) => void;
  style?: React.CSSProperties;
  className?: string;
}

const PatternCircle: React.FC<PatternCircleProps> = ({ size, contrast, onClick, style, className = '' }) => {
  const patternStyle: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '50%',
    cursor: 'pointer',
    opacity: contrast,
    backgroundImage: `repeating-linear-gradient(
      45deg,
      rgba(180, 180, 180, 0.9),
      rgba(180, 180, 180, 0.9) 3px,
      rgba(80, 80, 80, 0.9) 3px,
      rgba(80, 80, 80, 0.9) 6px
    )`,
    transition: 'transform 0.1s ease-out',
    ...style,
  };

  return (
    <div
      onClick={onClick}
      style={patternStyle}
      className={`hover:scale-110 ${className}`}
      aria-label="Pattern patch"
    ></div>
  );
};

export default PatternCircle;
