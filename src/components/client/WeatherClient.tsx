"use client";

import { useEffect, useState } from "react";
import { Search, MapPin, Loader2, Cloud, Star, StarOff } from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/src/components/ui/alert";
import ForecastDisplay from "../ForecastDisplay";
import { UnitToggle } from "../UnitToggle";
import WeatherDisplay from "../WeatherDisplay";
import LocationSelector from "../LocationSelector";
import { weatherService } from "@/src/services/weather.service";
import {
  WeatherData,
  ForecastData,
  WeatherServiceConfig,
} from "@/src/types/weather";
import { WeatherError } from "@/src/types/errors";
import { handleNetworkError } from "@/src/lib/errorHandlers";
import { useUserPreferencesStore } from "@/src/stores/WeatherStore";
import { WeatherResponse } from "@/src/types/weather";
import { ThemeToggle } from "../toogle";

interface WeatherClientProps {
  initialWeather?: WeatherData;
  initialForecast?: ForecastData;
}

export default function WeatherClient({
  initialWeather,
  initialForecast,
}: WeatherClientProps) {
  const [location, setLocation] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [error, setError] = useState<WeatherError | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(
    initialWeather || null
  );
  const [forecast, setForecast] = useState<ForecastData | null>(
    initialForecast || null
  );
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isOffline, setIsOffline] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const { toast } = useToast();
  const {
    unit,
    setUnit,
    favoriteLocations: favorites,
    addFavoriteLocation,
    removeFavoriteLocation,
    isFavorite,
  } = useUserPreferencesStore();

  useEffect(() => {
    setIsClient(true);
    setIsOffline(!window.navigator.onLine);

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    try {
      const config: WeatherServiceConfig = { unit };
      weatherService.updateUnit(config.unit);
    } catch (error) {
      handleError(error);
    }
  }, [unit]);

  useEffect(() => {
    try {
      const searches = weatherService.getRecentSearches();
      setRecentSearches(searches);
    } catch (error) {
      handleError(error);
    }
  }, []);

  const handleError = (error: unknown) => {
    const weatherError = handleNetworkError(error);
    setError(weatherError);
    setFetchError(weatherError.message);
    
    toast({
      variant: "destructive",
      title: "Error",
      description: weatherError.message,
    });
  };

  const validateInput = (searchLocation: string, searchZipcode: string): boolean => {
    if (!searchLocation.trim() && !searchZipcode.trim()) {
      handleError(new Error("Please enter a location or zipcode"));
      return false;
    }

    if (searchZipcode && !/^\d{5}(-\d{4})?$/.test(searchZipcode)) {
      handleError(new Error("Please enter a valid ZIP code"));
      return false;
    }

    return true;
  };

  const updateWeatherState = (response: WeatherResponse) => {
    try {
      const { weather: weatherData, forecast: forecastData } = response;

      setWeather(weatherData);
      setForecast(forecastData);
      setLocation(weatherData.name);

      const searches = weatherService.getRecentSearches();
      setRecentSearches(searches);
    } catch (error) {
      handleError(error);
    }
  };

  const fetchWeatherData = async (searchLocation: string, searchZipcode: string) => {
    if (!validateInput(searchLocation, searchZipcode)) {
      return;
    }

    setLoading(true);
    setError(null);
    setFetchError(null);

    try {
      if (isOffline) {
        throw new Error("No internet connection");
      }

      const response = searchZipcode
        ? await weatherService.getWeatherByZipcode(searchZipcode)
        : await weatherService.getWeatherByLocation(searchLocation);

      updateWeatherState(response);

      toast({
        title: "Weather Updated",
        description: `Weather information for ${response.weather.name} updated.`,
      });
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetchWeatherData(location, zipcode);
  };

  const handleGeolocation = async () => {
    setError(null);
    setFetchError(null);
    setLoading(true);

    try {
      if (!window.navigator.geolocation) {
        throw new Error("Geolocation is not supported by your browser");
      }

      if (isOffline) {
        throw new Error("Cannot get location while offline");
      }

      const response = await weatherService.getCurrentLocationWeather();
      updateWeatherState(response);

      toast({
        title: "Location Found",
        description: `Showing weather for ${response.weather.name}`,
      });
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = () => {
    if (!weather?.name) return;

    const locationName = weather.name;

    try {
      if (isFavorite(locationName)) {
        removeFavoriteLocation(locationName);
        toast({
          title: "Removed from Favorites",
          description: `${locationName} removed from your favorites.`,
        });
      } else {
        addFavoriteLocation(locationName);
        toast({
          title: "Added to Favorites",
          description: `${locationName} added to your favorites.`,
        });
      }
    } catch (error) {
      handleError(error);
    }
  };

  const handleFavoriteClick = async (locationName: string) => {
    setLoading(true);

    try {
      if (isOffline) {
        throw new Error("Cannot update weather while offline");
      }

      const response = await weatherService.getWeatherByLocation(locationName);
      updateWeatherState(response);

      toast({
        title: "Weather Updated",
        description: `Weather information for ${locationName} has been updated.`,
      });
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = async (cityName: string) => {
    setLocation(cityName);
    await fetchWeatherData(cityName, "");
  };
  return (
    <div className="w-full min-h-screen dark:bg-gray-900">
      <div className="mx-auto">
        {isClient && isOffline && (
          <div className="mb-4">
            <Alert variant="default">
              <AlertTitle>Offline Mode</AlertTitle>
              <AlertDescription>
                You are currently offline. Some features may be limited.
              </AlertDescription>
            </Alert>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Card className="lg:col-span-4 h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cloud className="h-8 w-8 text-blue-500" />
                  <CardTitle className="text-xl sm:text-2xl">
                    Weather Forecast
                  </CardTitle>
                </div>
                <UnitToggle unit={unit} setUnit={setUnit} />
                <ThemeToggle />

              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {weather && (
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-700 shadow-sm rounded-lg">
                  <CardContent className="p-4">
                    <WeatherDisplay weather={weather} unit={unit} />
                  </CardContent>
                </Card>
              )}

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <LocationSelector onLocationSelect={handleLocationSelect} />
              </div>

              <form onSubmit={handleSearch} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    type="text"
                    placeholder="Enter city name..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full"
                    aria-label="City name"
                  />
                  <Input
                    type="text"
                    placeholder="Enter zipcode..."
                    value={zipcode}
                    onChange={(e) => setZipcode(e.target.value)}
                    className="w-full"
                    aria-label="Zipcode"
                    pattern="[0-9]*"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    type="submit"
                    disabled={loading || isOffline}
                    className="w-full bg-blue-700 hover:bg-blue-200"
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
                    disabled={loading || isOffline}
                    className="w-full"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Use Location
                  </Button>
                </div>
              </form>

              {fetchError && (
                <div className="text-red-500 text-sm mt-2">{fetchError}</div>
              )}

              {weather?.name && (
                <div className="pt-4 border-t dark:border-gray-700">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleFavorite}
                    className="w-full justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {isFavorite(weather.name) ? (
                      <>
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-2" />
                        Remove from Favorites
                      </>
                    ) : (
                      <>
                        <StarOff className="h-4 w-4 mr-2" />
                        Add to Favorites
                      </>
                    )}
                  </Button>
                </div>
              )}

              {favorites.length > 0 && (
                <div className="pt-4 border-t dark:border-gray-700">
                  <h3 className="text-sm font-medium mb-3">
                    Favorite Locations
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {favorites.map((locationName) => (
                      <div
                        key={locationName}
                        className="flex items-center gap-2"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFavoriteClick(locationName)}
                          className="flex-1 text-xs sm:text-sm truncate"
                          disabled={loading || isOffline}
                        >
                          {locationName}
                        </Button>
                        {isFavorite(locationName) ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFavoriteLocation(locationName)}
                            className="text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            X
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => addFavoriteLocation(locationName)}
                            className="text-green-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            Add
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-8 h-full">
            <CardContent className="p-4 sm:p-6">
              {forecast ? (
                <ForecastDisplay forecast={forecast} unit={unit} />
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  Search for a location to see the forecast
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}