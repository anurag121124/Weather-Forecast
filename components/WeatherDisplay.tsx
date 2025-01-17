"use client";

import { Card } from "@/components/ui/card";
import { WeatherData } from "@/types/weather";
import {
  Cloud,
  CloudRain,
  CloudSnow,
  Sun,
  CloudLightning,
  Cloudy,
} from "lucide-react";

const getWeatherIcon = (code: number) => {
  let Icon;
  let color;

  if (code >= 200 && code < 300) {
    Icon = CloudLightning;
    color = "text-yellow-500"; // Thunderstorm
  } else if (code >= 300 && code < 600) {
    Icon = CloudRain;
    color = "text-blue-500"; // Rain
  } else if (code >= 600 && code < 700) {
    Icon = CloudSnow;
    color = "text-cyan-500"; // Snow
  } else if (code === 800) {
    Icon = Sun;
    color = "text-yellow-400"; // Clear sky
  } else if (code > 800) {
    Icon = Cloudy;
    color = "text-gray-500"; // Cloudy
  } else {
    Icon = Cloud;
    color = "text-gray-400"; // Default
  }

  return <Icon className={`h-12 w-12 ${color}`} />;
};



interface WeatherDisplayProps {
  weather: WeatherData;
  unit: "metric" | "imperial";
}

export default function WeatherDisplay({ weather, unit }: WeatherDisplayProps) {
  if (!weather) return null;

  const temp = Math.round(weather.main.temp || 0);
  const feelsLike = Math.round(weather.main.feels_like);
  const unitSymbol = unit === "metric" ? "°C" : "°F";

  return (
    <Card className="p-6 dark:bg-gray-800/50">
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
