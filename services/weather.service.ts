import { WeatherData } from "@/types/weather";

interface Coordinates {
  latitude: number;
  longitude: number;
}

class WeatherService {
  private baseUrl: string = "/api/weather";
  private recentSearchesKey: string = "recentSearches";
  private maxRecentSearches: number = 5;

  constructor(private config: { unit: "metric" | "imperial" }) {}

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

  async getWeatherByZipcode(zipcode: string): Promise<WeatherData> {
    try {
      // Construct the URL with correct parameters
      const url = `${this.baseUrl}?zip=${encodeURIComponent(zipcode)}&units=${this.config.unit}`;
      
      // Fetch data from the API
      const response = await fetch(url);
  
      // Check if the response is OK
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
      // Handle errors gracefully
      console.error('Error fetching weather data:', error);
      throw this.handleError(error);
    }
  }
  

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
      return error;
    }
    return new Error("An unexpected error occurred");
  }
}

// Create and export a singleton instance
export const weatherService = new WeatherService({ unit: "metric" });

// Export types
export type { WeatherData, Coordinates, WeatherService };
