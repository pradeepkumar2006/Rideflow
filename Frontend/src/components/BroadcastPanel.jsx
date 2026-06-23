import { useState } from 'react';
import { MapPin, Coins, Radio, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

export function BroadcastPanel({ onBoardBus }) {
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    route: '',
    crowd: 'Moderate'
  });

  const handleCrowdSelect = (level) => {
    setFormData({ ...formData, crowd: level });
  };

  const handleBroadcast = async () => {
    if (!formData.route) return alert("Please enter a route number!");
    setIsBroadcasting(true);

    try {
      // 1. Register bus in database
      const { data: busData, error: busError } = await supabase
        .from('buses')
        .insert([{ 
          bus_name: `Route ${formData.route}`, 
          number_plate: 'TN-00-0000', 
          capacity: 50, 
          status: 'Running' 
        }])
        .select()
        .single();

      if (busError) throw busError;

      // 2. Create an initial location entry
      const { data: locData, error: locError } = await supabase
        .from('bus_locations')
        .insert([{ 
          bus_id: busData.id, 
          latitude: 13.0827, // Default Chennai lat
          longitude: 80.2707 // Default Chennai lng
        }])
        .select()
        .single();

      if (locError) throw locError;

      // 3. Move to map
      onBoardBus({ 
        ...formData, 
        busId: busData.id, 
        locationId: locData.id, 
        isDriver: true 
      });
    } catch (err) {
      console.error(err);
      alert("Failed to connect to database!");
    } finally {
      setIsBroadcasting(false);
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-200">
       <div className="space-y-6">
          <div className="space-y-4">
             {/* From Location */}
             <div>
               <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Starting Point</label>
               <div className="relative flex items-center">
                  <div className="absolute left-4"><MapPin className="w-5 h-5 text-gray-400" /></div>
                  <input 
                    type="text" 
                    placeholder="e.g. Salem New Bus Stand" 
                    onChange={(e) => setFormData({...formData, from: e.target.value})}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all placeholder:text-gray-300 placeholder:font-medium" 
                  />
               </div>
             </div>

             {/* To Location */}
             <div>
               <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Destination</label>
               <div className="relative flex items-center">
                  <div className="absolute left-4"><MapPin className="w-5 h-5 text-gray-400" /></div>
                  <input 
                    type="text" 
                    placeholder="e.g. AVC College" 
                    onChange={(e) => setFormData({...formData, to: e.target.value})}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all placeholder:text-gray-300 placeholder:font-medium" 
                  />
               </div>
             </div>
          </div>

          <hr className="border-gray-100" />

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Bus Route Number</label>
            <input 
              type="text" 
              placeholder="e.g. 21G" 
              onChange={(e) => setFormData({...formData, route: e.target.value})}
              className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl font-black text-xl text-center text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all placeholder:text-gray-300 placeholder:font-medium tracking-tight" 
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Current Crowd Level</label>
            <div className="grid grid-cols-3 gap-3">
               <button 
                  onClick={() => handleCrowdSelect('Empty')}
                  className={`py-3.5 border rounded-xl font-bold text-xs transition-all outline-none ${formData.crowd === 'Empty' ? 'border-black bg-gray-900 text-white' : 'border-gray-200 text-gray-600 hover:border-black hover:bg-gray-50'}`}
               >
                 Empty
               </button>
               <button 
                  onClick={() => handleCrowdSelect('Moderate')}
                  className={`py-3.5 border rounded-xl font-bold text-xs transition-all outline-none ${formData.crowd === 'Moderate' ? 'border-black bg-gray-900 text-white' : 'border-gray-200 text-gray-600 hover:border-black hover:bg-gray-50'}`}
               >
                 Moderate
               </button>
               <button 
                  onClick={() => handleCrowdSelect('Crowded')}
                  className={`py-3.5 border rounded-xl font-bold text-xs transition-all outline-none ${formData.crowd === 'Crowded' ? 'border-black bg-gray-900 text-white' : 'border-gray-200 text-gray-600 hover:border-black hover:bg-gray-50'}`}
               >
                 Crowded
               </button>
            </div>
          </div>
          
          <button 
            onClick={handleBroadcast}
            disabled={isBroadcasting}
            className="w-full mt-4 bg-black text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-800 transition-all active:scale-[0.98] shadow-lg disabled:opacity-70"
          >
            {isBroadcasting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Radio className="w-5 h-5" />}
            {isBroadcasting ? 'Starting Broadcast...' : 'Board Bus & Broadcast'}
          </button>
       </div>
    </div>
  );
}
