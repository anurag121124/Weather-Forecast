// services/weather.service.ts

import {
  WeatherData,
  WeatherResponse,
  Coordinates,
  WeatherServiceConfig,
} from "@/src/types/weather";

export class WeatherService {
  private baseUrl: string = "/api/weather";
  private recentSearchesKey: string = "recentSearches";
  private maxRecentSearches: number = 5;

  constructor(private config: WeatherServiceConfig) {}

  async getWeatherByLocation(location: string): Promise<WeatherResponse> {
    try {
      const url = `${this.baseUrl}?location=${encodeURIComponent(location)}&unit=${this.config.unit}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch weather data for ${location}`);
      }
      const data: WeatherResponse = await response.json();
      if (data.weather?.name) {
        this.updateRecentSearches(data.weather.name);
      }
      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getWeatherByCoordinates({ latitude, longitude }: Coordinates): Promise<WeatherResponse> {
    try {
      const url = `${this.baseUrl}?lat=${latitude}&lon=${longitude}&unit=${this.config.unit}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch location-based weather data");
      }

      const data: WeatherResponse = await response.json();
      if (data.weather?.name) {
        this.updateRecentSearches(data.weather.name);
      }
      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getWeatherByZipcode(zipcode: string): Promise<WeatherResponse> {
    try {
      const url = `${this.baseUrl}?zip=${encodeURIComponent(zipcode)}&unit=${this.config.unit}`;
      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch weather data for ZIP code ${zipcode}: ${errorText}`);
      }
  
      const data: WeatherResponse = await response.json();
      if (data.weather?.name) {
        this.updateRecentSearches(data.weather.name);
      }
      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getCurrentLocationWeather(): Promise<WeatherResponse> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const data = await this.getWeatherByCoordinates({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
            resolve(data);
          } catch (error) {
            reject(error);
          }
        },
        () => {
          reject(new Error("Unable to retrieve your location"));
        }
      );
    });
  }

  getRecentSearches(): string[] {
    try {
      const saved = localStorage.getItem(this.recentSearchesKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  private updateRecentSearches(location: string): void {
    try {
      const searches = this.getRecentSearches();
      const updated = [location, ...searches.filter((s) => s !== location)].slice(
        0,
        this.maxRecentSearches
      );
      localStorage.setItem(this.recentSearchesKey, JSON.stringify(updated));
    } catch (error) {
      console.error("Failed to update recent searches:", error);
    }
  }

  updateUnit(unit: "metric" | "imperial"): void {
    this.config.unit = unit;
  }

  private handleError(error: unknown): Error {
    if (error instanceof Error) {
      console.error("WeatherService Error:", error.message);
      return error;
    }
    console.error("WeatherService Unexpected Error:", error);
    return new Error("An unexpected error occurred");
  }
}

// Create singleton instance with default metric units
export const weatherService = new WeatherService({ unit: "metric" });

// Export service instance, class, and related types
export type {
  WeatherData,
  WeatherResponse,
  Coordinates,
  WeatherServiceConfig,
  Weather,
  Main,
  Wind,
  Clouds,
  Sys,
  ForecastItem,
  ForecastData,
} from "@/src/types/weather";

// Export error types if needed
export interface WeatherServiceError extends Error {
  code?: string;
  status?: number;
}