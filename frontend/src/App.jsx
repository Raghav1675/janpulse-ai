import React, { useState } from 'react';
import CitizenPortal from './components/CitizenPortal';
import MpDashboard from './components/MpDashboard';
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";

function App() {
  const [view, setView] = useState('citizen');

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Global Navigation & Auth Bar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center space-x-6">
          <h1 className="text-2xl font-bold text-blue-900 tracking-tight">JanPulse AI</h1>
          
          <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
            <button 
              onClick={() => setView('citizen')} 
              className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${view === 'citizen' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
              Citizen Portal
            </button>
            <button 
              onClick={() => setView('mp')} 
              className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${view === 'mp' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
              MP Workspace
            </button>
          </div>
        </div>

        {/* Clerk Authentication UI */}
        <div>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-colors text-sm shadow-sm">
                Sign In / Register
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            {/* Shows the user's profile picture when logged in */}
            <UserButton afterSignOutUrl="/" /> 
          </SignedIn>
        </div>
      </nav>
      
      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto p-4">
        
        {/* If Citizen is selected, anyone can see it */}
        {view === 'citizen' && <CitizenPortal />}
        
        {/* If MP is selected, apply security rules */}
        {view === 'mp' && (
          <>
            <SignedIn>
              <MpDashboard />
            </SignedIn>
            
            <SignedOut>
              <div className="flex flex-col items-center justify-center mt-20 p-10 bg-white rounded-xl shadow-sm border border-gray-200 max-w-lg mx-auto text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-3">Restricted Workspace</h2>
                <p className="text-gray-500 mb-6">
                  This dashboard is strictly for authorized government officials and platform administrators. Please sign in to access constituency data.
                </p>
                <SignInButton mode="modal">
                  <button className="bg-blue-600 text-white px-6 py-2.5 rounded-lg shadow-sm hover:bg-blue-700 transition font-medium">
                    Authenticate
                  </button>
                </SignInButton>
              </div>
            </SignedOut>
          </>
        )}
      </main>
    </div>
  );
}

export default App;