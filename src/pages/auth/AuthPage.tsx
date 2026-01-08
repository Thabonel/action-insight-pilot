
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrengthIndicator';
import { validateEmail, sanitizeTextInput } from '@/lib/validation/input-sanitizer';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleEmailChange = (value: string) => {
    const sanitized = sanitizeTextInput(value, 320);
    setEmail(sanitized);

    if (sanitized && !validateEmail(sanitized)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError(null);
    }
  };

  const validateForm = (): boolean => {
    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please provide both email and password",
        variant: "destructive"
      });
      return false;
    }

    if (!validateEmail(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return false;
    }

    if (email.length > 320) {
      toast({
        title: "Invalid Email",
        description: "Email address is too long",
        variant: "destructive"
      });
      return false;
    }

    if (!isLogin && !isPasswordValid) {
      toast({
        title: "Invalid Password",
        description: "Please ensure your password meets all requirements",
        variant: "destructive"
      });
      return false;
    }

    if (password.length > 128) {
      toast({
        title: "Invalid Password",
        description: "Password is too long (maximum 128 characters)",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast({ title: "Success", description: "Signed in successfully!" });
        navigate('/app/conversational-dashboard');
      } else {
        const { error } = await signUp(email, password);
        if (error) throw error;
        toast({ 
          title: "Success", 
          description: "Account created successfully! Please check your email to verify your account." 
        });
        navigate('/app/conversational-dashboard');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Could not sign in. Please check your email and password, or try resetting your password.";
      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isLogin ? 'Sign In' : 'Sign Up'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                required
                maxLength={320}
                className={emailError ? 'border-destructive' : ''}
                aria-invalid={!!emailError}
                aria-describedby={emailError ? 'email-error' : undefined}
              />
              {emailError && (
                <p id="email-error" className="text-sm text-destructive mt-1">
                  {emailError}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                maxLength={128}
                minLength={isLogin ? 1 : 8}
                aria-describedby={!isLogin ? 'password-requirements' : undefined}
              />
              {!isLogin && (
                <div id="password-requirements" className="mt-3">
                  <PasswordStrengthIndicator
                    password={password}
                    onValidationChange={setIsPasswordValid}
                  />
                </div>
              )}
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading || (!isLogin && (!isPasswordValid || !!emailError))}
            >
              {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Sign Up')}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 hover:underline"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
