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

const NeuralFlowIcon: React.FC<NeuralFlowIconProps> = ({ name, className, size = 20 }) => {
  const fallbackVideoSvg = `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='${size}' height='${size}'>
      <path fill='currentColor' d='M3 6.75C3 5.78 3.78 5 4.75 5h8.5C14.22 5 15 5.78 15 6.75v1.39l3.51-2.02A1 1 0 0 1 20 6.03v11.94a1 1 0 0 1-1.49.87L15 16.82v1.43c0 .97-.78 1.75-1.75 1.75h-8.5A1.75 1.75 0 0 1 3 18.25v-11.5Zm2-.25a.25.25 0 0 0-.25.25v11.5c0 .14.11.25.25.25h8.5c.14 0 .25-.11.25-.25v-11.5c0-.14-.11-.25-.25-.25h-8.5Z'/>
      <path fill='currentColor' d='M9 9.75a.75.75 0 0 1 1.13-.66l4 2.25a.75.75 0 0 1 0 1.32l-4 2.25A.75.75 0 0 1 9 14.25v-4.5Z'/>
    </svg>`
  )}`;

  // Prefer PNG assets; for 'video', fall back to inline SVG if PNG is missing
  const src = `/icons/neural-flow/${name}.png`;
  return (
    <img
      src={src}
      alt={`${name} icon`}
      width={size}
      height={size}
      className={cn('object-contain', className)}
      style={{ width: size, height: size }}
      onError={(e) => {
        const img = e.currentTarget as HTMLImageElement;
        if (name === 'video') {
          img.onerror = null;
          img.src = fallbackVideoSvg;
        } else {
          img.src = '/icons/neural-flow/content.png';
        }
      }}
    />
  );
};

export default NeuralFlowIcon;
