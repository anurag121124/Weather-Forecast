import { Star, StarOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useWeatherStore } from '@/stores/WeatherStore'

export default function FavoriteLocations() {


  return (
    <div>
      {currentWeather && (
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleFavorite}
          className="flex items-center gap-2"
        >
          {isFavorite ? (
            <>
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              Remove from favorites
            </>
          ) : (
            <>
              <StarOff className="h-4 w-4" />
              Add to favorites
            </>
          )}
        </Button>
      )}
      
      {favorites.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Favorite Locations</h3>
          <div className="flex flex-wrap gap-2">
            {favorites.map((location) => (
              <Button
                key={location}
                variant="outline"
                size="sm"
                onClick={() => {
                }}
              >
                {location}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}