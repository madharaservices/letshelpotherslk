"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { X, Loader2, Send, MapPin, Eraser } from 'lucide-react';
import { toast } from 'sonner'

// OpenStreetMap (Nominatim) API එකෙන් Coordinates ගන්න Helper Function එක
const getCoordinatesFromText = async (locationText: string) => {
  try {
    // ශ්‍රී ලංකාව ඇතුලේ විතරක් සොයන්න ", Sri Lanka" අගට එකතු කරනවා
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

export default function RequestForm({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '', 
    phone: '', 
    type: 'rescue', 
    location: '', // User type කරන Text එක (උදා: Malabe)
    description: '', 
    latitude: null as number | null, // Map එකට ඕන ඉලක්කම්
    longitude: null as number | null
  });

  // GPS Button එක එබුවම ක්‍රියාත්මක වන කොටස
  const handleGetGPS = () => {
    setGpsLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData(prev => ({
            ...prev,
            location: `GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`, // පෙන්නන්න විතරයි
            latitude: latitude, 
            longitude: longitude
          }));
          // --- ALERT එක වෙනුවට TOAST එක ---
          toast.success("ස්ථානය (GPS) සාර්ථකව ලබා ගත්තා!"); 
          
          setGpsLoading(false);
        },
        () => { 
            toast.error("Location ලබා ගත නොහැක. Device Location On ද බලන්න."); 
            setGpsLoading(false); 
        },
        { enableHighAccuracy: true }
      );
    } else {
      toast.error("GPS පහසුකම නැත.");
      setGpsLoading(false);
    }
  };

  // Manual Location Type කරද්දි පරණ GPS ඛණ්ඩාංක අයින් කරන්න ඕනේ
  const handleLocationTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      location: e.target.value,
      latitude: null, // Type කරනවා නම් Auto ගත්ත Coordinates අයින් කරනවා
      longitude: null
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let finalLat = formData.latitude;
    let finalLon = formData.longitude;

    // GPS ඛණ්ඩාංක නැත්නම්, Type කරපු Text එකෙන් ඛණ්ඩාංක සොයන්න (Geocoding)
    if (!finalLat && formData.location) {
        // GPS නැති අයට Manual දාපු නම යවලා Coordinates ගන්නවා
        const coords = await getCoordinatesFromText(formData.location);
        if (coords) {
            finalLat = coords.lat;
            finalLon = coords.lon;
        }
    }

    // දත්ත Supabase එකට යැවීම
    const { error } = await supabase.from('requests').insert([{
        ...formData,
        latitude: finalLat,
        longitude: finalLon
    }]);

    setLoading(false);
    
    if (error) { 
        alert('දෝෂයක්! නැවත උත්සාහ කරන්න.'); 
    } else { 
        onSuccess(); 
        onClose(); 
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-end md:items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-t-3xl md:rounded-3xl p-6 animate-in slide-in-from-bottom-10 fade-in duration-300 shadow-2xl">
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
          <h3 className="text-xl font-bold text-slate-900">නව ඉල්ලීමක්</h3>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition"><X className="w-5 h-5 text-slate-600" /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">ඔබේ නම (හෝ විපතට පත් අයගේ නම)</label>
            <input required type="text" className="w-full p-3 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 focus:ring-2 focus:ring-blue-900/20 outline-none" onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="block text-xs font-bold text-slate-600 uppercase mb-1">දුරකථන</label>
               <input required type="tel" className="w-full p-3 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 outline-none" onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div>
               <label className="block text-xs font-bold text-slate-600 uppercase mb-1">අවශ්‍යතාවය</label>
               <select className="w-full p-3 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 outline-none" onChange={e => setFormData({...formData, type: e.target.value})}>
                 <option value="rescue">බේරාගැනීම් (Rescue)</option>
                 <option value="food">ආහාර/ජලය</option>
                 <option value="medicine">බෙහෙත්</option>
                 <option value="shelter">නවාතැන්</option>
                 <option value="other">වෙනත්</option>
               </select>
            </div>
          </div>

          {/* Location Section - Updated Logic */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">ස්ථානය (Manual Type හෝ GPS)</label>
            <div className="flex gap-2">
                <input 
                    required 
                    type="text" 
                    className="w-full p-3 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 outline-none font-medium"
                    placeholder="ගම හෝ නගරය Type කරන්න..."
                    value={formData.location}
                    onChange={handleLocationTyping} 
                />
                
                {/* GPS Button */}
                <button 
                    type="button" 
                    onClick={handleGetGPS} 
                    disabled={gpsLoading} 
                    className="p-3 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition min-w-[50px] flex justify-center items-center"
                    title="මගේ ස්ථානය ගන්න"
                >
                    {gpsLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <MapPin className="w-5 h-5" />}
                </button>
            </div>
            
            {/* Helper Text */}
            <p className="text-[10px] text-slate-500 mt-1 leading-tight">
                * ඔබ වෙනත් කෙනෙක් වෙනුවෙන් දමනවා නම්, <b>ඔවුන් ඉන්නා නගරය Type කරන්න.</b> (උදා: Malabe, Kaduwela).
                <br/>* ඔබ එතැනම සිටී නම් දකුණු පස GPS button එක ඔබන්න.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">විස්තරය</label>
            <textarea required rows={3} placeholder="වැඩිදුර විස්තර..." className="w-full p-3 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 outline-none" onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
          </div>

          <button disabled={loading} type="submit" className="w-full py-4 bg-blue-900 text-white font-bold rounded-xl hover:bg-blue-800 transition flex justify-center gap-2 shadow-lg shadow-blue-900/20 active:scale-95">
            {loading ? <Loader2 className="animate-spin" /> : <><Send className="w-5 h-5" /> පලකරන්න</>}
          </button>
        </form>
      </div>
    </div>
  );
}