import React, { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import download from 'downloadjs';
import {
  ChevronLeft, UploadCloud, GripVertical, Trash2, Play, Loader2,
  Layers, File as FileIcon
} from 'lucide-react';
import AdPlaceholder from './AdPlaceholder';

interface MergePageProps {
  onBack: () => void;
}

interface FileData {
  id: string;
  fileObj: File;
  name: string;
  size: string;
  pages: number;
}

const MergePage: React.FC<MergePageProps> = ({ onBack }) => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragItemIndex, setDragItemIndex] = useState<number | null>(null);
  const [dragOverItemIndex, setDragOverItemIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const newFiles = Array.from(e.target.files);
    const processedFiles: FileData[] = [];

    for (const file of newFiles) {
      if (file.type !== 'application/pdf') continue;

      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);

        processedFiles.push({
          id: Date.now() + Math.random().toString(),
          fileObj: file,
          name: file.name,
          size: (file.size / 1024 / 1024).toFixed(2) + " MB",
          pages: pdfDoc.getPageCount()
        });
      } catch (err) {
        console.error("Error loading PDF", err);
        alert(`无法加载文件 ${file.name}`);
      }
    }
    setFiles(prev => [...prev, ...processedFiles]);
    if(fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = (id: string) => setFiles(files.filter(f => f.id !== id));
  const handleClearAll = () => { if (window.confirm("确定清空列表吗？")) setFiles([]); };

  const handleSort = () => {
    if (dragItemIndex === null || dragOverItemIndex === null) return;
    const _files = [...files];
    const item = _files.splice(dragItemIndex, 1)[0];
    _files.splice(dragOverItemIndex, 0, item);
    setDragItemIndex(null);
    setDragOverItemIndex(null);
    setFiles(_files);
  };

  const handleProcessMerge = async () => {
    if (files.length < 2) { alert("请至少选择两个文件。"); return; }
    setIsProcessing(true);

    try {
      const mergedPdf = await PDFDocument.create();

      for (const fileData of files) {
        const arrayBuffer = await fileData.fileObj.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const pdfBytes = await mergedPdf.save();
      download(pdfBytes, `pdf_master_merged_${Date.now()}.pdf`, "application/pdf");
      alert("合并成功！");
    } catch (error) {
      console.error(error);
      alert("合并出错");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 animate-fade-in pb-32 pt-8">
      <input
        type="file"
        multiple
        accept=".pdf"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex items-center gap-10">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft size={24} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">合并 PDF
          <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">Free</span></h1>
          <p className="text-gray-500 text-sm mt-1">拖动调整顺序，点击开始合并。</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        {files.length > 0 && (
          <button onClick={handleClearAll} className="self-start sm:self-auto text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1">
            <Trash2 size={14} /> 清空
          </button>
        )}
      </div>

      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-blue-200 bg-blue-50/30 rounded-xl p-8 text-center cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-all mb-8 group relative"
      >
        <div className="bg-white w-14 h-14 rounded-full shadow-sm flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
           <UploadCloud className="text-blue-600" size={28} />
        </div>
        <p className="text-lg font-bold text-gray-700">点击上传文件</p>
        <p className="text-sm text-gray-400 mt-2">支持多个 PDF，按住 Ctrl/Cmd 多选</p>
      </div>

      <div className="space-y-3 mb-8 min-h-[100px]">
        {files.map((file, index) => (
          <div
            key={file.id}
            draggable
            onDragStart={() => setDragItemIndex(index)}
            onDragEnter={() => setDragOverItemIndex(index)}
            onDragEnd={handleSort}
            onDragOver={(e) => e.preventDefault()}
            className={`group flex items-center bg-white p-3 rounded-xl border shadow-sm transition-all ${dragItemIndex === index ? 'opacity-50 bg-blue-50 border-blue-400 border-dashed' : 'border-gray-100 hover:border-blue-200'}`}
          >
            <div className="px-2 sm:px-3 text-gray-300 group-hover:text-blue-500 cursor-grab shrink-0"><GripVertical size={20} /></div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-50 rounded-lg flex items-center justify-center mr-2 sm:mr-4 shrink-0"><FileIcon className="text-red-500" size={16} /></div>
            <div className="flex-1 min-w-0 mr-2 sm:mr-4">
              <h3 className="text-gray-800 font-medium text-xs sm:text-sm truncate">{file.name}</h3>
              <div className="text-xs text-gray-400 mt-0.5">{file.size} • {file.pages} 页</div>
            </div>
            <div className="flex items-center gap-1 sm:gap-3 pr-1 sm:pr-2 shrink-0">
              <span className="text-xs bg-gray-100 text-gray-500 w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded">{index + 1}</span>
              <button onClick={(e) => { e.stopPropagation(); handleDelete(file.id); }} className="text-gray-300 hover:text-red-500 p-1 sm:p-2"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
        {files.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
                <Layers className="text-gray-300 mb-2" size={24} />
                <p className="text-gray-400 text-sm">暂无文件</p>
            </div>
        )}
      </div>

      {files.length > 0 && (
        <div className="mb-8">
            <button
                onClick={handleProcessMerge}
                disabled={isProcessing}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-3 group disabled:opacity-70"
            >
                {isProcessing ? <Loader2 className="animate-spin" /> : <div className="bg-white/20 p-1.5 rounded-lg"><Play size={20} className="fill-white" /></div>}
                <div className="text-left">
                    <span className="block text-lg font-bold">{isProcessing ? "合并中..." : "开始合并文件"}</span>
                    <span className="block text-xs opacity-80 font-normal">{files.length} 个文件</span>
                </div>
            </button>
        </div>
      )}
      <AdPlaceholder className="w-full h-24" label="列表下方广告" size="Auto" />
    </div>
  );
};

export default MergePage;