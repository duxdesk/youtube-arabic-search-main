import React, { useState } from 'react';
import { useAdminAuth } from '../../lib/useAdminAuth';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Lock, Eye, EyeOff } from 'lucide-react';

interface AdminLoginProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, redirectTo }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, isAuthenticated } = useAdminAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(password);
      if (success) {
        setPassword('');
        if (redirectTo) {
          window.location.href = redirectTo;
        } else if (onSuccess) {
          onSuccess();
        }
      } else {
        setError('Invalid password. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // If already authenticated, show logout option
  if (isAuthenticated) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Admin Access Granted
          </CardTitle>
          <CardDescription>
            You are currently logged in as administrator
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">
                ✓ You have full access to data management features
              </AlertDescription>
            </Alert>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/manage'}
              className="w-full"
            >
              Go to Management Panel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Admin Authentication
        </CardTitle>
        <CardDescription>
          Enter admin password to access data management
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="admin-password">Admin Password</Label>
            <div className="relative">
              <Input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Contact system administrator if you forgot the password
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || !password}
          >
            {isLoading ? 'Verifying...' : 'Access Admin Panel'}
          </Button>

          <div className="text-center text-sm text-gray-500 pt-4 border-t">
            <p>⚠️ Unauthorized access is prohibited</p>
            <p className="text-xs mt-1">All actions are logged</p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
