import React from 'react';
import { cn } from '@/lib/utils';

export type NeuralFlowIconName =
  | 'add'
  | 'admin'
  | 'analytics'
  | 'autopilot'
  | 'campaigns'
  | 'close'
  | 'content'
  | 'video'
  | 'copy'
  | 'dashboard'
  | 'delete'
  | 'documentation'
  | 'edit'
  | 'email'
  | 'filter'
  | 'integrations'
  | 'leads'
  | 'loading'
  | 'mode-switch'
  | 'profile'
  | 'proposals'
  | 'refresh'
  | 'save'
  | 'search'
  | 'settings'
  | 'sign-out'
  | 'social'
  | 'success'
  | 'warning'
  | 'workflows';

interface NeuralFlowIconProps {
  name: NeuralFlowIconName;
  className?: string;
  size?: number;
}

const NeuralFlowIcon: React.FC<NeuralFlowIconProps> = ({
  name,
  className,
  size = 20
}) => {
  if (name === 'video') {
    // Inline SVG fallback for video icon so we don't depend on an external PNG
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        className={cn('text-current', className)}
        aria-label="video icon"
      >
        <path
          fill="currentColor"
          d="M3 6.75C3 5.784 3.784 5 4.75 5h8.5c.966 0 1.75.784 1.75 1.75v1.39l3.51-2.02A1 1 0 0 1 20 6.03v11.94a1 1 0 0 1-1.49.87L15 16.82v1.43c0 .966-.784 1.75-1.75 1.75h-8.5A1.75 1.75 0 0 1 3 18.25v-11.5Zm2-.25a.25.25 0 0 0-.25.25v11.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25v-11.5a.25.25 0 0 0-.25-.25h-8.5Z"
        />
      </svg>
    );
  }

  return (
    <img
      src={`/icons/neural-flow/${name}.png`}
      alt={`${name} icon`}
      width={size}
      height={size}
      className={cn('object-contain', className)}
      style={{ width: size, height: size }}
      onError={(e) => {
        // Fallback to a neutral icon if specific PNG is missing
        (e.currentTarget as HTMLImageElement).src = '/icons/neural-flow/content.png'
      }}
    />
  );
};

export default NeuralFlowIcon;
