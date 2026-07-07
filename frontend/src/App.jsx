import React, { useState } from 'react';
import CitizenPortal from './components/CitizenPortal';
import MpDashboard from './components/MpDashboard';

function App() {
  const [view, setView] = useState('citizen');

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm p-4 mb-8 flex justify-center space-x-4">
        <button 
          onClick={() => setView('citizen')} 
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${view === 'citizen' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
          Citizen Portal
        </button>
        <button 
          onClick={() => setView('mp')} 
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${view === 'mp' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
          MP Dashboard
        </button>
      </nav>
      
      {view === 'citizen' ? <CitizenPortal /> : <MpDashboard />}
    </div>
  );
}

export default App;