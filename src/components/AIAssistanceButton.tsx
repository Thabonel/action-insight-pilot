import React from 'react';
import { Button } from '@/components/ui/button';

interface AIAssistanceButtonProps {
  type: 'key-messages' | 'target-personas';
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'default';
}

const AIAssistanceButton: React.FC<AIAssistanceButtonProps> = ({
  type,
  onClick,
  loading = false,
  disabled = false,
  size = 'sm'
}) => {
  const getButtonConfig = () => {
    switch (type) {
      case 'key-messages':
        return {
          text: 'Generate Ideas'
        };
      case 'target-personas':
        return {
          text: 'Suggest Personas'
        };
    }
  };

  const config = getButtonConfig();

  return (
    <Button
      type="button"
      variant="outline"
      size={size}
      onClick={onClick}
      disabled={disabled || loading}
      className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 hover:from-blue-100 hover:to-purple-100 text-blue-700 hover:text-blue-800 transition-all duration-200"
    >
      {loading ? 'Generating...' : config.text}
    </Button>
  );
};

export default AIAssistanceButton;