"use client";

import { useState } from "react";
import { Search, MapPin, Loader2, Cloud } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import WeatherDisplay from "@/components/WeatherDisplay";
import ForecastDisplay from "@/components/ForecastDisplay";
import { UnitToggle } from "@/components/UnitToggle";
import LocationSelector from "@/components/LocationSelector";
import ErrorFallback from "@/components/ErrorFallback";

interface WeatherProps {
  initialWeather: any;
  initialForecast: any;
}

export async function getServerSideProps() {
  const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
  const defaultLocation = "New York";

  try {
    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${defaultLocation}&units=metric&appid=${API_KEY}`
    );
    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${defaultLocation}&units=metric&appid=${API_KEY}`
    );

    if (!weatherRes.ok || !forecastRes.ok) {
      throw new Error("Failed to fetch initial weather data");
    }

    const initialWeather = await weatherRes.json();
    const initialForecast = await forecastRes.json();

    return {
      props: {
        initialWeather,
        initialForecast,
      },
    };
  } catch (error) {
    return {
      props: {
        initialWeather: null,
        initialForecast: null,
        error: error instanceof Error ? error.message : "An error occurred",
      },
    };
  }
}

export default function Home({ initialWeather, initialForecast }: WeatherProps) {
  const [location, setLocation] = useState("");
  const [weather, setWeather] = useState(initialWeather);
  const [forecast, setForecast] = useState(initialForecast);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const { toast } = useToast();

  const fetchWeatherData = async (searchLocation: string) => {
    setLoading(true);
    setFetchError(null);

    try {
      const res = await fetch(`/api/weather?location=${searchLocation}&unit=${unit}`);
      if (!res.ok) throw new Error("Failed to fetch weather data");

      const { weather, forecast } = await res.json();
      setWeather(weather);
      setForecast(forecast);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (location.trim()) {
      fetchWeatherData(location);
    }
  };

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      setFetchError("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    setFetchError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`/api/weather?lat=${latitude}&lon=${longitude}&unit=${unit}`);
          if (!res.ok) throw new Error("Failed to fetch location-based weather data");

          const { weather, forecast } = await res.json();
          setWeather(weather);
          setForecast(forecast);
          setLocation(weather.name);
        } catch (err) {
          setFetchError(err instanceof Error ? err.message : "An error occurred");
        } finally {
          setLoading(false);
        }
      },
      () => {
        setFetchError("Unable to retrieve your location");
        setLoading(false);
      }
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-4 mb-12">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Cloud className="h-12 w-12 text-blue-500 dark:text-blue-400" />
            <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-200 bg-clip-text text-transparent">
              Weather Forecast
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Get accurate weather information for any location worldwide
          </p>
        </div>

        {fetchError && (
          <ErrorFallback
            error={new Error(fetchError)}
            resetError={() => setFetchError(null)}
          />
        )}

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl p-6 shadow-lg">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <form onSubmit={handleSearch} className="flex-1 w-full">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      type="text"
                      placeholder="Enter city name..."
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="pr-10 bg-white/90 dark:bg-gray-700/90"
                    />
                    {loading && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                    )}
                  </div>
                  <Button type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-600">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </form>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGeolocation}
                  disabled={loading}
                  className="flex-1 sm:flex-none bg-white/90 dark:bg-gray-700/90"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Current Location
                </Button>
                <UnitToggle unit={unit} setUnit={setUnit} />
              </div>
            </div>
          </div>
        </div>

        {weather && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl p-6 shadow-lg">
            <WeatherDisplay weather={weather} unit={unit} />
          </div>
        )}

        {forecast && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl p-6 shadow-lg">
            <ForecastDisplay forecast={forecast} unit={unit} />
          </div>
        )}
      </div>
    </main>
  );
}
