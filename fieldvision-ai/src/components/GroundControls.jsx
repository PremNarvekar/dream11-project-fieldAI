import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Tag, 
  CircleDot, 
  PieChart, 
  Move
} from 'lucide-react';

export function GroundControls({
  showLabels,
  setShowLabels,
  showCircle,
  setShowCircle,
  showSectors,
  setShowSectors,
  zoom,
  setZoom,
  onResetZoom,
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-white/95 border border-stone-200/90 rounded-2xl shadow-sm backdrop-blur-md text-xs">
      
      {/* Layer Toggles */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setShowLabels(!showLabels)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold transition-all ${
            showLabels 
              ? 'bg-zinc-950 text-white shadow-2xs' 
              : 'text-stone-600 hover:text-zinc-950 hover:bg-stone-100'
          }`}
          title="Toggle player names on field"
        >
          <Tag className="w-3.5 h-3.5" />
          <span>Labels</span>
        </button>

        <button
          onClick={() => setShowCircle(!showCircle)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold transition-all ${
            showCircle 
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs' 
              : 'text-stone-600 hover:text-zinc-950 hover:bg-stone-100'
          }`}
          title="Toggle 30-Yard restriction circle"
        >
          <CircleDot className="w-3.5 h-3.5" />
          <span>30-Yd Ring</span>
        </button>

        <button
          onClick={() => setShowSectors(!showSectors)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold transition-all ${
            showSectors 
              ? 'bg-stone-200 text-zinc-950 font-bold' 
              : 'text-stone-600 hover:text-zinc-950 hover:bg-stone-100'
          }`}
          title="Toggle Off/Leg field angles"
        >
          <PieChart className="w-3.5 h-3.5" />
          <span>Angles</span>
        </button>
      </div>

      {/* Drag Hint */}
      <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-stone-500 font-medium px-2.5 py-0.5 rounded-full bg-stone-100/80 border border-stone-200/60">
        <Move className="w-3 h-3 text-emerald-700 animate-pulse" />
        <span>Drag any player to adjust position</span>
      </div>

      {/* Zoom Controls */}
      <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-full border border-stone-200">
        <button
          onClick={() => setZoom(Math.max(0.85, zoom - 0.1))}
          className="p-1 rounded-full hover:bg-white text-stone-600 hover:text-zinc-900 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <span className="text-[11px] font-display font-bold px-1.5 text-zinc-900 min-w-[38px] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom(Math.min(1.3, zoom + 0.1))}
          className="p-1 rounded-full hover:bg-white text-stone-600 hover:text-zinc-900 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onResetZoom}
          className="p-1 rounded-full hover:bg-white text-stone-600 hover:text-zinc-900 transition-colors ml-0.5"
          title="Reset Zoom"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
}
