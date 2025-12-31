import React from 'react';
import { FileText } from 'lucide-react';

interface NavbarProps {
  onNavigate: (view: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => (
  <nav className="flex items-center justify-between px-4 sm:px-8 py-4 bg-white border-b border-gray-100 sticky top-0 z-50">
    <div
      className="flex items-center gap-2 text-blue-600 cursor-pointer hover:opacity-80 transition-opacity"
      onClick={() => onNavigate('home')}
    >
      <FileText size={24} />
      <span className="text-lg sm:text-xl font-bold tracking-tight">PDF Master</span>
    </div>
    <div className="flex items-center gap-2 sm:gap-4 text-sm">
      <span className="text-gray-500 hidden sm:block">安全 · 快速 · 本地处理</span>
      <button className="bg-gray-900 text-white px-3 sm:px-4 py-2 rounded-lg text-xs font-medium hover:bg-gray-800 transition-colors">
        GitHub
      </button>
    </div>
  </nav>
);

export default Navbar;