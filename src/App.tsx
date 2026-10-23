import React, { useState, useEffect } from 'react';
import { 
  Film, Video, Sparkles, BookOpen, Shield, Play, 
  RotateCcw, Sliders, Volume2, Cpu, Zap, Star, Images, 
  Camera, Terminal, LayoutDashboard, SlidersHorizontal
} from 'lucide-react';
import { CinematicPlayer } from './components/CinematicPlayer';
import { OmniVideoStudio } from './components/OmniVideoStudio';
import { StoryboardView } from './components/StoryboardView';
import { GalleryView } from './components/GalleryView';
import { ProductionDashboard } from './components/ProductionDashboard';
import { InputConsoleView } from './components/InputConsoleView';
import { AdminLogView } from './components/AdminLogView';
import { DEFAULT_GALLERY_STILLS } from './data/defaultGallery';
import { GalleryStill } from './types/gallery';
import { InputConsoleConfig } from './types/adminLog';

import { adminLogger } from './utils/adminLogger';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'player' | 'omni-studio' | 'gallery' | 'input-console' | 'admin-log' | 'storyboard'
  >('dashboard');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [customGeneratedVideo, setCustomGeneratedVideo] = useState<string | null>(null);

  // Gallery Stills state with localStorage persistence
  const [savedStills, setSavedStills] = useState<GalleryStill[]>(() => {
    try {
      const stored = localStorage.getItem('iron_warrior_gallery_stills');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load gallery from storage:', e);
    }
    return DEFAULT_GALLERY_STILLS;
  });

  // Persist gallery to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('iron_warrior_gallery_stills', JSON.stringify(savedStills));
    } catch (e) {
      console.warn('Failed to persist gallery to storage:', e);
    }
  }, [savedStills]);

  const handleSaveStill = (newStill: GalleryStill) => {
    setSavedStills((prev) => [newStill, ...prev]);
    adminLogger.log('SUCCESS', 'GALLERY_STORE', `New still saved to gallery: Scene 0${newStill.sceneId} (${newStill.style.toUpperCase()})`, {
      id: newStill.id,
      scene: newStill.sceneTitle,
      grain: newStill.grain,
      aspectRatio: newStill.aspectRatio,
      telemetry: newStill.telemetry,
    });
  };

  const handleDeleteStill = (id: string) => {
    setSavedStills((prev) => prev.filter((s) => s.id !== id));
    adminLogger.log('INFO', 'GALLERY_STORE', `Still removed from gallery`, { id });
  };

  const handleClearGallery = () => {
    setSavedStills([]);
    adminLogger.log('AUDIT', 'GALLERY_STORE', `User cleared all gallery stills`);
  };

  const handleResetDefaults = () => {
    setSavedStills(DEFAULT_GALLERY_STILLS);
    adminLogger.log('INFO', 'GALLERY_STORE', `Restored default Marvel promotional stills`);
  };

  const handleVideoGenerated = (videoUrl: string) => {
    setCustomGeneratedVideo(videoUrl);
    // Switch to player to view the video
    setActiveTab('player');
  };

  const handleApplyInputConfig = (config: InputConsoleConfig) => {
    if (config.aspectRatio === '16:9' || config.aspectRatio === '9:16') {
      setAspectRatio(config.aspectRatio);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      {/* Top Sci-Fi Header */}
      <header className="sticky top-0 z-50 bg-[#030712]/90 backdrop-blur-md border-b border-cyan-950/60 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div 
              onClick={() => setActiveTab('dashboard')}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center shadow-lg shadow-cyan-900/40 border border-cyan-400/40 cursor-pointer transition-transform hover:scale-105"
            >
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 
                  onClick={() => setActiveTab('dashboard')}
                  className="font-display font-black text-lg sm:text-xl text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-400 tracking-wider cursor-pointer"
                >
                  RISE OF THE IRON WARRIOR
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                  MARVEL VFX
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans">
                Genre: Sci-Fi • Superhero • Action | Duration: 30 Seconds | 4K Photorealistic
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs overflow-x-auto max-w-full scrollbar-none">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-cyan-300" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('player')}
              className={`px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'player'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Film className="w-4 h-4" />
              <span>Cinema Viewport</span>
            </button>

            <button
              onClick={() => setActiveTab('input-console')}
              className={`px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'input-console'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4 text-cyan-300" />
              <span>Input Layout</span>
            </button>

            <button
              onClick={() => setActiveTab('gallery')}
              className={`px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'gallery'
                  ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-black font-bold shadow-md shadow-amber-950'
                  : 'text-amber-400/80 hover:text-amber-300'
              }`}
            >
              <Images className="w-4 h-4" />
              <span>Stills Gallery</span>
              <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider ${
                activeTab === 'gallery' ? 'bg-black text-amber-300' : 'bg-amber-950 text-amber-300 border border-amber-600/50'
              }`}>
                {savedStills.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('omni-studio')}
              className={`px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'omni-studio'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Video className="w-4 h-4 text-cyan-300" />
              <span>Image to Video</span>
              <span className="text-[9px] bg-cyan-400 text-black px-1.5 py-0.2 rounded font-bold uppercase tracking-wider">
                Omni Flash
              </span>
            </button>

            <button
              onClick={() => setActiveTab('admin-log')}
              className={`px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'admin-log'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-950'
                  : 'text-indigo-400/80 hover:text-indigo-300'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>Admin Log</span>
            </button>

            <button
              onClick={() => setActiveTab('storyboard')}
              className={`px-3 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'storyboard'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Storyboard</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 flex flex-col gap-6">
        {/* Banner with Movie Tagline */}
        <div className="relative rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-blue-950/40 border border-cyan-900/30 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-cyan-500/10 to-transparent pointer-events-none" />
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-mono text-cyan-400 tracking-widest uppercase font-bold">
                PREMIERE SAGA • YSL: IRON WARRIOR — ORIGIN OF POWER
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white mt-0.5">
                "They thought I was just a man... I'm not the man I was anymore."
              </h2>
            </div>
          </div>

          {customGeneratedVideo && activeTab === 'player' && (
            <button
              onClick={() => setCustomGeneratedVideo(null)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 transition-colors self-start sm:self-auto cursor-pointer"
            >
              Switch Back to Procedural VFX Viewport
            </button>
          )}
        </div>

        {/* Tab 0: Production Mission Control Dashboard */}
        {activeTab === 'dashboard' && (
          <ProductionDashboard
            savedStills={savedStills}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {/* Tab 1: Cinematic 30s Cinema Viewport */}
        {activeTab === 'player' && (
          <div className="flex flex-col gap-6">
            <CinematicPlayer
              aspectRatio={aspectRatio}
              onAspectChange={setAspectRatio}
              customVideoUrl={customGeneratedVideo}
              onStillCaptured={handleSaveStill}
              onNavigateToGallery={() => setActiveTab('gallery')}
            />

            {/* Quick summary cards for the 4 scenes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs text-cyan-400 font-mono font-bold">
                  <span>SCENE 1 (0–6s)</span>
                  <span>THE ARRIVAL</span>
                </div>
                <p className="text-xs text-slate-300">
                  Dark city night, glossy blue vest reflecting lightning flashes, rolling smoke.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs text-cyan-400 font-mono font-bold">
                  <span>SCENE 2 (6–12s)</span>
                  <span>THE TRANSMISSION</span>
                </div>
                <p className="text-xs text-slate-300">
                  Blue holographic symbols around arms, nanotech activates and spreads across body.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs text-cyan-400 font-mono font-bold">
                  <span>SCENE 3 (12–22s)</span>
                  <span>THE TRANSFORMATION</span>
                </div>
                <p className="text-xs text-slate-300">
                  Armor plates assemble in layers, arc reactor ignites on chest, helmet seals shut.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs text-cyan-400 font-mono font-bold">
                  <span>SCENE 4 (22–30s)</span>
                  <span>THE IRON WARRIOR RISES</span>
                </div>
                <p className="text-xs text-slate-300">
                  Rooftop repulsor blast, supersonic launch into sky, title card horizon fly-off.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Director's Input Console & VFX Tuning Layout */}
        {activeTab === 'input-console' && (
          <InputConsoleView
            onApplyToViewport={handleApplyInputConfig}
            onSendToVideoStudio={() => setActiveTab('omni-studio')}
            onNavigateToPlayer={() => setActiveTab('player')}
          />
        )}

        {/* Tab 3: Director's Stills Gallery */}
        {activeTab === 'gallery' && (
          <GalleryView
            stills={savedStills}
            onDeleteStill={handleDeleteStill}
            onClearGallery={handleClearGallery}
            onResetDefaults={handleResetDefaults}
            onOpenDirectorsMode={() => setActiveTab('player')}
          />
        )}

        {/* Tab 4: Animate Photos into Video (Omni Flash Interactions API) */}
        {activeTab === 'omni-studio' && (
          <OmniVideoStudio
            onVideoGenerated={handleVideoGenerated}
            currentAspectRatio={aspectRatio}
          />
        )}

        {/* Tab 5: Admin Production & System Audit Log */}
        {activeTab === 'admin-log' && (
          <AdminLogView />
        )}

        {/* Tab 6: Storyboard & Character Lore */}
        {activeTab === 'storyboard' && (
          <StoryboardView
            onSelectSceneForPlayback={() => {
              setActiveTab('player');
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#02050c] px-4 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-slate-400">YSL: IRON WARRIOR</span>
            <span>• ORIGIN OF POWER</span>
          </div>
          <div>
            Powered by Google AI Studio • Gemini Omni Flash (Interactions API) & Web Audio API
          </div>
        </div>
      </footer>
    </div>
  );
}
