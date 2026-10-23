export type LogLevel = 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR' | 'AUDIT';

export type LogSubsystem = 
  | 'INTERACTIONS_API' 
  | 'DIRECTOR_CAM' 
  | 'GALLERY_STORE' 
  | 'AUDIO_ENGINE' 
  | 'VFX_COMPOSITOR' 
  | 'STUDIO_INPUT' 
  | 'SYSTEM_CORE';

export interface AdminLogEntry {
  id: string;
  timestamp: string; // ISO format
  displayTime: string; // HH:mm:ss.SSS
  level: LogLevel;
  subsystem: LogSubsystem;
  message: string;
  details?: Record<string, any>;
}

export interface InputConsoleConfig {
  activeSceneId: number;
  dialogueSpeaker: 'Warrior' | 'AI Voice' | 'System';
  dialogueText: string;
  vfxLightningFrequency: number; // 0.1 to 2.0
  vfxNanotechDensity: number;     // 10 to 100
  vfxReactorIntensity: number;    // 50 to 200
  vfxRepulsorBurstSize: number;   // 20 to 150
  defaultYaw: number;
  defaultPitch: number;
  defaultZoom: number;
  filmGrainPreset: 'clean' | 'subtle' | 'gritty';
  audioBassBoost: boolean;
  masterVolume: number;
  aspectRatio: '16:9' | '9:16' | '2.39:1';
}
