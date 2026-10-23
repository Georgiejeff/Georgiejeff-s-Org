import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, ShieldAlert, CheckCircle, AlertTriangle, 
  Info, Bug, Search, Download, Trash2, Copy, Check, 
  RefreshCw, Filter, Eye, ChevronDown, ChevronRight,
  Sparkles, Radio, Cpu, Activity
} from 'lucide-react';
import { AdminLogEntry, LogLevel, LogSubsystem } from '../types/adminLog';
import { adminLogger } from '../utils/adminLogger';

export const AdminLogView: React.FC = () => {
  const [logs, setLogs] = useState<AdminLogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubsystem, setSelectedSubsystem] = useState<string>('ALL');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = adminLogger.subscribe((updatedLogs) => {
      setLogs(updatedLogs);
    });
    return () => unsubscribe();
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (selectedSubsystem !== 'ALL' && log.subsystem !== selectedSubsystem) {
      return false;
    }
    if (selectedLevel !== 'ALL' && log.level !== selectedLevel) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchMsg = log.message.toLowerCase().includes(q);
      const matchSub = log.subsystem.toLowerCase().includes(q);
      const matchDetails = log.details ? JSON.stringify(log.details).toLowerCase().includes(q) : false;
      return matchMsg || matchSub || matchDetails;
    }
    return true;
  });

  const handleCopyLogs = async () => {
    const text = filteredLogs
      .map(
        (l) =>
          `[${l.displayTime}] [${l.level}] [${l.subsystem}] ${l.message} ${
            l.details ? JSON.stringify(l.details) : ''
          }`
      )
      .join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn('Copy failed', e);
    }
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `iron-warrior-admin-log-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleSimulateEvent = () => {
    const events: { level: LogLevel; sub: LogSubsystem; msg: string; details: any }[] = [
      {
        level: 'SUCCESS',
        sub: 'VFX_COMPOSITOR',
        msg: 'Arc Reactor core flare pulse synchronized to 120BPM orchestral baseline',
        details: { coreTemp: '4,200K', lumenOutput: '98,000 lm', anamorphicStreak: true },
      },
      {
        level: 'INFO',
        sub: 'DIRECTOR_CAM',
        msg: 'User adjusted Director Camera pitch to +14.5° and zoom factor to 1.85x',
        details: { yaw: -8.2, pitch: 14.5, zoom: 1.85, mouseDragDelta: [142, -56] },
      },
      {
        level: 'WARN',
        sub: 'INTERACTIONS_API',
        msg: 'Gemini Omni Flash 429 quota reached on Free Tier; local procedural motion synthesizer engaged',
        details: { model: 'gemini-omni-1.1-flash', dailyQuotaRemaining: 0, fallback: 'MediaRecorder 30fps' },
      },
      {
        level: 'AUDIT',
        sub: 'GALLERY_STORE',
        msg: 'Branded promotional still created: Scene 03 (Origin of Power Special Edition)',
        details: { dimensions: '1920x1080', format: 'PNG', filmGrainIntensity: '35%' },
      },
      {
        level: 'INFO',
        sub: 'AUDIO_ENGINE',
        msg: 'Hydraulic mechanical clank trigger fired on Scene 3 timeline marker (12.0s)',
        details: { oscillatorType: 'sawtooth', frequencyCutoff: '850Hz', delayFeedback: '0.22' },
      },
    ];

    const pick = events[Math.floor(Math.random() * events.length)];
    adminLogger.log(pick.level, pick.sub, pick.msg, pick.details);
  };

  const getLevelBadge = (level: LogLevel) => {
    switch (level) {
      case 'SUCCESS':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-600/50 flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-emerald-400" />
            SUCCESS
          </span>
        );
      case 'INFO':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-600/50 flex items-center gap-1">
            <Info className="w-3 h-3 text-cyan-400" />
            INFO
          </span>
        );
      case 'WARN':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-600/50 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            WARN
          </span>
        );
      case 'ERROR':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-950/80 text-red-300 border border-red-600/50 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-red-400" />
            ERROR
          </span>
        );
      case 'AUDIT':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-950/80 text-purple-300 border border-purple-600/50 flex items-center gap-1">
            <Terminal className="w-3 h-3 text-purple-400" />
            AUDIT
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-5 w-full animate-fadeIn font-sans">
      {/* Top Admin Terminal Header */}
      <div className="relative rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-indigo-500/30 p-5 sm:p-6 shadow-2xl backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="p-3 rounded-xl bg-indigo-500/15 border border-indigo-400/40 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.25)] shrink-0">
            <Terminal className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-display font-black text-lg sm:text-xl text-white tracking-wider">
                ADMIN PRODUCTION & AUDIT LOG
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-500/50 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                SYSTEM AUDIT ACTIVE
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {logs.length} EVENTS RECORDED
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Live audit logging of all system events: API requests, VFX shader compilations, 3D Director telemetry, audio synthesizers, and error traces.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleSimulateEvent}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white font-display font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-indigo-950/50 transition-all cursor-pointer active:scale-95"
            title="Inject simulated production telemetry event"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulate Event</span>
          </button>

          <button
            onClick={handleCopyLogs}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
            title="Copy all filtered logs to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Logs'}</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
            title="Export logs as JSON file"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={() => adminLogger.clear()}
            className="px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/50 text-red-300 text-xs font-semibold flex items-center gap-1.5 border border-red-800/60 transition-colors cursor-pointer"
            title="Clear all logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search log messages, telemetry, or subsystem..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-400 rounded-lg pl-9 pr-3 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-400 font-mono text-xs"
          />
        </div>

        {/* Level Filter */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[11px] font-mono">LEVEL:</span>
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-400 cursor-pointer"
          >
            <option value="ALL">ALL LEVELS</option>
            <option value="INFO">INFO ONLY</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="WARN">WARNINGS</option>
            <option value="ERROR">ERRORS</option>
            <option value="AUDIT">AUDIT</option>
          </select>

          {/* Subsystem Dropdown */}
          <span className="text-slate-400 text-[11px] font-mono pl-2">SYSTEM:</span>
          <select
            value={selectedSubsystem}
            onChange={(e) => setSelectedSubsystem(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-400 cursor-pointer"
          >
            <option value="ALL">ALL SUBSYSTEMS</option>
            <option value="INTERACTIONS_API">INTERACTIONS_API</option>
            <option value="DIRECTOR_CAM">DIRECTOR_CAM</option>
            <option value="GALLERY_STORE">GALLERY_STORE</option>
            <option value="AUDIO_ENGINE">AUDIO_ENGINE</option>
            <option value="VFX_COMPOSITOR">VFX_COMPOSITOR</option>
            <option value="STUDIO_INPUT">STUDIO_INPUT</option>
            <option value="SYSTEM_CORE">SYSTEM_CORE</option>
          </select>
        </div>
      </div>

      {/* Subsystem Fast Filter Badges */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        {['ALL', 'INTERACTIONS_API', 'DIRECTOR_CAM', 'GALLERY_STORE', 'AUDIO_ENGINE', 'VFX_COMPOSITOR', 'STUDIO_INPUT'].map((sub) => (
          <button
            key={sub}
            onClick={() => setSelectedSubsystem(sub)}
            className={`px-3 py-1 rounded-lg font-mono text-[11px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
              selectedSubsystem === sub
                ? 'bg-indigo-500/25 text-indigo-300 border border-indigo-400/60 shadow-sm'
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {sub}
          </button>
        ))}
      </div>

      {/* Main Terminal Window */}
      <div
        ref={logContainerRef}
        className="bg-black/90 border border-slate-800 rounded-2xl p-4 font-mono text-xs shadow-2xl flex flex-col gap-1.5 min-h-[460px] max-h-[640px] overflow-y-auto"
      >
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500 gap-3 my-auto">
            <Terminal className="w-10 h-10 text-slate-600" />
            <p className="text-sm">No log events match your filter query.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSubsystem('ALL');
                setSelectedLevel('ALL');
              }}
              className="text-xs text-indigo-400 underline hover:text-indigo-300 cursor-pointer"
            >
              Reset search & filters
            </button>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isExpanded = expandedLogId === log.id;
            return (
              <div
                key={log.id}
                onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                className={`p-2.5 rounded-lg border transition-all cursor-pointer flex flex-col gap-2 ${
                  isExpanded
                    ? 'bg-slate-900/90 border-indigo-500/60 shadow-lg'
                    : 'bg-slate-950/70 hover:bg-slate-900/70 border-slate-900 hover:border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="text-slate-500 text-[10px] select-none font-semibold">
                      {log.displayTime}
                    </span>
                    {getLevelBadge(log.level)}
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                      {log.subsystem}
                    </span>
                  </div>

                  <div className="flex-1 text-slate-200 text-[11px] break-words">
                    {log.message}
                  </div>

                  {log.details && (
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 shrink-0">
                      <span>{isExpanded ? 'Collapse' : 'Details'}</span>
                      {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </div>
                  )}
                </div>

                {/* Expanded Details JSON view */}
                {isExpanded && log.details && (
                  <div className="mt-1 p-3 rounded-lg bg-black/90 border border-slate-800 text-[11px] text-indigo-300 font-mono overflow-x-auto">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                      EVENT TELEMETRY METADATA:
                    </div>
                    <pre className="whitespace-pre-wrap leading-relaxed">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Terminal Footer Telemetry */}
      <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 px-2">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-indigo-400" />
          <span>PRODUCTION LOG SUBSYSTEM // STREAM_CONNECTED</span>
        </div>
        <span>DISPLAYING {filteredLogs.length} OF {logs.length} EVENTS</span>
      </div>
    </div>
  );
};
