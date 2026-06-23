import { useState, useEffect } from 'react';
import { Navigation, Clock, Search, MapPin, Loader2, Navigation2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

export function BusRadar({ onTrackBus }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeBuses, setActiveBuses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBuses();
  }, []);

  const fetchBuses = async () => {
    setIsLoading(true);
    // Fetch all buses with status 'Running'
    const { data, error } = await supabase
      .from('buses')
      .select('*')
      .eq('status', 'Running')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setActiveBuses(data);
    }
    setIsLoading(false);
  };

  const filteredBuses = activeBuses.filter(bus => 
    bus.bus_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Search Header */}
      <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-sm flex items-center gap-3">
         <div className="w-full flex-1 flex items-center bg-gray-50 rounded-xl px-4 py-3.5 border border-gray-200 focus-within:ring-2 focus-within:ring-black transition-all">
           <MapPin className="w-4 h-4 text-gray-400 mr-3 shrink-0" />
           <input 
             type="text" 
             placeholder="Search by route (e.g. 21G)" 
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="bg-transparent w-full outline-none font-bold text-sm text-black placeholder:text-gray-400 placeholder:font-medium" 
           />
         </div>
         <button 
            onClick={fetchBuses} 
            className="w-auto bg-black text-white px-6 py-3.5 rounded-xl font-bold hover:bg-gray-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
         >
           <Search className="w-4 h-4" />
         </button>
      </div>

      {/* Results Body */}
      {isLoading ? (
         <div className="text-center p-10 bg-white rounded-3xl border border-gray-200 shadow-sm flex flex-col items-center">
            <Loader2 className="w-8 h-8 text-black animate-spin mb-3" />
            <p className="text-sm font-bold text-gray-500">Scanning for active buses...</p>
         </div>
      ) : filteredBuses.length > 0 ? (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBuses.map((bus) => (
              <div key={bus.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                 <div className="flex justify-between items-start mb-4">
                    <div>
                       <h3 className="text-xl font-black text-gray-900">{bus.bus_name}</h3>
                       <p className="text-xs font-bold text-green-600 uppercase tracking-widest mt-1">Live Now</p>
                    </div>
                    <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center border border-green-100">
                       <Navigation2 className="w-5 h-5 text-green-600" />
                    </div>
                 </div>
                 
                 <button 
                   onClick={() => onTrackBus({ busId: bus.id, route: bus.bus_name, isDriver: false })}
                   className="bg-black text-white w-full py-3 rounded-xl font-bold text-sm hover:bg-gray-800 transition-all active:scale-[0.98] mt-2"
                 >
                    Track Live on Map
                 </button>
              </div>
            ))}
         </div>
      ) : (
         <div className="text-center p-10 md:p-16 bg-white rounded-3xl border border-gray-200 shadow-sm">
           <Clock className="w-8 h-8 text-gray-300 mx-auto mb-3" />
           <p className="font-bold text-gray-900 mb-1">No Active Buses Found</p>
           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Wait for someone to broadcast a bus</p>
         </div>
      )}
    </div>
  );
}
