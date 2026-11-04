import { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  Download, 
  Printer, 
  FileText, 
  ZoomIn, 
  ZoomOut,
  Maximize2
} from 'lucide-react';

export function PdfViewerModal({ isOpen, onClose, pdfUrl = '/fieldvision-idea-journey.pdf' }) {
  const [zoomLevel, setZoomLevel] = useState(100);

  if (!isOpen) return null;

  const handlePrint = () => {
    const iframe = document.getElementById('fieldvision-pdf-iframe');
    if (iframe && iframe.contentWindow) {
      try {
        iframe.contentWindow.print();
        return;
      } catch {
        // Fallback to window print
      }
    }
    window.open(pdfUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-zinc-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white border border-zinc-200/90 rounded-3xl max-w-5xl w-full h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Top Viewer Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-zinc-100 bg-[#fbfcfb]">
          
          {/* Document Title & Badge */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-950 text-[#d6f944] flex items-center justify-center font-bold shadow-sm">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-zinc-950 text-sm sm:text-base tracking-tight">
                  Idea Journey – The Story Behind FieldVision AI
                </h3>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold">
                  2 Pages • Original Concept
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 hidden sm:block">
                Original Reddit post & AI collaboration documentation
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Zoom Controls */}
            <div className="hidden md:flex items-center bg-zinc-100 p-1 rounded-xl border border-zinc-200 text-xs">
              <button
                onClick={() => setZoomLevel((z) => Math.max(z - 15, 60))}
                className="p-1 rounded-lg hover:bg-zinc-200 text-zinc-700 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 text-[11px] font-mono font-semibold text-zinc-800">
                {zoomLevel}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(z + 15, 160))}
                className="p-1 rounded-lg hover:bg-zinc-200 text-zinc-700 transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 transition-colors hidden sm:flex items-center justify-center"
              title="Print document"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Download Button */}
            <a
              href={pdfUrl}
              download="FieldVision-AI-Idea-Journey.pdf"
              className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 transition-colors flex items-center justify-center"
              title="Download PDF document"
            >
              <Download className="w-4 h-4" />
            </a>

            {/* View Original PDF in New Tab (Requirement) */}
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white hover:text-[#d6f944] text-xs font-semibold shadow-sm transition-all"
              title="Open complete PDF directly in a new browser tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">View Original PDF</span>
              <span className="sm:hidden">Open</span>
            </a>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-800 transition-colors ml-1"
              title="Close viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* Mobile Notice Bar */}
        <div className="sm:hidden bg-amber-50 px-4 py-2 border-b border-amber-200/60 flex items-center justify-between text-xs text-amber-900">
          <span>Viewing on mobile? Tap Open for full screen native PDF.</span>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold underline text-amber-950 flex items-center gap-1 ml-2"
          >
            <span>Open</span>
            <Maximize2 className="w-3 h-3" />
          </a>
        </div>

        {/* Embedded PDF Viewer Container */}
        <div className="flex-1 w-full h-full bg-zinc-100 overflow-auto flex items-center justify-center relative">
          <object
            id="fieldvision-pdf-object"
            data={pdfUrl}
            type="application/pdf"
            className="w-full h-full transition-transform duration-150 origin-top"
            style={{ transform: zoomLevel !== 100 ? `scale(${zoomLevel / 100})` : 'none' }}
          >
            {/* Fallback iframe for browsers with object handling quirks */}
            <iframe
              id="fieldvision-pdf-iframe"
              src={pdfUrl}
              title="FieldVision AI - Idea Journey Document"
              className="w-full h-full border-0"
            >
              {/* Fallback for devices without inline PDF support */}
              <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                <FileText className="w-12 h-12 text-zinc-400 mb-3" />
                <h4 className="font-bold text-zinc-900 text-base mb-1">
                  PDF Preview Unavailable in this Browser
                </h4>
                <p className="text-xs text-zinc-500 mb-4 max-w-md">
                  Your browser does not support embedded PDF rendering directly. You can view or download the complete 2-page document.
                </p>
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-zinc-950 text-white font-semibold text-xs flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>View Original PDF</span>
                </a>
              </div>
            </iframe>
          </object>
        </div>

      </div>
    </div>
  );
}
