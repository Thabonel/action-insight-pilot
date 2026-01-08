import React from 'react';

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

const Grid: React.FC<GridProps> = ({ children, ...props }) => {
  return (
    <div {...props}>
      {children || null}
    </div>
  );
};

export default Grid;