import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { location, lat, lon, unit = "metric" } = req.query;
  const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: "API key is missing" });
  }
  try {
    let weatherUrl = "";
    let forecastUrl = "";
    if (location) {
      weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=${unit}&appid=${API_KEY}`;
      forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&units=${unit}&appid=${API_KEY}`;
    } else if (lat && lon) {
      weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${unit}&appid=${API_KEY}`;
      forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${unit}&appid=${API_KEY}`;
    } else {
      return res.status(400).json({ error: "Location or coordinates are required" });
    }

    const [weatherRes, forecastRes] = await Promise.all([
      fetch(weatherUrl),
      fetch(forecastUrl),
    ]);

    if (!weatherRes.ok || !forecastRes.ok) {
      throw new Error("Failed to fetch weather data");
    }

    const weather = await weatherRes.json();
    const forecast = await forecastRes.json();

    res.status(200).json({ weather, forecast });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An error occurred";
    res.status(500).json({ error: errorMessage });
  }
}
