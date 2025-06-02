
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ProjectDetailsData {
  description: string;
  scope: string;
  services: string[];
  duration: number;
  features: string[];
}

interface ProjectDetailsProps {
  projectDetails: ProjectDetailsData;
  onInputChange: (field: string, value: string | number) => void;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({
  projectDetails,
  onInputChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Details</CardTitle>
        <CardDescription>Describe the project requirements and scope</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="description">Project Description</Label>
          <Textarea
            id="description"
            value={projectDetails.description}
            onChange={(e) => onInputChange('description', e.target.value)}
            placeholder="Describe the project requirements..."
            rows={3}
          />
        </div>
        <div>
          <Label htmlFor="scope">Project Scope</Label>
          <Textarea
            id="scope"
            value={projectDetails.scope}
            onChange={(e) => onInputChange('scope', e.target.value)}
            placeholder="Define the project scope..."
            rows={2}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="duration">Duration (weeks)</Label>
            <Input
              id="duration"
              type="number"
              value={projectDetails.duration}
              onChange={(e) => onInputChange('duration', parseInt(e.target.value))}
              min="1"
              max="52"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectDetails;
