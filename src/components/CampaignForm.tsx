
import React from 'react';

interface CampaignFormProps {
  newCampaign: {
    name: string;
    type: string;
    status: string;
    description: string;
  };
  setNewCampaign: React.Dispatch<React.SetStateAction<{
    name: string;
    type: string;
    status: string;
    description: string;
  }>>;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const CampaignForm: React.FC<CampaignFormProps> = ({
  newCampaign,
  setNewCampaign,
  onSubmit,
  onCancel
}) => {
  return (
    <div className="mb-8 bg-white shadow-sm rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-slate-900 mb-4">Create New Campaign</h3>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Campaign Name
          </label>
          <input
            type="text"
            value={newCampaign.name}
            onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Campaign Type
          </label>
          <select
            value={newCampaign.type}
            onChange={(e) => setNewCampaign(prev => ({ ...prev, type: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="email">Email</option>
            <option value="social">Social Media</option>
            <option value="content">Content</option>
            <option value="mixed">Mixed</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Description
          </label>
          <textarea
            value={newCampaign.description}
            onChange={(e) => setNewCampaign(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex space-x-3">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Create Campaign
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-slate-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CampaignForm;
