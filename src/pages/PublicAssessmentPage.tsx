import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, ArrowRight, ArrowLeft, Mail, User, Phone } from 'lucide-react';
import type { AssessmentTemplate, AssessmentResponse } from '@/types/assessment';

/**
 * Public Assessment Page - No authentication required
 *
 * Flow:
 * 1. Landing Page (hook + benefits + CTA)
 * 2. Questions (15 questions with progress bar)
 * 3. Email Capture (required to see results)
 * 4. Results Display (score + insights + personalized CTA)
 */
export default function PublicAssessmentPage() {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const [searchParams] = useSearchParams();

  // State
  const [loading, setLoading] = useState(true);
  const [assessment, setAssessment] = useState<AssessmentTemplate | null>(null);
  const [currentStep, setCurrentStep] = useState<'landing' | 'questions' | 'email' | 'results'>('landing');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number | string[]>>({});
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [result, setResult] = useState<AssessmentResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Track UTM parameters
  const utmData = {
    utm_source: searchParams.get('utm_source') || undefined,
    utm_medium: searchParams.get('utm_medium') || undefined,
    utm_campaign: searchParams.get('utm_campaign') || undefined,
    utm_content: searchParams.get('utm_content') || undefined,
    utm_term: searchParams.get('utm_term') || undefined,
  };

  // Load assessment
  useEffect(() => {
    loadAssessment();
  }, [assessmentId]);

  const loadAssessment = async () => {
    if (!assessmentId) {
      setError('Assessment ID is required');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/assessments/public/${assessmentId}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError('Assessment not found or not published');
        } else {
          setError('Failed to load assessment');
        }
        return;
      }

      const data = await response.json();

      if (data.success && data.assessment) {
        setAssessment(data.assessment);
      } else {
        setError('Invalid assessment data');
      }
    } catch (err) {
      console.error('Error loading assessment:', err);
      setError('Failed to load assessment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startAssessment = () => {
    setStartedAt(new Date().toISOString());
    setCurrentStep('questions');
  };

  const handleAnswer = (questionId: string, value: string | number | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const nextQuestion = () => {
    if (!assessment) return;

    if (currentQuestionIndex < assessment.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // All questions answered - go to email capture
      setCurrentStep('email');
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const submitAssessment = async () => {
    if (!email || !assessment) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/assessments/public/${assessmentId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name: name || undefined,
          phone: phone || undefined,
          answers,
          ...utmData,
          device_type: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
          referrer: document.referrer || undefined,
          started_at: startedAt,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit assessment');
      }

      setResult(data);
      setCurrentStep('results');
    } catch (err) {
      console.error('Error submitting assessment:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit your responses. Please try again.';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading assessment...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error && !assessment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="text-red-500 text-5xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Assessment Not Available</h2>
              <p className="text-gray-600">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!assessment) return null;

  const currentQuestion = assessment.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / assessment.questions.length) * 100;
  const currentAnswer = answers[currentQuestion?.id];
  const canProceed = currentAnswer !== undefined && currentAnswer !== '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Landing Page */}
        {currentStep === 'landing' && (
          <Card className="shadow-xl">
            <CardHeader className="text-center space-y-4 pb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                {assessment.headline}
              </h1>
              <p className="text-xl text-gray-600">
                {assessment.subheadline}
              </p>
            </CardHeader>

            <CardContent className="space-y-8 pb-10">
              {/* Benefits */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  You'll discover:
                </h3>
                <div className="space-y-3">
                  {assessment.questions && (
                    <>
                      <div className="flex items-start">
                        <CheckCircle className="h-6 w-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                        <p className="text-gray-700">Your current score and where you stand</p>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="h-6 w-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                        <p className="text-gray-700">3 key insights personalized to your situation</p>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle className="h-6 w-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                        <p className="text-gray-700">Specific next steps to improve your results</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Quick stats */}
              <div className="flex justify-center items-center space-x-8 text-center">
                <div>
                  <div className="text-3xl font-bold text-blue-600">{assessment.questions.length}</div>
                  <div className="text-sm text-gray-600">Questions</div>
                </div>
                <div className="h-12 w-px bg-gray-300"></div>
                <div>
                  <div className="text-3xl font-bold text-blue-600">3-5</div>
                  <div className="text-sm text-gray-600">Minutes</div>
                </div>
                <div className="h-12 w-px bg-gray-300"></div>
                <div>
                  <div className="text-3xl font-bold text-blue-600">Free</div>
                  <div className="text-sm text-gray-600">No Cost</div>
                </div>
              </div>

              {/* CTA */}
              <div className="text-center">
                <Button
                  onClick={startAssessment}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-6 text-lg rounded-full shadow-lg transform transition hover:scale-105"
                >
                  Start Assessment
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <p className="mt-4 text-sm text-gray-500">
                  Takes 3-5 minutes • Get instant results
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Questions */}
        {currentStep === 'questions' && currentQuestion && (
          <Card className="shadow-xl">
            {/* Progress bar */}
            <div className="px-6 pt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Question {currentQuestionIndex + 1} of {assessment.questions.length}
                </span>
                <span className="text-sm font-medium text-blue-600">
                  {Math.round(progress)}% Complete
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <CardContent className="pt-8 pb-8 space-y-6">
              {/* Question */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {currentQuestion.text}
                </h2>

                {/* Answer options */}
                <div className="space-y-3">
                  {currentQuestion.type === 'text' ? (
                    <Input
                      value={currentAnswer || ''}
                      onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                      placeholder={currentQuestion.placeholder || 'Type your answer...'}
                      className="text-lg p-6"
                    />
                  ) : (
                    currentQuestion.options?.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleAnswer(currentQuestion.id, option.value)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          currentAnswer === option.value
                            ? 'border-blue-600 bg-blue-50 shadow-md'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${
                            currentAnswer === option.value
                              ? 'border-blue-600 bg-blue-600'
                              : 'border-gray-300'
                          }`}>
                            {currentAnswer === option.value && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                          <span className="text-lg text-gray-900">{option.label}</span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between pt-4">
                <Button
                  onClick={previousQuestion}
                  variant="outline"
                  disabled={currentQuestionIndex === 0}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>

                <Button
                  onClick={nextQuestion}
                  disabled={!canProceed}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {currentQuestionIndex === assessment.questions.length - 1 ? 'See Results' : 'Next'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Email Capture */}
        {currentStep === 'email' && (
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Get Your Results</h2>
              <p className="text-gray-600 mt-2">
                Enter your email to see your personalized results and recommendations
              </p>
            </CardHeader>

            <CardContent className="space-y-4 pb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="pl-10 text-lg p-6"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name (optional)
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="pl-10 text-lg p-6"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone (optional)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="pl-10 text-lg p-6"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <Button
                onClick={submitAssessment}
                disabled={!email || submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg rounded-lg"
              >
                {submitting ? 'Submitting...' : 'Get My Results'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <p className="text-xs text-gray-500 text-center">
                We respect your privacy. Your email will never be shared.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {currentStep === 'results' && result && (
          <Card className="shadow-xl">
            <CardHeader className="text-center space-y-4 pb-8">
              <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                {result.score}
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  {result.result.label}
                </h2>
                <p className="text-xl text-gray-600 mt-2">
                  You scored {result.score} out of 100
                </p>
              </div>
            </CardHeader>

            <CardContent className="space-y-8 pb-10">
              {/* Message */}
              <div className="bg-blue-50 rounded-lg p-6 text-center">
                <p className="text-lg text-gray-800">
                  {result.result.message}
                </p>
              </div>

              {/* Insights */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Your Personalized Insights:
                </h3>
                <div className="space-y-4">
                  {result.result.insights.map((insight, index) => (
                    <div key={index} className="flex items-start bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold mr-4">
                        {index + 1}
                      </div>
                      <p className="text-gray-800 pt-1">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg p-8 text-center text-white">
                <h3 className="text-2xl font-bold mb-4">Ready for the Next Step?</h3>
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg rounded-full shadow-lg transform transition hover:scale-105"
                >
                  {result.result.cta.text}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>

              {/* Email confirmation */}
              <div className="text-center text-sm text-gray-600">
                <Mail className="h-5 w-5 inline mr-2" />
                We've sent your detailed results to <span className="font-medium">{email}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
