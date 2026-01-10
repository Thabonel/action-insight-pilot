
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

export interface PublishingWorkflowProps {
  content: string;
  title: string;
  onPublish: () => void;
}

export const PublishingWorkflow: React.FC<PublishingWorkflowProps> = ({
  content,
  title,
  onPublish
}) => {
  const [checklist, setChecklist] = useState({
    content_quality: false,
    seo_optimization: false,
    accessibility_compliance: false,
    legal_compliance: false,
    featured_image: false,
    internal_links: false,
    call_to_action: false,
    social_promotion: false
  });

  const [qualityScore] = useState({
    overall_score: 87,
    seo_score: 92,
    readability_score: 85,
    accessibility_score: 78,
    legal_compliance_score: 95
  });

  const { toast } = useToast();

  const checklistItems = [
    { key: 'content_quality', label: 'Content Quality Check' },
    { key: 'seo_optimization', label: 'SEO Optimization' },
    { key: 'accessibility_compliance', label: 'Accessibility Compliance' },
    { key: 'legal_compliance', label: 'Legal Compliance' },
    { key: 'featured_image', label: 'Featured Image Added' },
    { key: 'internal_links', label: 'Internal Links Added' },
    { key: 'call_to_action', label: 'Call-to-Action Included' },
    { key: 'social_promotion', label: 'Social Promotion Ready' }
  ];

  const handleChecklistChange = (key: string, checked: boolean) => {
    setChecklist(prev => ({ ...prev, [key]: checked }));
  };

  const allChecked = Object.values(checklist).every(Boolean);

  return (
    <div className="space-y-6">
      {/* Quality Scores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Content Quality Assessment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Overall Score</span>
                <Badge variant={qualityScore.overall_score >= 80 ? "default" : "destructive"}>
                  {qualityScore.overall_score}%
                </Badge>
              </div>
              <Progress value={qualityScore.overall_score} />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">SEO Score</span>
                <Badge variant={qualityScore.seo_score >= 80 ? "default" : "destructive"}>
                  {qualityScore.seo_score}%
                </Badge>
              </div>
              <Progress value={qualityScore.seo_score} />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Readability</span>
                <Badge variant={qualityScore.readability_score >= 80 ? "default" : "destructive"}>
                  {qualityScore.readability_score}%
                </Badge>
              </div>
              <Progress value={qualityScore.readability_score} />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Accessibility</span>
                <Badge variant={qualityScore.accessibility_score >= 80 ? "default" : "destructive"}>
                  {qualityScore.accessibility_score}%
                </Badge>
              </div>
              <Progress value={qualityScore.accessibility_score} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pre-Publication Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Pre-Publication Checklist
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {checklistItems.map((item) => {
              return (
                <div key={item.key} className="flex items-center space-x-3">
                  <Checkbox
                    checked={checklist[item.key as keyof typeof checklist]}
                    onCheckedChange={(checked) =>
                      handleChecklistChange(item.key, checked as boolean)
                    }
                  />
                  <span className="text-sm">{item.label}</span>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t">
            <Button 
              onClick={onPublish}
              disabled={!allChecked}
              className="w-full"
            >
              {allChecked ? 'Ready to Publish' : 'Complete Checklist to Publish'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
