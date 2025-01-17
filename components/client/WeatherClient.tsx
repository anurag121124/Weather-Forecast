"use client";

import { useEffect, useState } from "react";
import { Search, MapPin, Loader2, Cloud, Star, StarOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ForecastDisplay from "../ForecastDisplay";
import { UnitToggle } from "../UnitToggle";
import WeatherDisplay from "../WeatherDisplay";
import LocationSelector from "../LocationSelector";
import { weatherService } from "@/services/weather.service";
import { WeatherData, ForecastData } from "@/services/weather.service";
import { useWeatherStore } from "@/stores/WeatherStore";

interface WeatherClientProps {
  initialWeather: WeatherData;
  initialForecast: ForecastData;
}

export default function WeatherClient({
  initialWeather,
  initialForecast,
}: WeatherClientProps) {
  const [location, setLocation] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [weather, setWeather] = useState<WeatherData>(initialWeather);
  const [forecast, setForecast] = useState<ForecastData>(initialForecast);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const { toast } = useToast();

  const { 
    favorites, 
    addFavorite, 
    removeFavorite, 
    currentWeather,
    setCurrentWeather 
  } = useWeatherStore();

  useEffect(() => {
    weatherService.updateUnit(unit);
  }, [unit]);

  useEffect(() => {
    if (weather) {
      setCurrentWeather(weather);
    }
  }, [weather, setCurrentWeather]);

  const isFavorite = currentWeather && favorites.includes(currentWeather.name);

  const toggleFavorite = () => {
    if (!currentWeather) return;
    
    if (isFavorite) {
      removeFavorite(currentWeather.name);
      toast({
        title: "Removed from favorites",
        description: `${currentWeather.name} has been removed from your favorites.`,
      });
    } else {
      addFavorite(currentWeather.name);
      toast({
        title: "Added to favorites",
        description: `${currentWeather.name} has been added to your favorites.`,
      });
    }
  };

  const fetchWeatherData = async (
    searchLocation: string,
    searchZipcode: string
  ) => {
    setLoading(true);
    setFetchError(null);
    try {
      const weatherData = searchZipcode.trim()
        ? await weatherService.getWeatherByZipcode(searchZipcode)
        : await weatherService.getWeatherByLocation(searchLocation);

      setWeather(weatherData.weather);
      setForecast(weatherData.forecast);

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
      const { weather, forecast } = await weatherService.getCurrentLocationWeather();
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

  const handleFavoriteClick = (locationName: string) => {
    setLocation(locationName);
    fetchWeatherData(locationName, "");
  };

  return (
    <div className="w-full min-h-screen dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Weather Controls */}
          <Card className="lg:col-span-4 h-full">
            <CardHeader className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Cloud className="h-8 w-8 text-blue-500" />
                  <CardTitle className="text-xl sm:text-2xl">Weather Forecast</CardTitle>
                </div>
                <UnitToggle unit={unit} setUnit={setUnit} />
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Current Weather Card */}
              {weather && (
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-700 shadow-sm rounded-lg">
                  <CardContent className="p-4">
                    <WeatherDisplay weather={weather} unit={unit} />
                  </CardContent>
                </Card>
              )}

              {/* Location Selector */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <LocationSelector
                  onLocationSelect={(cityName) => {
                    setLocation(cityName);
                    fetchWeatherData(cityName, "");
                  }}
                />
              </div>

              {/* Search Form */}
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    type="text"
                    placeholder="Enter city name..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full"
                  />
                  <Input
                    type="text"
                    placeholder="Enter zipcode..."
                    value={zipcode}
                    onChange={(e) => setZipcode(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Search className="h-4 w-4 mr-2" />
                    )}
                    Search
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGeolocation}
                    disabled={loading}
                    className="w-full"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Location
                  </Button>
                </div>
              </form>

              {/* Favorites Section */}
              {currentWeather && (
                <div className="pt-4 border-t dark:border-gray-700">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleFavorite}
                    className="w-full justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {isFavorite ? (
                      <>
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-2" />
                        Remove from favorites
                      </>
                    ) : (
                      <>
                        <StarOff className="h-4 w-4 mr-2" />
                        Add to favorites
                      </>
                    )}
                  </Button>
                </div>
              )}

              {favorites.length > 0 && (
                <div className="pt-4 border-t dark:border-gray-700">
                  <h3 className="text-sm font-medium mb-3">Favorite Locations</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {favorites.map((locationName) => (
                      <Button
                        key={locationName}
                        variant="outline"
                        size="sm"
                        onClick={() => handleFavoriteClick(locationName)}
                        className="w-full text-xs sm:text-sm truncate"
                      >
                        {locationName}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right Column - Forecast */}
          <Card className="lg:col-span-8 h-full">
            <CardContent className="p-4 sm:p-6">
              {forecast && <ForecastDisplay forecast={forecast} unit={unit} />}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}