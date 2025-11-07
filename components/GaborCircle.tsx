
import React from 'react';

interface GaborCircleProps {
  size: number;
  contrast: number;
  onClick: (event: React.MouseEvent) => void;
  style?: React.CSSProperties;
  className?: string;
}

const GaborCircle: React.FC<GaborCircleProps> = ({ size, contrast, onClick, style, className = '' }) => {
  const gaborStyle: React.CSSProperties = {
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
      style={gaborStyle}
      className={`hover:scale-110 ${className}`}
      aria-label="Gabor patch"
    ></div>
  );
};

export default GaborCircle;
