import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CloudOff } from "lucide-react";
import { WeatherErrorType } from "@/types/errors";

interface WeatherError {
  type: WeatherErrorType;
  message: string;
}

interface ErrorFallbackProps {
  error: WeatherError;
  onRetry?: () => void;
}

export function ErrorFallback({ error, onRetry }: ErrorFallbackProps) {
  const messages = {
    [WeatherErrorType.INVALID_INPUT]: "Please enter a valid city name or ZIP code",
    [WeatherErrorType.RATE_LIMIT]: "Too many requests. Please try again in a few minutes",
    [WeatherErrorType.NETWORK]: "No internet connection. Please check your connection and try again",
    [WeatherErrorType.API]: "Weather service is temporarily unavailable",
    [WeatherErrorType.LOCATION]: "Unable to get your location. Please check your browser settings",
    [WeatherErrorType.UNKNOWN]: "An unexpected error occurred. Please try again"
  };

  return (
    <Alert variant="destructive" className="my-4">
      <CloudOff className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        {messages[error.type] || error.message}
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="mt-2"
          >
            Try Again
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}