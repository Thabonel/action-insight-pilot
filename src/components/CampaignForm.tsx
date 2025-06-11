
import React from 'react';
import { Loader2 } from 'lucide-react';

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
  loading?: boolean;
}

const CampaignForm: React.FC<CampaignFormProps> = ({
  newCampaign,
  setNewCampaign,
  onSubmit,
  onCancel,
  loading = false
}) => {
  return (
    <div className="mb-8 bg-white shadow-sm rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-slate-900 mb-4">Create New Campaign</h3>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Campaign Name *
          </label>
          <input
            type="text"
            value={newCampaign.name}
            onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={loading}
            placeholder="Enter campaign name"
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
            disabled={loading}
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
            disabled={loading}
            placeholder="Describe your campaign objectives..."
          />
        </div>
        
        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={loading || !newCampaign.name.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>{loading ? 'Creating Campaign...' : 'Create Campaign'}</span>
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-6 py-2 border border-gray-300 text-slate-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CampaignForm;
