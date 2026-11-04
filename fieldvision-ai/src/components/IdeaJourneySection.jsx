import { 
  FileText, 
  ExternalLink, 
  Download, 
  Eye, 
  Sparkles, 
  MessageSquare,
  ArrowRight
} from 'lucide-react';

export function IdeaJourneySection({ onOpenViewer, pdfUrl = '/fieldvision-idea-journey.pdf' }) {
  return (
    <section className="bg-white border border-zinc-200/90 rounded-3xl p-6 lg:p-8 shadow-sm">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 pb-6 border-b border-zinc-100">
        
        {/* Editorial Story Header */}
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-950"></span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              Product Origins & Problem Discovery
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 mb-2 font-display">
            Idea Journey – How We Got Here
          </h2>

          <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
            FieldVision AI was born out of a genuine cricket fan's frustration expressed during an IPL discussion on Reddit. When asked what real problems fans face while watching live matches, one comment cut through the noise:
          </p>

          <div className="my-3.5 pl-4 py-2 border-l-2 border-emerald-600 bg-emerald-50/50 rounded-r-2xl text-xs sm:text-sm italic text-zinc-800 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-700 shrink-0 not-italic" />
            <span>&ldquo;Just show me the live field placement.&rdquo;</span>
            <span className="not-italic text-[11px] font-semibold text-zinc-500 ml-1">— Reddit fan</span>
          </div>

          <p className="text-xs text-zinc-500 leading-relaxed">
            That single request inspired our team to build an AI-powered tactical companion that reveals the invisible chess match on the pitch: where every fielder is positioned, why they are there, and where scoring opportunities lie.
          </p>
        </div>

        {/* Clickable PDF Document Preview Card */}
        <div className="lg:w-96 shrink-0">
          <div 
            onClick={onOpenViewer}
            className="group relative bg-[#f8faf9] hover:bg-white border border-zinc-200/90 hover:border-zinc-400 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            {/* Top pill */}
            <div className="flex items-center justify-between mb-3.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100/80 text-emerald-900 text-[10px] font-bold">
                <Sparkles className="w-3 h-3 text-emerald-700" />
                Original Concept PDF
              </span>
              <span className="text-[10px] font-mono font-semibold text-zinc-400">
                139 KB • 2 Pages
              </span>
            </div>

            {/* Teaser Document View */}
            <div className="bg-white rounded-2xl p-4 border border-zinc-200/80 shadow-2xs mb-4 relative overflow-hidden group-hover:border-zinc-300 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-950 text-[#d6f944] flex items-center justify-center font-bold shadow-sm shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xs sm:text-sm text-zinc-900 tracking-tight truncate">
                    IDEA JOURNEY
                  </h4>
                  <p className="text-[11px] text-zinc-500 font-medium truncate">
                    The Story Behind FieldVision AI
                  </p>
                  <p className="text-[10px] text-zinc-400 mt-1 line-clamp-2 leading-snug">
                    Reddit ideation, problem statement, and GPT collaboration notes.
                  </p>
                </div>
              </div>

              {/* Hover overlay hint */}
              <div className="mt-3 pt-2.5 border-t border-zinc-100 flex items-center justify-between text-[11px] text-emerald-800 font-semibold">
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Click to Preview Document</span>
                </span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Direct Action Buttons */}
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              
              {/* Primary: View Original PDF in New Tab (Requirement) */}
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-2xl bg-zinc-950 hover:bg-zinc-800 text-white hover:text-[#d6f944] text-xs font-semibold shadow-sm transition-all text-center"
                title="Open complete PDF directly in a new browser tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View Original PDF</span>
              </a>

              {/* Secondary: Download */}
              <a
                href={pdfUrl}
                download="FieldVision-AI-Idea-Journey.pdf"
                className="p-2.5 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200/80 transition-colors"
                title="Download original PDF"
              >
                <Download className="w-4 h-4" />
              </a>

            </div>

          </div>
        </div>

      </div>

      {/* Feature Highlights beneath */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
        <div className="p-4 rounded-2xl bg-[#f8faf9] border border-zinc-200/70">
          <span className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">
            01 • The Problem
          </span>
          <h4 className="font-bold text-xs text-zinc-900 mb-1">
            Broadcast Blindspot
          </h4>
          <p className="text-[11px] text-zinc-600 leading-relaxed">
            TV cameras follow the ball, rarely showing the complete outfield layout. Fans never see where fielders are until the ball is hit.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#f8faf9] border border-zinc-200/70">
          <span className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">
            02 • The Technology
          </span>
          <h4 className="font-bold text-xs text-zinc-900 mb-1">
            Spatial Telemetry + Gemini AI
          </h4>
          <p className="text-[11px] text-zinc-600 leading-relaxed">
            Real-time coordinates, 30-yard restriction modeling, and Gemini 2.5 Flash analyze fielding gaps and tactical traps dynamically.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#f8faf9] border border-zinc-200/70">
          <span className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">
            03 • The Result
          </span>
          <h4 className="font-bold text-xs text-zinc-900 mb-1">
            Accessible Cricket Intelligence
          </h4>
          <p className="text-[11px] text-zinc-600 leading-relaxed">
            Designed for everyday cricket fans to understand match tactics within 5 seconds without dense statistical clutter.
          </p>
        </div>
      </div>
    </section>
  );
}
