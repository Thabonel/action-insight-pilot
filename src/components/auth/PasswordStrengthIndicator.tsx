import React from 'react';
import { validatePasswordStrength } from '@/lib/validation/input-sanitizer';
import { Progress } from '@/components/ui/progress';

interface PasswordStrengthIndicatorProps {
  password: string;
  onValidationChange?: (isValid: boolean) => void;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ 
  password, 
  onValidationChange 
}) => {
  const { isValid, errors, score } = validatePasswordStrength(password);
  
  React.useEffect(() => {
    onValidationChange?.(isValid);
  }, [isValid, onValidationChange]);

  if (!password) return null;

  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['destructive', 'destructive', 'secondary', 'secondary', 'default'];
  const progressValue = (score / 5) * 100;

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Password Strength</span>
          <span className={`font-medium ${
            score >= 4 ? 'text-emerald-600' : 
            score >= 3 ? 'text-yellow-600' : 
            'text-destructive'
          }`}>
            {strengthLabels[score] || 'Very Weak'}
          </span>
        </div>
        <Progress 
          value={progressValue} 
          className="h-2"
        />
      </div>

      {errors.length > 0 && (
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Requirements:</p>
          <div className="space-y-1">
            {[
              'At least 8 characters long',
              'One lowercase letter',
              'One uppercase letter', 
              'One number',
              'One special character'
            ].map((requirement, index) => {
              const hasRequirement = index === 0 ? 
                password.length >= 8 :
                index === 1 ? /[a-z]/.test(password) :
                index === 2 ? /[A-Z]/.test(password) :
                index === 3 ? /\d/.test(password) :
                /[!@#$%^&*(),.?":{}|<>]/.test(password);

              return (
                <div key={requirement} className="flex items-center gap-2 text-sm">
                  <span className={hasRequirement ? 'text-emerald-600' : 'text-muted-foreground'}>
                    {hasRequirement ? '[OK]' : '[  ]'} {requirement}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};