
import React from 'react';

interface EmptyStateProps {
  onCreateCampaign: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onCreateCampaign }) => {
  return (
    <div className="col-span-full text-center py-12">
      <h3 className="text-lg font-medium text-slate-900 mb-2">No campaigns yet</h3>
      <p className="text-slate-600 mb-4">Create your first campaign to get started</p>
      <button
        onClick={onCreateCampaign}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
      >
        Create Your First Campaign
      </button>
    </div>
  );
};

export default EmptyState;
