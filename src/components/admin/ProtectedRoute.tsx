import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../lib/useAdminAuth';
import { AdminLogin } from './AdminLogin';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Shield, Lock, AlertTriangle } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = true,
  fallback
}) => {
  const { isAuthenticated } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (requireAdmin && !isAuthenticated) {
      setShowLogin(true);
    }
  }, [isAuthenticated, requireAdmin, location]);

  if (!requireAdmin) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showLogin) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
          <div className="w-full max-w-4xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <Lock className="h-8 w-8 text-red-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Admin Access Required
              </h1>
              <p className="text-gray-600">
                This section is restricted to authorized administrators only
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <Shield className="h-10 w-10 text-blue-600 mb-3" />
                    <h3 className="font-semibold mb-2">Data Protection</h3>
                    <p className="text-sm text-gray-500">
                      Sensitive data management requires authentication
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <AlertTriangle className="h-10 w-10 text-amber-600 mb-3" />
                    <h3 className="font-semibold mb-2">Audit Log</h3>
                    <p className="text-sm text-gray-500">
                      All admin actions are logged for security
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <Lock className="h-10 w-10 text-purple-600 mb-3" />
                    <h3 className="font-semibold mb-2">Secure Access</h3>
                    <p className="text-sm text-gray-500">
                      Encrypted authentication protects your data
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <AdminLogin 
              onSuccess={() => {
                setShowLogin(false);
                // Stay on same page after login
              }}
            />

            <div className="text-center mt-8">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back to Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return null;
  }

  return <>{children}</>;
};
