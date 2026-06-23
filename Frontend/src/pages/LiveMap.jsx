import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { ArrowLeft, Radio, Coins, Bell, BellRing, AlertTriangle, Navigation } from 'lucide-react';
import L from 'leaflet';
import { supabase } from '../supabaseClient';

// Fix for default Leaflet icon paths in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export function LiveMap({ tripDetails, onEndTrip }) {
  const [alarmSet, setAlarmSet] = useState(false);
  const [showToast, setShowToast] = useState(false);
  
  // Center of Chennai as default
  const [position, setPosition] = useState([13.0827, 80.2707]);
  const [locationGranted, setLocationGranted] = useState(false);
  const [permissionError, setPermissionError] = useState(null);
  const watchIdRef = useRef(null);

  useEffect(() => {
    if (!tripDetails) return;

    if (tripDetails.isDriver) {
      // 🚗 DRIVER MODE: Watch GPS and update database
      if (locationGranted && "geolocation" in navigator) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          async (pos) => {
            const { latitude, longitude } = pos.coords;
            setPosition([latitude, longitude]);
            
            // Send new location to Supabase
            if (tripDetails.locationId) {
               await supabase
                 .from('bus_locations')
                 .update({ latitude, longitude, last_updated: new Date() })
                 .eq('id', tripDetails.locationId);
            }
          },
          (err) => {
            console.error("GPS Error:", err);
            setPermissionError("Please enable GPS/Location in your browser settings to broadcast.");
            setLocationGranted(false);
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
      }
    } else {
      // 🚌 PASSENGER MODE: Listen to Supabase Realtime
      
      // First fetch the current location immediately
      const fetchInitialLoc = async () => {
        const { data } = await supabase
          .from('bus_locations')
          .select('*')
          .eq('bus_id', tripDetails.busId)
          .order('last_updated', { ascending: false })
          .limit(1)
          .single();
          
        if (data && data.latitude && data.longitude) {
           setPosition([data.latitude, data.longitude]);
        }
      };
      fetchInitialLoc();

      // Then subscribe to live updates
      const channel = supabase
        .channel(`public:bus_locations:${tripDetails.busId}`)
        .on('postgres_changes', { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'bus_locations',
            filter: `bus_id=eq.${tripDetails.busId}`
          }, (payload) => {
             console.log("Realtime Update Received!", payload.new);
             const newLoc = payload.new;
             if (newLoc.latitude && newLoc.longitude) {
               setPosition([newLoc.latitude, newLoc.longitude]);
             }
        })
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [tripDetails, locationGranted]);

  const toggleAlarm = () => {
    setAlarmSet(!alarmSet);
    if (!alarmSet) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const requestLocationAccess = () => {
    setPermissionError(null);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
           // Access granted! Set initial position immediately
           const { latitude, longitude } = pos.coords;
           setPosition([latitude, longitude]);
           setLocationGranted(true);
        },
        (err) => {
           setPermissionError("Location access denied. Please allow it in your browser.");
        }
      );
    } else {
      setPermissionError("Geolocation is not supported by your browser.");
    }
  };

  const handleShareSOS = async () => {
    const text = `Tracking my live bus ride on Route ${tripDetails?.route || '21G'}.`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Live Bus Tracking',
          text: text,
        });
      } catch (err) {
        console.log('Share error:', err);
      }
    } else {
      alert("Safe Commute SOS Link copied to clipboard!\n" + text);
    }
  };

  return (
    <div className="h-[100dvh] w-full relative bg-gray-100 flex flex-col animate-fade-in overflow-hidden">
      
      {/* Toast Notification */}
      {showToast && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[2000] bg-black text-white px-6 py-3 rounded-full font-bold text-sm shadow-xl flex items-center gap-2 animate-slide-up">
           <BellRing className="w-4 h-4 text-green-400" /> Wake-Up Alarm set for 500m before destination!
        </div>
      )}

      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex items-center justify-between z-[1000] shadow-sm relative shrink-0">
         <button onClick={onEndTrip} className="flex items-center gap-1.5 md:gap-2 text-gray-600 hover:text-black font-bold text-sm transition-colors">
            <ArrowLeft className="w-5 h-5" /> <span className="hidden sm:inline">Back to Dashboard</span><span className="sm:hidden">Back</span>
         </button>
         <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
           <span className="relative flex h-2.5 w-2.5">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
           </span>
           <span className="text-[10px] font-bold tracking-widest uppercase text-green-700 hidden sm:inline">
              {tripDetails?.isDriver ? "Broadcasting GPS" : "Live GPS Active"}
           </span>
           <span className="text-[10px] font-bold tracking-widest uppercase text-green-700 sm:hidden">Live</span>
         </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 w-full relative z-0">
        <MapContainer center={position} zoom={15} className="h-full w-full zoomControl-bottom-right">
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          <Marker position={position}>
            <Popup>
              <div className="text-center font-bold">
                Route: {tripDetails?.route || 'Bus'}<br/>
                {tripDetails?.isDriver ? "You are broadcasting!" : "Tracking this bus."}
              </div>
            </Popup>
          </Marker>
        </MapContainer>

        {/* Location Permission Overlay */}
        {tripDetails?.isDriver && !locationGranted && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-[1500] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
             <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full border border-gray-100">
               <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                 <MapPin className="w-8 h-8 text-purple-600" />
               </div>
               <h3 className="text-xl font-black text-gray-900 mb-2">Enable Live Location</h3>
               <p className="text-sm font-medium text-gray-500 mb-6">
                 We need your location access to broadcast this bus to other commuters.
               </p>
               
               {permissionError && (
                 <div className="bg-red-50 text-red-600 text-xs font-bold p-3 rounded-lg mb-4">
                   {permissionError}
                 </div>
               )}

               <button 
                 onClick={requestLocationAccess}
                 className="w-full bg-purple-600 text-white font-bold py-3.5 rounded-xl hover:bg-purple-700 transition-all active:scale-[0.98] shadow-lg shadow-purple-600/30"
               >
                 Grant Location Access
               </button>
             </div>
          </div>
        )}

        {/* Overlay Floating Card */}
        <div className="absolute bottom-0 md:bottom-8 left-0 md:left-1/2 md:-translate-x-1/2 w-full md:w-[90%] md:max-w-md bg-white p-6 md:p-8 rounded-t-3xl md:rounded-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] border-t md:border border-gray-200 z-[1000] animate-slide-up max-h-[80dvh] overflow-y-auto">
           
           <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 md:hidden"></div>

           <div className="flex justify-between items-start mb-6">
             <div>
               <h3 className="text-3xl font-black tracking-tight text-black">{tripDetails?.route || 'Bus Route'}</h3>
               <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">
                 {tripDetails?.from || 'Tracking'} → {tripDetails?.to || 'Live'}
               </p>
             </div>
             <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-200 shadow-sm shrink-0">
                {tripDetails?.isDriver ? <Radio className="w-6 h-6 text-black animate-pulse" /> : <Navigation className="w-6 h-6 text-black animate-bounce" />}
             </div>
           </div>
           
           {tripDetails?.isDriver && (
             <div className="flex items-center gap-3 bg-gray-50 w-full px-5 py-4 rounded-xl border border-gray-200 mb-6">
                <Coins className="w-6 h-6 text-yellow-500 shrink-0" />
                <div>
                  <p className="font-bold text-sm text-gray-900 tracking-wide">Earning Smart Coins!</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Community Thanks You</p>
                </div>
             </div>
           )}

           {/* Practical Utility Features Grid */}
           <div className="grid grid-cols-2 gap-3 mb-6">
              <button 
                onClick={toggleAlarm}
                className={`py-3.5 px-3 rounded-xl border font-bold text-xs flex flex-col items-center justify-center gap-2 transition-all ${alarmSet ? 'bg-black text-white border-black shadow-md' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
              >
                 {alarmSet ? <BellRing className="w-5 h-5 text-green-400" /> : <Bell className="w-5 h-5 text-gray-400" />}
                 {alarmSet ? 'Alarm Active' : 'Wake-Me-Up Alarm'}
              </button>

              <button 
                onClick={handleShareSOS}
                className="py-3.5 px-3 rounded-xl border border-red-100 bg-red-50 text-red-600 font-bold text-xs flex flex-col items-center justify-center gap-2 hover:bg-red-100 transition-all"
              >
                 <AlertTriangle className="w-5 h-5 text-red-500" />
                 Safe Commute SOS
              </button>
           </div>

           <button 
             onClick={onEndTrip} 
             className="w-full bg-red-500 text-white font-bold py-4 rounded-xl hover:bg-red-600 transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(239,68,68,0.2)]"
           >
             {tripDetails?.isDriver ? (locationGranted ? "Stop Broadcasting" : "Cancel") : "Stop Tracking"}
           </button>
        </div>
      </div>
    </div>
  );
}
