import React from 'react';

type Props = {
  className?: string;
  size?: number;
  title?: string;
};

// Simple image-based icon component to replace brain icons with brand mark
const LogoMarkIcon: React.FC<Props> = ({ className, size = 20, title = 'AI Boost Campaign' }) => {
  return (
    <img
      src="/brand/mark.png"
      alt={title}
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size }}
    />
  );
};

export default LogoMarkIcon;

