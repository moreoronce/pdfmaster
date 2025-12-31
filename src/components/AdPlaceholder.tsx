import React from 'react';
import { Megaphone } from 'lucide-react';

interface AdPlaceholderProps {
  className?: string;
  label?: string;
  size?: string;
}

const AdPlaceholder: React.FC<AdPlaceholderProps> = ({
  className,
  label = "广告赞助位",
  size = "Responsive"
}) => (
  <div className={`bg-gray-50 border border-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-400 p-4 relative overflow-hidden group ${className}`}>
    <div className="absolute top-0 right-0 bg-gray-200 text-[10px] px-1.5 text-gray-500 rounded-bl">Ad</div>
    <Megaphone size={24} className="mb-2 opacity-20 group-hover:opacity-40 transition-opacity" />
    <span className="text-xs font-medium">{label}</span>
    <span className="text-[10px] opacity-60 mt-1">Google AdSense ({size})</span>
  </div>
);

export default AdPlaceholder;