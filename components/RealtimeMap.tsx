"use client";
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import { supabase } from '@/lib/supabase';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { ShieldAlert, Utensils, HeartPulse, Home, HelpCircle, Navigation, MapPin, Phone } from 'lucide-react';

// Map Controller to Fly to User
function MapController({ center }: { center: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 14, { duration: 2 });
    }
  }, [center, map]);
  return null;
}

export default function RealtimeMap() {
  const [markers, setMarkers] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    fetchMarkers();

    const channel = supabase
      .channel('realtime_map_markers')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, (payload) => {
        if (payload.eventType === 'INSERT' && payload.new.latitude) {
           setMarkers((prev) => [...prev, payload.new]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMarkers = async () => {
    const { data } = await supabase.from('requests').select('*').not('latitude', 'is', null);
    if (data) setMarkers(data);
  };

  const handleLocateMe = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
      });
    } else {
      alert("GPS පහසුකම නැත");
    }
  };

  // Custom Icon Generator
  const createCustomIcon = (type: string) => {
    let IconComponent = HelpCircle;
    let typeClass = "other";

    if (type === 'rescue') { IconComponent = ShieldAlert; typeClass = "rescue"; }
    else if (type === 'food') { IconComponent = Utensils; typeClass = "food"; }
    else if (type === 'medicine') { IconComponent = HeartPulse; typeClass = "medicine"; }
    else if (type === 'shelter') { IconComponent = Home; typeClass = "shelter"; }

    const iconHtml = renderToStaticMarkup(<IconComponent />);

    return L.divIcon({
      className: "custom-marker-icon",
      html: `<div class="marker-pin ${typeClass}">${iconHtml}</div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -30]
    });
  };

  // Helper to get color based on type
  const getHeaderColor = (type: string) => {
    switch(type) {
      case 'rescue': return 'bg-red-600';
      case 'food': return 'bg-orange-500';
      case 'medicine': return 'bg-emerald-600';
      case 'shelter': return 'bg-blue-600';
      default: return 'bg-slate-600';
    }
  };

  const getLabel = (type: string) => {
    switch(type) {
      case 'rescue': return 'බේරාගැනීම් (Rescue)';
      case 'food': return 'ආහාර/ජලය';
      case 'medicine': return 'බෙහෙත්';
      case 'shelter': return 'නවාතැන්';
      default: return 'වෙනත්';
    }
  };

  return (
    <div className="relative h-[400px] w-full rounded-3xl overflow-hidden shadow-lg border border-slate-200 z-0 bg-slate-100">
      
      {/* Locate Me Button */}
      <button 
        onClick={handleLocateMe}
        className="absolute top-4 right-4 z-[1000] bg-white text-slate-700 p-2.5 rounded-xl shadow-lg border border-slate-200 hover:bg-slate-50 transition active:scale-95 flex items-center justify-center"
        title="මගේ ස්ථානය"
      >
        <MapPin className="w-5 h-5 text-blue-600" />
      </button>

      <MapContainer 
        center={[7.8731, 80.7718]} 
        zoom={8} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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

        {markers.map((marker) => (
          <Marker 
            key={marker.id} 
            position={[marker.latitude, marker.longitude]} 
            icon={createCustomIcon(marker.type)}
          >
            <Popup>
              <div className="font-sans flex flex-col p-0 m-0 w-full">
                
                {/* 1. Header with Type & Color */}
                <div className={`${getHeaderColor(marker.type)} px-4 py-3 text-white flex justify-between items-center`}>
                  <span className="text-[11px] font-bold uppercase tracking-wide opacity-90">
                    {getLabel(marker.type)}
                  </span>
                  {/* Status Indicator */}
                  <div className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                    <span className="text-[9px] font-bold">LIVE</span>
                  </div>
                </div>

                {/* 2. Body Content */}
                <div className="p-4 bg-white">
                  <h4 className="text-lg font-bold text-slate-900 leading-tight mb-1">
                    {marker.name}
                  </h4>
                  <div className="text-[11px] text-slate-400 font-medium mb-3 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {marker.location || "ස්ථානය සඳහන් කර නැත"}
                  </div>
                  
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4">
                    <p className="text-slate-600 text-sm leading-relaxed m-0 break-words line-clamp-4">
                      {marker.description}
                    </p>
                  </div>

                  {/* 3. Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <a 
                      href={`tel:${marker.phone}`} 
                      className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-slate-900 text-white text-xs font-bold shadow-md hover:bg-slate-800 transition active:scale-95 no-underline"
                    >
                      <Phone className="w-3.5 h-3.5" /> Call
                    </a>
                    
                    <a 
                      href={`https://www.google.com/maps/dir/?api=1&destination=${marker.latitude},${marker.longitude}`} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-slate-200 text-slate-700 bg-white text-xs font-bold hover:bg-slate-50 transition active:scale-95 no-underline"
                    >
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