"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { MapPin, Phone, Navigation, Clock, ShieldAlert, Utensils, HeartPulse, Home, HelpCircle, Share2, CheckCircle, Check, Heart } from 'lucide-react';
import { toast } from 'sonner';

export default function RequestList({ refreshTrigger }: { refreshTrigger: number }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'requests' | 'offers'>('requests'); // Tab State
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchData();

    // Realtime logic based on active tab
    const tableName = view === 'requests' ? 'requests' : 'offers';
    const channel = supabase
      .channel(`realtime_${tableName}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, (payload) => {
        if (payload.eventType === 'INSERT') {
            setItems((prev) => [payload.new, ...prev]);
        }
        else if (payload.eventType === 'UPDATE') {
            setItems((prev) => prev.map(i => i.id === payload.new.id ? payload.new : i));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [refreshTrigger, view]);

  const fetchData = async () => {
    setLoading(true);
    const tableName = view === 'requests' ? 'requests' : 'offers';
    const { data } = await supabase
      .from(tableName)
      .select('*')
      .order('status', { ascending: false }) // Active ඒවා උඩට
      .order('created_at', { ascending: false });
      
    if (data) setItems(data);
    setLoading(false);
  };

  // --- Mark as Done Feature (Restored) ---
  const handleMarkAsDone = async (id: number) => {
    const confirm = window.confirm("මෙම ඉල්ලීම සම්පූර්ණ වූ බව තහවුරු කරනවාද?");
    if (!confirm) return;

    setActionLoading(id);
    const { error } = await supabase.from('requests').update({ status: 'completed' }).eq('id', id);
    setActionLoading(null);
    
    if (error) toast.error("දෝෂයක් සිදු විය.");
    else toast.success("ඉල්ලීම විසඳුනා ලෙස සලකුණු කරන ලදී!");
  };

  const handleShare = async (item: any) => {
    const text = view === 'requests' 
      ? `🚨 *හදිසි ඉල්ලීමක්!* \n👤 ${item.name}\n📍 ${item.location}\n📞 ${item.phone}\n📝 ${item.description}`
      : `🤝 *උදව් දීමට කැමතියි!* \n👤 ${item.name}\n📍 ${item.location}\n🎁 ${item.type}\n📞 ${item.phone}\n📝 ${item.description}`;
    
    if (navigator.share) { 
        try { await navigator.share({ title: 'HelpSL', text, url: window.location.href }); } catch(e) {} 
    }
    else { window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank'); }
  };

  const getBadgeConfig = (type: string) => {
    if (type === 'boat') return { color: "bg-blue-100 text-blue-800 border-blue-200", icon: Navigation, label: "බෝට්ටු/වාහන" };
    switch(type) {
      case 'rescue': return { color: "bg-red-50 text-red-700 border-red-200", icon: ShieldAlert, label: "බේරාගැනීම්" };
      case 'food': return { color: "bg-orange-50 text-orange-700 border-orange-200", icon: Utensils, label: "ආහාර" };
      case 'medicine': return { color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: HeartPulse, label: "සෞඛ්‍ය" };
      case 'shelter': return { color: "bg-blue-50 text-blue-700 border-blue-200", icon: Home, label: "නවාතැන්" };
      default: return { color: "bg-slate-100 text-slate-700 border-slate-200", icon: HelpCircle, label: "වෙනත්" };
    }
  };

  return (
    <div className="space-y-6 pb-32">
      
      {/* 1. TABS SWITCHER */}
      <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
        <button 
          onClick={() => setView('requests')}
          className={`flex-1 py-3 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${view === 'requests' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <ShieldAlert className="w-4 h-4"/> උදව් අවශ්‍ය අය
        </button>
        <button 
          onClick={() => setView('offers')}
          className={`flex-1 py-3 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${view === 'offers' ? 'bg-pink-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <Heart className="w-4 h-4"/> උදව් ලබා දෙන අය
        </button>
      </div>

      {/* 2. HEADER WITH COUNT (Restored Feature) */}
      <div className="flex justify-between items-center px-1">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
            {view === 'requests' ? 'නවතම ඉල්ලීම්' : 'නවතම පරිත්‍යාග'}
            <span className="bg-slate-200 text-slate-700 text-xs px-2 py-0.5 rounded-full">{items.length}</span>
        </h3>
        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full border border-green-200 flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse"></span>
          Live
        </span>
      </div>

      {/* 3. LIST AREA */}
      {loading ? (
        <div className="text-center py-20"><div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-slate-400 rounded-full"></div></div>
      ) : items.length === 0 ? (
        <div className="text-center p-12 bg-white border-2 border-dashed border-slate-200 rounded-2xl text-slate-400">
          දත්ත කිසිවක් නොමැත.
        </div>
      ) : (
        items.map((item) => {
          const badge = getBadgeConfig(item.type);
          const Icon = badge.icon;
          const isDone = item.status === 'completed';

          return (
            <div key={item.id} className={`bg-white rounded-2xl p-5 shadow-sm border transition-all duration-500 ${isDone ? 'border-green-200 bg-green-50/50 opacity-75' : view === 'offers' ? 'border-pink-100 hover:border-pink-300' : 'border-slate-100 hover:border-blue-300'} hover:shadow-md`}>
              
              {/* Card Header */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className={`font-bold text-lg ${isDone ? 'text-green-800 line-through decoration-2' : 'text-slate-900'}`}>{item.name}</h4>
                    {isDone && <span className="bg-green-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1"><Check className="w-3 h-3"/> විසඳුණි</span>}
                  </div>
                  <div className="flex items-center text-slate-500 text-xs mt-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-blue-600" />
                    {item.location}
                  </div>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-[11px] font-bold border flex items-center gap-1.5 ${badge.color}`}>
                  <Icon className="w-3.5 h-3.5" /> {badge.label}
                </span>
              </div>
              
              {/* Description */}
              <p className="text-slate-700 text-sm leading-relaxed mb-5 bg-slate-50 p-3.5 rounded-xl border border-slate-50">
                {item.description}
              </p>

              {/* Action Buttons */}
              <div className="grid grid-cols-4 gap-2">
                <a href={`tel:${item.phone}`} className={`col-span-2 flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-bold shadow-lg active:scale-95 transition ${isDone ? 'bg-slate-400 pointer-events-none' : view === 'offers' ? 'bg-pink-600 hover:bg-pink-700' : 'bg-slate-900 hover:bg-slate-800'}`}>
                  <Phone className="w-4 h-4" /> {view === 'requests' ? 'අමතන්න' : 'ගන්න'}
                </a>
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.location)}`} target="_blank" rel="noreferrer" className="col-span-1 flex items-center justify-center py-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 active:scale-95 transition">
                  <Navigation className="w-5 h-5" />
                </a>
                <button onClick={() => handleShare(item)} className="col-span-1 flex items-center justify-center py-3 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 active:scale-95 transition">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
              
              {/* Footer with Mark as Done (Restored) */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                 <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                   <Clock className="w-3 h-3" />
                   {new Date(item.created_at).toLocaleString('si-LK')}
                 </div>

                 {view === 'requests' && !isDone && (
                     <button 
                      onClick={() => handleMarkAsDone(item.id)}
                      disabled={actionLoading === item.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-xs font-bold hover:bg-green-100 border border-green-200 transition active:scale-95"
                     >
                      {actionLoading === item.id ? "Updating..." : <><CheckCircle className="w-3.5 h-3.5" /> විසඳුනා Mark Done</>}
                     </button>
                 )}
                 
                 {view === 'offers' && (
                    <span className="text-pink-600 text-[10px] font-bold flex items-center gap-1"><Heart className="w-3 h-3 fill-current"/> පරිත්‍යාගයකි</span>
                 )}
              </div>

            </div>
          );
        })
      )}
    </div>
  );
}