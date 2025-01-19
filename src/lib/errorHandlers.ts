import { WeatherError, WeatherErrorType } from "@/src/types/errors";

export function createWeatherError(type: WeatherErrorType, message: string, code?: number): WeatherError {
  return {
    name: 'WeatherError',
    type,
    message,
    code
  } as WeatherError;
}

export function handleNetworkError(error: unknown): WeatherError {
  if (!navigator.onLine) {
    return createWeatherError(
      WeatherErrorType.NETWORK,
      "No internet connection"
    );
  }
  
  if (error instanceof Error) {
    if (error.message.includes('rate limit')) {
      return createWeatherError(
        WeatherErrorType.RATE_LIMIT,
        "API rate limit exceeded"
      );
    }
    if (error.message.includes('not found')) {
      return createWeatherError(
        WeatherErrorType.INVALID_INPUT,
        "Location not found"
      );
    }
  }
  
  return createWeatherError(
    WeatherErrorType.UNKNOWN,
    "An unexpected error occurred"
  );
}