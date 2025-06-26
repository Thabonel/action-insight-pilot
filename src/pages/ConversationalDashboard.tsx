
import React, { useState, useEffect } from 'react';
import { useConversationalDashboard } from '@/hooks/useConversationalDashboard';
import ConversationalChatInterface from '@/components/dashboard/ConversationalChatInterface';
import QuickActionGrid from '@/components/dashboard/QuickActionGrid';
import SystemOverviewCards from '@/components/dashboard/SystemOverviewCards';
import AIGreeting from '@/components/dashboard/AIGreeting';
import LearningInsights from '@/components/dashboard/LearningInsights';
import { RealInsights } from '@/types/insights';
import { CAMPAIGN_QUESTIONS, CampaignQuestion } from '@/lib/campaign-questions';

const ConversationalDashboard: React.FC = () => {
  const {
    query,
    setQuery,
    chatHistory,
    isProcessing,
    insights: rawInsights,
    user,
    handleQuerySubmit,
    handleSuggestionClick
  } = useConversationalDashboard();

  // Campaign creation flow state management
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [collectedAnswers, setCollectedAnswers] = useState<Record<string, any>>({});
  const [campaignCreationStatus, setCampaignCreationStatus] = useState<'idle' | 'in_progress' | 'creating' | 'completed' | 'error'>('idle');
  const [isCampaignFlow, setIsCampaignFlow] = useState<boolean>(false);

  // Function to start campaign creation flow
  const startCampaignFlow = () => {
    setIsCampaignFlow(true);
    setCampaignCreationStatus('in_progress');
    setCurrentQuestion(0);
    setCollectedAnswers({});
  };

  // Function to process user answer and move to next question
  const processAnswer = (answer: string) => {
    if (!isCampaignFlow || campaignCreationStatus !== 'in_progress') return;

    const currentQuestionKey = CAMPAIGN_QUESTIONS[currentQuestion]?.key;
    if (currentQuestionKey) {
      setCollectedAnswers(prev => ({
        ...prev,
        [currentQuestionKey]: answer
      }));

      // Move to next question or complete flow
      if (currentQuestion < CAMPAIGN_QUESTIONS.length - 1) {
        setCurrentQuestion(prev => prev + 1);
      } else {
        setCampaignCreationStatus('creating');
        // All questions answered, trigger campaign creation
      }
    }
  };

  // Function to get current question prompt
  const getCurrentQuestionPrompt = (): string => {
    if (!isCampaignFlow || campaignCreationStatus !== 'in_progress') {
      return '';
    }
    return CAMPAIGN_QUESTIONS[currentQuestion]?.prompt || '';
  };

  // Function to get progress information
  const getProgress = () => {
    if (!isCampaignFlow) return { current: 0, total: 0, percentage: 0 };
    
    const total = CAMPAIGN_QUESTIONS.length;
    const current = currentQuestion + 1;
    const percentage = Math.round((current / total) * 100);
    
    return { current, total, percentage };
  };

  // Detect if user wants to start campaign creation
  useEffect(() => {
    if (chatHistory.length > 0 && !isCampaignFlow) {
      const lastMessage = chatHistory[chatHistory.length - 1];
      if (lastMessage.role === 'user') {
        const userMessage = lastMessage.content.toLowerCase();
        const campaignTriggers = [
          'create campaign',
          'new campaign', 
          'build campaign',
          'campaign creation',
          'start campaign',
          'make campaign'
        ];
        
        if (campaignTriggers.some(trigger => userMessage.includes(trigger))) {
          startCampaignFlow();
        }
      }
    }
  }, [chatHistory, isCampaignFlow]);

  // Convert insights array to proper RealInsights format
  const insights: RealInsights = React.useMemo(() => {
    if (Array.isArray(rawInsights)) {
      return {
        totalActions: rawInsights.length,
        recentActivities: rawInsights.map((insight: any, index: number) => ({
          type: insight.type || 'general',
          message: insight.message || insight.toString(),
          timestamp: new Date()
        })),
        suggestions: ['Optimize email campaigns', 'Review social media performance', 'Update user preferences'],
        trends: {
          positive: 5,
          negative: 2,
          neutral: 3
        }
      };
    }
    
    // If rawInsights is already an object with the right structure, return it as RealInsights
    if (rawInsights && typeof rawInsights === 'object' && 'totalActions' in rawInsights) {
      return rawInsights as RealInsights;
    }
    
    // Default fallback that matches RealInsights interface
    return {
      totalActions: 0,
      recentActivities: [],
      suggestions: ['Optimize email campaigns', 'Review social media performance', 'Update user preferences'],
      trends: {
        positive: 5,
        negative: 2,
        neutral: 3
      }
    };
  }, [rawInsights]);

  // Convert chatHistory to match expected interface
  const convertedChatHistory = chatHistory.map(msg => ({
    ...msg,
    query: msg.content,
    response: msg.role === 'assistant' ? msg.content : ''
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* AI Greeting */}
        <AIGreeting insights={insights} />

        {/* System Overview Cards */}
        <SystemOverviewCards />

        {/* Main Chat Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-2 space-y-6">
            <ConversationalChatInterface
              chatHistory={convertedChatHistory}
              isProcessing={isProcessing}
              query={query}
              setQuery={setQuery}
              handleQuerySubmit={handleQuerySubmit}
              handleSuggestionClick={handleSuggestionClick}
              user={user}
              // Campaign flow specific props
              isCampaignFlow={isCampaignFlow}
              currentQuestion={getCurrentQuestionPrompt()}
              progress={getProgress()}
              campaignCreationStatus={campaignCreationStatus}
              collectedAnswers={collectedAnswers}
              onAnswerProvided={processAnswer}
              onCampaignFlowReset={() => {
                setIsCampaignFlow(false);
                setCampaignCreationStatus('idle');
                setCurrentQuestion(0);
                setCollectedAnswers({});
              }}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <QuickActionGrid insights={insights} />
            
            {/* Learning Insights */}
            <LearningInsights insights={insights} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationalDashboard;

