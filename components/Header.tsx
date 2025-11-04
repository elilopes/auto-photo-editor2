
import React from 'react';
import { Camera } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="w-full bg-gray-900 p-4 shadow-lg flex items-center justify-center border-b border-gray-700 relative z-10">
      <Camera className="w-8 h-8 text-blue-400 mr-3" />
      <h1 className="text-2xl font-bold text-white tracking-wider">Auto Photo Editor</h1>
    </header>
  );
};