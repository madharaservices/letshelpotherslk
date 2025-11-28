"use client";
import { useEffect, useState } from 'react';
import { CloudRain, Sun, Cloud, Loader2, CloudLightning, MapPin } from 'lucide-react';

export default function WeatherWidget() {
  const [weather, setWeather] = useState<{ temp: number, code: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
          const data = await res.json();
          setWeather({ temp: data.current_weather.temperature, code: data.current_weather.weathercode });
        } catch (error) {
          console.error("Weather error", error);
          setError(true);
        } finally {
          setLoading(false);
        }
      }, () => {
        setLoading(false);
        setError(true);
      });
    } else {
      setLoading(false);
      setError(true);
    }
  }, []);

  // Small Loading State
  if (loading) return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/90 text-white rounded-full shadow-sm border border-slate-700/50">
        <Loader2 className="w-3 h-3 animate-spin text-blue-400"/> 
        <span className="text-[10px] font-bold tracking-wide">සොයමින්...</span>
    </div>
  );

  // Small Error State
  if (error || !weather) return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/90 text-white rounded-full shadow-sm border border-slate-700/50">
        <MapPin className="w-3 h-3 text-gray-400"/> 
        <span className="text-[10px] font-bold tracking-wide">GPS Off</span>
    </div>
  );

  // Weather Logic
  let Icon = Sun;
  let label = "පැහැදිලියි";
  let iconColor = "text-yellow-400";
  const containerStyle = "bg-slate-900"; // Simple dark background for better contrast

  if (weather.code >= 95) { 
    Icon = CloudLightning; label = "ගිගුරුම්"; iconColor = "text-yellow-300";
  } else if (weather.code >= 51 || weather.code >= 80) { 
    Icon = CloudRain; label = "වැසි"; iconColor = "text-blue-300";
  } else if (weather.code >= 1 && weather.code <= 3) { 
    Icon = Cloud; label = "වලාකුළු"; iconColor = "text-gray-300";
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full shadow-md border border-slate-800 ${containerStyle} text-white transition-all hover:scale-105 cursor-default`}>
      <div className={`p-1 rounded-full bg-white/10 ${iconColor}`}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      
      <div className="flex flex-col leading-none">
        <div className="flex items-center gap-2">
            <span className="text-xs font-bold">{weather.temp}°C</span>
            <span className="text-[10px] opacity-70 font-medium border-l border-white/20 pl-2">{label}</span>
        </div>
      </div>
    </div>
  );
}