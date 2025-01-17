import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const location = searchParams.get('location');
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const unit = searchParams.get('unit') || 'metric';
  const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

  try {
    let weatherUrl: string;
    let forecastUrl: string;

    if (lat && lon) {
      weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${unit}&appid=${API_KEY}`;
      forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${unit}&appid=${API_KEY}`;
    } else if (location) {
      weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=${unit}&appid=${API_KEY}`;
      forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&units=${unit}&appid=${API_KEY}`;
    } else {
      return NextResponse.json(
        { error: 'Location parameters are required' },
        { status: 400 }
      );
    }

    const [weatherRes, forecastRes] = await Promise.all([
      fetch(weatherUrl),
      fetch(forecastUrl),
    ]);

    if (!weatherRes.ok || !forecastRes.ok) {
      throw new Error('Failed to fetch weather data');
    }

    const weather = await weatherRes.json();
    const forecast = await forecastRes.json();

    return NextResponse.json({ weather, forecast });
  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
}