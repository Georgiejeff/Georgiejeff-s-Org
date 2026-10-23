import { AdminLogEntry, LogLevel, LogSubsystem } from '../types/adminLog';

const STORAGE_KEY = 'iron_warrior_admin_logs';
const MAX_LOGS = 200;

type LogListener = (logs: AdminLogEntry[]) => void;

class AdminLoggerService {
  private logs: AdminLogEntry[] = [];
  private listeners: Set<LogListener> = new Set();

  constructor() {
    this.loadLogs();
    if (this.logs.length === 0) {
      this.seedInitialLogs();
    }
  }

  private loadLogs() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          this.logs = parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load admin logs:', e);
    }
  }

  private persistLogs() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.logs));
    } catch (e) {
      console.warn('Failed to save admin logs:', e);
    }
  }

  private seedInitialLogs() {
    const now = new Date();
    const createTime = (offsetMs: number) => {
      const d = new Date(now.getTime() - offsetMs);
      return {
        iso: d.toISOString(),
        display: d.toTimeString().split(' ')[0] + '.' + String(d.getMilliseconds()).padStart(3, '0'),
      };
    };

    const seeds: Omit<AdminLogEntry, 'id'>[] = [
      {
        ...(() => {
          const t = createTime(45000);
          return { timestamp: t.iso, displayTime: t.display };
        })(),
        level: 'INFO',
        subsystem: 'SYSTEM_CORE',
        message: 'Iron Warrior Production Subsystem online [Kernel v4.2.1-marvel-vfx]',
        details: { environment: 'Google AI Studio Client', resolution: '4K UHD' },
      },
      {
        ...(() => {
          const t = createTime(38000);
          return { timestamp: t.iso, displayTime: t.display };
        })(),
        level: 'SUCCESS',
        subsystem: 'AUDIO_ENGINE',
        message: 'Web Audio API context initialized (SampleRate: 44.1kHz, Multi-Oscillator Synths active)',
        details: { channels: 2, subBassNode: 'Active', latency: '3.8ms' },
      },
      {
        ...(() => {
          const t = createTime(30000);
          return { timestamp: t.iso, displayTime: t.display };
        })(),
        level: 'INFO',
        subsystem: 'INTERACTIONS_API',
        message: 'Interactions API endpoint registered for gemini-omni-1.1-flash',
        details: { endpoint: '/api/generate-video', paidTierRequired: true },
      },
      {
        ...(() => {
          const t = createTime(22000);
          return { timestamp: t.iso, displayTime: t.display };
        })(),
        level: 'SUCCESS',
        subsystem: 'VFX_COMPOSITOR',
        message: 'Procedural VFX shaders loaded: Lightning, Nanotech Rune Ring, Arc Reactor Core, Repulsor',
        details: { pipeline: 'HTML5 2D Canvas 60FPS', aspectRatios: ['16:9', '9:16'] },
      },
      {
        ...(() => {
          const t = createTime(14000);
          return { timestamp: t.iso, displayTime: t.display };
        })(),
        level: 'AUDIT',
        subsystem: 'GALLERY_STORE',
        message: 'Stills Gallery storage verified. Default Marvel promotional stills mounted.',
        details: { defaultStillsCount: 5, storageEngine: 'LocalStorage' },
      },
      {
        ...(() => {
          const t = createTime(5000);
          return { timestamp: t.iso, displayTime: t.display };
        })(),
        level: 'INFO',
        subsystem: 'DIRECTOR_CAM',
        message: 'Director Camera interactive 3D rotation and zoom listeners registered.',
        details: { defaultYaw: 0, defaultPitch: 0, defaultZoom: 1.0 },
      },
    ];

    this.logs = seeds.map((s, idx) => ({
      id: `boot-log-${Date.now()}-${idx}`,
      ...s,
    }));
    this.persistLogs();
  }

  public getLogs(): AdminLogEntry[] {
    return [...this.logs];
  }

  public log(
    level: LogLevel,
    subsystem: LogSubsystem,
    message: string,
    details?: Record<string, any>
  ): AdminLogEntry {
    const now = new Date();
    const displayTime =
      now.toTimeString().split(' ')[0] +
      '.' +
      String(now.getMilliseconds()).padStart(3, '0');

    const entry: AdminLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: now.toISOString(),
      displayTime,
      level,
      subsystem,
      message,
      details,
    };

    this.logs.unshift(entry);
    if (this.logs.length > MAX_LOGS) {
      this.logs.pop();
    }

    this.persistLogs();
    this.notify();
    return entry;
  }

  public clear() {
    this.logs = [];
    this.persistLogs();
    this.notify();
  }

  public resetToDefault() {
    this.seedInitialLogs();
    this.notify();
  }

  public subscribe(listener: LogListener): () => void {
    this.listeners.add(listener);
    listener(this.getLogs());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const current = this.getLogs();
    this.listeners.forEach((l) => l(current));
  }
}

export const adminLogger = new AdminLoggerService();
