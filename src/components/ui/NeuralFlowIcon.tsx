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
  return (
    <img
      src={`/icons/neural-flow/${name}.png`}
      alt={`${name} icon`}
      width={size}
      height={size}
      className={cn('object-contain', className)}
      style={{ width: size, height: size }}
    />
  );
};

export default NeuralFlowIcon;
