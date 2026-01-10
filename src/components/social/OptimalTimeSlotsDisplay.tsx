
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TimeSlot {
  time: string;
  prediction: string;
  score: number;
  posts: number;
}

interface OptimalTimeSlotsDisplayProps {
  timeSlots: TimeSlot[];
}

const OptimalTimeSlotsDisplay: React.FC<OptimalTimeSlotsDisplayProps> = ({ timeSlots }) => {
  const getPredictionColor = (prediction: string) => {
    switch (prediction) {
      case 'Excellent': return 'bg-green-100 text-green-800';
      case 'High': return 'bg-blue-100 text-blue-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Optimal Posting Times Today</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {timeSlots.map((slot, index) => (
            <div
              key={index}
              className="p-4 border rounded-lg hover:border-blue-500 cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{slot.time}</span>
                <Badge className={getPredictionColor(slot.prediction)}>
                  {slot.prediction}
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Predicted score:</span>
                  <span className="font-medium">{slot.score}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Your posts at this time:</span>
                  <span className="text-gray-800">{slot.posts}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default OptimalTimeSlotsDisplay;
