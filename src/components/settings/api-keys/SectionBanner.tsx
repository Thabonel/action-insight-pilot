
import React from 'react';

interface SectionBannerProps {
  title: string;
  description: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
}

const SectionBanner: React.FC<SectionBannerProps> = ({
  title,
  description,
  bgColor,
  borderColor,
  textColor
}) => {
  return (
    <div className={`${bgColor} border ${borderColor} rounded-lg p-4`}>
      <div>
        <h4 className={`font-semibold ${textColor}`}>{title}</h4>
        <p className={`text-sm ${textColor} mt-1`}>
          {description}
        </p>
      </div>
    </div>
  );
};

export default SectionBanner;
