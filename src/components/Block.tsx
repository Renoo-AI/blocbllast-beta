import React from 'react';

interface BlockProps {
  color: string;
  size?: number;
  className?: string;
  opacity?: number;
}

export const Block: React.FC<BlockProps> = ({ color, size, className = '', opacity = 1 }) => {
  return (
    <div
      className={`relative rounded-md ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        opacity,
        boxShadow: `
          inset 0 3px 0 0 rgba(255, 255, 255, 0.5),
          inset 0 -5px 0 0 rgba(0, 0, 0, 0.25),
          0 5px 0 0 rgba(0, 0, 0, 0.3)
        `,
        transform: 'translateY(-2px)',
      }}
    >
      {/* Glossy highlight */}
      <div
        className="absolute top-1 left-1 bg-white opacity-30 rounded-full"
        style={{ width: '25%', height: '15%' }}
      />
    </div>
  );
};
