
import React from 'react';

const SecurityBanner: React.FC = () => {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
      <div>
        <h4 className="font-semibold text-green-900">Secure and Encrypted</h4>
        <p className="text-sm text-green-800">
          Your API keys are encrypted with AES-GCM and only accessible to you. We never store them in plain text.
        </p>
      </div>
    </div>
  );
};

export default SecurityBanner;
