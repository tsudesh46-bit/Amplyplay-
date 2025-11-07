
import React from 'react';

interface GaborTextProps {
  children: React.ReactNode;
  isCorrect: boolean;
  contrast: number;
  fontSize: number;
  onClick: () => void;
  className?: string;
}

const GaborText: React.FC<GaborTextProps> = ({ children, isCorrect, contrast, fontSize, onClick, className = '' }) => {
  const gaborStyle = {
    '--gabor-color-1': `rgba(0, 0, 0, ${contrast})`,
    '--gabor-color-2': `rgba(50, 50, 50, ${contrast})`,
    'backgroundImage': `repeating-linear-gradient(45deg, var(--gabor-color-1), var(--gabor-color-1) 3px, var(--gabor-color-2) 3px, var(--gabor-color-2) 6px)`,
  } as React.CSSProperties;

  const solidStyle = {
    color: `rgba(0, 0, 0, ${contrast})`,
  } as React.CSSProperties;

  const baseClasses = "font-bold cursor-pointer flex items-center justify-center transition-all duration-100 ease-in-out";
  
  const dynamicStyle = {
    fontSize: `${fontSize}px`,
    opacity: contrast,
    ...(isCorrect ? gaborStyle : solidStyle)
  };

  const dynamicClasses = isCorrect ? 'bg-clip-text text-transparent' : '';

  return (
    <div
      onClick={onClick}
      style={dynamicStyle}
      className={`${baseClasses} ${dynamicClasses} ${className}`}
    >
      {children}
    </div>
  );
};

export default GaborText;
