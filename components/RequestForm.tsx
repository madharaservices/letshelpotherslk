"use client";
import { useState, useEffect } from 'react'; // useEffect එකතු කළා
import { supabase } from '@/lib/supabase';
import { X, Loader2, Send, MapPin } from 'lucide-react';

export default function RequestForm({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', phone: '', type: 'rescue', location: '', description: '', latitude: null as number | null, longitude: null as number | null
  });

  // --- NEW: Form එක Open වෙද්දිම Auto Location ගන්නවා ---
  useEffect(() => {
    handleGetLocation(true); // true = Silent Mode (No alerts)
  }, []);

  // Updated Function: silent parameter එකතු කළා
  const handleGetLocation = (silent: boolean = false) => {
    setGpsLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData(prev => ({
            ...prev,
            location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`, 
            latitude: latitude, 
            longitude: longitude
          }));
          
          if (!silent) alert("ස්ථානය සාර්ථකව ලබා ගත්තා!"); // Button එක එබුවොත් විතරක් කියනවා
          setGpsLoading(false);
        },
        () => { 
            if (!silent) alert("Location ලබා ගත නොහැක. Device Location On ද බලන්න."); 
            setGpsLoading(false); 
        },
        { enableHighAccuracy: true }
      );
    } else {
      if (!silent) alert("GPS පහසුකම නැත.");
      setGpsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('requests').insert([formData]);
    setLoading(false);
    if (error) { alert('දෝෂයක්! නැවත උත්සාහ කරන්න.'); } 
    else { onSuccess(); onClose(); }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-end md:items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-t-3xl md:rounded-3xl p-6 animate-in slide-in-from-bottom-10 fade-in duration-300 shadow-2xl">
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
          <h3 className="text-xl font-bold text-slate-900">නව ඉල්ලීමක්</h3>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full"><X className="w-5 h-5 text-slate-600" /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">ඔබේ නම</label>
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
                 <option value="rescue">බේරාගැනීම්</option>
                 <option value="food">ආහාර/ජලය</option>
                 <option value="medicine">බෙහෙත්</option>
                 <option value="shelter">නවාතැන්</option>
               </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">ස්ථානය</label>
            <div className="flex gap-2">
                <input required type="text" 
                className="w-full p-3 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 outline-none font-medium"
                placeholder={gpsLoading ? "ස්ථානය සොයමින්..." : "ස්ථානය හෝ GPS ඛණ්ඩාංක"}
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})} />
                
                <button type="button" onClick={() => handleGetLocation(false)} disabled={gpsLoading} className="p-3 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition">
                    {gpsLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <MapPin className="w-5 h-5" />}
                </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">* දකුණු පස Button එක ඔබා Auto Location ලබා දෙන්න.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">විස්තරය</label>
            <textarea required rows={3} className="w-full p-3 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 outline-none" onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
          </div>

          <button disabled={loading} type="submit" className="w-full py-4 bg-blue-900 text-white font-bold rounded-xl hover:bg-blue-800 transition flex justify-center gap-2">
            {loading ? <Loader2 className="animate-spin" /> : <><Send className="w-5 h-5" /> පලකරන්න</>}
          </button>
        </form>
      </div>
    </div>
  );
}