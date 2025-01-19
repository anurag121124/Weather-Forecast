import WeatherClient from '@/src/components/client/WeatherClient';
import { getWeatherData } from '@/src/lib/weather';

export default async function Home() {
  const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
  const defaultLocation = "New York";

  try {
    const { weather, forecast } = await getWeatherData(defaultLocation, "metric");

    return (
      <main className="min-h-screen  dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 p-4">
        <WeatherClient initialWeather={weather} initialForecast={forecast} />
      </main>
    );
  } catch (error) {
    return (
      <div className="text-center p-4">
        <h1>Error loading weather data</h1>
        <p>{error instanceof Error ? error.message : "An error occurred"}</p>
      </div>
    );
  }
}