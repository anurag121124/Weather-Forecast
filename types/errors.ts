export enum WeatherErrorType {
    INVALID_INPUT = 'INVALID_INPUT',
    RATE_LIMIT = 'RATE_LIMIT',
    NETWORK = 'NETWORK',
    API = 'API',
    LOCATION = 'LOCATION',
    UNKNOWN = 'UNKNOWN'
  }
  
  export interface WeatherError extends Error {
    type: WeatherErrorType;
    code?: number;
  }