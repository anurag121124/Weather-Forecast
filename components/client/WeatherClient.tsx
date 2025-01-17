"use client";

import { useEffect, useState } from "react";
import { Search, MapPin, Loader2, Cloud, Droplets } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import ForecastDisplay from "../ForecastDisplay";
import { UnitToggle } from "../UnitToggle";
import WeatherDisplay from "../WeatherDisplay";
import LocationSelector from "../LocationSelector";
import { weatherService } from "@/services/weather.service";
import { WeatherData } from "@/services/weather.service";

interface WeatherClientProps {
  initialWeather: WeatherData;
  initialForecast: WeatherData;
}

export default function WeatherClient({
  initialWeather,
  initialForecast,
}: WeatherClientProps) {
  const [location, setLocation] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [weather, setWeather] = useState(initialWeather);
  const [forecast, setForecast] = useState(initialForecast);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const { toast } = useToast();

  useEffect(() => {
    weatherService.updateUnit(unit);
  }, [unit]);

  const fetchWeatherData = async (
    searchLocation: string,
    searchZipcode: string
  ) => {
    setLoading(true);
    setFetchError(null);
    try {
      let weatherData;
      if (searchZipcode.trim()) {
        weatherData = await weatherService.getWeatherByZipcode(searchZipcode);
      } else {
        weatherData = await weatherService.getWeatherByLocation(searchLocation);
      }
      const { weather, forecast } = weatherData as { weather: WeatherData, forecast: ForecastData };
      setWeather(weather as any);
      setForecast(forecast);

      toast({
        title: "Weather Updated",
        description: `Weather information for ${
          searchLocation || searchZipcode
        } has been updated.`,
        duration: 3000,
      });
    } catch (err) {
      const error = err instanceof Error ? err.message : "An error occurred";
      setFetchError(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.trim() || zipcode.trim()) {
      fetchWeatherData(location, zipcode);
    }
  };

  const handleGeolocation = async () => {
    setLoading(true);
    setFetchError(null);

    try {
      const { weather, forecast } =
        await weatherService.getCurrentLocationWeather();
      setWeather(weather);
      setForecast(forecast);
      setLocation(weather.name);
      toast({
        title: "Location Found",
        description: `Showing weather for ${weather.name}`,
      });
    } catch (err) {
      const error = err instanceof Error ? err.message : "An error occurred";
      setFetchError(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column - Search and Current Weather */}
        <div className="md:col-span-4 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-2 mb-6">
            <Cloud className="h-8 w-8 text-blue-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Weather Forecast
            </h1>
          </div>
          <div className="flex justify-end">
            <UnitToggle unit={unit} setUnit={setUnit} />
          </div>

          {/* Current Weather */}
          {weather && (
            <div className="border rounded-lg p-4">
              <WeatherDisplay weather={weather} unit={unit} />
            </div>
          )}
          {/* Location Selector */}
          <LocationSelector
            onLocationSelect={(cityName) => {
              setLocation(cityName);
              fetchWeatherData(cityName, "");
            }}
          />
          {/* Search Form */}
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-2 items-center">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="Enter city name..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full"
                />
                {loading && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                )}
              </div>
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="Enter zipcode..."
                  value={zipcode}
                  onChange={(e) => setZipcode(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleGeolocation}
                disabled={loading}
                className="flex-1 flex items-center justify-center"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Location
              </Button>
            </div>
          </form>
        </div>

        {/* Right Column - Forecast */}
        <div className="md:col-span-8">
          {forecast && (
            <div className="rounded-lg p-4 h-full">
              <ForecastDisplay forecast={forecast} unit={unit} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
