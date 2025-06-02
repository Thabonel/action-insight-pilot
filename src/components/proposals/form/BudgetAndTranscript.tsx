
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface BudgetRange {
  min: number;
  max: number;
}

interface BudgetAndTranscriptProps {
  budgetRange: BudgetRange;
  callTranscript: string;
  onBudgetChange: (field: 'min' | 'max', value: number) => void;
  onTranscriptChange: (value: string) => void;
}

const BudgetAndTranscript: React.FC<BudgetAndTranscriptProps> = ({
  budgetRange,
  callTranscript,
  onBudgetChange,
  onTranscriptChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget & Additional Information</CardTitle>
        <CardDescription>Set budget range and add call transcript if available</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="min_budget">Minimum Budget ($)</Label>
            <Input
              id="min_budget"
              type="number"
              value={budgetRange.min}
              onChange={(e) => onBudgetChange('min', parseInt(e.target.value))}
              min="0"
            />
          </div>
          <div>
            <Label htmlFor="max_budget">Maximum Budget ($)</Label>
            <Input
              id="max_budget"
              type="number"
              value={budgetRange.max}
              onChange={(e) => onBudgetChange('max', parseInt(e.target.value))}
              min="0"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="call_transcript">Call Transcript (Optional)</Label>
          <Textarea
            id="call_transcript"
            value={callTranscript}
            onChange={(e) => onTranscriptChange(e.target.value)}
            placeholder="Paste call transcript here to help AI generate more accurate proposals..."
            rows={4}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetAndTranscript;
