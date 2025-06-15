import React from 'react';

interface QuickActionGridProps {
  data?: {
    topFeatures: any[];
  };
}

const QuickActionGrid: React.FC<QuickActionGridProps> = ({ data }) => {
  // Add null check and default value
  const features = data?.topFeatures || [];

  return (
    <div>
      {features.map((feature, index) => (
        <div key={index}>
          {/* feature rendering logic */}
        </div>
      ))}
    </div>
  );
};

// Example usage
<QuickActionGrid data={{ topFeatures: [...] }} />

export default QuickActionGrid;