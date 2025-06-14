
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SectionBannerProps {
  icon: LucideIcon;
  title: string;
  description: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
}

const SectionBanner: React.FC<SectionBannerProps> = ({
  icon: Icon,
  title,
  description,
  bgColor,
  borderColor,
  textColor
}) => {
  return (
    <div className={`${bgColor} border ${borderColor} rounded-lg p-4`}>
      <div className="flex items-start space-x-3">
        <Icon className={`h-5 w-5 ${textColor} mt-0.5`} />
        <div>
          <h4 className={`font-semibold ${textColor}`}>{title}</h4>
          <p className={`text-sm ${textColor} mt-1`}>
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SectionBanner;
