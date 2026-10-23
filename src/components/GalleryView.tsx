import React, { useState } from 'react';
import { 
  Camera, Download, Trash2, Eye, Share2, Check, Filter, 
  Sparkles, Compass, SlidersHorizontal, ArrowLeft, ArrowRight,
  Maximize2, X, RefreshCw, Layers, Film
} from 'lucide-react';
import { GalleryStill } from '../types/gallery';

interface GalleryViewProps {
  stills: GalleryStill[];
  onDeleteStill: (id: string) => void;
  onClearGallery: () => void;
  onResetDefaults: () => void;
  onOpenDirectorsMode: () => void;
}

export const GalleryView: React.FC<GalleryViewProps> = ({
  stills,
  onDeleteStill,
  onClearGallery,
  onResetDefaults,
  onOpenDirectorsMode,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'captures' | 'scene1' | 'scene2' | 'scene3' | 'scene4' | 'marvel' | 'clean'>('all');
  const [aspectFilter, setAspectFilter] = useState<'all' | '16:9' | '9:16'>('all');
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter stills based on scene, style, or custom capture
  const filteredStills = stills.filter((still) => {
    if (aspectFilter !== 'all' && still.aspectRatio !== aspectFilter) {
      return false;
    }
    if (selectedFilter === 'captures') return still.isCustomCapture === true;
    if (selectedFilter === 'scene1') return still.sceneId === 1;
    if (selectedFilter === 'scene2') return still.sceneId === 2;
    if (selectedFilter === 'scene3') return still.sceneId === 3;
    if (selectedFilter === 'scene4') return still.sceneId === 4;
    if (selectedFilter === 'marvel') return still.style === 'marvel';
    if (selectedFilter === 'clean') return still.style === 'clean';
    return true;
  });

  const customCapturesCount = stills.filter((s) => s.isCustomCapture).length;

  const downloadStill = (still: GalleryStill) => {
    const a = document.createElement('a');
    a.href = still.imageUrl;
    a.download = `iron-warrior-scene${still.sceneId}-${still.style}-still-${still.id.slice(0, 8)}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const copyStillToClipboard = async (still: GalleryStill) => {
    try {
      const res = await fetch(still.imageUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
      setCopiedId(still.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.warn('Clipboard copy failed:', e);
    }
  };

  // Lightbox keyboard navigation & cycling
  const activeStill = activeLightboxIndex !== null ? filteredStills[activeLightboxIndex] : null;

  const handleNextLightbox = () => {
    if (activeLightboxIndex === null) return;
    setActiveLightboxIndex((activeLightboxIndex + 1) % filteredStills.length);
  };

  const handlePrevLightbox = () => {
    if (activeLightboxIndex === null) return;
    setActiveLightboxIndex(
      (activeLightboxIndex - 1 + filteredStills.length) % filteredStills.length
    );
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fadeIn">
      {/* Top Gallery Header Bar */}
      <div className="relative rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-amber-500/30 p-5 sm:p-6 shadow-2xl backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)] shrink-0">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-display font-black text-lg sm:text-xl text-white tracking-wider">
                DIRECTOR'S STILLS GALLERY
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/50">
                {stills.length} ARCHIVED STILLS
              </span>
              {customCapturesCount > 0 && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/50">
                  {customCapturesCount} DIRECTOR CAPTURES
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              High-resolution promotional stills captured from Director's Mode with 35mm film grain, 3D camera angles, and Marvel cinematic branding.
            </p>
          </div>
        </div>

        {/* Action Buttons in Gallery Header */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onOpenDirectorsMode}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-display font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-950/50 transition-all cursor-pointer active:scale-95"
            title="Open 30s Cinema Viewport and enable Director's 3D Camera"
          >
            <Camera className="w-4 h-4 text-black" />
            <span>Capture New Still</span>
          </button>

          <button
            onClick={onResetDefaults}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
            title="Restore default Marvel promotional artwork stills"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          {stills.length > 0 && (
            <button
              onClick={onClearGallery}
              className="px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/50 text-red-300 text-xs font-semibold flex items-center gap-1.5 border border-red-800/60 transition-colors cursor-pointer"
              title="Clear all saved stills"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Aspect Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs">
        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-1 mr-1" />
          {[
            { id: 'all', label: `All (${stills.length})` },
            { id: 'captures', label: `My Captures (${customCapturesCount})` },
            { id: 'scene1', label: 'Scene 1' },
            { id: 'scene2', label: 'Scene 2' },
            { id: 'scene3', label: 'Scene 3' },
            { id: 'scene4', label: 'Scene 4' },
            { id: 'marvel', label: 'Marvel Promo' },
            { id: 'clean', label: 'Clean Stills' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all font-semibold cursor-pointer ${
                selectedFilter === tab.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Aspect Ratio Filter */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 shrink-0 self-end sm:self-auto">
          <button
            onClick={() => setAspectFilter('all')}
            className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
              aspectFilter === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Aspects
          </button>
          <button
            onClick={() => setAspectFilter('16:9')}
            className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
              aspectFilter === '16:9'
                ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            16:9
          </button>
          <button
            onClick={() => setAspectFilter('9:16')}
            className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
              aspectFilter === '9:16'
                ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            9:16
          </button>
        </div>
      </div>

      {/* Stills Grid */}
      {filteredStills.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-500 border border-slate-700">
            <Camera className="w-8 h-8 text-amber-400/60" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-white">No Stills Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              {selectedFilter === 'captures'
                ? "You haven't captured any stills in Director's Mode yet. Open the 30s Cinema Viewport, drag to rotate your camera, and click 'Capture Moment'!"
                : "No stills match the selected filter. Try changing your filter or reset defaults."}
            </p>
          </div>
          <button
            onClick={onOpenDirectorsMode}
            className="mt-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-display font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-950/40 cursor-pointer active:scale-95"
          >
            <Camera className="w-4 h-4" />
            <span>Open Director's Mode Now</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {filteredStills.map((still, index) => {
            const isCustom = still.isCustomCapture === true;
            return (
              <div
                key={still.id}
                className="group relative bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-[0_0_25px_rgba(245,158,11,0.2)] flex flex-col"
              >
                {/* Image Container with Badges */}
                <div
                  className={`relative w-full overflow-hidden bg-black flex items-center justify-center cursor-pointer ${
                    still.aspectRatio === '9:16' ? 'aspect-[9/16] max-h-[360px]' : 'aspect-[16/9]'
                  }`}
                  onClick={() => setActiveLightboxIndex(index)}
                >
                  <img
                    src={still.imageUrl}
                    alt={`Iron Warrior Scene ${still.sceneId}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Top Badges */}
                  <div className="absolute top-2 inset-x-2 flex items-center justify-between pointer-events-none z-10">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-cyan-300 border border-cyan-800/80 shadow">
                      SCENE 0{still.sceneId}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {isCustom && (
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500 text-black shadow">
                          CAPTURE
                        </span>
                      )}
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/80 text-slate-300 border border-slate-700">
                        {still.aspectRatio}
                      </span>
                    </div>
                  </div>

                  {/* Hover Overlay with Quick Action Buttons */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px] flex items-center justify-center gap-2 p-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveLightboxIndex(index);
                      }}
                      className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black shadow-lg transition-transform active:scale-95 cursor-pointer"
                      title="Inspect Fullscreen Lightbox"
                    >
                      <Eye className="w-4 h-4 text-black" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadStill(still);
                      }}
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white shadow-lg transition-transform active:scale-95 cursor-pointer border border-slate-600"
                      title="Download PNG"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyStillToClipboard(still);
                      }}
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white shadow-lg transition-transform active:scale-95 cursor-pointer border border-slate-600"
                      title="Copy Image to Clipboard"
                    >
                      {copiedId === still.id ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Share2 className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteStill(still.id);
                      }}
                      className="p-2.5 rounded-xl bg-red-950/80 hover:bg-red-900 text-red-300 shadow-lg transition-transform active:scale-95 cursor-pointer border border-red-800/80"
                      title="Delete Still"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Card Info Footer */}
                <div className="p-3.5 flex flex-col gap-2 flex-1 justify-between bg-slate-950/60">
                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-display font-bold text-white truncate">
                        {still.sceneTitle}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 shrink-0">
                        {still.timestamp}
                      </span>
                    </div>

                    {still.dialogueQuote && (
                      <p className="text-[11px] text-slate-400 italic line-clamp-1 mt-1">
                        "{still.dialogueQuote}"
                      </p>
                    )}
                  </div>

                  {/* Telemetry info row */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400">
                    <div className="flex items-center gap-1 text-amber-300/90">
                      <Compass className="w-3 h-3 text-amber-400" />
                      <span>
                        Y:{still.telemetry.yaw >= 0 ? '+' : ''}{still.telemetry.yaw}° P:{still.telemetry.pitch >= 0 ? '+' : ''}{still.telemetry.pitch}°
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">ZOOM: {still.telemetry.zoom}x</span>
                      <span className="text-cyan-400 font-semibold">{still.style.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FULLSCREEN LIGHTBOX MODAL */}
      {activeStill && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-lg flex items-center justify-center p-3 sm:p-6 overflow-hidden animate-fadeIn">
          {/* Close Lightbox */}
          <button
            onClick={() => setActiveLightboxIndex(null)}
            className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            title="Close Lightbox (Esc)"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Previous Still Button */}
          {filteredStills.length > 1 && (
            <button
              onClick={handlePrevLightbox}
              className="absolute left-3 sm:left-6 z-40 p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 text-amber-400 border border-amber-500/40 shadow-xl transition-transform active:scale-95 cursor-pointer"
              title="Previous Still"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          {/* Next Still Button */}
          {filteredStills.length > 1 && (
            <button
              onClick={handleNextLightbox}
              className="absolute right-3 sm:right-6 z-40 p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 text-amber-400 border border-amber-500/40 shadow-xl transition-transform active:scale-95 cursor-pointer"
              title="Next Still"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          )}

          {/* Lightbox Content Container */}
          <div className="relative max-w-6xl w-full max-h-[92vh] flex flex-col lg:flex-row gap-5 items-center justify-center p-2">
            {/* Main Image Viewport */}
            <div className="flex-1 w-full flex items-center justify-center max-h-[72vh] lg:max-h-[85vh] overflow-hidden rounded-2xl bg-black/80 border border-slate-800 p-2 shadow-2xl">
              <img
                src={activeStill.imageUrl}
                alt={activeStill.sceneTitle}
                className="max-h-full max-w-full object-contain rounded-xl"
              />
            </div>

            {/* Lightbox Inspector Sidebar */}
            <div className="w-full lg:w-80 bg-slate-950 border border-amber-500/40 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 text-xs font-sans">
              <div className="flex items-center justify-between border-b border-amber-500/30 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-amber-500/20 text-amber-400">
                    <Camera className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-display font-bold text-amber-300 uppercase tracking-wider text-sm">
                    SHOT INSPECTOR
                  </span>
                </div>
                <span className="font-mono text-[10px] text-slate-400">
                  {activeLightboxIndex! + 1} / {filteredStills.length}
                </span>
              </div>

              {/* Title & Scene */}
              <div className="flex flex-col gap-1">
                <div className="text-[10px] font-mono text-cyan-400 uppercase font-bold tracking-widest">
                  SCENE 0{activeStill.sceneId} // {activeStill.style.toUpperCase()}_STILL
                </div>
                <h3 className="font-display font-bold text-white text-base">
                  {activeStill.sceneTitle}
                </h3>
                {activeStill.dialogueQuote && (
                  <p className="text-slate-300 italic text-[11px] bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 mt-1">
                    "{activeStill.dialogueQuote}"
                  </p>
                )}
              </div>

              {/* Telemetry Breakdown */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col gap-2 font-mono text-[11px] text-slate-300">
                <div className="text-amber-400 font-bold tracking-wider text-[10px]">
                  DIRECTOR CAMERA TELEMETRY
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">YAW ANGLE:</span>
                  <span className="text-amber-300 font-bold">
                    {activeStill.telemetry.yaw >= 0 ? '+' : ''}{activeStill.telemetry.yaw}°
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">PITCH ANGLE:</span>
                  <span className="text-amber-300 font-bold">
                    {activeStill.telemetry.pitch >= 0 ? '+' : ''}{activeStill.telemetry.pitch}°
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">CAMERA ZOOM:</span>
                  <span className="text-amber-300 font-bold">
                    {activeStill.telemetry.zoom}x
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">FILM GRAIN:</span>
                  <span className="text-slate-200">
                    {Math.round(activeStill.grain * 100)}% 35mm
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ASPECT RATIO:</span>
                  <span className="text-cyan-400 font-bold">
                    {activeStill.aspectRatio} UHD
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">TIMESTAMP:</span>
                  <span className="text-slate-400">{activeStill.timestamp}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => downloadStill(activeStill)}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-950/40 cursor-pointer active:scale-98"
                >
                  <Download className="w-4 h-4 text-black" />
                  <span>Download Full Resolution</span>
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => copyStillToClipboard(activeStill)}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
                  >
                    {copiedId === activeStill.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>Copy Image</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      onDeleteStill(activeStill.id);
                      setActiveLightboxIndex(null);
                    }}
                    className="py-2 px-3 rounded-xl bg-red-950/40 hover:bg-red-900/50 text-red-300 text-xs font-semibold flex items-center justify-center gap-1.5 border border-red-800/60 transition-colors cursor-pointer"
                    title="Delete Still"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
