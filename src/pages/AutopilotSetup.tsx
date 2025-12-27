import React from 'react';
import { useNavigate } from 'react-router-dom';
import AutopilotSetupWizard from '@/components/autopilot/AutopilotSetupWizard';
import { HelpButton } from '@/components/common/HelpButton';
import { FloatingHelpButton } from '@/components/common/FloatingHelpButton';
import { helpContent } from '@/config/helpContent';

const AutopilotSetup: React.FC = () => {
  const navigate = useNavigate();

  const handleComplete = () => {
    // Navigate to simple dashboard after setup
    navigate('/app/autopilot');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <HelpButton
        title={helpContent.autopilot.title}
        content={helpContent.autopilot.content}
      />
      <AutopilotSetupWizard onComplete={handleComplete} />
      <FloatingHelpButton helpSection="autopilot" />
    </div>
  );
};

export default AutopilotSetup;
