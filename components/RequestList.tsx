"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { MapPin, Phone, Navigation, Clock, ShieldAlert, Utensils, HeartPulse, Home, HelpCircle, Share2, CheckCircle, Check } from 'lucide-react';

interface Request {
  id: number;
  name: string;
  type: string;
  location: string;
  description: string;
  phone: string;
  created_at: string;
  status: string;
}

export default function RequestList({ refreshTrigger }: { refreshTrigger: number }) {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchRequests();

    // --- 🔥 REALTIME SUBSCRIPTION ---
    // Database එකට අලුත් දෙයක් ආපු ගමන්ම මෙතනට Signal එක එනවා
    const channel = supabase
      .channel('realtime_requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, (payload) => {
        
        if (payload.eventType === 'INSERT') {
          // අලුත් Request එකක් ලිස්ට් එකේ උඩටම
          setRequests((prev) => [payload.new as Request, ...prev]);
        } 
        else if (payload.eventType === 'UPDATE') {
          // කවුරු හරි "Mark Done" කළොත් ඒක ඒ වෙලාවෙම අප්ඩේට් වෙනවා
          setRequests((prev) => prev.map(req => req.id === payload.new.id ? payload.new as Request : req));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshTrigger]);

  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .order('status', { ascending: false }) // Pending උඩට, Completed යටට
      .order('created_at', { ascending: false }); // අලුත් ඒවා උඩට

    if (!error && data) setRequests(data);
    setLoading(false);
  };

  // --- Mark as Done Feature ---
  const handleMarkAsDone = async (id: number) => {
    const confirm = window.confirm("මෙම ඉල්ලීම සම්පූර්ණ වූ බව තහවුරු කරනවාද?");
    if (!confirm) return;

    setActionLoading(id);
    const { error } = await supabase.from('requests').update({ status: 'completed' }).eq('id', id);
    setActionLoading(null);
    
    if (error) alert("දෝෂයක් සිදු විය.");
  };

  // --- Share Feature ---
  const handleShare = async (req: Request) => {
    const shareData = {
      title: '🚨 හදිසි ආපදා ඉල්ලීමක් - HelpSL',
      text: `🚨 *හදිසි ආපදා ඉල්ලීමක්!* \n\n👤 නම: ${req.name}\n📍 ස්ථානය: ${req.location}\nsos අවශ්‍යතාවය: ${req.type.toUpperCase()}\n📞 අමතන්න: ${req.phone}\n\n📝 විස්තරය: ${req.description}\n\nඋදව් කරන්න: https://helpsl.vercel.app`,
      url: window.location.href
    };

    if (navigator.share) {
      try { await navigator.share(shareData); } catch (err) { console.log('Error', err); }
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareData.text)}`, '_blank');
    }
  };

  const getBadgeConfig = (type: string) => {
    switch(type) {
      case 'rescue': return { color: "bg-red-50 text-red-700 border-red-200", icon: ShieldAlert, label: "බේරාගැනීම්" };
      case 'food': return { color: "bg-orange-50 text-orange-700 border-orange-200", icon: Utensils, label: "ආහාර" };
      case 'medicine': return { color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: HeartPulse, label: "සෞඛ්‍ය" };
      case 'shelter': return { color: "bg-blue-50 text-blue-700 border-blue-200", icon: Home, label: "නවාතැන්" };
      default: return { color: "bg-slate-100 text-slate-700 border-slate-200", icon: HelpCircle, label: "වෙනත්" };
    }
  };

  if (loading && requests.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mb-2"></div>
      <p className="text-xs">තොරතුරු යාවත්කාලීන වෙමින් පවතී...</p>
    </div>
  );

  return (
    <div className="space-y-4 pb-32 px-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-slate-800">නවතම ඉල්ලීම් ({requests.length})</h3>
        <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full border border-green-200 flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse"></span>
          Live
        </span>
      </div>
      
      {requests.length === 0 && !loading && (
        <div className="text-center p-12 bg-white border border-dashed border-slate-300 rounded-2xl mx-auto text-slate-500">
          <p>දැනට ඉල්ලීම් කිසිවක් නොමැත.</p>
        </div>
      )}

      {requests.map((req) => {
        const badge = getBadgeConfig(req.type);
        const Icon = badge.icon;
        const isCompleted = req.status === 'completed';
        
        return (
          <div key={req.id} className={`bg-white rounded-2xl p-5 shadow-sm border transition-all duration-500 ${isCompleted ? 'border-green-200 bg-green-50/50 opacity-75' : 'border-slate-100 hover:shadow-md animate-in slide-in-from-top-2'}`}>
            
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center gap-2">
                    <h4 className={`font-bold text-lg ${isCompleted ? 'text-green-800 line-through decoration-2' : 'text-slate-900'}`}>{req.name}</h4>
                    {isCompleted && <span className="bg-green-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1"><Check className="w-3 h-3"/> විසඳුණි</span>}
                </div>
                <div className="flex items-center text-slate-500 text-xs mt-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-blue-600" />
                  {req.location}
                </div>
              </div>
              <span className={`px-3 py-1.5 rounded-full text-[11px] font-bold border flex items-center gap-1.5 ${badge.color}`}>
                <Icon className="w-3.5 h-3.5" />
                {badge.label}
              </span>
            </div>
            
            {/* Description */}
            <p className="text-slate-600 text-sm leading-relaxed mb-5 bg-slate-50 p-3.5 rounded-xl border border-slate-50">
              {req.description}
            </p>

            {/* Actions */}
            <div className="grid grid-cols-4 gap-2">
              <a href={`tel:${req.phone}`} className={`col-span-2 flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-bold shadow-lg active:scale-95 transition ${isCompleted ? 'bg-slate-400 pointer-events-none' : 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/10'}`}>
                <Phone className="w-4 h-4" /> අමතන්න
              </a>
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(req.location)}`} target="_blank" rel="noreferrer" className="col-span-1 flex items-center justify-center py-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 active:scale-95 transition">
                <Navigation className="w-5 h-5" />
              </a>
              <button onClick={() => handleShare(req)} className="col-span-1 flex items-center justify-center py-3 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 active:scale-95 transition">
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Footer / Mark Done */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
               <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                 <Clock className="w-3 h-3" />
                 {new Date(req.created_at).toLocaleString('si-LK')}
               </div>

               {!isCompleted && (
                   <button 
                    onClick={() => handleMarkAsDone(req.id)}
                    disabled={actionLoading === req.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-xs font-bold hover:bg-green-100 border border-green-200 transition active:scale-95"
                   >
                    {actionLoading === req.id ? "Updating..." : <><CheckCircle className="w-3.5 h-3.5" /> විසඳුනා Mark Done</>}
                   </button>
               )}
            </div>

          </div>
        );
      })}
    </div>
  );
}