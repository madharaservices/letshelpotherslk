"use client";

import { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import RequestList from '@/components/RequestList';
import RequestForm from '@/components/RequestForm';
import Footer from '@/components/Footer';
import { Plus, AlertTriangle, Heart, MapPin } from 'lucide-react';

export default function Home() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // --- 1. Web එක Open වෙද්දිම Location Permission ඉල්ලන කොටස ---
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => console.log("Location Access Granted"),
        (err) => console.log("Location Access Needed"),
        { timeout: 10000 }
      );
    }
  }, []);

  // --- 2. Map එක Smooth Load වෙන්න හදපු කොටස ---
  const Map = useMemo(() => dynamic(
    () => import('@/components/RealtimeMap'),
    { 
      loading: () => (
        <div className="h-[400px] w-full bg-slate-100 rounded-3xl animate-pulse flex flex-col items-center justify-center text-slate-400 border border-slate-200">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-2"></div>
          <span className="text-xs font-medium">සිතියම සකසමින්...</span>
        </div>
      ),
      ssr: false 
    }
  ), []);

  // --- 3. Missing Function Fixed Here (මේක තමයි කලින් අඩුවෙලා තිබුණේ) ---
  const handleSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-200">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-950 to-slate-900 text-white px-4 py-10 mb-6 rounded-b-[2.5rem] shadow-xl shadow-blue-900/20">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-800/50 border border-blue-700/50 text-blue-200 text-[10px] font-bold tracking-wider">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            LIVE OPERATION
          </div>
          <h2 className="text-3xl md:text-4xl font-bold leading-tight">
            ඔබට අවශ්‍ය <span className="text-blue-400">සහය</span> කුමක්ද?
          </h2>
          <div className="flex justify-center gap-3 mt-6">
            <button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2 px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-red-900/40 active:scale-95 transition-all">
              <AlertTriangle className="w-4 h-4" /> උදව් ඉල්ලන්න
            </button>
            <button className="flex items-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 rounded-xl font-bold text-sm active:scale-95 transition-all text-white">
              <Heart className="w-4 h-4 text-pink-400" /> උදව් කරන්න
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        
        {/* Real-time Map Section */}
        <div className="bg-white p-2 rounded-3xl shadow-sm border border-slate-100">
          <div className="px-4 py-3">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              ආපදා සිතියම (Live Map)
            </h3>
            <p className="text-xs text-slate-500">Auto Location ලබා දුන් ඉල්ලීම් මෙහි දිස්වේ.</p>
          </div>
          <Map />
        </div>

        {/* Request List */}
        <RequestList refreshTrigger={refreshTrigger} />
      </div>

      <Footer />

      {/* Mobile Floating Button */}
      <div className="fixed bottom-6 right-6 md:hidden z-40">
        <button onClick={() => setIsFormOpen(true)} className="bg-blue-900 text-white p-4 rounded-full shadow-2xl hover:bg-blue-800 transition-all border-4 border-slate-50">
          <Plus className="w-7 h-7" />
        </button>
      </div>

      {/* Form Modal */}
      {isFormOpen && <RequestForm onClose={() => setIsFormOpen(false)} onSuccess={handleSuccess} />}
    </div>
  );
}