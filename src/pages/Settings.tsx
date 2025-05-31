
import React, { useState, useEffect } from 'react';
import { behaviorTracker } from '@/lib/behavior-tracker';
import { useAuth } from '@/contexts/AuthContext';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState(behaviorTracker.getPreferences());
  const [insights] = useState(behaviorTracker.getInsights());

  useEffect(() => {
    behaviorTracker.trackAction('navigation', 'settings', { section: 'main' });
  }, []);

  const handlePreferenceChange = (key: string, value: any) => {
    const updates = { [key]: value };
    behaviorTracker.updatePreferences(updates);
    setPreferences(prev => ({ ...prev, ...updates }));
    behaviorTracker.trackAction('execution', 'settings', { 
      action: 'preference_update', 
      preference: key, 
      value 
    });
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Settings & Preferences</h1>
        <p className="mt-2 text-slate-600">
          Customize your AI marketing experience and review your behavior insights
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Preferences */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-slate-900 mb-6">AI Learning Preferences</h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Content Preference
              </label>
              <div className="space-y-2">
                {['visual', 'text', 'mixed'].map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="visualVsText"
                      value={option}
                      checked={preferences.visualVsText === option}
                      onChange={(e) => handlePreferenceChange('visualVsText', e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-slate-700 capitalize">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Workflow Style
              </label>
              <div className="space-y-2">
                {['quick', 'detailed', 'balanced'].map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="quickVsDetailed"
                      value={option}
                      checked={preferences.quickVsDetailed === option}
                      onChange={(e) => handlePreferenceChange('quickVsDetailed', e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-slate-700 capitalize">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Working Hours
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Start Hour</label>
                  <select
                    value={preferences.workingHours.start}
                    onChange={(e) => handlePreferenceChange('workingHours', {
                      ...preferences.workingHours,
                      start: parseInt(e.target.value)
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>{i}:00</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">End Hour</label>
                  <select
                    value={preferences.workingHours.end}
                    onChange={(e) => handlePreferenceChange('workingHours', {
                      ...preferences.workingHours,
                      end: parseInt(e.target.value)
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>{i}:00</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Behavior Insights */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-slate-900 mb-6">Your Behavior Insights</h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-2">Most Used Features</h4>
              <div className="space-y-2">
                {insights.topFeatures.slice(0, 3).map((feature, index) => (
                  <div key={feature} className="flex justify-between items-center">
                    <span className="text-sm text-slate-600 capitalize">{feature}</span>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${100 - (index * 25)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-2">Peak Productivity Hours</h4>
              <div className="flex flex-wrap gap-2">
                {preferences.peakProductivityHours.slice(0, 5).map((hour) => (
                  <span 
                    key={hour}
                    className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                  >
                    {hour}:00
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-2">Success Patterns</h4>
              <div className="space-y-2">
                {Object.entries(preferences.successPatterns)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 3)
                  .map(([feature, count]) => (
                    <div key={feature} className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 capitalize">{feature}</span>
                      <span className="text-sm font-medium text-green-600">{count} successes</span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{insights.productivityScore}%</div>
                <div className="text-sm text-slate-600">Productivity Score</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className="mt-8 bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-slate-900 mb-6">Account Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <div className="mt-1 text-sm text-slate-600">{user?.email}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Account Created</label>
            <div className="mt-1 text-sm text-slate-600">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
