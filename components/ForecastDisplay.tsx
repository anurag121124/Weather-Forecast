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
  Bar
} from 'recharts';

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
  if (code >= 200 && code < 300) return <CloudLightning className="h-6 w-6 md:h-8 md:w-8 text-yellow-500" />;
  if (code >= 300 && code < 600) return <CloudRain className="h-6 w-6 md:h-8 md:w-8 text-blue-500" />;
  if (code >= 600 && code < 700) return <CloudSnow className="h-6 w-6 md:h-8 md:w-8 text-blue-300" />;
  if (code === 800) return <Sun className="h-6 w-6 md:h-8 md:w-8 text-yellow-400" />;
  if (code > 800) return <Cloudy className="h-6 w-6 md:h-8 md:w-8 text-gray-400" />;
  return <Cloud className="h-6 w-6 md:h-8 md:w-8 text-gray-500" />;
};

const CustomTooltip = ({ active, payload, label, unitSymbol }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-2 md:p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="font-semibold mb-1 md:mb-2 text-sm md:text-base">{label}</p>
        {payload.map((item: any, index: number) => (
          <p key={index} className="text-xs md:text-sm" style={{ color: item.color }}>
            {item.name}: {item.value}{unitSymbol}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};

export default function ForecastDisplay({ forecast, unit }: ForecastDisplayProps) {
  if (!forecast) return null;

  const dailyForecasts = forecast.list.reduce<Record<string, DayForecast>>((acc, item) => {
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
      name: day.date,
      tempRange: Math.round(Math.max(...day.temps) - Math.min(...day.temps))
    }));

  const unitSymbol = unit === "metric" ? "°C" : "°F";

  return (
    <div className="space-y-4 md:space-y-8 p-2 md:p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
          5-Day Forecast
        </h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-4">
        {processedData.map((day) => (
          <div
            key={day.date}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl p-2 md:p-4 text-center hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            <p className="text-sm md:text-lg font-semibold text-gray-700 dark:text-gray-200">
              {day.date}
            </p>
            <div className="flex justify-center my-2 md:my-3">
              {getWeatherIcon(day.icon)}
            </div>
            <p className="text-sm md:text-lg font-bold text-gray-800 dark:text-gray-100">
              {day.high}{unitSymbol} 
              <span className="text-gray-500 dark:text-gray-400 mx-1">/</span> 
              {day.low}{unitSymbol}
            </p>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 mt-1 md:mt-2 capitalize">
              {day.description}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Temperature Trend Chart */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl p-3 md:p-6">
          <h4 className="text-lg md:text-xl font-semibold mb-4 md:mb-6 text-gray-800 dark:text-gray-100">
            Temperature Trend
          </h4>
          <div className="h-[250px] md:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={processedData}
                margin={{
                  top: 5,
                  right: 10,
                  left: 0,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#9CA3AF" opacity={0.1} />
                <XAxis 
                  dataKey="name" 
                  stroke="#6B7280"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  stroke="#6B7280"
                  tickFormatter={(value) => `${value}${unitSymbol}`}
                  tick={{ fontSize: 12 }}
                  width={40}
                />
                <Tooltip content={<CustomTooltip unitSymbol={unitSymbol} />} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line
                  type="monotone"
                  dataKey="high"
                  name="High"
                  stroke="#EF4444"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="avg"
                  name="Average"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="low"
                  name="Low"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Temperature Range Chart */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl p-3 md:p-6">
          <h4 className="text-lg md:text-xl font-semibold mb-4 md:mb-6 text-gray-800 dark:text-gray-100">
            Daily Temperature Range
          </h4>
          <div className="h-[250px] md:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={processedData}
                margin={{
                  top: 5,
                  right: 10,
                  left: 0,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#9CA3AF" opacity={0.1} />
                <XAxis 
                  dataKey="name" 
                  stroke="#6B7280"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  stroke="#6B7280"
                  tickFormatter={(value) => `${value}${unitSymbol}`}
                  tick={{ fontSize: 12 }}
                  width={40}
                />
                <Tooltip content={<CustomTooltip unitSymbol={unitSymbol} />} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar
                  dataKey="tempRange"
                  name="Temperature Range"
                  fill="#8884d8"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}