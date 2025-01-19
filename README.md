# Weather Application

A modern weather application built with Next.js, TypeScript, and Tailwind CSS that provides real-time weather information and forecasts.

## Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Components](#components)
- [Hooks](#hooks)
- [Services](#services)
- [Stores](#stores)
- [Configuration](#configuration)

## Introduction

This weather application provides users with real-time weather data, forecasts, and detailed meteorological information. Built with modern web technologies, it offers a responsive and intuitive interface for accessing weather information across different devices.

## Features

- Real-time weather data
- Location-based weather information
- Detailed weather forecasts
- Responsive design
- Dark mode support
- Unit conversion (metric/imperial)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/anurag121124/Weather-Forecast.git
cd Weather-Forecast
```

2. Install dependencies:
```bash
npm install
# or
bun install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Then edit `.env` with your API keys and configuration.

## Usage

### Development
To start the development server:
```bash
npm run dev
# or
bun dev
```

### Building
To build the project:
```bash
npm run build
# or
bun run build
```

### Production
To start the production server:
```bash
npm start
# or
bun start
```

## Project Structure

```
.
├── app/
│   ├── api/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── hooks/
│   └── use-toast.ts
├── src/
│   ├── components/
│   │   └── ForecastDisplay.tsx
│   ├── lib/
│   ├── services/
│   │   └── weather.service.ts
│   ├── stores/
│   │   └── WeatherStore.ts
│   └── types/
├── tailwind.config.ts
└── tsconfig.json
```

## API Reference

### WeatherService

Located in `src/services/weather.service.ts`, this service handles all weather-related API calls.

#### Methods

- `getWeatherByLocation(location: string): Promise<WeatherData>`
  - Fetches weather data for a specific location
  - Parameters:
    - `location`: String representing the city or coordinates
  - Returns: Promise resolving to WeatherData object

## Components

### ForecastDisplay

Location: `src/components/ForecastDisplay.tsx`

A component that displays weather forecast information with the following features:
- Current temperature display
- Weather condition icons
- Detailed metrics (humidity, wind speed, pressure)
- Responsive layout

## Hooks

### useToast

Location: `hooks/use-toast.ts`

A custom hook for managing toast notifications throughout the application.

## Services

### WeatherService

Location: `src/services/weather.service.ts`

Handles all weather-related API calls and data transformations.

## Stores

### WeatherStore

Location: `src/stores/WeatherStore.ts`

Manages the global weather state using a state management solution.

## Configuration

### Environment Variables

Required environment variables:
```
NEXT_PUBLIC_WEATHER_API_KEY=your_api_key
NEXT_PUBLIC_API_URL=https://api.weatherservice.com
```

### Tailwind Configuration

The project uses Tailwind CSS for styling. Configuration can be found in `tailwind.config.ts`.


For more information or support, please open an issue in the repository.