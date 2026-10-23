import React, { useState } from 'react';
import { 
  Sliders, SlidersHorizontal, Sparkles, Film, 
  Compass, Volume2, Zap, Shield, Save, RefreshCw, 
  ArrowRight, Radio, Eye, Layers, Check, MessageSquare
} from 'lucide-react';
import { SCENES, SceneDefinition } from '../data/scenes';
import { InputConsoleConfig } from '../types/adminLog';
import { adminLogger } from '../utils/adminLogger';

interface InputConsoleViewProps {
  onApplyToViewport?: (config: InputConsoleConfig) => void;
  onSendToVideoStudio?: (sceneId: number, prompt: string) => void;
  onNavigateToPlayer?: () => void;
}

export const InputConsoleView: React.FC<InputConsoleViewProps> = ({
  onApplyToViewport,
  onSendToVideoStudio,
  onNavigateToPlayer,
}) => {
  const [selectedSceneId, setSelectedSceneId] = useState<number>(1);
  const activeScene = SCENES.find((s) => s.id === selectedSceneId) || SCENES[0];

  // Config state
  const [speaker, setSpeaker] = useState<'Warrior' | 'AI Voice' | 'System'>(
    activeScene.dialogue?.speaker || 'Warrior'
  );
  const [dialogueText, setDialogueText] = useState<string>(
    activeScene.dialogue?.text || ''
  );
  const [motionPrompt, setMotionPrompt] = useState<string>(
    activeScene.promptPreset
  );

  // VFX Tuning parameters
  const [lightningFreq, setLightningFreq] = useState<number>(1.0);
  const [nanotechDensity, setNanotechDensity] = useState<number>(65);
  const [reactorIntensity, setReactorIntensity] = useState<number>(100);
  const [repulsorPower, setRepulsorPower] = useState<number>(90);

  // Camera Framing parameters
  const [defaultYaw, setDefaultYaw] = useState<number>(0);
  const [defaultPitch, setDefaultPitch] = useState<number>(0);
  const [defaultZoom, setDefaultZoom] = useState<number>(1.0);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '2.39:1'>('16:9');
  const [grainPreset, setGrainPreset] = useState<'clean' | 'subtle' | 'gritty'>('subtle');

  // Audio parameters
  const [bassBoost, setBassBoost] = useState<boolean>(true);
  const [masterVolume, setMasterVolume] = useState<number>(85);

  const [appliedNotice, setAppliedNotice] = useState<boolean>(false);

  const handleSelectScene = (id: number) => {
    setSelectedSceneId(id);
    const scene = SCENES.find((s) => s.id === id);
    if (scene) {
      setSpeaker(scene.dialogue?.speaker || 'Warrior');
      setDialogueText(scene.dialogue?.text || '');
      setMotionPrompt(scene.promptPreset);
    }
  };

  const handleApplyConfig = () => {
    const config: InputConsoleConfig = {
      activeSceneId: selectedSceneId,
      dialogueSpeaker: speaker,
      dialogueText,
      vfxLightningFrequency: lightningFreq,
      vfxNanotechDensity: nanotechDensity,
      vfxReactorIntensity: reactorIntensity,
      vfxRepulsorBurstSize: repulsorPower,
      defaultYaw,
      defaultPitch,
      defaultZoom,
      filmGrainPreset: grainPreset,
      audioBassBoost: bassBoost,
      masterVolume,
      aspectRatio,
    };

    adminLogger.log('SUCCESS', 'STUDIO_INPUT', `Applied director inputs for Scene 0${selectedSceneId}`, {
      scene: activeScene.title,
      speaker,
      dialogue: dialogueText,
      camera: { yaw: defaultYaw, pitch: defaultPitch, zoom: defaultZoom },
      vfx: { lightningFreq, nanotechDensity, reactorIntensity, repulsorPower },
    });

    if (onApplyToViewport) {
      onApplyToViewport(config);
    }

    setAppliedNotice(true);
    setTimeout(() => setAppliedNotice(false), 2500);
  };

  const handleResetCanon = () => {
    const scene = SCENES.find((s) => s.id === selectedSceneId) || SCENES[0];
    setSpeaker(scene.dialogue?.speaker || 'Warrior');
    setDialogueText(scene.dialogue?.text || '');
    setMotionPrompt(scene.promptPreset);
    setLightningFreq(1.0);
    setNanotechDensity(65);
    setReactorIntensity(100);
    setRepulsorPower(90);
    setDefaultYaw(0);
    setDefaultPitch(0);
    setDefaultZoom(1.0);
    setGrainPreset('subtle');
    setBassBoost(true);
    setMasterVolume(85);

    adminLogger.log('INFO', 'STUDIO_INPUT', `Reset Scene 0${selectedSceneId} to canon movie script defaults.`);
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fadeIn font-sans">
      {/* Top Input Console Header */}
      <div className="relative rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-cyan-500/30 p-5 sm:p-6 shadow-2xl backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="p-3 rounded-xl bg-cyan-500/15 border border-cyan-400/40 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)] shrink-0">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-display font-black text-lg sm:text-xl text-white tracking-wider">
                DIRECTOR'S INPUT CONSOLE & VFX TUNING
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/50">
                SCENE {selectedSceneId} // {activeScene.title}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Customize scene dialogue, Marvel VFX shader intensities, starting camera perspective, and audio mastering parameters.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleApplyConfig}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-display font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-cyan-950/50 transition-all cursor-pointer active:scale-95"
          >
            {appliedNotice ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
            <span>{appliedNotice ? 'Config Applied!' : 'Apply to Viewport'}</span>
          </button>

          {onNavigateToPlayer && (
            <button
              onClick={onNavigateToPlayer}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>Preview in Cinema</span>
            </button>
          )}

          <button
            onClick={handleResetCanon}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
            title="Reset to original script defaults"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Canon</span>
          </button>
        </div>
      </div>

      {/* Scene Selector Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {SCENES.map((scene) => (
          <button
            key={scene.id}
            onClick={() => handleSelectScene(scene.id)}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
              selectedSceneId === scene.id
                ? 'bg-cyan-950/60 border-cyan-400 ring-1 ring-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="font-bold text-cyan-400 px-1.5 py-0.5 rounded bg-black/60 border border-cyan-900/60">
                SCENE 0{scene.id}
              </span>
              <span className="text-slate-500">{scene.startTime}s–{scene.endTime}s</span>
            </div>
            <div className="font-display font-bold text-xs text-white truncate">{scene.title}</div>
            <div className="text-[11px] text-slate-400 truncate">{scene.vfxTheme.toUpperCase()}_VFX</div>
          </button>
        ))}
      </div>

      {/* Input Workstation: 3 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Script & Dialogue Input (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <MessageSquare className="w-4 h-4 text-cyan-400" />
            <span className="font-display font-bold text-sm text-white">
              Dialogue & Motion Script
            </span>
          </div>

          {/* Speaker Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300">Dialogue Speaker</label>
            <div className="grid grid-cols-3 gap-2">
              {(['Warrior', 'AI Voice', 'System'] as const).map((spk) => (
                <button
                  key={spk}
                  onClick={() => setSpeaker(spk)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
                    speaker === spk
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {spk}
                </button>
              ))}
            </div>
          </div>

          {/* Dialogue Text Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300">Spoken Line</label>
            <textarea
              value={dialogueText}
              onChange={(e) => setDialogueText(e.target.value)}
              rows={2}
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 resize-none font-sans"
              placeholder="Enter spoken subtitle line..."
            />
          </div>

          {/* Motion Prompt Override */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-300">Cinematic Motion Direction</label>
              <span className="text-[10px] text-slate-500 font-mono">{motionPrompt.length} chars</span>
            </div>
            <textarea
              value={motionPrompt}
              onChange={(e) => setMotionPrompt(e.target.value)}
              rows={4}
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 resize-y leading-relaxed font-sans"
              placeholder="Describe camera movement, lighting, armor assembly, lightning and plasma energy..."
            />
          </div>

          {onSendToVideoStudio && (
            <button
              onClick={() => onSendToVideoStudio(selectedSceneId, motionPrompt)}
              className="mt-auto py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-700/50 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Load Into Video Studio</span>
            </button>
          )}
        </div>

        {/* Center Column: Marvel VFX Shader Sliders (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="font-display font-bold text-sm text-white">
              VFX Shader Parameters
            </span>
          </div>

          {/* Lightning Intensity */}
          <div className="flex flex-col gap-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-300">Lightning Flash Frequency</span>
              <span className="font-mono text-cyan-400 font-bold">{lightningFreq.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min={0.2}
              max={2.5}
              step={0.1}
              value={lightningFreq}
              onChange={(e) => setLightningFreq(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0.2x Distant</span>
              <span>1.0x Normal</span>
              <span>2.5x Violent</span>
            </div>
          </div>

          {/* Nanotech Rune Density */}
          <div className="flex flex-col gap-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-300">Nanotech Circuit Rune Density</span>
              <span className="font-mono text-cyan-400 font-bold">{nanotechDensity}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              step={5}
              value={nanotechDensity}
              onChange={(e) => setNanotechDensity(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>10% Dormant</span>
              <span>50% Active</span>
              <span>100% Full Surge</span>
            </div>
          </div>

          {/* Arc Reactor Core Overdrive */}
          <div className="flex flex-col gap-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-300">Arc Reactor Luminance Overdrive</span>
              <span className="font-mono text-cyan-400 font-bold">{reactorIntensity}%</span>
            </div>
            <input
              type="range"
              min={50}
              max={200}
              step={10}
              value={reactorIntensity}
              onChange={(e) => setReactorIntensity(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>50% Low Glow</span>
              <span>100% Nominal</span>
              <span>200% Supercharged</span>
            </div>
          </div>

          {/* Repulsor Thruster Power */}
          <div className="flex flex-col gap-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-300">Repulsor Blast Flare Magnitude</span>
              <span className="font-mono text-cyan-400 font-bold">{repulsorPower}%</span>
            </div>
            <input
              type="range"
              min={20}
              max={150}
              step={5}
              value={repulsorPower}
              onChange={(e) => setRepulsorPower(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>20% Sub-idle</span>
              <span>90% Standard</span>
              <span>150% Hypersonic</span>
            </div>
          </div>
        </div>

        {/* Right Column: Camera Framing & Audio Mix (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Compass className="w-4 h-4 text-amber-400" />
            <span className="font-display font-bold text-sm text-white">
              Camera & Audio Master
            </span>
          </div>

          {/* Camera Starting Perspective */}
          <div className="flex flex-col gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Default Staging Camera</span>
              <span className="font-mono text-amber-400 text-[11px]">
                Y:{defaultYaw}° P:{defaultPitch}°
              </span>
            </div>

            <div className="flex flex-col gap-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400 w-16">Yaw (Y):</span>
                <input
                  type="range"
                  min={-35}
                  max={35}
                  step={1}
                  value={defaultYaw}
                  onChange={(e) => setDefaultYaw(parseInt(e.target.value))}
                  className="flex-1 h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-amber-400"
                />
                <span className="font-mono text-[11px] text-slate-300 w-10 text-right">{defaultYaw}°</span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400 w-16">Pitch (X):</span>
                <input
                  type="range"
                  min={-20}
                  max={20}
                  step={1}
                  value={defaultPitch}
                  onChange={(e) => setDefaultPitch(parseInt(e.target.value))}
                  className="flex-1 h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-amber-400"
                />
                <span className="font-mono text-[11px] text-slate-300 w-10 text-right">{defaultPitch}°</span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400 w-16">Zoom:</span>
                <input
                  type="range"
                  min={0.8}
                  max={2.0}
                  step={0.05}
                  value={defaultZoom}
                  onChange={(e) => setDefaultZoom(parseFloat(e.target.value))}
                  className="flex-1 h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-amber-400"
                />
                <span className="font-mono text-[11px] text-slate-300 w-10 text-right">{defaultZoom.toFixed(2)}x</span>
              </div>
            </div>
          </div>

          {/* Aspect Ratio & Film Grain */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-300">Format & Film Grain</label>
            <div className="grid grid-cols-3 gap-2">
              {(['16:9', '9:16', '2.39:1'] as const).map((ar) => (
                <button
                  key={ar}
                  onClick={() => setAspectRatio(ar)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
                    aspectRatio === ar
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {ar}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              {(['clean', 'subtle', 'gritty'] as const).map((gr) => (
                <button
                  key={gr}
                  onClick={() => setGrainPreset(gr)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all border capitalize cursor-pointer ${
                    grainPreset === gr
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {gr} Grain
                </button>
              ))}
            </div>
          </div>

          {/* Web Audio Mix Controls */}
          <div className="flex flex-col gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800 mt-auto">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-300 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Web Audio Master Level</span>
              </span>
              <span className="font-mono text-cyan-400 font-bold">{masterVolume}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={masterVolume}
              onChange={(e) => setMasterVolume(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400">Sub-bass Synthesizer:</span>
              <button
                onClick={() => setBassBoost(!bassBoost)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer transition-colors ${
                  bassBoost ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-800 text-slate-500'
                }`}
              >
                {bassBoost ? 'BOOST ACTIVE' : 'OFF'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
