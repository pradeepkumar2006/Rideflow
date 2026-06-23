import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { BusRadar } from './components/BusRadar';
import { BroadcastPanel } from './components/BroadcastPanel';
import { LiveMap } from './pages/LiveMap';

function App() {
  // 'dashboard' | 'map'
  const [currentView, setCurrentView] = useState('dashboard');
  const [tripDetails, setTripDetails] = useState(null);

  const handleBoardBus = (details) => {
    setTripDetails(details);
    setCurrentView('map');
  };

  const handleEndTrip = () => {
    setTripDetails(null);
    setCurrentView('dashboard');
  };

  if (currentView === 'map') {
    return <LiveMap tripDetails={tripDetails} onEndTrip={handleEndTrip} />;
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-gray-900 pb-20">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-6 mt-10">
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Left Column: Contribute */}
            <div className="lg:col-span-5 space-y-6">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-black">Contribute</h2>
                    <p className="text-gray-500 text-sm font-medium mt-1">Boarding a bus? Broadcast its location to earn smart coins.</p>
                </div>
                <BroadcastPanel onBoardBus={handleBoardBus} />
            </div>

            {/* Right Column: Search & Consume */}
            <div className="lg:col-span-7 space-y-6">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-black">Live Radar</h2>
                    <p className="text-gray-500 text-sm font-medium mt-1">Search for buses tracked by the community.</p>
                </div>
                <BusRadar onTrackBus={handleBoardBus} />
            </div>
            
         </div>
      </main>
    </div>
  );
}

export default App;
