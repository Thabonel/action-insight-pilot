import React from 'react';
import { useNavigate } from 'react-router-dom';
import AutopilotSetupWizard from '@/components/autopilot/AutopilotSetupWizard';

const AutopilotSetup: React.FC = () => {
  const navigate = useNavigate();

  const handleComplete = () => {
    // Navigate to simple dashboard after setup
    navigate('/app/autopilot');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <AutopilotSetupWizard onComplete={handleComplete} />
    </div>
  );
};

export default AutopilotSetup;
