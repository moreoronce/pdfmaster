import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import download from 'downloadjs';
import * as pdfjsLib from 'pdfjs-dist';
import {
  ChevronLeft, UploadCloud, File as FileIcon, RotateCcw,
  Settings, CheckSquare, XSquare, Download, Loader2,
  CheckCircle2, FileText
} from 'lucide-react';
import AdPlaceholder from './AdPlaceholder';

// 配置 PDF.js worker
console.log('[DEBUG] 配置 PDF.js worker...');
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.js';
console.log('[DEBUG] PDF.js worker 配置完成:', pdfjsLib.GlobalWorkerOptions.workerSrc);

interface SplitPageProps {
  onBack: () => void;
}

interface FileData {
  fileObj: File;
  name: string;
  size: string;
  pageCount: number;
  pagesArray: number[];
  pdfDoc: any; // PDF.js 文档对象
}

interface PageThumbnailProps {
  pageNum: number;
  isSelected: boolean;
  isDisabled: boolean;
  onClick: () => void;
  pdfDoc: any; // PDF.js 文档对象
}

const PageThumbnail: React.FC<PageThumbnailProps> = ({
  pageNum,
  isSelected,
  isDisabled,
  onClick,
  pdfDoc
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [renderError, setRenderError] = useState(false);

  console.log('[DEBUG] PageThumbnail 渲染:', { pageNum, isSelected, isDisabled, hasPdfDoc: !!pdfDoc });

  // 渲染 PDF 页面缩略图
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) {
      console.log('[DEBUG] 跳过渲染 - 缺少 pdfDoc 或 canvas');
      return;
    }

    let isCancelled = false;
    let renderTask: any = null;

    const renderPage = async () => {
      try {
        console.log('[DEBUG] 开始渲染页面:', pageNum);
        const page = await pdfDoc.getPage(pageNum);
        
        // 检查是否已取消
        if (isCancelled) {
          console.log('[DEBUG] 渲染已取消:', pageNum);
          return;
        }

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        // 计算缩略图尺寸
        const viewport = page.getViewport({ scale: 1.5 });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        console.log('[DEBUG] Canvas 尺寸:', { width: canvas.width, height: canvas.height });

        // 渲染页面
        renderTask = page.render({
          canvasContext: context,
          viewport: viewport
        });

        await renderTask.promise;

        // 检查是否在渲染过程中被取消
        if (isCancelled) {
          console.log('[DEBUG] 渲染完成但已被取消:', pageNum);
          return;
        }

        console.log('[DEBUG] 页面渲染成功:', pageNum);
        setIsLoading(false);
      } catch (error) {
        if (isCancelled) {
          console.log('[DEBUG] 渲染被取消:', pageNum);
          return;
        }
        console.error('[DEBUG] 页面渲染失败:', pageNum, error);
        setRenderError(true);
        setIsLoading(false);
      }
    };

    renderPage();

    // 清理函数：取消正在进行的渲染
    return () => {
      console.log('[DEBUG] 清理渲染任务:', pageNum);
      isCancelled = true;
      if (renderTask) {
        renderTask.cancel();
      }
    };
  }, [pdfDoc, pageNum]);

  return (
    <div
      onClick={() => !isDisabled && onClick()}
      className={`relative group aspect-[3/4] rounded-lg cursor-pointer transition-all duration-200 overflow-hidden ${
        isDisabled ? 'opacity-50 cursor-not-allowed grayscale' : ''
      } ${
        isSelected && !isDisabled
          ? 'border-2 border-blue-500 ring-4 ring-blue-50 bg-blue-50/10'
          : 'border-2 border-gray-100 bg-white hover:border-blue-200 hover:shadow-md'
      }`}
    >
      {/* Canvas 用于渲染 PDF 缩略图 */}
      <div className="absolute inset-3 rounded border border-gray-200 flex items-center justify-center bg-white overflow-hidden">
        <canvas
          ref={canvasRef}
          className="max-w-full max-h-full object-contain"
          style={{ display: renderError ? 'none' : 'block' }}
        />
      </div>
      
      {/* 加载状态 */}
      {isLoading && !renderError && (
        <div className="absolute inset-3 flex items-center justify-center bg-gray-50 rounded border border-gray-200">
          <Loader2 size={24} className="text-blue-500 animate-spin" />
        </div>
      )}
      
      {/* 错误状态 - 显示占位符 */}
      {renderError && (
        <div className="absolute inset-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded border border-gray-200 flex flex-col items-center justify-center p-3">
          <FileText size={32} className="text-gray-400 mb-2" />
          <div className="text-center">
            <div className="text-xs font-medium text-gray-600 mb-1">第 {pageNum} 页</div>
            <div className="w-full h-1 bg-gray-200 rounded-full mb-2"></div>
            <div className="space-y-1">
              <div className="h-0.5 bg-gray-300 rounded w-3/4 mx-auto"></div>
              <div className="h-0.5 bg-gray-300 rounded w-full"></div>
              <div className="h-0.5 bg-gray-300 rounded w-2/3 mx-auto"></div>
            </div>
          </div>
        </div>
      )}

      {/* 页码标识 */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-medium text-gray-400 bg-white/90 px-2 py-0.5 rounded-full shadow-sm">
        {pageNum}
      </div>

      {/* 选择状态指示器 */}
      {!isDisabled && (
        <div className={`absolute top-2 right-2 transition-all ${isSelected ? 'scale-100' : 'scale-0 group-hover:scale-100'}`}>
          {isSelected ? (
            <CheckCircle2 size={22} className="text-blue-600 fill-white drop-shadow-sm" />
          ) : (
            <div className="w-5 h-5 rounded-full border-2 border-gray-300 bg-white/80 shadow-sm"></div>
          )}
        </div>
      )}
    </div>
  );
};

