"use client";

import { Button } from "@/components/ui/button";
import { Thermometer } from "lucide-react";

interface UnitToggleProps {
  unit: "metric" | "imperial";
  setUnit: (unit: "metric" | "imperial") => void;
}

export function UnitToggle({ unit, setUnit }: UnitToggleProps) {
  return (
    <div className="flex items-center space-x-2">
      <Thermometer className="h-4 w-4" />
      <div className="flex rounded-lg overflow-hidden">
        <Button
          variant={unit === "metric" ? "default" : "outline"}
          className="rounded-none rounded-l-lg"
          onClick={() => setUnit("metric")}
        >
          °C
        </Button>
        <Button
          variant={unit === "imperial" ? "default" : "outline"}
          className="rounded-none rounded-r-lg"
          onClick={() => setUnit("imperial")}
        >
          °F
        </Button>
      </div>
    </div>
  );
}