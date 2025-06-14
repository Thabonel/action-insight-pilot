
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import PerformancePredictions from './predictive/PerformancePredictions';
import RevenueForecastChart from './predictive/RevenueForecastChart';
import CampaignSuccessPredictions from './predictive/CampaignSuccessPredictions';
import LeadConversionPredictions from './predictive/LeadConversionPredictions';
import BudgetOptimization from './predictive/BudgetOptimization';

const PredictiveAnalytics: React.FC = () => {
  const [predictions] = useState({
    nextMonth: {
      revenue: 47500,
      confidence: 87,
      leads: 290,
      campaigns: 20
    },
    quarterlyForecast: {
      revenue: 142000,
      growth: 28,
      confidence: 82
    }
  });

  const [campaignPredictions] = useState([
    { 
      name: 'Summer Product Launch',
      successProbability: 92,
      predictedROI: 340,
      riskFactors: ['Market saturation', 'Timing overlap'],
      recommendation: 'Launch as planned'
    },
    {
      name: 'LinkedIn B2B Campaign',
      successProbability: 78,
      predictedROI: 245,
      riskFactors: ['Budget constraints', 'Competition'],
      recommendation: 'Increase budget by 20%'
    },
    {
      name: 'Video Content Series',
      successProbability: 85,
      predictedROI: 189,
      riskFactors: ['Production delays'],
      recommendation: 'Proceed with caution'
    }
  ]);

  const [leadPredictions] = useState([
    { type: 'High-Intent Leads', probability: 94, expectedConversions: 23 },
    { type: 'Nurture Sequence', probability: 67, expectedConversions: 45 },
    { type: 'Cold Outreach', probability: 23, expectedConversions: 12 },
    { type: 'Referral Program', probability: 89, expectedConversions: 18 }
  ]);

  const [budgetOptimization] = useState([
    { channel: 'Email Marketing', currentBudget: 5000, recommendedBudget: 6500, expectedReturn: 8900 },
    { channel: 'Social Media', currentBudget: 4000, recommendedBudget: 3200, expectedReturn: 5800 },
    { channel: 'Content Creation', currentBudget: 3000, recommendedBudget: 4200, expectedReturn: 7200 },
    { channel: 'Paid Advertising', currentBudget: 6000, recommendedBudget: 5500, expectedReturn: 9800 }
  ]);

  const [forecastData] = useState([
    { month: 'Current', actual: 42500, predicted: 42500 },
    { month: 'Next', actual: null, predicted: 47500 },
    { month: 'Month 2', actual: null, predicted: 52000 },
    { month: 'Month 3', actual: null, predicted: 48500 },
    { month: 'Month 4', actual: null, predicted: 55000 },
    { month: 'Month 5', actual: null, predicted: 58500 },
    { month: 'Month 6', actual: null, predicted: 61000 }
  ]);

  // Ensure all arrays are safely handled
  const safeCampaignPredictions = Array.isArray(campaignPredictions) ? campaignPredictions : [];
  const safeLeadPredictions = Array.isArray(leadPredictions) ? leadPredictions : [];
  const safeBudgetOptimization = Array.isArray(budgetOptimization) ? budgetOptimization : [];
  const safeForecastData = Array.isArray(forecastData) ? forecastData : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <span>Predictive Analytics</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <PerformancePredictions 
          nextMonth={predictions.nextMonth}
          quarterlyForecast={predictions.quarterlyForecast}
        />

        <RevenueForecastChart forecastData={safeForecastData} />

        <CampaignSuccessPredictions campaignPredictions={safeCampaignPredictions} />

        <LeadConversionPredictions leadPredictions={safeLeadPredictions} />

        <BudgetOptimization budgetOptimization={safeBudgetOptimization} />
      </CardContent>
    </Card>
  );
};

export default PredictiveAnalytics;
