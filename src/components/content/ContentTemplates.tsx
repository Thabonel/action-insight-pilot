
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { behaviorTracker } from '@/lib/behavior-tracker';
import {
  FileText,
  Star,
  TrendingUp,
  Target,
  Zap,
  Copy,
  Eye,
  Clock
} from 'lucide-react';

interface Template {
  id: number;
  name: string;
  category: string;
  description: string;
  successRate: number;
  avgEngagement: number;
  estimatedTime: string;
  uses: number;
  preview: string;
  tags: string[];
}

const ContentTemplates: React.FC = () => {
  const [templates] = useState<Template[]>([
    {
      id: 1,
      name: "Ultimate How-To Guide Template",
      category: "How-to Guide",
      description: "Based on your most successful how-to content structure",
      successRate: 94,
      avgEngagement: 8.2,
      estimatedTime: "45 mins",
      uses: 12,
      preview: "# How to [Action/Goal]\n\n## What You'll Learn\n- Key benefit 1\n- Key benefit 2\n\n## Step-by-Step Process\n\n### Step 1: [Clear Action]\nDetailed explanation with actionable insights...",
      tags: ["high-converting", "your-style", "proven"]
    },
    {
      id: 2,
      name: "Results-Driven List Article",
      category: "List Article", 
      description: "Your top-performing list format with proven engagement",
      successRate: 87,
      avgEngagement: 7.1,
      estimatedTime: "30 mins",
      uses: 8,
      preview: "# X [Topic] That [Outcome]\n\n## Quick Overview\nWhy this matters to your audience...\n\n## 1. [First Point]\nValue-packed insight with real examples...",
      tags: ["quick-wins", "engaging", "social-friendly"]
    },
    {
      id: 3,
      name: "Authority Case Study Format",
      category: "Case Study",
      description: "Template based on your highest-converting case studies",
      successRate: 92,
      avgEngagement: 9.1,
      estimatedTime: "60 mins", 
      uses: 6,
      preview: "# How [Company] Achieved [Specific Result]\n\n## The Challenge\nProblem description...\n\n## The Solution\nStrategy implementation...\n\n## The Results\nSpecific metrics and outcomes...",
      tags: ["authority-building", "conversion-focused", "detailed"]
    },
    {
      id: 4,
      name: "Quick Win Tutorial",
      category: "Tutorial",
      description: "Fast-to-create format for immediate value delivery",
      successRate: 79,
      avgEngagement: 6.8,
      estimatedTime: "20 mins",
      uses: 15,
      preview: "# Quick Tutorial: [Specific Skill]\n\n## What You Need\n- Tool/resource list\n\n## 5-Minute Setup\nStep-by-step with screenshots...",
      tags: ["fast-creation", "beginner-friendly", "actionable"]
    }
  ]);

  const [industryTemplates] = useState([
    { name: "SaaS Product Launch Announcement", category: "Announcement", score: 85 },
    { name: "B2B Lead Magnet Content", category: "Lead Generation", score: 88 },
    { name: "Marketing ROI Analysis", category: "Analysis", score: 82 },
    { name: "Customer Success Story", category: "Social Proof", score: 90 }
  ]);

  const handleTemplateUse = (template: Template) => {
    behaviorTracker.trackAction('feature_use', 'content_template_use', {
      templateId: template.id,
      templateName: template.name,
      category: template.category
    });
  };

  const handleTemplatePreview = (template: Template) => {
    behaviorTracker.trackAction('feature_use', 'content_template_preview', {
      templateId: template.id,
      templateName: template.name
    });
  };

  return (
    <div className="space-y-6">
      {/* Personalized Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-yellow-600" />
            <span>Your High-Performing Templates</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="border border-gray-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">
                        {template.name}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {template.category}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">
                        {template.successRate}%
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{template.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Avg Engagement:</span>
                      <span className="font-medium ml-1">{template.avgEngagement}%</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Est. Time:</span>
                      <span className="font-medium ml-1">{template.estimatedTime}</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded p-3">
                    <h4 className="text-xs font-medium text-gray-700 mb-2">Template Preview:</h4>
                    <code className="text-xs text-gray-600 whitespace-pre-wrap">
                      {template.preview}
                    </code>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {template.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-gray-500">
                      Used {template.uses} times
                    </span>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTemplatePreview(template)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleTemplateUse(template)}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Use Template
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Industry Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-600" />
              <span>Industry-Specific Templates</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {industryTemplates.map((template, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{template.name}</p>
                  <p className="text-xs text-gray-600">{template.category}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{template.score}%</Badge>
                  <Button variant="outline" size="sm">Use</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-purple-600" />
              <span>Quick Creation Templates</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 gap-3">
              <Button variant="outline" className="justify-start h-auto py-3">
                <div className="text-left">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">5-Minute Social Post</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Quick engagement content</p>
                </div>
              </Button>
              
              <Button variant="outline" className="justify-start h-auto py-3">
                <div className="text-left">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Email Newsletter Template</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Weekly update format</p>
                </div>
              </Button>
              
              <Button variant="outline" className="justify-start h-auto py-3">
                <div className="text-left">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Quick Tip Format</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Bite-sized value content</p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Template Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Template Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">94%</p>
              <p className="text-sm text-gray-600">Avg Success Rate</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">7.8%</p>
              <p className="text-sm text-gray-600">Avg Engagement</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">35</p>
              <p className="text-sm text-gray-600">Templates Used</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">40min</p>
              <p className="text-sm text-gray-600">Avg Creation Time</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentTemplates;
