import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught in boundary:', error, errorInfo);
    // Toast can be triggered from parent; here we just log for now
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50" dir="rtl">
          <Alert className="max-w-md w-full border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>حدث خطأ!</AlertTitle>
            <AlertDescription>
              {this.state.error?.message || 'غير معروف.'}
              <div className="flex gap-2 mt-2">
                <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                  <RefreshCw className="h-3 w-3 mr-1" />
                  إعادة تحميل
                </Button>
                <Button variant="destructive" size="sm" onClick={() => this.setState({ hasError: false, error: undefined })}>
                  تجاهل
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
