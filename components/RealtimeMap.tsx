"use client";
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import { supabase } from '@/lib/supabase';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { ShieldAlert, Utensils, HeartPulse, Home, HelpCircle, Navigation, MapPin, Phone, Heart, HandHeart } from 'lucide-react';

// Map Controller
function MapController({ center }: { center: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 14, { duration: 2 });
  }, [center, map]);
  return null;
}

export default function RealtimeMap() {
  const [markers, setMarkers] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [showOffers, setShowOffers] = useState(true); // Filter State

  useEffect(() => {
    fetchData();

    // Realtime Listener for BOTH tables
    const channel = supabase.channel('realtime_map_markers')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'requests' }, (payload) => {
        if (payload.new.latitude) setMarkers((prev) => [...prev, { ...payload.new, category: 'request' }]);
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'offers' }, (payload) => {
        if (payload.new.latitude) setMarkers((prev) => [...prev, { ...payload.new, category: 'offer' }]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchData = async () => {
    // Requests සහ Offers දෙකම ගන්නවා
    const [reqRes, offRes] = await Promise.all([
      supabase.from('requests').select('*').not('latitude', 'is', null),
      supabase.from('offers').select('*').not('latitude', 'is', null)
    ]);

    const allMarkers = [
      ...(reqRes.data || []).map(i => ({ ...i, category: 'request' })),
      ...(offRes.data || []).map(i => ({ ...i, category: 'offer' }))
    ];
    setMarkers(allMarkers);
  };

  const handleLocateMe = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
      });
    } else { alert("GPS පහසුකම නැත"); }
  };

  // Custom Icon Logic
  const createCustomIcon = (type: string, category: string) => {
    let IconComponent = HelpCircle;
    let typeClass = "other";

    if (category === 'offer') {
      IconComponent = Heart; 
      typeClass = "offer"; // Pink color defined in globals.css
    } else {
      if (type === 'rescue') { IconComponent = ShieldAlert; typeClass = "rescue"; }
      else if (type === 'food') { IconComponent = Utensils; typeClass = "food"; }
      else if (type === 'medicine') { IconComponent = HeartPulse; typeClass = "medicine"; }
      else if (type === 'shelter') { IconComponent = Home; typeClass = "shelter"; }
    }

    const iconHtml = renderToStaticMarkup(<IconComponent />);

    return L.divIcon({
      className: "custom-marker-icon",
      html: `<div class="marker-pin ${typeClass}">${iconHtml}</div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -30]
    });
  };

  // Popup Header Color
  const getHeaderColor = (type: string, category: string) => {
    if (category === 'offer') return 'bg-pink-600';
    switch(type) {
      case 'rescue': return 'bg-red-600';
      case 'food': return 'bg-orange-500';
      case 'medicine': return 'bg-emerald-600';
      case 'shelter': return 'bg-blue-600';
      default: return 'bg-slate-600';
    }
  };

  // Filter Logic
  const displayedMarkers = showOffers ? markers : markers.filter(m => m.category === 'request');

  return (
    <div className="relative h-[400px] w-full rounded-3xl overflow-hidden shadow-lg border border-slate-200 z-0 bg-slate-100">
      
      {/* Top Controls */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        <button 
          onClick={handleLocateMe}
          className="bg-white text-slate-700 p-2.5 rounded-xl shadow-lg border border-slate-200 hover:bg-slate-50 transition active:scale-95 flex items-center justify-center"
          title="මගේ ස්ථානය"
        >
          <MapPin className="w-5 h-5 text-blue-600" />
        </button>

        {/* Show/Hide Offers Toggle */}
        <button 
          onClick={() => setShowOffers(!showOffers)}
          className={`p-2.5 rounded-xl shadow-lg border border-slate-200 transition active:scale-95 flex items-center justify-center ${showOffers ? 'bg-pink-50 text-pink-600 border-pink-200' : 'bg-white text-slate-400'}`}
          title="Show Offers"
        >
          <Heart className={`w-5 h-5 ${showOffers ? 'fill-current' : ''}`} />
        </button>
      </div>

      <div className="absolute top-4 left-4 z-[1000] bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm border border-slate-200 text-[10px] font-bold text-slate-600 flex flex-col gap-1">
         <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-600"></span> ඉල්ලීම් (Requests)</div>
         <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-pink-600"></span> පරිත්‍යාග (Offers)</div>
      </div>

      <MapContainer 
        center={[7.8731, 80.7718]} 
        zoom={8} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='© OpenStreetMap'
        />

        <MapController center={userLocation} />

        {userLocation && (
           <Marker position={userLocation} icon={L.divIcon({
             className: "custom-marker-icon",
             html: `<div style="background:#2563eb; width:16px; height:16px; border:3px solid white; border-radius:50%; box-shadow:0 0 0 8px rgba(37, 99, 235, 0.2);"></div>`,
             iconSize: [20, 20]
           })}>
             <Popup>ඔබ සිටින ස්ථානය</Popup>
           </Marker>
        )}

        {displayedMarkers.map((marker) => (
          <Marker 
            key={`${marker.category}-${marker.id}`} 
            position={[marker.latitude, marker.longitude]} 
            icon={createCustomIcon(marker.type, marker.category)}
          >
            <Popup>
              <div className="font-sans flex flex-col p-0 m-0 w-full">
                <div className={`${getHeaderColor(marker.type, marker.category)} px-4 py-3 text-white flex justify-between items-center`}>
                  <span className="text-[11px] font-bold uppercase tracking-wide opacity-90">
                    {marker.category === 'offer' ? '🤝 උදව්වක් (Offer)' : marker.type.toUpperCase()}
                  </span>
                  <div className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full">
                    <span className="text-[9px] font-bold">LIVE</span>
                  </div>
                </div>

                <div className="p-4 bg-white">
                  <h4 className="text-lg font-bold text-slate-900 leading-tight mb-1">{marker.name}</h4>
                  <div className="text-[11px] text-slate-400 font-medium mb-3 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {marker.location || "Location not set"}
                  </div>
                  
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4">
                    <p className="text-slate-600 text-sm leading-relaxed m-0 break-words line-clamp-4">
                      {marker.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <a href={`tel:${marker.phone}`} className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-slate-900 text-white text-xs font-bold shadow-md hover:bg-slate-800 transition active:scale-95 no-underline">
                      <Phone className="w-3.5 h-3.5" /> Call
                    </a>
                    <a href={`https://www.google.com/maps/search/?api=1&query=${marker.latitude},${marker.longitude}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-slate-200 text-slate-700 bg-white text-xs font-bold hover:bg-slate-50 transition active:scale-95 no-underline">
                      <Navigation className="w-3.5 h-3.5 text-blue-600" /> Navigate
                    </a>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}