"use client";

import {
  Cloud,
  CloudRain,
  CloudSnow,
  Sun,
  CloudLightning,
  Cloudy,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Define types for the forecast data
interface WeatherItem {
  dt: number;
  main: {
    temp: number;
  };
  weather: Array<{
    id: number;
    description: string;
  }>;
}

interface ForecastData {
  list: WeatherItem[];
}

interface DayForecast {
  date: string;
  temps: number[];
  icon: number;
  description: string;
  high?: number;
  low?: number;
  avg?: number;
}

interface ForecastDisplayProps {
  forecast: ForecastData;
  unit: "metric" | "imperial";
}

const getWeatherIcon = (code: number) => {
  if (code >= 200 && code < 300) return <CloudLightning className="h-8 w-8 text-yellow-500" />;
  if (code >= 300 && code < 600) return <CloudRain className="h-8 w-8 text-blue-500" />;
  if (code >= 600 && code < 700) return <CloudSnow className="h-8 w-8 text-blue-300" />;
  if (code === 800) return <Sun className="h-8 w-8 text-yellow-400" />;
  if (code > 800) return <Cloudy className="h-8 w-8 text-gray-400" />;
  return <Cloud className="h-8 w-8 text-gray-500" />;
};


const CustomTooltip = ({ active, payload, label, unitSymbol }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="font-semibold mb-2">{label}</p>
        {payload.map((item: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: item.color }}>
            {item.name}: {item.value}{unitSymbol}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function ForecastDisplay({ forecast, unit }: ForecastDisplayProps) {
  if (!forecast) return null;

  const dailyForecasts = forecast.list.reduce<Record<string, DayForecast>>((acc, item) => {
    const date = new Date(item.dt * 1000).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = {
        date,
        temps: [],
        icon: item.weather[0].id,
        description: item.weather[0].description,
      };
    }
    acc[date].temps.push(item.main.temp);
    return acc;
  }, {});

  const processedData = Object.values(dailyForecasts)
    .slice(0, 5)
    .map((day) => ({
      ...day,
      high: Math.round(Math.max(...day.temps)),
      low: Math.round(Math.min(...day.temps)),
      avg: Math.round(
        day.temps.reduce((a: number, b: number) => a + b, 0) / day.temps.length
      ),
      name: new Date(day.date).toLocaleDateString("en-US", { weekday: "short" })
    }));

    console.log(dailyForecasts, 'processedData');

  const unitSymbol = unit === "metric" ? "°C" : "°F";

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
          5-Day Forecast
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {processedData.map((day) => (
          <div
            key={day.date}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl p-4 text-center hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              {day.date}
            </p>
            <div className="flex justify-center my-3">
              {getWeatherIcon(day.icon)}
            </div>
            <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
              {day.high}{unitSymbol} 
              <span className="text-gray-500 dark:text-gray-400 mx-1">/</span> 
              {day.low}{unitSymbol}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 capitalize">
              {day.description}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl p-6">
        <h4 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-100">
          Temperature Trend
        </h4>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={processedData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#9CA3AF" opacity={0.1} />
              <XAxis 
                dataKey="name" 
                stroke="#6B7280"
              />
              <YAxis 
                stroke="#6B7280"
                tickFormatter={(value) => `${value}${unitSymbol}`}
              />
              <Tooltip content={<CustomTooltip unitSymbol={unitSymbol} />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="high"
                name="High"
                stroke="#EF4444"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 8 }}
              />
              <Line
                type="monotone"
                dataKey="avg"
                name="Average"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 8 }}
              />
              <Line
                type="monotone"
                dataKey="low"
                name="Low"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}