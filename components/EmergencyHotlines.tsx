"use client";
import { X, Phone, Globe, ShieldAlert, Flame, Ambulance, Activity } from 'lucide-react';

export default function EmergencyHotlines({ onClose }: { onClose: () => void }) {
  
  const hotlines = [
    { title: "DMC (ආපදා මධ්‍යස්ථානය)", number: "117", icon: ShieldAlert, color: "text-red-600", bg: "bg-red-50 border-red-100" },
    { title: "පොලිස් හදිසි සේවා", number: "119", icon: ShieldAlert, color: "text-blue-600", bg: "bg-blue-50 border-blue-100" },
    { title: "1990 සුව සැරිය", number: "1990", icon: Ambulance, color: "text-green-600", bg: "bg-green-50 border-green-100" },
    { title: "ගිනි නිවන සේවා", number: "110", icon: Flame, color: "text-orange-600", bg: "bg-orange-50 border-orange-100" },
    { title: "යුධ හමුදා (බේරාගැනීම්)", number: "113", icon: ShieldAlert, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-100" },
  ];

  const districts = [
    { name: "කොළඹ", num: "011 243 4028" },
    { name: "ගම්පහ", num: "033 223 4676" },
    { name: "කළුතර", num: "034 222 2344" },
    { name: "ගාල්ල", num: "091 224 2355" },
    { name: "මාතර", num: "041 223 4030" },
    { name: "රත්නපුර", num: "045 222 5522" },
    { name: "මහනුවර", num: "081 220 2875" },
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      
      {/* Modal Container */}
      <div className="bg-white w-full sm:max-w-2xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl shadow-2xl relative flex flex-col">
        
        {/* Header - Sticky */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm p-5 border-b border-slate-100 z-10 flex justify-between items-center">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Phone className="w-6 h-6 text-red-600" />
              හදිසි ඇමතුම්
            </h2>
            <p className="text-xs text-slate-500">ආපදා අවස්ථාවකදී ක්ෂණිකව අමතන්න</p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition">
            <X className="w-6 h-6 text-slate-600" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          
          {/* 1. Priority Hotlines (Big Buttons) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {hotlines.map((hotline, idx) => (
              <a key={idx} href={`tel:${hotline.number}`} className={`border ${hotline.bg} p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2 hover:scale-105 transition-transform active:scale-95 shadow-sm`}>
                <hotline.icon className={`w-8 h-8 ${hotline.color}`} />
                <div>
                  <div className={`text-2xl font-black ${hotline.color} tracking-tight`}>{hotline.number}</div>
                  <div className="text-[10px] font-bold text-slate-700 uppercase leading-tight">{hotline.title}</div>
                </div>
              </a>
            ))}
          </div>

          {/* 2. Other Important Numbers */}
          <div>
            <h3 className="font-bold text-slate-800 text-sm mb-3">වෙනත් වැදගත් අංක</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
               <a href="tel:0774506602" className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition bg-white shadow-sm">
                  <div className="bg-blue-100 p-2 rounded-lg"><Activity className="w-5 h-5 text-blue-600" /></div>
                  <div>
                      <div className="font-bold text-slate-900 text-sm">GMOA සෞඛ්‍ය සහන</div>
                      <div className="text-xs text-slate-500 font-mono">077 450 6602 (24/7)</div>
                  </div>
               </a>
               <a href="tel:0112686686" className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition bg-white shadow-sm">
                  <div className="bg-blue-100 p-2 rounded-lg"><Globe className="w-5 h-5 text-blue-600" /></div>
                  <div>
                      <div className="font-bold text-slate-900 text-sm">කාලගුණ විද්‍යා දෙපාර්තමේන්තුව</div>
                      <div className="text-xs text-slate-500 font-mono">011 268 6686</div>
                  </div>
               </a>
            </div>
          </div>

          {/* 3. District Numbers (List View on Mobile for better readability) */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <h3 className="font-bold text-slate-800 text-sm mb-3">දිස්ත්‍රික් ආපදා සම්බන්ධීකරණ</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {districts.map((d, i) => (
                <a key={i} href={`tel:${d.num}`} className="flex justify-between items-center bg-white px-4 py-3 rounded-xl border border-slate-200 hover:border-blue-400 transition shadow-sm active:bg-blue-50">
                  <span className="text-sm font-bold text-slate-600">{d.name}</span>
                  <span className="text-sm font-black text-blue-900 font-mono">{d.num}</span>
                </a>
              ))}
            </div>
          </div>

          {/* 4. External Web Links */}
          <div className="space-y-2">
             <a href="https://floodsupport.org/sos/dashboard" target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition">
                <Globe className="w-4 h-4 text-blue-700" />
                <span className="text-sm font-bold text-blue-800">ආපදා සහන අධීක්ෂණ Dashboard</span>
             </a>
             <a href="https://slirrigation.maps.arcgis.com/apps/dashboards/2cffe83c9ff5497d97375498bdf3ff38" target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition">
                <Globe className="w-4 h-4 text-emerald-700" />
                <span className="text-sm font-bold text-emerald-800">ජල මට්ටම් / වාරිමාර්ග තොරතුරු</span>
             </a>
          </div>

        </div>
      </div>
    </div>
  );
}