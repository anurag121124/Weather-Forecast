import React from 'react';
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
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

// Previous interfaces remain the same...
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

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  unitSymbol: string;
}

// Weather icon function remains the same...
const getWeatherIcon = (code: number) => {
  if (code >= 200 && code < 300)
    return <CloudLightning className="h-8 w-8 md:h-10 md:w-10 text-yellow-500 transition-transform hover:scale-110" />;
  if (code >= 300 && code < 600)
    return <CloudRain className="h-8 w-8 md:h-10 md:w-10 text-blue-500 transition-transform hover:scale-110" />;
  if (code >= 600 && code < 700)
    return <CloudSnow className="h-8 w-8 md:h-10 md:w-10 text-blue-300 transition-transform hover:scale-110" />;
  if (code === 800)
    return <Sun className="h-8 w-8 md:h-10 md:w-10 text-yellow-400 transition-transform hover:scale-110" />;
  if (code > 800)
    return <Cloudy className="h-8 w-8 md:h-10 md:w-10 text-gray-400 transition-transform hover:scale-110" />;
  return <Cloud className="h-8 w-8 md:h-10 md:w-10 text-gray-500 transition-transform hover:scale-110" />;
};

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, unitSymbol }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md p-3 md:p-5 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="font-semibold mb-2 md:mb-3 text-sm md:text-base">
          {label}
        </p>
        {payload.map((item: any, index: number) => (
          <p
            key={index}
            className="text-xs md:text-sm font-medium"
            style={{ color: item.color }}
          >
            {item.name}: {item.value}
            {unitSymbol}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

// Updated chart configuration with explicit axis props
const chartConfig = {
  xAxis: {
    stroke: "#6B7280",
    tick: {
      fontSize: 12,
      angle: -45,
      textAnchor: "end" as const,
    },
    height: 60,
    axisLine: { stroke: "#6B7280" },
    tickLine: { stroke: "#6B7280" },
  },
  yAxis: {
    stroke: "#6B7280",
    tick: {
      fontSize: 12,
    },
    width: 45,
    axisLine: { stroke: "#6B7280" },
    tickLine: { stroke: "#6B7280" },
    domain: ["auto", "auto"] as ["auto", "auto"],
    padding: { top: 20, bottom: 20 },
  },
  cartesianGrid: {
    strokeDasharray: "3 3",
    stroke: "#9CA3AF",
    opacity: 0.1,
  },
  legend: {
    wrapperStyle: { fontSize: "12px", marginTop: "10px" },
  },
  margin: {
    top: 5,
    right: 10,
    left: 0,
    bottom: 5,
  },
};

const ForecastDisplay: React.FC<ForecastDisplayProps> = ({
  forecast,
  unit,
}) => {
  if (!forecast) return null;

  const dailyForecasts = forecast.list.reduce<Record<string, DayForecast>>(
    (acc, item) => {
      const formattedDate = formatDate(item.dt);
      if (!acc[formattedDate]) {
        acc[formattedDate] = {
          date: formattedDate,
          temps: [],
          icon: item.weather[0].id,
          description: item.weather[0].description,
        };
      }
      acc[formattedDate].temps.push(item.main.temp);
      return acc;
    },
    {}
  );

  const processedData = Object.values(dailyForecasts)
    .slice(0, 5)
    .map((day) => ({
      ...day,
      high: Math.round(Math.max(...day.temps)),
      low: Math.round(Math.min(...day.temps)),
      avg: Math.round(
        day.temps.reduce((a: number, b: number) => a + b, 0) / day.temps.length
      ),
      name: day.date,
      tempRange: Math.round(Math.max(...day.temps) - Math.min(...day.temps)),
    }));

  const unitSymbol = unit === "metric" ? "°C" : "°F";

  const renderYAxisTick = (value: number) => `${value}${unitSymbol}`;

  return (
    <div className="space-y-6 md:space-y-10 p-4 md:p-6 bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-2xl">
      {/* Header section remains the same... */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
          5-Day Weather Forecast
        </h3>
      </div>

      {/* Daily forecast cards remain the same... */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-5">
        {processedData.map((day) => (
          <div
            key={day.date}
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl p-4 md:p-5 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100 dark:border-gray-700"
          >
            <p className="text-sm md:text-lg font-bold text-gray-700 dark:text-gray-200">
              {day.date}
            </p>
            <div className="flex justify-center my-3 md:my-4">
              {getWeatherIcon(day.icon)}
            </div>
            <p className="text-base md:text-base font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              {day.high}
              {unitSymbol}
              <span className="text-gray-400 dark:text-gray-500 mx-2">/</span>
              {day.low}
              {unitSymbol}
            </p>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 mt-2 md:mt-3 capitalize font-medium">
              {day.description}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {/* Temperature Trend Chart */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl p-4 md:p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <h4 className="text-xl md:text-2xl font-bold mb-6 md:mb-8 bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
            Temperature Trend
          </h4>
          <div className="h-[300px] md:h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={processedData}
                margin={chartConfig.margin}
              >
                <CartesianGrid {...chartConfig.cartesianGrid} />
                <XAxis
                  dataKey="name"
                  {...chartConfig.xAxis}
                />
                <YAxis
                  {...chartConfig.yAxis}
                  tickFormatter={renderYAxisTick}
                  orientation="left"
                  type="number"
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip unitSymbol={unitSymbol} />} />
                <Legend {...chartConfig.legend} />
                <Line
                  type="monotone"
                  dataKey="high"
                  name="High"
                  stroke="#EF4444"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 7 }}
                />
                <Line
                  type="monotone"
                  dataKey="avg"
                  name="Average"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 7 }}
                />
                <Line
                  type="monotone"
                  dataKey="low"
                  name="Low"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Temperature Range Chart */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl p-4 md:p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <h4 className="text-xl md:text-2xl font-bold mb-6 md:mb-8 bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
            Daily Temperature Range
          </h4>
          <div className="h-[300px] md:h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={processedData}
                margin={chartConfig.margin}
              >
                <CartesianGrid {...chartConfig.cartesianGrid} />
                <XAxis
                  dataKey="name"
                  {...chartConfig.xAxis}
                />
                <YAxis
                  {...chartConfig.yAxis}
                  tickFormatter={renderYAxisTick}
                  orientation="left"
                  type="number"
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip unitSymbol={unitSymbol} />} />
                <Legend {...chartConfig.legend} />
                <Bar
                  dataKey="tempRange"
                  name="Temperature Range"
                  fill="#1d4ed8"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForecastDisplay;