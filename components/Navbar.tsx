// components/Navbar.tsx
"use client";
import { useState } from 'react';
import { AlertTriangle, PhoneCall } from 'lucide-react'; // PhoneCall අයිකන් එක ගත්තා
import WeatherWidget from './WeatherWidget';
import EmergencyHotlines from './EmergencyHotlines';

export default function Navbar() {
  const [showHotlines, setShowHotlines] = useState(false);

  return (
    <>
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <div className="bg-blue-950 p-2.5 rounded-xl shadow-sm">
              <AlertTriangle className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold leading-none text-slate-900 tracking-tight">HelpSL</h1>
              <p className="text-[11px] text-blue-700 font-semibold">ශ්‍රී ලංකා ආපදා සහන</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Weather Widget */}
            <div className="hidden md:block">
               <WeatherWidget />
            </div>

            {/* Hotlines Button (New Feature) */}
            <button 
              onClick={() => setShowHotlines(true)}
              className="flex items-center gap-2 bg-red-600 text-white px-3 py-2 rounded-full shadow-md hover:bg-red-700 transition active:scale-95 animate-pulse"
            >
              <PhoneCall className="w-4 h-4" />
              <span className="text-xs font-bold hidden sm:block">හදිසි ඇමතුම්</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Weather (Show below nav on small screens if needed, strictly optional) */}
      <div className="md:hidden px-4 py-2 bg-white/50 backdrop-blur-sm border-b border-slate-100 flex justify-center">
         <WeatherWidget />
      </div>

      {/* Emergency Modal */}
      {showHotlines && <EmergencyHotlines onClose={() => setShowHotlines(false)} />}
    </>
  );
}