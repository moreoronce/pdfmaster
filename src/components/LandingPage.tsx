import React from 'react';
import { ArrowRight, Layers, Scissors } from 'lucide-react';
import AdPlaceholder from './AdPlaceholder';

interface LandingPageProps {
  onNavigate: (view: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => (
  <main className="flex-1 flex flex-col items-center justify-center p-6 animate-fade-in">
    <div className="text-center mb-12 space-y-4">
      <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
        您的全能 <span className="text-blue-600">PDF</span> 工具箱
      </h1>
      <p className="text-gray-500 text-lg max-w-lg mx-auto leading-relaxed">
        无需上传服务器，直接在浏览器中利用 WebAssembly 处理您的文件。
        保护隐私，极致且迅速。
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mb-12">
      <button onClick={() => onNavigate('merge')} className="group relative bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 text-left">
        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity"><ArrowRight className="text-blue-500" /></div>
        <div className="bg-blue-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors duration-300">
          <Layers className="text-blue-600 group-hover:text-white transition-colors" size={28} />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">合并 PDF</h2>
        <p className="text-sm text-gray-500 leading-relaxed">将多个 PDF 文档按指定顺序合并为一个文件。</p>
      </button>

      <button onClick={() => onNavigate('split')} className="group relative bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 text-left">
        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity"><ArrowRight className="text-orange-500" /></div>
        <div className="bg-orange-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-500 transition-colors duration-300">
          <Scissors className="text-orange-500 group-hover:text-white transition-colors" size={28} />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">分割 PDF</h2>
        <p className="text-sm text-gray-500 leading-relaxed">提取特定页面，或将文档拆分为多个文件。</p>
      </button>
    </div>
    <AdPlaceholder className="w-full max-w-4xl h-24" label="底部横幅广告" size="728x90" />
  </main>
);

export default LandingPage;