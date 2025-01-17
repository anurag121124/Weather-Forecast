// components/ErrorFallback.tsx
import React from 'react';
import { AlertCircle, CloudOff, WifiOff, AlertTriangle, Ban, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toast } from 'flowbite-react';

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
      action: 'Retry Connection',
    },
    'City not found': {
      icon: <CloudOff className="h-6 w-6" />,
      title: 'Location Not Found',
      description: 'Please check the city name or ZIP code and try again.',
      action: 'Try Different Location',
    },
    'Request failed with status 429': {
      icon: <AlertCircle className="h-6 w-6" />,
      title: 'Too Many Requests',
      description: "We've hit the API rate limit. Please try again in a moment.",
      action: 'Try Again Later',
    },
    'Invalid API key': {
      icon: <Ban className="h-6 w-6" />,
      title: 'API Key Error',
      description: "There's an issue with the API configuration. Please contact support.",
      action: 'Contact Support',
    },
    'Request timed out': {
      icon: <Wifi className="h-6 w-6" />,
      title: 'Connection Timeout',
      description: 'The request took too long to complete. Please check your connection and try again.',
      action: 'Retry',
    },
    'Invalid ZIP code format': {
      icon: <AlertTriangle className="h-6 w-6" />,
      title: 'Invalid ZIP Code',
      description: 'Please enter a valid 5-digit ZIP code.',
      action: 'Try Again',
    },
    'Invalid city name length': {
      icon: <AlertTriangle className="h-6 w-6" />,
      title: 'Invalid City Name',
      description: 'City name must be between 2 and 85 characters.',
      action: 'Edit Location',
    },
    default: {
      icon: <AlertCircle className="h-6 w-6" />,
      title: 'Error',
      description: 'An unexpected error occurred. Please try again.',
      action: 'Try Again',
    },
  };

  // Get error info or fallback to default
  const errorInfo = errorTypes[error.message] || errorTypes.default;

  return (
    <div className="flex items-center justify-center h-full p-4">
      <Toast>
        <div className="flex items-center space-x-4">
          {errorInfo.icon}
          <div>
            <h4 className="text-lg font-bold">{errorInfo.title}</h4>
            <p className="text-sm text-gray-600">{errorInfo.description}</p>
          </div>
          {errorInfo.action && (
            <Button
              onClick={resetError}
              variant="outline"
              size="sm"
              className="hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              {errorInfo.action}
            </Button>
          )}
        </div>
      </Toast>
    </div>
  );
};

export default ErrorFallback;
