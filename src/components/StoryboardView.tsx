import React, { useState } from 'react';
import { 
  Film, Camera, Music, MessageSquare, Sparkles, Volume2, 
  ChevronRight, Layers, ShieldCheck, Zap, Disc3, Bot
} from 'lucide-react';
import { SCENES, CHARACTER_PORTRAITS, SceneDefinition } from '../data/scenes';
import { audioEngine } from '../utils/audioEngine';

interface StoryboardViewProps {
  onSelectSceneForPlayback?: (startTime: number) => void;
}

export const StoryboardView: React.FC<StoryboardViewProps> = ({
  onSelectSceneForPlayback,
}) => {
  const [selectedScene, setSelectedScene] = useState<SceneDefinition>(SCENES[0]);
  const [directorLore, setDirectorLore] = useState<Record<number, string>>({});
  const [isLoadingLore, setIsLoadingLore] = useState<boolean>(false);

  // Play individual SFX on demand
  const handlePlaySound = (type: string) => {
    switch (type) {
      case 'braam':
        audioEngine.playCinematicBraam(1.1);
        break;
      case 'thunder':
        audioEngine.playThunder();
        break;
      case 'nanotech':
        audioEngine.playNanotechActivation();
        break;
      case 'armor':
        audioEngine.playArmorLock();
        break;
      case 'reactor':
        audioEngine.playReactorIgnition();
        break;
      case 'repulsor':
        audioEngine.playRepulsorBlast();
        break;
      case 'transition':
        audioEngine.playMetallicSceneTransition(3);
        break;
      default:
        break;
    }
  };

  // Generate live AI director commentary for the selected scene
  const handleGenerateLore = async (sceneId: number) => {
    setIsLoadingLore(true);
    try {
      const res = await fetch('/api/generate-lore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sceneNumber: sceneId,
          characterState: selectedScene.title + ' - ' + selectedScene.subtitle,
        }),
      });
      const data = await res.json();
      if (data.success && data.text) {
        setDirectorLore((prev) => ({ ...prev, [sceneId]: data.text }));
      }
    } catch (e) {
      console.warn('Lore generation error:', e);
    } finally {
      setIsLoadingLore(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* 4-Scene Storyboard Grid */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-cyan-400" />
            <h3 className="font-display text-lg font-bold text-white tracking-wide">
              Official 30-Second Storyboard & Scene Breakdown
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            4 SCENES • 30 SECONDS TOTAL
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {SCENES.map((scene) => {
            const isSelected = selectedScene.id === scene.id;
            return (
              <div
                key={scene.id}
                onClick={() => setSelectedScene(scene)}
                className={`flex flex-col rounded-2xl overflow-hidden border transition-all cursor-pointer bg-slate-900/80 ${
                  isSelected
                    ? 'border-cyan-400 ring-2 ring-cyan-500/20 shadow-lg shadow-cyan-950/40'
                    : 'border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                {/* Scene Card Header & Image */}
                <div className="relative aspect-[16/10] bg-black overflow-hidden group">
                  <img
                    src={scene.image}
                    alt={scene.title}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60" />

                  {/* Time Badge */}
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/80 border border-cyan-500/40 font-mono text-[11px] text-cyan-300 font-bold">
                    {scene.startTime}s – {scene.endTime}s
                  </div>

                  {/* Scene Number */}
                  <div className="absolute top-2.5 right-2.5 text-xs font-mono font-bold text-slate-400">
                    SCENE {scene.id}
                  </div>

                  {/* Playhead jump trigger */}
                  {onSelectSceneForPlayback && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectSceneForPlayback(scene.startTime);
                      }}
                      className="absolute bottom-2.5 right-2.5 px-2 py-1 rounded bg-cyan-600/80 hover:bg-cyan-500 text-white text-[11px] font-semibold flex items-center gap-1 shadow transition-all cursor-pointer"
                    >
                      <span>Jump to Viewport</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col gap-2.5 flex-1 justify-between">
                  <div>
                    <h4 className="font-display font-bold text-sm text-white">
                      {scene.title}
                    </h4>
                    <p className="text-[11px] text-cyan-400 font-mono mt-0.5">
                      {scene.subtitle}
                    </p>
                    <p className="text-xs text-slate-300 mt-2 line-clamp-3 leading-relaxed">
                      {scene.visual}
                    </p>
                  </div>

                  {scene.dialogue && (
                    <div className="mt-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-300 italic">
                      <span className="font-bold text-cyan-400 not-italic uppercase font-mono mr-1">
                        {scene.dialogue.speaker}:
                      </span>
                      "{scene.dialogue.text}"
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Scene Detailed Director Inspector */}
      <div className="bg-slate-900/90 border border-cyan-900/40 rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 text-xs font-mono font-bold">
                SCENE {selectedScene.id} • {selectedScene.startTime}s to {selectedScene.endTime}s
              </span>
              <h3 className="font-display text-xl font-bold text-white tracking-wide">
                {selectedScene.title}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">{selectedScene.subtitle}</p>
          </div>

          <button
            onClick={() => handleGenerateLore(selectedScene.id)}
            disabled={isLoadingLore}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-800/60 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
          >
            <Bot className="w-4 h-4 text-cyan-400" />
            <span>{isLoadingLore ? 'Consulting Director...' : 'Director VFX Commentary'}</span>
          </button>
        </div>

        {/* Scene Specs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Camera Card */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase">
              <Camera className="w-4 h-4" />
              <span>Camera Direction</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-sans">
              {selectedScene.camera}
            </p>
          </div>

          {/* Sound Card */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase">
              <Music className="w-4 h-4" />
              <span>Sound Design & Audio Score</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-sans">
              {selectedScene.sound}
            </p>
          </div>

          {/* Dialogue Card */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase">
              <MessageSquare className="w-4 h-4" />
              <span>Dialogue / Audio Transmission</span>
            </div>
            {selectedScene.dialogue ? (
              <div className="text-xs">
                <span className="font-bold text-amber-400 font-mono block mb-1">
                  {selectedScene.dialogue.speaker}
                </span>
                <p className="text-slate-100 italic font-sans">
                  "{selectedScene.dialogue.text}"
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No verbal lines in this sequence.</p>
            )}
          </div>
        </div>

        {/* AI Director Notes (Generated or Default) */}
        <div className="bg-cyan-950/20 border border-cyan-800/40 p-4 rounded-xl flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 font-bold">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>DIRECTOR'S VFX CONSTITUTION & SCRIPT NOTES</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            {directorLore[selectedScene.id] || selectedScene.directorNotes}
          </p>
        </div>
      </div>

      {/* Character Evolution Gallery (From Street Masked Vigilante to Armored Hero) */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <h3 className="font-display text-lg font-bold text-white tracking-wide">
              The Evolution: From Mortal to Armored Iron Warrior
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            4 KEY HEROIC PHASES
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CHARACTER_PORTRAITS.map((hero, index) => (
            <div
              key={hero.id}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden p-3 flex flex-col gap-3 group hover:border-cyan-800/60 transition-all"
            >
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-black">
                <img
                  src={hero.image}
                  alt={hero.name}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 font-mono text-[10px] text-cyan-400 border border-cyan-500/30">
                  PHASE 0{index + 1}
                </div>
              </div>

              <div>
                <h4 className="font-display font-bold text-sm text-white">{hero.name}</h4>
                <div className="text-[11px] text-cyan-400 font-mono mt-0.5">{hero.role}</div>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{hero.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Cinematic SFX Soundboard */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-cyan-400" />
            <h3 className="font-display text-base font-bold text-white tracking-wide">
              Cinematic Procedural SFX Soundboard
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            WEB AUDIO API SYNTHESIZER
          </span>
        </div>

        <p className="text-xs text-slate-400">
          Trigger the procedural sound effects generated live in the trailer:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          <button
            onClick={() => handlePlaySound('braam')}
            className="p-3 rounded-xl bg-slate-950 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-600/50 text-left transition-all group cursor-pointer"
          >
            <div className="text-xs font-bold text-white group-hover:text-cyan-300">Cinematic Braam</div>
            <div className="text-[10px] text-slate-400 mt-1">Trailer Subwoofer Boom</div>
          </button>

          <button
            onClick={() => handlePlaySound('thunder')}
            className="p-3 rounded-xl bg-slate-950 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-600/50 text-left transition-all group cursor-pointer"
          >
            <div className="text-xs font-bold text-white group-hover:text-cyan-300">Night Thunder</div>
            <div className="text-[10px] text-slate-400 mt-1">Scene 1 Lightning</div>
          </button>

          <button
            onClick={() => handlePlaySound('nanotech')}
            className="p-3 rounded-xl bg-slate-950 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-600/50 text-left transition-all group cursor-pointer"
          >
            <div className="text-xs font-bold text-white group-hover:text-cyan-300">Nanotech Pulse</div>
            <div className="text-[10px] text-slate-400 mt-1">Holographic Symbols</div>
          </button>

          <button
            onClick={() => handlePlaySound('armor')}
            className="p-3 rounded-xl bg-slate-950 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-600/50 text-left transition-all group cursor-pointer"
          >
            <div className="text-xs font-bold text-white group-hover:text-cyan-300">Armor Hydraulic</div>
            <div className="text-[10px] text-slate-400 mt-1">Plate Locking Clank</div>
          </button>

          <button
            onClick={() => handlePlaySound('reactor')}
            className="p-3 rounded-xl bg-slate-950 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-600/50 text-left transition-all group cursor-pointer"
          >
            <div className="text-xs font-bold text-white group-hover:text-cyan-300">Reactor Ignition</div>
            <div className="text-[10px] text-slate-400 mt-1">Arc Core Whine & Hum</div>
          </button>

          <button
            onClick={() => handlePlaySound('repulsor')}
            className="p-3 rounded-xl bg-slate-950 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-600/50 text-left transition-all group cursor-pointer"
          >
            <div className="text-xs font-bold text-white group-hover:text-cyan-300">Repulsor Blast</div>
            <div className="text-[10px] text-slate-400 mt-1">Supersonic Thrust</div>
          </button>

          <button
            onClick={() => handlePlaySound('transition')}
            className="p-3 rounded-xl bg-slate-950 hover:bg-cyan-950/40 border border-cyan-800/60 hover:border-cyan-400 text-left transition-all group cursor-pointer col-span-2 sm:col-span-3 md:col-span-6 bg-cyan-950/20"
          >
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-cyan-300 group-hover:text-white flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>Metallic Scene Transition (Web Audio API)</span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 px-2 py-0.5 rounded bg-black/60 border border-cyan-800">
                ACTIVE IN PLAYER
              </span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Subtle titanium sheath whoosh, mechanical latch click, and resonant harmonic ring when switching scenes
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
