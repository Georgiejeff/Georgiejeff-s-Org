import React from 'react';
import { 
  Film, Video, Camera, Sliders, Terminal, Shield, 
  Sparkles, Zap, Play, Activity, Cpu, CheckCircle, 
  Layers, HardDrive, ArrowRight, Compass, Volume2, 
  Radio, Clock, Star
} from 'lucide-react';
import { SCENES } from '../data/scenes';
import { GalleryStill } from '../types/gallery';

interface ProductionDashboardProps {
  savedStills: GalleryStill[];
  onNavigateTab: (tab: 'omni-studio' | 'player' | 'storyboard' | 'gallery' | 'input-console' | 'admin-log') => void;
  onSelectScenePlayback?: (sceneId: number) => void;
}

export const ProductionDashboard: React.FC<ProductionDashboardProps> = ({
  savedStills,
  onNavigateTab,
  onSelectScenePlayback,
}) => {
  const customCaptures = savedStills.filter((s) => s.isCustomCapture).length;

  return (
    <div className="flex flex-col gap-6 w-full animate-fadeIn font-sans">
      {/* Hero Mission Control Header */}
      <div className="relative rounded-2xl bg-gradient-to-r from-slate-900 via-cyan-950/30 to-blue-950/40 border border-cyan-500/30 p-5 sm:p-7 shadow-2xl backdrop-blur-md overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-cyan-500/10 via-blue-500/5 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-900/50 border border-cyan-400/40 shrink-0">
              <Zap className="w-8 h-8 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold uppercase tracking-wider">
                  PRODUCTION MISSION CONTROL
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/60 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  WARRIOR_PROTOCOL ONLINE
                </span>
              </div>
              <h1 className="font-display font-black text-xl sm:text-2xl text-white tracking-wider mt-1">
                IRON WARRIOR PRODUCTION DASHBOARD
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Marvel Cinematic VFX • 30-Second Superhero Origin Saga • 4K AI Video & Director's Telemetry
              </p>
            </div>
          </div>

          {/* Quick Primary Actions */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => onNavigateTab('player')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-display font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-cyan-900/40 transition-all cursor-pointer active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Launch 30s Cinema</span>
            </button>

            <button
              onClick={() => onNavigateTab('gallery')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-display font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-950/40 transition-all cursor-pointer active:scale-95"
            >
              <Camera className="w-4 h-4 text-black" />
              <span>Stills Gallery ({savedStills.length})</span>
            </button>
          </div>
        </div>

        {/* Telemetry Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-slate-800/80">
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col gap-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>SAGA DURATION</span>
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="font-display font-bold text-lg text-white">00:30.00</div>
            <div className="text-[10px] text-cyan-400 font-mono">4 SCENE CHOREOGRAPHY</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col gap-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>GALLERY ARCHIVE</span>
              <Camera className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="font-display font-bold text-lg text-amber-300">
              {savedStills.length} STILLS
            </div>
            <div className="text-[10px] text-amber-400/80 font-mono">
              {customCaptures} USER CAPTURED
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col gap-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>VIDEO SYNTHESIS</span>
              <Video className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="font-display font-bold text-lg text-white">DUAL-ENGINE</div>
            <div className="text-[10px] text-blue-400 font-mono">OMNI FLASH + CANVAS VFX</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col gap-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>AUDIO ENGINE</span>
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="font-display font-bold text-lg text-emerald-300">44.1 kHz</div>
            <div className="text-[10px] text-emerald-400 font-mono">SYNTHESIZED SUB-BASS</div>
          </div>
        </div>
      </div>

      {/* Production Stage Breakdown (4 Scenes) */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-cyan-400" />
            <h3 className="font-display font-bold text-sm sm:text-base text-white tracking-wider">
              30-SECOND MOVIE SCENE TIMELINE
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">4 OF 4 SCENES MASTERED</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {SCENES.map((scene) => (
            <div
              key={scene.id}
              className="group relative bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 rounded-2xl overflow-hidden shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              {/* Scene Image Preview */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-black">
                <img
                  src={scene.image}
                  alt={scene.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-black/80 text-cyan-300 border border-cyan-800/80">
                    SCENE 0{scene.id}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 text-slate-300 border border-cyan-900/50">
                    {scene.startTime}s–{scene.endTime}s
                  </span>
                </div>
                <div className="absolute bottom-2 left-2.5 right-2.5">
                  <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                    {scene.vfxTheme.toUpperCase()}_VFX
                  </span>
                  <div className="font-display font-bold text-sm text-white truncate">
                    {scene.title}
                  </div>
                </div>
              </div>

              {/* Body Info */}
              <div className="p-3.5 flex flex-col gap-2.5 flex-1 justify-between bg-slate-950/50">
                <div className="flex flex-col gap-1 text-xs">
                  <p className="text-slate-300 text-[11px] line-clamp-2 leading-relaxed">
                    {scene.visual}
                  </p>
                  {scene.dialogue && (
                    <div className="p-2 rounded-lg bg-black/60 border border-slate-800/80 text-[11px] text-slate-300 italic">
                      "{scene.dialogue.text}"
                    </div>
                  )}
                </div>

                {/* Quick actions for this scene */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => {
                      if (onSelectScenePlayback) onSelectScenePlayback(scene.id);
                      onNavigateTab('player');
                    }}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[11px] font-semibold border border-cyan-500/40 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-cyan-300" />
                    <span>Play Scene</span>
                  </button>

                  <button
                    onClick={() => onNavigateTab('input-console')}
                    className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700 transition-colors cursor-pointer"
                    title="Customize scene inputs"
                  >
                    <Sliders className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Production Subsystems Command Center */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Module 1: Input Console */}
        <div
          onClick={() => onNavigateTab('input-console')}
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer flex flex-col justify-between gap-3 group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono text-cyan-400 group-hover:translate-x-0.5 transition-transform">
              CONFIGURE ↗
            </span>
          </div>
          <div>
            <h4 className="font-display font-bold text-white text-sm">Director's Input Console</h4>
            <p className="text-xs text-slate-400 mt-1">
              Adjust dialogue scripts, lightning frequency, nanotech rune density, arc reactor overdrive, and starting camera staging angles.
            </p>
          </div>
          <div className="text-[10px] font-mono text-cyan-300/80 pt-2 border-t border-slate-800/80">
            VFX TUNING // SCENE SCRIPTING
          </div>
        </div>

        {/* Module 2: Stills Gallery */}
        <div
          onClick={() => onNavigateTab('gallery')}
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 transition-all cursor-pointer flex flex-col justify-between gap-3 group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Camera className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono text-amber-400 group-hover:translate-x-0.5 transition-transform">
              EXPLORE ↗
            </span>
          </div>
          <div>
            <h4 className="font-display font-bold text-white text-sm">Director's Stills Gallery</h4>
            <p className="text-xs text-slate-400 mt-1">
              Browse, inspect, and export high-resolution promotional stills captured from Director's Mode with 35mm film grain and Marvel branding.
            </p>
          </div>
          <div className="text-[10px] font-mono text-amber-300/80 pt-2 border-t border-slate-800/80">
            {savedStills.length} ARCHIVED PROMO STILLS
          </div>
        </div>

        {/* Module 3: Admin & Audit Log */}
        <div
          onClick={() => onNavigateTab('admin-log')}
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer flex flex-col justify-between gap-3 group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
              <Terminal className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono text-indigo-400 group-hover:translate-x-0.5 transition-transform">
              VIEW TERMINAL ↗
            </span>
          </div>
          <div>
            <h4 className="font-display font-bold text-white text-sm">Admin Audit & System Log</h4>
            <p className="text-xs text-slate-400 mt-1">
              Live audit stream of all production events: API calls to Gemini Omni Flash, Web Audio triggers, 3D telemetry, and system warnings.
            </p>
          </div>
          <div className="text-[10px] font-mono text-indigo-300/80 pt-2 border-t border-slate-800/80">
            SECURITY & PRODUCTION TELEMETRY
          </div>
        </div>
      </div>
    </div>
  );
};
