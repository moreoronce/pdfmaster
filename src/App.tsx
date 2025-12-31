import { useState } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import MergePage from './components/MergePage';
import SplitPage from './components/SplitPage';

export default function App() {
  const [currentView, setCurrentView] = useState('home');

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-900 flex flex-col">
      <Navbar onNavigate={setCurrentView} />

      {currentView === 'home' && <LandingPage onNavigate={setCurrentView} />}
      {currentView === 'merge' && <MergePage onBack={() => setCurrentView('home')} />}
      {currentView === 'split' && <SplitPage onBack={() => setCurrentView('home')} />}

      <footer className="py-8 text-center text-gray-400 text-sm border-t border-gray-100 mt-auto bg-white">
        &copy; 2026 Yawata@<a href="https://deeprouter.org" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 transition-colors">DeepRouter</a>. All rights reserved.
      </footer>
    </div>
  );
}