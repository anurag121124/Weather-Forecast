/**
 * Represents a single weather condition.
 */
export interface Weather {
  id: number; // Weather condition ID
  main: string; // Group of weather parameters (e.g., Rain, Snow, Clear, Clouds)
  description: string; // Weather condition within the group (e.g., light rain)
  icon: string; // Weather icon ID
  
}

/**
 * Represents the main weather statistics.
 */
export interface Main {
  temp: number; // Temperature in specified unit (Kelvin, Celsius, Fahrenheit)
  feels_like: number; // Human perception of temperature
  temp_min: number; // Minimum temperature at the moment
  temp_max: number; // Maximum temperature at the moment
  pressure: number; // Atmospheric pressure in hPa
  humidity: number; // Humidity in percentage
}

/**
 * Represents wind conditions.
 */
export interface Wind {
  speed: number; // Wind speed in meter/sec or miles/hour
  deg: number; // Wind direction in degrees
}

/**
 * Represents cloudiness information.
 */
export interface Clouds {
  all: number; // Cloudiness in percentage
}

/**
 * Represents system-related data (e.g., country, sunrise/sunset).
 */
export interface Sys {
  type: number; // Internal parameter (ignore)
  id: number; // Internal parameter (ignore)
  country: string; // Country code (e.g., US, GB)
  sunrise: number; // Sunrise time (UNIX timestamp)
  sunset: number; // Sunset time (UNIX timestamp)
}

/**
 * Configuration for the weather service, such as the unit system.
 */
export interface WeatherServiceConfig {
  unit: "metric" | "imperial"; // Unit system: metric (Celsius) or imperial (Fahrenheit)
}

/**
 * Represents weather data fetched from the weather service.
 */
export interface WeatherData {
  forecast(forecast: any): unknown;
  coord: {
    lon: number; // Longitude of the location
    lat: number; // Latitude of the location
  };
  weather: Weather[]; // Array of Weather objects
  base: string; // Internal parameter
  main: Main; // Main weather statistics
  visibility: number; // Visibility in meters
  wind: Wind; // Wind data
  clouds: Clouds; // Cloudiness information
  dt: number; // Data calculation time (UNIX timestamp)
  sys: Sys; // System-related data (e.g., sunrise/sunset)
  timezone: number; // Timezone offset in seconds
  id: number; // City ID
  name: string; // City name
  cod: number; // Internal parameter for response code
}

/**
 * Represents the forecast data structure.
 */
export interface ForecastData {
  list: {
    dt: number; // Data time (UNIX timestamp)
    main: Main; // Main weather statistics for the forecast
    weather: Weather[]; // Array of Weather objects for the forecast
    clouds: Clouds; // Cloudiness information
    wind: Wind; // Wind data
    visibility: number; // Visibility in meters
    pop: number; // Probability of precipitation
    sys: Sys; // Additional system data
    dt_txt: string; // Date-time text (e.g., "2023-01-01 12:00:00")
  }[];
  city: {
    id: number; // City ID
    name: string; // City name
    coord: {
      lat: number; // Latitude of the city
      lon: number; // Longitude of the city
    };
    country: string; // Country code
    population: number; // Population of the city
    timezone: number; // Timezone offset in seconds
    sunrise: number; // Sunrise time (UNIX timestamp)
    sunset: number; // Sunset time (UNIX timestamp)
  };
}
