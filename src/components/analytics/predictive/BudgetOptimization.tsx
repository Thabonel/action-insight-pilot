
import React from 'react';

interface BudgetOptimizationItem {
  channel: string;
  currentBudget: number;
  recommendedBudget: number;
  expectedReturn: number;
}

interface BudgetOptimizationProps {
  budgetOptimization: BudgetOptimizationItem[];
}

const BudgetOptimization: React.FC<BudgetOptimizationProps> = ({
  budgetOptimization
}) => {
  return (
    <div>
      <h4 className="font-medium text-gray-900 mb-3">Budget Optimization Opportunities</h4>
      <div className="space-y-3">
        {budgetOptimization.map((channel, index) => {
          const budgetChange = channel.recommendedBudget - channel.currentBudget;
          const isIncrease = budgetChange > 0;
          
          return (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <span className="font-medium text-gray-900">{channel.channel}</span>
                <div className="text-sm text-gray-600">
                  Current: ${channel.currentBudget.toLocaleString()} → 
                  Recommended: ${channel.recommendedBudget.toLocaleString()}
                </div>
              </div>
              <div className="text-right">
                <div className={`font-medium ${isIncrease ? 'text-blue-600' : 'text-green-600'}`}>
                  {isIncrease ? '+' : ''}${budgetChange.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">
                  Expected: ${channel.expectedReturn.toLocaleString()}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BudgetOptimization;
