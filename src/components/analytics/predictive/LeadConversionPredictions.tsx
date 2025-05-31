
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface LeadPrediction {
  type: string;
  probability: number;
  expectedConversions: number;
}

interface LeadConversionPredictionsProps {
  leadPredictions: LeadPrediction[];
}

const LeadConversionPredictions: React.FC<LeadConversionPredictionsProps> = ({
  leadPredictions
}) => {
  return (
    <div>
      <h4 className="font-medium text-gray-900 mb-3">Lead Conversion Likelihood</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {leadPredictions.map((lead, index) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900">{lead.type}</span>
              <Badge variant={lead.probability > 70 ? 'default' : 'secondary'}>
                {lead.probability}%
              </Badge>
            </div>
            <Progress value={lead.probability} className="h-2 mb-3" />
            <div className="text-sm text-gray-600">
              Expected conversions: <span className="font-medium">{lead.expectedConversions}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeadConversionPredictions;
