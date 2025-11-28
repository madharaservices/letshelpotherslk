"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { X, Loader2, Heart, MapPin } from 'lucide-react';
import { toast } from 'sonner';

// Geocoding Helper
const getCoordinatesFromText = async (locationText: string) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationText + ", Sri Lanka")}`
    );
    const data = await response.json();
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    }
  } catch (error) {
    console.error("Geocoding Error:", error);
  }
  return null;
};

export default function OfferForm({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '', phone: '', type: 'food', location: '', description: '', latitude: null as number | null, longitude: null as number | null
  });

  const handleGetGPS = () => {
    setGpsLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData(prev => ({ ...prev, location: `GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`, latitude, longitude }));
          toast.success("ස්ථානය (GPS) ලබා ගත්තා!");
          setGpsLoading(false);
        },
        () => { toast.error("Location ලබා ගත නොහැක."); setGpsLoading(false); },
        { enableHighAccuracy: true }
      );
    } else { toast.error("GPS පහසුකම නැත."); setGpsLoading(false); }
  };

  const handleLocationTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, location: e.target.value, latitude: null, longitude: null });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let finalLat = formData.latitude;
    let finalLon = formData.longitude;

    if (!finalLat && formData.location) {
        const coords = await getCoordinatesFromText(formData.location);
        if (coords) { finalLat = coords.lat; finalLon = coords.lon; }
    }

    const { error } = await supabase.from('offers').insert([{ ...formData, latitude: finalLat, longitude: finalLon }]);
    setLoading(false);
    
    if (error) { toast.error('දෝෂයක්! නැවත උත්සාහ කරන්න.'); } 
    else { toast.success('ඔබගේ පරිත්‍යාගය පල කරන ලදී!'); onSuccess(); onClose(); }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-end md:items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-t-3xl md:rounded-3xl p-6 animate-in slide-in-from-bottom-10 fade-in duration-300 shadow-2xl">
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2"><Heart className="text-pink-500 w-6 h-6"/> මම උදව් කරමි</h3>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition"><X className="w-5 h-5 text-slate-600" /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">ඔබේ නම / ආයතනය</label>
            <input required type="text" className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none" onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="block text-xs font-bold text-slate-600 uppercase mb-1">දුරකථන</label>
               <input required type="tel" className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none" onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div>
               <label className="block text-xs font-bold text-slate-600 uppercase mb-1">ලබා දිය හැක්කේ?</label>
               <select className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none" onChange={e => setFormData({...formData, type: e.target.value})}>
                 <option value="food">ආහාර/ජලය (Food)</option>
                 <option value="boat">බෝට්ටු/වාහන (Transport)</option>
                 <option value="medicine">බෙහෙත් (Medicine)</option>
                 <option value="shelter">නවාතැන් (Shelter)</option>
                 <option value="other">වෙනත්</option>
               </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">ඔබ සිටින ස්ථානය</label>
            <div className="flex gap-2">
                <input required type="text" className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none font-medium" placeholder="නගරය Type කරන්න..." value={formData.location} onChange={handleLocationTyping} />
                <button type="button" onClick={handleGetGPS} disabled={gpsLoading} className="p-3 bg-pink-100 text-pink-600 rounded-xl hover:bg-pink-200 transition min-w-[50px] flex justify-center items-center">
                    {gpsLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <MapPin className="w-5 h-5" />}
                </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">විස්තරය (ලබා දෙන දේවල්)</label>
            <textarea required rows={3} className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none" placeholder="උදා: බත් පැකට් 50ක් දිය හැක..." onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
          </div>

          <button disabled={loading} type="submit" className="w-full py-4 bg-pink-600 text-white font-bold rounded-xl hover:bg-pink-700 transition flex justify-center gap-2 shadow-lg active:scale-95">
            {loading ? <Loader2 className="animate-spin" /> : "පලකරන්න"}
          </button>
        </form>
      </div>
    </div>
  );
}