const SplitPage: React.FC<SplitPageProps> = ({ onBack }) => {
  const [file, setFile] = useState<FileData | null>(null);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [mode, setMode] = useState<'range' | 'all'>('range');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    console.log('[DEBUG] 开始加载 PDF 文件:', uploadedFile.name, '大小:', uploadedFile.size);

    try {
      const arrayBuffer = await uploadedFile.arrayBuffer();
      console.log('[DEBUG] ArrayBuffer 大小:', arrayBuffer.byteLength);

      // 加载 pdf-lib 文档（用于处理）
      const pdfLibDoc = await PDFDocument.load(arrayBuffer);
      const count = pdfLibDoc.getPageCount();
      console.log('[DEBUG] PDF 页数:', count);

      // 加载 PDF.js 文档（用于渲染缩略图）
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdfJsDoc = await loadingTask.promise;
      console.log('[DEBUG] PDF.js 文档加载成功:', pdfJsDoc.numPages);

      // 设置文件信息
      setFile({
        fileObj: uploadedFile,
        name: uploadedFile.name,
        size: (uploadedFile.size / 1024 / 1024).toFixed(2) + " MB",
        pageCount: count,
        pagesArray: Array.from({ length: count }, (_, i) => i + 1),
        pdfDoc: pdfJsDoc
      });
      setSelectedPages([]);
      console.log('[DEBUG] 文件信息设置完成');

    } catch (err) {
      console.error('[DEBUG] PDF 文件加载失败:', err);
      alert("无法读取 PDF 文件，请重试。");
    }
    if(fileInputRef.current) fileInputRef.current.value = '';
  };

  const togglePage = (pageNum: number) => {
    if (selectedPages.includes(pageNum)) {
      setSelectedPages(selectedPages.filter(p => p !== pageNum));
    } else {
      setSelectedPages([...selectedPages, pageNum].sort((a, b) => a - b));
    }
  };

  const handleProcessSplit = async () => {
    if (!file) return;
    setIsProcessing(true);

    try {
      const arrayBuffer = await file.fileObj.arrayBuffer();
      const srcDoc = await PDFDocument.load(arrayBuffer);
      const newDoc = await PDFDocument.create();

      if (mode === 'range') {
        if (selectedPages.length === 0) { alert("请选择页面"); setIsProcessing(false); return; }
        const indices = selectedPages.map(p => p - 1);
        const copiedPages = await newDoc.copyPages(srcDoc, indices);
        copiedPages.forEach(p => newDoc.addPage(p));
        const pdfBytes = await newDoc.save();
        download(pdfBytes, `split_selection_${file.name}`, "application/pdf");

      } else {
        alert("为防止浏览器拦截多个下载弹窗，这里演示提取当前文档的第 1 页。完整功能通常需要打包为 ZIP。");
        const copiedPages = await newDoc.copyPages(srcDoc, [0]);
        newDoc.addPage(copiedPages[0]);
        const pdfBytes = await newDoc.save();
        download(pdfBytes, `page_1_${file.name}`, "application/pdf");
      }

      if(mode === 'range') alert("提取成功！下载已开始。");
    } catch (err) {
      console.error(err);
      alert("处理失败：" + (err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!file) {
    return (
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 animate-fade-in pb-32 pt-8">
             <input type="file" accept=".pdf" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
             <div className="flex items-center gap-10 mb-6">
                <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ChevronLeft size={24} className="text-gray-600" /></button>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">分割 PDF</h1>
            </div>
            <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-blue-200 bg-blue-50/30 rounded-2xl p-6 sm:p-12 text-center cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-all mb-8 h-[300px] sm:h-[400px] flex flex-col items-center justify-center group">
                <div className="bg-white w-16 h-16 sm:w-20 sm:h-20 rounded-full shadow-sm flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform"><UploadCloud className="text-blue-600" size={32} /></div>
                <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-3">选择要分割的 PDF 文件</h2>
                <button className="mt-4 sm:mt-8 bg-blue-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-full font-medium shadow-lg hover:bg-blue-700 transition-colors text-sm sm:text-base">选择文件</button>
            </div>
            <AdPlaceholder className="w-full h-24 sm:h-32" label="首页中部广告" size="Responsive" />
        </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 animate-fade-in pt-8">
      <div className="flex items-center gap-10">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ChevronLeft size={24} className="text-gray-600" /></button>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">分割 PDF</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        <div className="lg:col-span-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-gray-100 sticky top-24 z-20 gap-3">
            <div className="flex items-center gap-3 min-w-0">
                <div className="bg-red-50 p-2 rounded-lg shrink-0"><FileIcon className="text-red-500" size={18} /></div>
                <div className="min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 truncate">{file.name}</h3>
                  <p className="text-xs text-gray-500">共 {file.pageCount} 页 · {file.size}</p>
                </div>
            </div>
            <button onClick={() => { if (window.confirm('移除文件？')) { setFile(null); setSelectedPages([]); } }} className="self-start sm:self-auto text-gray-400 hover:text-red-600 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 shrink-0"><RotateCcw size={14} /> 更换文件</button>
          </div>

          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 pb-20">
            {file.pagesArray.map((page) => {
              const isSelected = selectedPages.includes(page);
              const isDisabled = mode === 'all';
              return (
                <PageThumbnail
                  key={page}
                  pageNum={page}
                  isSelected={isSelected}
                  isDisabled={isDisabled}
                  onClick={() => togglePage(page)}
                  pdfDoc={file.pdfDoc}
                />
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg shadow-gray-100 border border-gray-100 lg:sticky lg:top-24">
            <div className="flex items-center gap-2 mb-6 text-gray-800"><Settings size={20} /><h3 className="font-bold text-sm sm:text-base">分割设置</h3></div>
            <div className="space-y-3 mb-8">
              <label className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer ${mode === 'range' ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200' : 'hover:bg-gray-50 border-gray-200'}`} onClick={() => setMode('range')}>
                <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${mode === 'range' ? 'border-blue-600' : 'border-gray-300'}`}>{mode === 'range' && <div className="w-2 h-2 rounded-full bg-blue-600" />}</div>
                <div className="min-w-0"><span className="block text-sm font-bold text-gray-900">提取选定页面</span><span className="block text-xs text-gray-500 mt-0.5">将选中的页面合并为一个新 PDF</span></div>
              </label>
              <label className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer ${mode === 'all' ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200' : 'hover:bg-gray-50 border-gray-200'}`} onClick={() => setMode('all')}>
                <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${mode === 'all' ? 'border-blue-600' : 'border-gray-300'}`}>{mode === 'all' && <div className="w-2 h-2 rounded-full bg-blue-600" />}</div>
                <div className="min-w-0"><span className="block text-sm font-bold text-gray-900">拆分为单页</span><span className="block text-xs text-gray-500 mt-0.5">演示模式：仅提取第 1 页</span></div>
              </label>
            </div>

            {mode === 'range' && (
              <div className="mb-8 space-y-4">
                 <div className="flex flex-col sm:flex-row gap-2">
                    <button onClick={() => file && setSelectedPages(file.pagesArray)} className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-blue-600"><CheckSquare size={14} /> 全选</button>
                    <button onClick={() => setSelectedPages([])} className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-red-500"><XSquare size={14} /> 清空</button>
                 </div>
                <div className="bg-gray-50 p-3 sm:p-4 rounded-xl border border-gray-100">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">已选页码</label>
                    <div className="font-mono text-gray-800 break-words bg-white border border-gray-200 p-2 rounded-lg text-xs sm:text-sm min-h-[40px]">
                    {selectedPages.length > 0 ? selectedPages.join(', ') : <span className="text-gray-400 italic">请点击左侧页面...</span>}
                    </div>
                </div>
              </div>
            )}
            <button onClick={handleProcessSplit} disabled={isProcessing} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 sm:py-3.5 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70 text-sm sm:text-base">
                {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <><Download size={18} /> 下载文件</>}
            </button>
          </div>
          <AdPlaceholder className="w-full h-48 sm:h-64" label="侧边栏推荐" size="300x250 / Auto" />
        </div>
      </div>
    </div>
  );
};

export default SplitPage;