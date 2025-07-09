import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Target, Loader2 } from 'lucide-react';

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
          icon: Sparkles,
          text: 'Generate Ideas',
          emoji: '✨'
        };
      case 'target-personas':
        return {
          icon: Target,
          text: 'Suggest Personas',
          emoji: '🎯'
        };
    }
  };

  const config = getButtonConfig();
  const IconComponent = config.icon;

  return (
    <Button
      type="button"
      variant="outline"
      size={size}
      onClick={onClick}
      disabled={disabled || loading}
      className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 hover:from-blue-100 hover:to-purple-100 text-blue-700 hover:text-blue-800 transition-all duration-200"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <IconComponent className="h-4 w-4 mr-2" />
      )}
      <span className="mr-1">{config.emoji}</span>
      {loading ? 'Generating...' : config.text}
    </Button>
  );
};

export default AIAssistanceButton;