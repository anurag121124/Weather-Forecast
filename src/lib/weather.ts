export async function getWeatherData(location: string, unit: string = "metric") {
    const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
  
    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=${unit}&appid=${API_KEY}`
    );
    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${location}&units=${unit}&appid=${API_KEY}`
    );
  
    if (!weatherRes.ok || !forecastRes.ok) {
      throw new Error("Failed to fetch weather data");
    }
  
    const weather = await weatherRes.json();
    const forecast = await forecastRes.json();
  
    return { weather, forecast };
  }