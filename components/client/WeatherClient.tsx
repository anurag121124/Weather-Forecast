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
import { ForecastData, WeatherData } from "@/types/weather";
import { useUserPreferencesStore } from "@/stores/WeatherStore";

interface WeatherClientProps {
  initialWeather?: WeatherData;
  initialForecast?: ForecastData;
}

export default function WeatherClient({
  initialWeather,
  initialForecast,
}: WeatherClientProps) {
  // State management
  const [location, setLocation] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [weather, setWeather] = useState<WeatherData | null>(initialWeather || null);
  const [forecast, setForecast] = useState<ForecastData | null>(initialForecast || null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

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
    weatherService.updateUnit(unit);
  }, [unit]);

  // Load recent searches on mount
  useEffect(() => {
    const searches = weatherService.getRecentSearches();
    setRecentSearches(searches);
  }, []);

  const updateWeatherState = (weatherData: WeatherData) => {
    setWeather(weatherData);
    if (weatherData.forecast) {
      setForecast(weatherData.forecast as any);
    }
    setLocation(weatherData.name);
    
    // Update recent searches in state
    const searches = weatherService.getRecentSearches();
    setRecentSearches(searches);
  };

  const handleError = (error: unknown) => {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    setFetchError(errorMessage);
    toast({
      variant: "destructive",
      title: "Error",
      description: errorMessage,
    });
  };

  const fetchWeatherData = async (searchLocation: string, searchZipcode: string) => {
    if (!searchLocation.trim() && !searchZipcode.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a location or zipcode",
      });
      return;
    }

    setLoading(true);
    setFetchError(null);

    try {
      const weatherData = searchZipcode
        ? await weatherService.getWeatherByZipcode(searchZipcode)
        : await weatherService.getWeatherByLocation(searchLocation);

      updateWeatherState(weatherData);
      
      toast({
        title: "Weather Updated",
        description: `Weather information for ${weatherData.name} updated.`,
      });
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWeatherData(location, zipcode);
  };

  const handleGeolocation = async () => {
    setLoading(true);
    setFetchError(null);

    try {
      const weatherData = await weatherService.getCurrentLocationWeather();
      updateWeatherState(weatherData);
      
      toast({
        title: "Location Found",
        description: `Showing weather for ${weatherData.name}`,
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
  };

  const handleFavoriteClick = async (locationName: string) => {
    setLoading(true);
    try {
      const weatherData = await weatherService.getWeatherByLocation(locationName);
      updateWeatherState(weatherData);
      
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
    <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Search and Controls Card */}
          <Card className="lg:col-span-4 h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cloud className="h-8 w-8 text-blue-500" />
                  <CardTitle className="text-xl sm:text-2xl">Weather Forecast</CardTitle>
                </div>
                <UnitToggle unit={unit} setUnit={setUnit} />
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Current Weather Display */}
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
                  onLocationSelect={handleLocationSelect}
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
                    disabled={loading || (!location.trim() && !zipcode.trim())}
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
                    Use Location
                  </Button>
                </div>
              </form>

              {/* Error Display */}
              {fetchError && (
                <div className="text-red-500 text-sm mt-2">
                  {fetchError}
                </div>
              )}

              {/* Favorite Toggle */}
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

              {/* Favorites List */}
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
                        disabled={loading}
                      >
                        {locationName}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Forecast Display Card */}
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