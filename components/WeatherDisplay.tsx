"use client";

import { Card } from "@/components/ui/card";
import {
  Cloud,
  CloudRain,
  CloudSnow,
  Sun,
  CloudLightning,
  Cloudy,
} from "lucide-react";

const getWeatherIcon = (code: number) => {
  if (code >= 200 && code < 300) return <CloudLightning className="h-12 w-12" />;
  if (code >= 300 && code < 600) return <CloudRain className="h-12 w-12" />;
  if (code >= 600 && code < 700) return <CloudSnow className="h-12 w-12" />;
  if (code === 800) return <Sun className="h-12 w-12" />;
  if (code > 800) return <Cloudy className="h-12 w-12" />;
  return <Cloud className="h-12 w-12" />;
};

interface Weather {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  weather: {
    id: number;
    description: string;
  }[];
  name: string;
  wind: {
    speed: number;
  };
}

interface WeatherDisplayProps {
  weather: Weather;
  unit: "metric" | "imperial";
}

export default function WeatherDisplay({ weather, unit }: WeatherDisplayProps) {
  if (!weather) return null;

  const temp = Math.round(weather.main.temp);
  const feelsLike = Math.round(weather.main.feels_like);
  const unitSymbol = unit === "metric" ? "°C" : "°F";

  return (
    <Card className="p-6 bg-white/50 backdrop-blur-lg dark:bg-gray-800/50">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center space-x-4">
          {getWeatherIcon(weather.weather[0].id)}
          <div>
            <h2 className="text-2xl font-bold">{weather.name}</h2>
            <p className="text-gray-600 dark:text-gray-300">
              {weather.weather[0].description}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-4xl font-bold">
              {temp}
              {unitSymbol}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Feels like {feelsLike}
              {unitSymbol}
            </p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm">
              Humidity: {weather.main.humidity}%
            </p>
            <p className="text-sm">
              Wind: {weather.wind.speed} {unit === "metric" ? "m/s" : "mph"}
            </p>
            <p className="text-sm">
              Pressure: {weather.main.pressure} hPa
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}