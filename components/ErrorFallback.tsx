    // components/ErrorFallback.tsx
import React from 'react';
import { AlertCircle, CloudOff, WifiOff, AlertTriangle, Ban, Wifi } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

interface ErrorType {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: string;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError }) => {
  // Comprehensive error type mapping with specific messages and icons
  const errorTypes: Record<string, ErrorType> = {
    'Failed to fetch': {
      icon: <WifiOff className="h-6 w-6" />,
      title: 'No Internet Connection',
      description: 'Please check your internet connection and try again.',
      action: 'Retry Connection'
    },
    'City not found': {
      icon: <CloudOff className="h-6 w-6" />,
      title: 'Location Not Found',
      description: 'Please check the city name or ZIP code and try again.',
      action: 'Try Different Location'
    },
    'Request failed with status 429': {
      icon: <AlertCircle className="h-6 w-6" />,
      title: 'Too Many Requests',
      description: 'We\'ve hit the API rate limit. Please try again in a moment.',
      action: 'Try Again Later'
    },
    'Invalid API key': {
      icon: <Ban className="h-6 w-6" />,
      title: 'API Key Error',
      description: 'There\'s an issue with the API configuration. Please contact support.',
      action: 'Contact Support'
    },
    'Request timed out': {
      icon: <Wifi className="h-6 w-6" />,
      title: 'Connection Timeout',
      description: 'The request took too long to complete. Please check your connection and try again.',
      action: 'Retry'
    },
    'Invalid ZIP code format': {
      icon: <AlertTriangle className="h-6 w-6" />,
      title: 'Invalid ZIP Code',
      description: 'Please enter a valid 5-digit ZIP code.',
      action: 'Try Again'
    },
    'Invalid city name length': {
      icon: <AlertTriangle className="h-6 w-6" />,
      title: 'Invalid City Name',
      description: 'City name must be between 2 and 85 characters.',
      action: 'Edit Location'
    },
    default: {
      icon: <AlertCircle className="h-6 w-6" />,
      title: 'Error',
      description: 'An unexpected error occurred. Please try again.',
      action: 'Try Again'
    }
  };

  // Get error info or fallback to default
  const errorInfo = errorTypes[error.message] || errorTypes.default;

  return (
    <Alert variant="destructive" className="animate-fadeIn">
      <div className="flex flex-col space-y-4">
        <div className="flex items-start gap-4">
          <div className="text-destructive dark:text-red-400">
            {errorInfo.icon}
          </div>
          <div className="flex-1">
            <AlertTitle className="text-lg font-semibold mb-2">
              {errorInfo.title}
            </AlertTitle>
            <AlertDescription className="text-sm text-gray-600 dark:text-gray-300">
              {errorInfo.description}
            </AlertDescription>
          </div>
        </div>
        
        <div className="flex gap-2 justify-end">
          <Button 
            onClick={resetError}
            variant="outline" 
            size="sm"
            className="hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            {errorInfo.action}
          </Button>
        </div>
      </div>
    </Alert>
  );
};

export default ErrorFallback;