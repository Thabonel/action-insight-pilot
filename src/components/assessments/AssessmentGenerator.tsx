import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import type { AssessmentTemplate, AssessmentQuestion } from '@/types/assessment';

interface AssessmentGeneratorProps {
  campaignId?: string;
  onAssessmentCreated?: (assessmentId: string) => void;
}

/**
 * AssessmentGenerator Component
 *
 * Flow:
 * 1. User enters business info
 * 2. AI generates 15-question assessment
 * 3. User reviews and edits questions
 * 4. User previews assessment
 * 5. User publishes assessment
 */
export default function AssessmentGenerator({ campaignId, onAssessmentCreated }: AssessmentGeneratorProps) {
  const { toast } = useToast();

  // Generation form state
  const [businessType, setBusinessType] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [productOffer, setProductOffer] = useState('');
  const [assessmentGoal, setAssessmentGoal] = useState('');

  // Generation state
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<AssessmentTemplate | null>(null);
  const [editing, setEditing] = useState(false);
  const [editedQuestions, setEditedQuestions] = useState<AssessmentQuestion[]>([]);
  const [editedHeadline, setEditedHeadline] = useState('');
  const [editedSubheadline, setEditedSubheadline] = useState('');
  const [publishing, setPublishing] = useState(false);

  const generateAssessment = async () => {
    if (!businessType || !targetAudience || !productOffer || !assessmentGoal) {
      toast({
        title: "Missing Information",
        description: "Please fill out all fields",
        variant: "destructive"
      });
      return;
    }

    setGenerating(true);

    try {
      const response = await fetch('/api/assessments/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        },
        body: JSON.stringify({
          business_type: businessType,
          target_audience: targetAudience,
          product_offer: productOffer,
          assessment_goal: assessmentGoal,
          campaign_id: campaignId
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate assessment');
      }

      // Set generated assessment
      const assessment = {
        ...data.assessment,
        id: data.assessment_id,
        status: 'draft' as const
      };

      setGenerated(assessment);
      setEditedQuestions(assessment.questions || []);
      setEditedHeadline(assessment.landing_page?.headline || '');
      setEditedSubheadline(assessment.landing_page?.subheadline || '');

      toast({
        title: "Assessment Generated!",
        description: `Created ${assessment.questions?.length || 0} questions. Review and edit before publishing.`
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to generate assessment. Please try again.";
      console.error('Error generating assessment:', error);
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const updateQuestion = (index: number, field: keyof AssessmentQuestion, value: string | AssessmentQuestion['options']) => {
    const updated = [...editedQuestions];
    updated[index] = { ...updated[index], [field]: value };
    setEditedQuestions(updated);
  };

  const deleteQuestion = (index: number) => {
    const updated = editedQuestions.filter((_, i) => i !== index);
    setEditedQuestions(updated);
  };

  const addQuestion = () => {
    setEditedQuestions([
      ...editedQuestions,
      {
        id: `q${editedQuestions.length + 1}`,
        text: 'New question?',
        type: 'multiple_choice',
        category: 'best_practice',
        options: [
          { label: 'Option 1', value: 'opt1', points: 10 },
          { label: 'Option 2', value: 'opt2', points: 0 }
        ]
      }
    ]);
  };

  const publishAssessment = async () => {
    if (!generated) return;

    setPublishing(true);

    try {
      const response = await fetch(`/api/assessments/${generated.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        },
        body: JSON.stringify({
          headline: editedHeadline,
          subheadline: editedSubheadline,
          questions: editedQuestions,
          status: 'published'
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to publish assessment');
      }

      toast({
        title: "Assessment Published!",
        description: "Your assessment is now live and ready to capture leads.",
      });

      if (onAssessmentCreated) {
        onAssessmentCreated(generated.id);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to publish assessment.";
      console.error('Error publishing assessment:', error);
      toast({
        title: "Publishing Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setPublishing(false);
    }
  };

  const copyAssessmentURL = () => {
    if (!generated) return;
    const url = `${window.location.origin}/a/${generated.id}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "URL Copied!",
      description: "Assessment URL copied to clipboard"
    });
  };

  return (
    <div className="space-y-6">

      {/* Generation Form */}
      {!generated && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              Generate High-Converting Assessment
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              AI will create a 15-question assessment following the proven methodology for 20-40% conversion rates
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <Label>Business Type *</Label>
              <Input
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                placeholder="e.g., Marketing Agency, SaaS Product, Coaching Business"
              />
            </div>

            <div>
              <Label>Target Audience *</Label>
              <Textarea
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="Describe your ideal customer: demographics, pain points, goals..."
                rows={3}
              />
            </div>

            <div>
              <Label>Product/Service Offer *</Label>
              <Textarea
                value={productOffer}
                onChange={(e) => setProductOffer(e.target.value)}
                placeholder="What are you selling? What problem does it solve?"
                rows={3}
              />
            </div>

            <div>
              <Label>Assessment Goal *</Label>
              <Input
                value={assessmentGoal}
                onChange={(e) => setAssessmentGoal(e.target.value)}
                placeholder="e.g., Qualify leads for consultation, Identify marketing gaps, Assess fitness level"
              />
            </div>

            <Button
              onClick={generateAssessment}
              disabled={generating}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              {generating ? 'Generating Assessment...' : 'Generate Assessment'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Review & Edit */}
      {generated && (
        <div className="space-y-6">

          {/* Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Review Your Assessment</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Edit questions, preview the experience, then publish
                  </p>
                </div>
                <Badge variant="outline" className="text-orange-600 border-orange-300">
                  Draft
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Landing Page Content */}
              <div>
                <Label>Landing Page Headline</Label>
                {editing ? (
                  <Input
                    value={editedHeadline}
                    onChange={(e) => setEditedHeadline(e.target.value)}
                    className="text-lg"
                  />
                ) : (
                  <p className="text-lg font-semibold text-gray-900 mt-1">{editedHeadline}</p>
                )}
              </div>

              <div>
                <Label>Subheadline</Label>
                {editing ? (
                  <Textarea
                    value={editedSubheadline}
                    onChange={(e) => setEditedSubheadline(e.target.value)}
                    rows={2}
                  />
                ) : (
                  <p className="text-gray-700 mt-1">{editedSubheadline}</p>
                )}
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={() => setEditing(!editing)}
                  variant="outline"
                >
                  {editing ? 'Done Editing' : 'Edit Questions'}
                </Button>

                <Button
                  onClick={copyAssessmentURL}
                  variant="outline"
                >
                  Copy URL
                </Button>

                <Button
                  onClick={() => window.open(`/a/${generated.id}`, '_blank')}
                  variant="outline"
                >
                  Preview
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Questions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Questions ({editedQuestions.length})</CardTitle>
                {editing && (
                  <Button onClick={addQuestion} variant="outline" size="sm">
                    Add Question
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {editedQuestions.map((question, index) => (
                <Card key={question.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">Q{index + 1}</Badge>
                        <Badge variant="secondary">{question.category}</Badge>
                      </div>
                      {editing && (
                        <Button
                          onClick={() => deleteQuestion(index)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          Delete
                        </Button>
                      )}
                    </div>

                    {editing ? (
                      <>
                        <Textarea
                          value={question.text}
                          onChange={(e) => updateQuestion(index, 'text', e.target.value)}
                          className="mb-3"
                          rows={2}
                        />

                        {/* Options */}
                        {question.options && (
                          <div className="space-y-2 ml-4">
                            {question.options.map((option, optIndex) => (
                              <div key={optIndex} className="flex items-center space-x-2">
                                <Input
                                  value={option.label}
                                  onChange={(e) => {
                                    const updated = [...editedQuestions];
                                    updated[index].options![optIndex].label = e.target.value;
                                    setEditedQuestions(updated);
                                  }}
                                  className="flex-1"
                                  placeholder="Option text"
                                />
                                <Input
                                  type="number"
                                  value={option.points || 0}
                                  onChange={(e) => {
                                    const updated = [...editedQuestions];
                                    updated[index].options![optIndex].points = parseInt(e.target.value);
                                    setEditedQuestions(updated);
                                  }}
                                  className="w-20"
                                  placeholder="Points"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="text-gray-900 font-medium mb-3">{question.text}</p>

                        {question.options && (
                          <div className="space-y-2 ml-4">
                            {question.options.map((option, optIndex) => (
                              <div key={optIndex} className="flex items-center justify-between text-sm">
                                <span className="text-gray-700">• {option.label}</span>
                                <span className="text-gray-500">{option.points} pts</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Publish */}
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Ready to Publish?</h3>
                  <p className="text-sm text-gray-600">
                    Your assessment will be live at: <code className="bg-white px-2 py-1 rounded">/a/{generated.id}</code>
                  </p>
                </div>

                <Button
                  onClick={publishAssessment}
                  disabled={publishing}
                  className="bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  {publishing ? 'Publishing...' : 'Publish Assessment'}
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>
      )}

    </div>
  );
}
