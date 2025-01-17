import { WeatherData } from "@/types/weather";

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface WeatherServiceConfig {
  unit: "metric" | "imperial"; // Unit system: metric (Celsius) or imperial (Fahrenheit)
}

class WeatherService {
  private baseUrl: string = "/api/weather";
  private recentSearchesKey: string = "recentSearches";
  private maxRecentSearches: number = 5;

  constructor(private config: WeatherServiceConfig) {}

  /**
   * Fetch weather data by location name.
   * @param location Location name (e.g., "New York").
   * @returns WeatherData object.
   */
  async getWeatherByLocation(location: string): Promise<WeatherData> {
    try {
      const url = `${this.baseUrl}?location=${encodeURIComponent(location)}&unit=${this.config.unit}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch weather data for ${location}`);
      }
      const data = await response.json();
      this.updateRecentSearches(location);
      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Fetch weather data by geographic coordinates.
   * @param coordinates Object containing latitude and longitude.
   * @returns WeatherData object.
   */
  async getWeatherByCoordinates({ latitude, longitude }: Coordinates): Promise<WeatherData> {
    try {
      const url = `${this.baseUrl}?lat=${latitude}&lon=${longitude}&unit=${this.config.unit}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch location-based weather data");
      }

      const data = await response.json();
      this.updateRecentSearches(data.weather.name);
      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Fetch weather data by ZIP code.
   * @param zipcode ZIP code (e.g., "10001").
   * @returns WeatherData object.
   */
  async getWeatherByZipcode(zipcode: string): Promise<WeatherData> {
    try {
      const url = `${this.baseUrl}?zip=${encodeURIComponent(zipcode)}&unit=${this.config.unit}`;
      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch weather data for ZIP code ${zipcode}: ${errorText}`);
      }
  
      // Parse the JSON response
      const data = await response.json();
  
      // Update recent searches (assuming this is a valid method)
      if (data.name) {
        this.updateRecentSearches(data.name);
      }
  
      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Fetch weather data for the user's current location using geolocation.
   * @returns WeatherData object.
   */
  async getCurrentLocationWeather(): Promise<WeatherData> {
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

  /**
   * Retrieve a list of recent search locations from localStorage.
   * @returns Array of recent search location names.
   */
  getRecentSearches(): string[] {
    try {
      const saved = localStorage.getItem(this.recentSearchesKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  /**
   * Update the list of recent search locations in localStorage.
   * @param location Location name to add.
   */
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

  /**
   * Update the unit system for weather data (metric or imperial).
   * @param unit Unit system to set.
   */
  updateUnit(unit: "metric" | "imperial"): void {
    this.config.unit = unit;
  }

  /**
   * Handle errors and ensure they are properly formatted.
   * @param error The error to handle.
   * @returns Error object.
   */
  private handleError(error: unknown): Error {
    if (error instanceof Error) {
      console.error("WeatherService Error:", error.message);
      return error;
    }
    console.error("WeatherService Unexpected Error:", error);
    return new Error("An unexpected error occurred");
  }
}

// Create and export a singleton instance of WeatherService
export const weatherService = new WeatherService({ unit: "metric" });

// Export types for use elsewhere
export type { WeatherData, Coordinates, WeatherServiceConfig };
