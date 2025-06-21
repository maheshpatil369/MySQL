import React, { useState, useEffect } from 'react';
import { MapPin, Thermometer, Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Wind, AlertTriangle, Loader2 } from 'lucide-react';

const WeatherWidget = () => {
  const [location, setLocation] = useState(null);
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const googleMapsApiKey = "AIzaSyDiyfxTxJCt4ZgVnkblMoZkIS1-VO3j6yE"; // From your Maps.jsx
  const openWeatherMapApiKey = "7a268ec30dc025eafed868daa2b7f6b6";

  const weatherIconMap = {
    '01d': <Sun className="w-8 h-8 text-yellow-400" />, // clear sky day
    '01n': <Sun className="w-8 h-8 text-yellow-400" />, // clear sky night (using Sun for simplicity, could use Moon)
    '02d': <Cloud className="w-8 h-8 text-blue-300" />, // few clouds day
    '02n': <Cloud className="w-8 h-8 text-blue-300" />, // few clouds night
    '03d': <Cloud className="w-8 h-8 text-gray-400" />, // scattered clouds
    '03n': <Cloud className="w-8 h-8 text-gray-400" />,
    '04d': <Cloud className="w-8 h-8 text-gray-500" />, // broken clouds
    '04n': <Cloud className="w-8 h-8 text-gray-500" />,
    '09d': <CloudRain className="w-8 h-8 text-blue-500" />, // shower rain
    '09n': <CloudRain className="w-8 h-8 text-blue-500" />,
    '10d': <CloudRain className="w-8 h-8 text-blue-400" />, // rain day
    '10n': <CloudRain className="w-8 h-8 text-blue-400" />, // rain night
    '11d': <CloudLightning className="w-8 h-8 text-yellow-500" />, // thunderstorm
    '11n': <CloudLightning className="w-8 h-8 text-yellow-500" />,
    '13d': <CloudSnow className="w-8 h-8 text-blue-200" />, // snow
    '13n': <CloudSnow className="w-8 h-8 text-blue-200" />,
    '50d': <Wind className="w-8 h-8 text-gray-400" />, // mist
    '50n': <Wind className="w-8 h-8 text-gray-400" />,
    default: <Cloud className="w-8 h-8 text-gray-400" />,
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        setError("Unable to retrieve your location. Please enable location services.");
        // Fallback: Try to get weather for a default city or IP-based location if desired
        // For now, just show error.
        setLoading(false);
      }
    );
  }, []);

  useEffect(() => {
    if (!location) return;

    const fetchCityAndWeather = async () => {
      setLoading(true);
      setError('');
      try {
        // 1. Reverse Geocode to get City
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.latitude},${location.longitude}&key=${googleMapsApiKey}`;
        const geocodeResponse = await fetch(geocodeUrl);
        if (!geocodeResponse.ok) throw new Error('Failed to fetch city data');
        const geocodeData = await geocodeResponse.json();
        
        if (geocodeData.status !== 'OK' || !geocodeData.results || geocodeData.results.length === 0) {
          throw new Error(geocodeData.error_message || 'Could not determine city from location.');
        }

        let foundCity = 'Unknown City';
        // Look for 'locality' or 'administrative_area_level_2' or 'administrative_area_level_1'
        for (const result of geocodeData.results) {
          for (const component of result.address_components) {
            if (component.types.includes('locality')) {
              foundCity = component.long_name;
              break;
            }
            if (foundCity === 'Unknown City' && component.types.includes('administrative_area_level_2')) {
              foundCity = component.long_name;
            }
             if (foundCity === 'Unknown City' && component.types.includes('administrative_area_level_1')) {
              foundCity = component.long_name;
            }
          }
          if (foundCity !== 'Unknown City') break;
        }
        setCity(foundCity);

        // 2. Fetch Weather Data
        if (foundCity !== 'Unknown City') {
          const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${location.latitude}&lon=${location.longitude}&appid=${openWeatherMapApiKey}&units=metric`;
          // Or use city name: `https://api.openweathermap.org/data/2.5/weather?q=${foundCity}&appid=${openWeatherMapApiKey}&units=metric`;
          // Using lat/lon is generally more accurate if available.
          const weatherResponse = await fetch(weatherUrl);
          if (!weatherResponse.ok) {
            const errorData = await weatherResponse.json();
            throw new Error(errorData.message || 'Failed to fetch weather data');
          }
          const weatherData = await weatherResponse.json();
          setWeather(weatherData);
        } else {
          throw new Error('City could not be determined to fetch weather.');
        }

      } catch (err) {
        console.error("Weather widget error:", err);
        setError(err.message || 'Could not fetch weather information.');
      } finally {
        setLoading(false);
      }
    };

    fetchCityAndWeather();
  }, [location, googleMapsApiKey, openWeatherMapApiKey]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-md text-sm text-gray-700 dark:text-gray-300">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Loading weather...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center p-3 bg-red-100 dark:bg-red-900/30 backdrop-blur-sm rounded-lg shadow-md text-sm text-red-700 dark:text-red-300">
        <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  if (!weather) {
    return null; // Or some other placeholder if weather couldn't be fetched but no explicit error
  }

  return (
    <div className="p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-md text-gray-800 dark:text-white">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center">
          <MapPin className="w-4 h-4 mr-1.5 text-blue-500" />
          <span className="font-semibold text-sm truncate" title={city}>{city || 'Loading city...'}</span>
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400">Now</div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {weatherIconMap[weather.weather[0].icon] || weatherIconMap.default}
          <span className="text-2xl font-bold ml-2">{Math.round(weather.main.temp)}°C</span>
        </div>
        <div className="text-xs text-right text-gray-700 dark:text-gray-300 capitalize">
          {weather.weather[0].description}
          <div>H: {Math.round(weather.main.temp_max)}° L: {Math.round(weather.main.temp_min)}°</div>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;