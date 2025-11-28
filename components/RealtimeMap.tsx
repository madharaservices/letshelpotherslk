"use client";
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import { supabase } from '@/lib/supabase';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { ShieldAlert, Utensils, HeartPulse, Home, HelpCircle, Navigation, MapPin } from 'lucide-react';

// --- Helper: Map Controller to Fly to User ---
function MapController({ center }: { center: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 13, { duration: 2 }); // Smooth animation
    }
  }, [center, map]);
  return null;
}

export default function RealtimeMap() {
  const [markers, setMarkers] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    fetchMarkers();

    // --- 🔥 REALTIME MAP LISTENER ---
    // කවුරු හරි Location දාලා Request කළාම, Map එකටත් ඒ වෙලාවෙම වැටෙනවා
    const channel = supabase
      .channel('realtime_map_markers')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, (payload) => {
        if (payload.eventType === 'INSERT' && payload.new.latitude) {
           setMarkers((prev) => [...prev, payload.new]); // Add new pin to map instantly
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMarkers = async () => {
    // Lat/Lon තියෙන ඒවා විතරක් ගමු
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

  // --- Custom Icon Generator ---
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
      popupAnchor: [0, -40]
    });
  };

  return (
    <div className="relative h-[400px] w-full rounded-3xl overflow-hidden shadow-lg border border-slate-200 z-0">
      
      {/* Locate Me Button */}
      <button 
        onClick={handleLocateMe}
        className="absolute top-4 right-4 z-[1000] bg-white text-slate-700 p-2 rounded-xl shadow-lg border border-slate-200 hover:bg-slate-50 transition active:scale-95"
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
        {/* Modern Map Tiles (CartoDB Voyager) */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>'
        />

        <MapController center={userLocation} />

        {/* User Location Marker */}
        {userLocation && (
           <Marker position={userLocation} icon={L.divIcon({
             className: "custom-marker-icon",
             html: `<div style="background:#2563eb; width:15px; height:15px; border:3px solid white; border-radius:50%; box-shadow:0 0 0 10px rgba(37, 99, 235, 0.2);"></div>`,
             iconSize: [20, 20]
           })}>
             <Popup>ඔබ සිටින ස්ථානය</Popup>
           </Marker>
        )}

        {/* Request Markers */}
        {markers.map((marker) => (
          <Marker 
            key={marker.id} 
            position={[marker.latitude, marker.longitude]} 
            icon={createCustomIcon(marker.type)}
          >
            <Popup>
              <div className="flex flex-col font-sans">
                <div className={`h-2 w-full mb-3 rounded-full ${
                  marker.type === 'rescue' ? 'bg-red-500' : 
                  marker.type === 'food' ? 'bg-orange-500' : 
                  marker.type === 'medicine' ? 'bg-emerald-500' : 'bg-blue-500'
                }`}></div>
                
                <h4 className="font-bold text-slate-900 text-lg m-0 leading-tight">{marker.name}</h4>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">{marker.type}</span>
                
                <p className="text-slate-600 text-sm m-0 mb-3 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  {marker.description}
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <a href={`tel:${marker.phone}`} className="text-center py-2 rounded-lg bg-slate-900 text-white text-xs font-bold no-underline">
                    Call Now
                  </a>
                  <a href={`https://www.google.com/maps/search/?api=1&query=${marker.latitude},${marker.longitude}`} target="_blank" rel="noreferrer" className="text-center py-2 rounded-lg border border-slate-200 text-slate-700 text-xs font-bold no-underline flex items-center justify-center gap-1">
                    <Navigation className="w-3 h-3" /> Navigate
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}