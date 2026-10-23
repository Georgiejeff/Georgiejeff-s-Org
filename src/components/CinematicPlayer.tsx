import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, 
  Sparkles, Shield, Zap, Flame, Radio, Film, Compass, 
  Crosshair, Move, ZoomIn, ZoomOut, RotateCw, Camera,
  Download, SlidersHorizontal, Share2, Check, X, Images
} from 'lucide-react';
import { SCENES, SceneDefinition } from '../data/scenes';
import { audioEngine } from '../utils/audioEngine';
import { GalleryStill } from '../types/gallery';

interface CinematicPlayerProps {
  aspectRatio: '16:9' | '9:16';
  onAspectChange: (ratio: '16:9' | '9:16') => void;
  customVideoUrl?: string | null;
  onStillCaptured?: (still: GalleryStill) => void;
  onNavigateToGallery?: () => void;
}

export const CinematicPlayer: React.FC<CinematicPlayerProps> = ({
  aspectRatio,
  onAspectChange,
  customVideoUrl,
  onStillCaptured,
  onNavigateToGallery,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [activeScene, setActiveScene] = useState<SceneDefinition>(SCENES[0]);
  const [subtitlesVisible, setSubtitlesVisible] = useState(true);
  const [hudOverlay, setHudOverlay] = useState(true);
  const [playedTriggers, setPlayedTriggers] = useState<Set<string>>(new Set());
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  // Director's Mode interactive camera state
  const [isDirectorsMode, setIsDirectorsMode] = useState<boolean>(false);
  const [directorRotation, setDirectorRotation] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [directorZoom, setDirectorZoom] = useState<number>(1.0);
  const [directorPan, setDirectorPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Capture Moment states (High-res snapshot with film-grain filter)
  const [showCaptureModal, setShowCaptureModal] = useState<boolean>(false);
  const [capturedPosterUrl, setCapturedPosterUrl] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [filmGrainAmount, setFilmGrainAmount] = useState<number>(0.35);
  const [promoStyle, setPromoStyle] = useState<'marvel' | 'clean'>('marvel');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const previousSceneIdRef = useRef<number>(1);

  // Drag interaction tracking refs
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const initialRotRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const initialPanRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const initialZoomRef = useRef<number>(1.0);
  const dragModeRef = useRef<'rotate' | 'pan' | 'zoom'>('rotate');

  // Determine which scene is active based on currentTime and trigger metallic transition SFX
  useEffect(() => {
    const scene = SCENES.find(
      (s) => currentTime >= s.startTime && (currentTime < s.endTime || s.id === 4)
    ) || SCENES[0];

    // Trigger subtle metallic transition sound effect when switching scenes
    if (scene.id !== previousSceneIdRef.current) {
      audioEngine.playMetallicSceneTransition(scene.id);
      previousSceneIdRef.current = scene.id;
      setIsTransitioning(true);
      setTimeout(() => setIsTransitioning(false), 300);
    }

    setActiveScene(scene);
  }, [currentTime]);

  // Handle synchronized sound triggers
  useEffect(() => {
    if (!isPlaying) return;

    // Trigger Braam & Thunder at Scene 1 start (0.2s)
    if (currentTime >= 0.2 && currentTime < 0.6 && !playedTriggers.has('scene1_start')) {
      audioEngine.playCinematicBraam(0.9);
      setTimeout(() => audioEngine.playThunder(), 700);
      setTimeout(() => audioEngine.speakDialogue("They thought I was just a man...", 'warrior'), 1800);
      setPlayedTriggers((prev) => new Set(prev).add('scene1_start'));
    }

    // Trigger Nanotech telemetry & AI voice at Scene 2 start (6.0s)
    if (currentTime >= 6.0 && currentTime < 6.5 && !playedTriggers.has('scene2_start')) {
      audioEngine.playNanotechActivation();
      setTimeout(() => audioEngine.speakDialogue("ARMOR SYSTEM ACTIVATED. WARRIOR PROTOCOL ONLINE.", 'ai'), 1200);
      setPlayedTriggers((prev) => new Set(prev).add('scene2_start'));
    }

    // Trigger Armor Locking clanks & Reactor ignition at Scene 3 (12.0s)
    if (currentTime >= 12.0 && currentTime < 12.5 && !playedTriggers.has('scene3_start')) {
      audioEngine.playArmorLock();
      setTimeout(() => audioEngine.playArmorLock(), 800);
      setTimeout(() => audioEngine.playReactorIgnition(), 1600);
      setTimeout(() => audioEngine.playCinematicBraam(1.2), 3200);
      setTimeout(() => audioEngine.speakDialogue("POWER CORE ONLINE. ALL SYSTEMS OPERATIONAL.", 'ai'), 4500);
      setPlayedTriggers((prev) => new Set(prev).add('scene3_start'));
    }

    // Trigger Repulsor blast & Flight launch at Scene 4 (22.0s)
    if (currentTime >= 22.0 && currentTime < 22.5 && !playedTriggers.has('scene4_start')) {
      audioEngine.speakDialogue("I'm not the man I was anymore.", 'warrior');
      setTimeout(() => audioEngine.playRepulsorBlast(), 1500);
      setTimeout(() => audioEngine.playCinematicBraam(1.3), 3000);
      setPlayedTriggers((prev) => new Set(prev).add('scene4_start'));
    }
  }, [currentTime, isPlaying, playedTriggers]);

  // Master timeline timer loop (0 to 30 seconds)
  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      lastTimeRef.current = null;
      return;
    }

    const updatePlayhead = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const deltaSeconds = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      setCurrentTime((prev) => {
        const next = prev + deltaSeconds;
        if (next >= 30) {
          setIsPlaying(false);
          return 30;
        }
        return next;
      });

      animationFrameRef.current = requestAnimationFrame(updatePlayhead);
    };

    animationFrameRef.current = requestAnimationFrame(updatePlayhead);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying]);

  const togglePlay = () => {
    if (currentTime >= 30) {
      handleRestart();
      return;
    }
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    setCurrentTime(0);
    setPlayedTriggers(new Set());
    setIsPlaying(true);
  };

  const handleSeek = (newTime: number) => {
    setCurrentTime(newTime);
    const targetScene = SCENES.find(
      (s) => newTime >= s.startTime && (newTime < s.endTime || s.id === 4)
    ) || SCENES[0];

    if (targetScene.id !== previousSceneIdRef.current) {
      audioEngine.playMetallicSceneTransition(targetScene.id);
      previousSceneIdRef.current = targetScene.id;
      setIsTransitioning(true);
      setTimeout(() => setIsTransitioning(false), 300);
    }

    // Allow re-triggering audio cues around this timestamp
    const filteredTriggers = new Set<string>();
    if (newTime > 1) filteredTriggers.add('scene1_start');
    if (newTime > 7) filteredTriggers.add('scene2_start');
    if (newTime > 13) filteredTriggers.add('scene3_start');
    if (newTime > 23) filteredTriggers.add('scene4_start');
    setPlayedTriggers(filteredTriggers);
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    audioEngine.setMuted(next);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => console.log(err));
    } else {
      document.exitFullscreen().catch((err) => console.log(err));
    }
  };

  // Format seconds to MM:SS.SS
  const formatTime = (seconds: number) => {
    const s = Math.floor(seconds);
    const ms = Math.floor((seconds % 1) * 100);
    return `00:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  // Compute camera animation transform based on active scene & relative scene progress
  const sceneProgress = Math.max(
    0,
    Math.min(1, (currentTime - activeScene.startTime) / (activeScene.endTime - activeScene.startTime))
  );

  let cameraTransform = 'scale(1)';
  if (activeScene.id === 1) {
    // Slow cinematic push-in toward skull mask
    const zoom = 1 + sceneProgress * 0.22;
    const yShift = -sceneProgress * 4;
    cameraTransform = `scale(${zoom}) translateY(${yShift}%)`;
  } else if (activeScene.id === 2) {
    // Fast dynamic orbit with slight rotation
    const zoom = 1.1 + Math.sin(sceneProgress * Math.PI) * 0.15;
    const rot = Math.sin(sceneProgress * 8) * 1.5;
    cameraTransform = `scale(${zoom}) rotate(${rot}deg)`;
  } else if (activeScene.id === 3) {
    // 360-degree heroic transformation orbit
    const rot = (sceneProgress * 12) - 6;
    const zoom = 1.15 + Math.sin(sceneProgress * Math.PI * 2) * 0.1;
    cameraTransform = `scale(${zoom}) rotate(${rot}deg)`;
  } else if (activeScene.id === 4) {
    // Upward launch tilt & pull-back
    const zoom = 1.1 + sceneProgress * 0.3;
    const yShift = -sceneProgress * 18;
    cameraTransform = `scale(${zoom}) translateY(${yShift}%)`;
  }

  // Reset Director's interactive camera angles and zoom
  const resetDirectorCamera = () => {
    setDirectorRotation({ x: 0, y: 0 });
    setDirectorZoom(1.0);
    setDirectorPan({ x: 0, y: 0 });
  };

  // Mouse drag handlers on the video container
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDirectorsMode) return;

    if (e.button === 2 || e.shiftKey) {
      dragModeRef.current = 'pan';
    } else if (e.button === 1 || e.altKey) {
      dragModeRef.current = 'zoom';
    } else {
      dragModeRef.current = 'rotate';
    }

    dragStartRef.current = { x: e.clientX, y: e.clientY };
    initialRotRef.current = { ...directorRotation };
    initialPanRef.current = { ...directorPan };
    initialZoomRef.current = directorZoom;
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDirectorsMode || !isDragging) return;

    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;

    if (dragModeRef.current === 'rotate') {
      const newPitch = Math.max(-65, Math.min(65, initialRotRef.current.x - deltaY * 0.35));
      const newYaw = initialRotRef.current.y + deltaX * 0.35;
      setDirectorRotation({ x: newPitch, y: newYaw });
    } else if (dragModeRef.current === 'pan') {
      setDirectorPan({
        x: initialPanRef.current.x + deltaX * 0.6,
        y: initialPanRef.current.y + deltaY * 0.6,
      });
    } else if (dragModeRef.current === 'zoom') {
      const newZoom = Math.max(0.6, Math.min(3.5, initialZoomRef.current - deltaY * 0.008));
      setDirectorZoom(newZoom);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!isDirectorsMode) return;
    e.preventDefault();
    setDirectorZoom((prev) => Math.max(0.6, Math.min(3.5, prev - e.deltaY * 0.0015)));
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    if (isDirectorsMode) {
      e.preventDefault();
    }
  };

  // Touch event support for mobile interactive rotation
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDirectorsMode || e.touches.length === 0) return;
    const touch = e.touches[0];
    dragModeRef.current = 'rotate';
    dragStartRef.current = { x: touch.clientX, y: touch.clientY };
    initialRotRef.current = { ...directorRotation };
    initialPanRef.current = { ...directorPan };
    initialZoomRef.current = directorZoom;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDirectorsMode || !isDragging || e.touches.length === 0) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - dragStartRef.current.x;
    const deltaY = touch.clientY - dragStartRef.current.y;
    const newPitch = Math.max(-65, Math.min(65, initialRotRef.current.x - deltaY * 0.4));
    const newYaw = initialRotRef.current.y + deltaX * 0.4;
    setDirectorRotation({ x: newPitch, y: newYaw });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Active transform: interactive 3D rotation & zoom when Director's Mode is enabled,
  // or automated timeline scene camera choreography when disabled
  const activeTransform = isDirectorsMode
    ? `perspective(1000px) rotateX(${directorRotation.x.toFixed(2)}deg) rotateY(${directorRotation.y.toFixed(2)}deg) scale(${directorZoom.toFixed(2)}) translate3d(${directorPan.x.toFixed(1)}px, ${directorPan.y.toFixed(1)}px, 0px)`
    : cameraTransform;

  // =========================================================================
  // CAPTURE MOMENT: High-Resolution Snapshot with Film-Grain & Marvel Branding
  // =========================================================================
  const renderPromotionalSnapshot = async (
    grain: number = filmGrainAmount,
    style: 'marvel' | 'clean' = promoStyle
  ) => {
    setIsCapturing(true);

    try {
      const canvas = document.createElement('canvas');
      const isPortrait = aspectRatio === '9:16';
      canvas.width = isPortrait ? 1080 : 1920;
      canvas.height = isPortrait ? 1920 : 1080;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not create 2D canvas context');

      // 1. Fill base dark cinema backdrop
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Obtain current visual source (current video frame or high-res scene asset)
      let sourceElement: CanvasImageSource | null = null;
      if (customVideoUrl && containerRef.current) {
        const videoEl = containerRef.current.querySelector('video');
        if (videoEl && videoEl.readyState >= 2) {
          sourceElement = videoEl;
        }
      }

      if (!sourceElement) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = activeScene.image;
        await new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = () => resolve(null);
        });
        sourceElement = img;
      }

      // 3. Draw image with Director's 3D angle, rotation, zoom, and pan
      if (sourceElement) {
        ctx.save();
        ctx.translate(
          canvas.width / 2 + directorPan.x * (canvas.width / 800),
          canvas.height / 2 + directorPan.y * (canvas.height / 500)
        );
        ctx.scale(directorZoom, directorZoom);

        // 3D rotation simulated
        const radY = (directorRotation.y * Math.PI) / 180;
        ctx.rotate(radY);

        // Simulated vertical pitch skew
        const pitchRad = (directorRotation.x * Math.PI) / 180;
        ctx.transform(1, 0, Math.sin(pitchRad) * 0.12, 1, 0, 0);

        const imgW = (sourceElement as any).videoWidth || (sourceElement as any).naturalWidth || (sourceElement as any).width || canvas.width;
        const imgH = (sourceElement as any).videoHeight || (sourceElement as any).naturalHeight || (sourceElement as any).height || canvas.height;
        const scale = Math.max(canvas.width / imgW, canvas.height / imgH);
        const w = imgW * scale;
        const h = imgH * scale;

        ctx.drawImage(sourceElement, -w / 2, -h / 2, w, h);
        ctx.restore();
      }

      // 4. Render Scene-Specific Cinematic VFX Highlights
      if (activeScene.id === 1) {
        // Night Lightning Flash highlights
        const lightningGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        lightningGrad.addColorStop(0, 'rgba(147, 197, 253, 0.28)');
        lightningGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.09)');
        lightningGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = lightningGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (activeScene.id === 2) {
        // Holographic Cybernetic Target Reticle
        ctx.save();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)';
        ctx.lineWidth = 4;
        ctx.setLineDash([16, 10]);
        ctx.beginPath();
        ctx.arc(canvas.width * 0.5, canvas.height * 0.5, canvas.height * 0.28, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      } else if (activeScene.id === 3) {
        // Arc Reactor plasma flare in chest
        ctx.save();
        const rx = canvas.width * 0.5;
        const ry = canvas.height * 0.44;
        const radGrad = ctx.createRadialGradient(rx, ry, 5, rx, ry, canvas.height * 0.26);
        radGrad.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
        radGrad.addColorStop(0.18, 'rgba(6, 182, 212, 0.85)');
        radGrad.addColorStop(0.5, 'rgba(2, 132, 199, 0.35)');
        radGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = radGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Anamorphic horizontal flare streak
        ctx.fillStyle = 'rgba(56, 189, 248, 0.7)';
        ctx.fillRect(0, ry - 3, canvas.width, 6);
        ctx.restore();
      } else if (activeScene.id === 4) {
        // Repulsor blast flare
        ctx.save();
        const px = canvas.width * 0.68;
        const py = canvas.height * 0.58;
        const blastGrad = ctx.createRadialGradient(px, py, 10, px, py, canvas.height * 0.35);
        blastGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        blastGrad.addColorStop(0.2, 'rgba(56, 189, 248, 0.85)');
        blastGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = blastGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
      }

      // 5. Cinematic Vignette
      const vignette = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, canvas.height * 0.35,
        canvas.width / 2, canvas.height / 2, canvas.height * 0.88
      );
      vignette.addColorStop(0, 'transparent');
      vignette.addColorStop(1, 'rgba(0, 0, 0, 0.72)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 6. Apply Authentic Film-Grain Filter
      if (grain > 0) {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        const grainIntensity = grain * 55;
        // Fine 35mm grain synthesis
        for (let i = 0; i < data.length; i += 4) {
          const noise = (Math.random() - 0.5) * grainIntensity;
          data[i] = Math.min(255, Math.max(0, data[i] + noise));
          data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
          data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
        }
        ctx.putImageData(imgData, 0, 0);
      }

      // 7. Render Branded Promotional Typography & Watermarks
      if (style === 'marvel') {
        // Top Letterbox Bar
        const topGrad = ctx.createLinearGradient(0, 0, 0, 110);
        topGrad.addColorStop(0, 'rgba(0,0,0,0.92)');
        topGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = topGrad;
        ctx.fillRect(0, 0, canvas.width, 110);

        // Top Metadata text
        ctx.font = '700 16px "Rajdhani", monospace, sans-serif';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('MARVEL STUDIOS INSPIRED • SPECIAL CINEMATIC PROMOTIONAL STILL', 50, 48);

        ctx.font = '600 14px monospace';
        ctx.fillStyle = '#94a3b8';
        const telemetry = `DIR_CAM // YAW: ${directorRotation.y >= 0 ? '+' : ''}${directorRotation.y.toFixed(1)}° • PITCH: ${directorRotation.x >= 0 ? '+' : ''}${directorRotation.x.toFixed(1)}° • ZOOM: ${directorZoom.toFixed(2)}X • 4K UHD`;
        const textWidth = ctx.measureText(telemetry).width;
        ctx.fillText(telemetry, canvas.width - textWidth - 50, 48);

        // Top Cyan Divider line
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(50, 68);
        ctx.lineTo(canvas.width - 50, 68);
        ctx.stroke();

        // Bottom Branding Banner
        const botHeight = isPortrait ? 340 : 230;
        const botGrad = ctx.createLinearGradient(0, canvas.height - botHeight, 0, canvas.height);
        botGrad.addColorStop(0, 'transparent');
        botGrad.addColorStop(0.35, 'rgba(2, 6, 23, 0.88)');
        botGrad.addColorStop(1, 'rgba(2, 6, 23, 0.98)');
        ctx.fillStyle = botGrad;
        ctx.fillRect(0, canvas.height - botHeight, canvas.width, botHeight);

        // Accent glowing strip
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(50, canvas.height - botHeight + 50, 6, 110);

        // Movie Title
        ctx.font = '900 44px "Orbitron", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('RISE OF THE IRON WARRIOR', 75, canvas.height - botHeight + 92);

        // Subtitle
        ctx.font = '700 20px "Rajdhani", sans-serif';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('YSL: ORIGIN OF POWER • SPECIAL EDITION', 75, canvas.height - botHeight + 124);

        // Dialogue Quote
        if (activeScene.dialogue) {
          ctx.font = 'italic 500 18px "Inter", sans-serif';
          ctx.fillStyle = '#e2e8f0';
          ctx.fillText(`"${activeScene.dialogue.text}" — ${activeScene.dialogue.speaker.toUpperCase()}`, 75, canvas.height - botHeight + 158);
        }

        // Scene metadata tag
        ctx.font = '600 14px "Rajdhani", monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`SCENE 0${activeScene.id}: ${activeScene.title.toUpperCase()} // ${activeScene.vfxTheme.toUpperCase()}_VFX // PROTOCOL_ONLINE`, 75, canvas.height - botHeight + 185);
      } else {
        // Clean Director Still: Subtle corner watermark only
        ctx.font = '700 16px "Orbitron", sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.fillText('IRON WARRIOR — ORIGIN OF POWER', 40, canvas.height - 40);

        ctx.font = '600 13px monospace';
        ctx.fillStyle = 'rgba(56, 189, 248, 0.85)';
        ctx.fillText(`SCENE ${activeScene.id} • DIR_CAM: ${directorZoom.toFixed(1)}x`, canvas.width - 240, canvas.height - 40);
      }

      const dataUrl = canvas.toDataURL('image/png');
      setCapturedPosterUrl(dataUrl);

      // Save to Stills Gallery
      const newStill: GalleryStill = {
        id: `capture-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        imageUrl: dataUrl,
        sceneId: activeScene.id,
        sceneTitle: activeScene.title,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        style,
        grain,
        aspectRatio,
        telemetry: {
          pitch: parseFloat(directorRotation.x.toFixed(1)),
          yaw: parseFloat(directorRotation.y.toFixed(1)),
          zoom: parseFloat(directorZoom.toFixed(2)),
        },
        dialogueQuote: activeScene.dialogue?.text,
        isCustomCapture: true,
      };

      if (onStillCaptured) {
        onStillCaptured(newStill);
      }

      setShowCaptureModal(true);
    } catch (err) {
      console.error('Failed to capture frame:', err);
    } finally {
      setIsCapturing(false);
    }
  };

  const downloadCapturedPoster = () => {
    if (!capturedPosterUrl) return;
    const a = document.createElement('a');
    a.href = capturedPosterUrl;
    a.download = `iron-warrior-scene${activeScene.id}-promo-still.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const copyPosterToClipboard = async () => {
    if (!capturedPosterUrl) return;
    try {
      const res = await fetch(capturedPosterUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (e) {
      console.warn('Clipboard copy failed:', e);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Top Bar with Mode, Aspect Ratio, Director's Mode & HUD toggles */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 backdrop-blur-md border border-slate-800 p-3 rounded-xl">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-display text-xs tracking-wider text-cyan-400 font-bold uppercase">
            30-Second Cinematic Cinema VFX Viewport
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            4K UHD MASTER
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Aspect ratio selector */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => onAspectChange('16:9')}
              className={`px-3 py-1 rounded transition-all font-medium ${
                aspectRatio === '16:9'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              16:9 Landscape
            </button>
            <button
              onClick={() => onAspectChange('9:16')}
              className={`px-3 py-1 rounded transition-all font-medium ${
                aspectRatio === '9:16'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              9:16 Portrait
            </button>
          </div>

          {/* Director's Mode interactive camera toggle */}
          <button
            onClick={() => setIsDirectorsMode(!isDirectorsMode)}
            className={`px-3 py-1 text-xs rounded-lg border font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isDirectorsMode
                ? 'bg-amber-500/25 text-amber-300 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.35)] ring-1 ring-amber-400/50'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white hover:border-slate-600'
            }`}
            title="Toggle Director's Mode: Interactive 3D rotation and zoom via mouse drag on the video container"
          >
            <Compass
              className={`w-3.5 h-3.5 ${isDirectorsMode ? 'text-amber-400 animate-spin' : 'text-slate-400'}`}
              style={isDirectorsMode ? { animationDuration: '8s' } : undefined}
            />
            <span>Director's Mode</span>
            {isDirectorsMode && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            )}
          </button>

          {/* Capture Moment Button in Top Bar when Director's Mode is active */}
          {isDirectorsMode && (
            <button
              onClick={() => renderPromotionalSnapshot()}
              disabled={isCapturing}
              className="px-3 py-1 text-xs rounded-lg border font-semibold flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-display tracking-wide shadow-md shadow-amber-950 transition-all cursor-pointer active:scale-95"
              title="Capture Moment: Take high-resolution branded promotional poster with film grain"
            >
              <Camera className="w-3.5 h-3.5 text-black" />
              <span>{isCapturing ? 'Capturing...' : 'Capture Moment'}</span>
            </button>
          )}

          <button
            onClick={() => setHudOverlay(!hudOverlay)}
            className={`px-2.5 py-1 text-xs rounded border transition-colors flex items-center gap-1.5 ${
              hudOverlay
                ? 'bg-cyan-950/60 text-cyan-300 border-cyan-700'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="Toggle Iron Warrior HUD Telemetry"
          >
            <Radio className="w-3.5 h-3.5" />
            HUD
          </button>

          <button
            onClick={() => setSubtitlesVisible(!subtitlesVisible)}
            className={`px-2.5 py-1 text-xs rounded border transition-colors ${
              subtitlesVisible
                ? 'bg-cyan-950/60 text-cyan-300 border-cyan-700'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            CC
          </button>
        </div>
      </div>

      {/* Main Viewport Container with Mouse Drag & Wheel Events */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onContextMenu={handleContextMenu}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`relative w-full mx-auto bg-black rounded-2xl overflow-hidden border shadow-2xl transition-all duration-300 flex items-center justify-center select-none ${
          isDirectorsMode
            ? isDragging
              ? 'cursor-grabbing border-amber-500/80 ring-2 ring-amber-400/50 shadow-amber-950/50'
              : 'cursor-grab border-amber-500/60 ring-1 ring-amber-500/30'
            : 'border-cyan-900/40'
        } ${
          aspectRatio === '16:9'
            ? 'aspect-[16/9] max-h-[72vh]'
            : 'aspect-[9/16] max-h-[82vh] max-w-[440px]'
        }`}
      >
        {/* Floating Director's Telemetry HUD when Director's Mode is active */}
        {isDirectorsMode && (
          <div className="absolute top-3 right-3 z-40 bg-black/85 backdrop-blur-md border border-amber-500/60 rounded-xl p-3 shadow-2xl flex flex-col gap-2 font-mono text-[11px] text-amber-300 w-48 sm:w-56 pointer-events-auto">
            <div className="flex items-center justify-between border-b border-amber-900/60 pb-1.5">
              <div className="flex items-center gap-1.5 font-bold tracking-wider text-amber-400">
                <Compass className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '10s' }} />
                <span>DIRECTOR CAM</span>
              </div>
              <button
                onClick={resetDirectorCamera}
                className="px-1.5 py-0.5 text-[10px] rounded bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-700/60 transition-colors flex items-center gap-1 cursor-pointer"
                title="Reset Camera Angles and Zoom"
              >
                <RotateCw className="w-2.5 h-2.5" />
                <span>RESET</span>
              </button>
            </div>

            <div className="flex flex-col gap-1 text-[10px] text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">PITCH (X):</span>
                <span className="font-bold text-amber-300">
                  {directorRotation.x >= 0 ? '+' : ''}{directorRotation.x.toFixed(1)}°
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">YAW (Y):</span>
                <span className="font-bold text-amber-300">
                  {directorRotation.y >= 0 ? '+' : ''}{directorRotation.y.toFixed(1)}°
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">ZOOM:</span>
                <span className="font-bold text-amber-300">
                  {directorZoom.toFixed(2)}x
                </span>
              </div>
            </div>

            {/* Quick Zoom Buttons */}
            <div className="flex items-center gap-1.5 pt-1 border-t border-amber-900/40">
              <button
                onClick={() => setDirectorZoom((z) => Math.max(0.6, z - 0.2))}
                className="flex-1 py-1 rounded bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-800 text-[10px] flex items-center justify-center gap-1 cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3 h-3" />
                <span>-</span>
              </button>
              <button
                onClick={() => setDirectorZoom((z) => Math.min(3.5, z + 0.2))}
                className="flex-1 py-1 rounded bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-800 text-[10px] flex items-center justify-center gap-1 cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3 h-3" />
                <span>+</span>
              </button>
            </div>

            {/* Capture Moment Button inside Director HUD */}
            <button
              onClick={() => renderPromotionalSnapshot()}
              disabled={isCapturing}
              className="w-full mt-1 py-1.5 px-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-md shadow-amber-950 transition-all cursor-pointer active:scale-95"
              title="Capture high-resolution promotional still with film-grain filter"
            >
              <Camera className="w-3.5 h-3.5 text-black" />
              <span>{isCapturing ? 'Rendering...' : 'Capture Moment'}</span>
            </button>
          </div>
        )}

        {/* Mini instructions & quick capture pill at bottom of viewport when Director's Mode is active */}
        {isDirectorsMode && (
          <div className="absolute bottom-3 inset-x-4 flex justify-center items-center gap-2 z-30 pointer-events-auto">
            <div className="bg-black/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-amber-500/50 text-[11px] font-mono text-amber-300 flex items-center gap-2 shadow-2xl">
              <Move className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="hidden sm:inline">Drag: Rotate 3D • Scroll: Zoom • Shift-Drag: Pan</span>
              <span className="sm:hidden">Drag: Rotate • Scroll: Zoom</span>
            </div>
            <button
              onClick={() => renderPromotionalSnapshot()}
              disabled={isCapturing}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold text-[11px] px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 cursor-pointer transition-transform active:scale-95 font-display"
              title="Capture Moment snapshot"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Capture</span>
            </button>
          </div>
        )}

        {/* If user generated custom video with Omni Flash, display video directly */}
        {customVideoUrl ? (
          <div
            className="w-full h-full flex items-center justify-center overflow-hidden"
            style={{
              transform: isDirectorsMode ? activeTransform : undefined,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.15s ease-out',
            }}
          >
            <video
              src={customVideoUrl}
              className={`w-full h-full object-cover ${isDirectorsMode ? 'pointer-events-none' : ''}`}
              autoPlay
              loop
              controls={!isDirectorsMode}
            />
          </div>
        ) : (
          <div className="relative w-full h-full overflow-hidden flex items-center justify-center bg-black">
            {/* Background City Skyline & Atmosphere */}
            <div
              className="absolute inset-0 bg-cover bg-center filter brightness-90 contrast-110"
              style={{
                backgroundImage: `url(${activeScene.image})`,
                transform: activeTransform,
                transformOrigin: isDirectorsMode ? 'center center' : (activeScene.id === 1 ? '50% 25%' : '50% 50%'),
                transition: isDragging ? 'none' : (isDirectorsMode ? 'transform 0.15s ease-out' : 'transform 0.7s ease-out'),
              }}
            />

            {/* Dark Vignette & Cinema Letterbox */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/85 via-transparent to-black/70" />
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-black/60 via-transparent to-black/60" />

            {/* Subtle Metallic Transition Sheen on Scene Switch */}
            {isTransitioning && (
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-cyan-400/25 to-transparent mix-blend-screen animate-pulse z-30 transition-opacity duration-300" />
            )}

            {/* Scanlines layer */}
            <div className="absolute inset-0 pointer-events-none opacity-25 scanline-bg" />

            {/* SCENE 1 VFX: Lightning Flash & Smoke Roll */}
            {activeScene.id === 1 && (
              <>
                <div className="absolute inset-0 bg-blue-300/25 pointer-events-none animate-lightning mix-blend-screen" />
                <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-cyan-950/40 to-transparent pointer-events-none blur-xl opacity-75" />
              </>
            )}

            {/* SCENE 2 VFX: Holographic Nanotech Rune Rings & Cyan Pulse */}
            {activeScene.id === 2 && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                {/* Rotating Cybernetic Target Reticles */}
                <div className="w-80 h-80 rounded-full border border-cyan-400/40 animate-spin border-dashed" style={{ animationDuration: '12s' }} />
                <div className="absolute w-64 h-64 rounded-full border border-cyan-300/30 animate-ping opacity-30" />
                <div className="absolute w-44 h-44 rounded-full border border-blue-500/50 animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }} />
                {/* Glowing Nanotech Glyphs */}
                <div className="absolute top-1/4 text-cyan-300 font-mono text-[10px] tracking-widest bg-black/60 px-3 py-1 rounded border border-cyan-500/40 backdrop-blur-sm animate-pulse">
                  NANITE_INJECTION // VECTOR_ARM_L // SYNC_98.4%
                </div>
              </div>
            )}

            {/* SCENE 3 VFX: Arc Reactor Core Ignition & Armor Assembly Plasma */}
            {activeScene.id === 3 && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                {/* Central Arc Reactor Flare */}
                <div className="relative flex items-center justify-center -translate-y-8">
                  <div className="w-24 h-24 rounded-full bg-cyan-400/30 blur-2xl animate-pulse" />
                  <div className="absolute w-12 h-12 rounded-full border-2 border-cyan-300 animate-pulse-reactor bg-cyan-400/40 glow-reactor flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-white glow-blue" />
                  </div>
                  {/* Energy discharge rays */}
                  <div className="absolute w-72 h-1 bg-cyan-400/60 blur-[1px] animate-pulse" />
                  <div className="absolute h-72 w-1 bg-cyan-400/60 blur-[1px] animate-pulse" />
                </div>
                {/* Mechanical Armor HUD Frame */}
                <div className="absolute inset-10 border border-cyan-500/20 rounded-2xl pointer-events-none" />
              </div>
            )}

            {/* SCENE 4 VFX: Repulsor Palm Flare & Rocket Thrust */}
            {activeScene.id === 4 && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                {/* Repulsor Glow in Right Hand */}
                <div className="absolute bottom-1/3 right-1/4 w-32 h-32 rounded-full bg-cyan-300/40 blur-2xl animate-pulse" />
                {/* Rocket Sonic Wave */}
                <div className="absolute bottom-10 w-96 h-16 bg-gradient-to-t from-cyan-400/30 to-transparent blur-xl" />
                {/* Title Card Overlay at end of scene 4 (27s+) */}
                {currentTime >= 26.5 && (
                  <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fadeIn z-30">
                    <span className="text-cyan-400 text-xs font-mono tracking-[0.4em] uppercase mb-2">
                      MARVEL CINEMATIC UNIVERSE INSPIRED
                    </span>
                    <h2 className="font-display text-2xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-cyan-400 drop-shadow-[0_0_35px_rgba(6,182,212,0.8)] tracking-wider">
                      YSL: IRON WARRIOR
                    </h2>
                    <p className="font-display text-sm sm:text-base text-cyan-300 tracking-[0.3em] font-semibold mt-2">
                      ORIGIN OF POWER
                    </p>
                    <div className="mt-6 flex items-center gap-3">
                      <div className="h-0.5 w-12 bg-gradient-to-r from-transparent to-cyan-500" />
                      <div className="w-2.5 h-2.5 rotate-45 bg-cyan-400 shadow-[0_0_10px_#06b6d4]" />
                      <div className="h-0.5 w-12 bg-gradient-to-l from-transparent to-cyan-500" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Iron Warrior HUD Overlay */}
            {hudOverlay && (
              <div className="absolute inset-0 p-4 pointer-events-none flex flex-col justify-between font-hud z-20 text-xs text-cyan-400/80">
                {/* Top HUD header */}
                <div className="flex items-start justify-between">
                  <div className="bg-black/60 backdrop-blur-md p-2 rounded border border-cyan-800/40">
                    <div className="flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="font-bold tracking-widest text-cyan-300">SYSTEM: WARRIOR_PROTOCOL</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                      CORE: {activeScene.id >= 3 ? '100% ONLINE (ARC-REACTOR)' : 'STANDBY'} • V: 4K UHD
                    </div>
                  </div>

                  <div className="bg-black/60 backdrop-blur-md p-2 rounded border border-cyan-800/40 text-right">
                    <div className="font-mono text-cyan-300 font-bold">{formatTime(currentTime)}</div>
                    <div className="text-[10px] text-slate-400">TOTAL: 00:30.00</div>
                  </div>
                </div>

                {/* Center targeting telemetry */}
                <div className="flex items-center justify-between px-2">
                  <div className="flex flex-col gap-1 text-[10px] font-mono text-cyan-400/60 hidden sm:flex">
                    <div>PITCH: +04.2°</div>
                    <div>YAW: -12.8°</div>
                    <div>NANITE_FLOW: {activeScene.id >= 2 ? 'ACTIVE' : 'DORMANT'}</div>
                  </div>
                  <div className="w-10 h-10 border border-cyan-400/30 rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-cyan-400/80 rounded-full" />
                  </div>
                  <div className="flex flex-col gap-1 text-[10px] font-mono text-cyan-400/60 text-right hidden sm:flex">
                    <div>REPULSOR: {activeScene.id === 4 ? 'FIRING' : 'READY'}</div>
                    <div>VFX_LAYER: {activeScene.vfxTheme.toUpperCase()}</div>
                    <div>FPS: 60.0</div>
                  </div>
                </div>

                {/* Bottom HUD footer badge */}
                <div className="flex items-end justify-between">
                  <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded border border-cyan-800/40 text-[10px] flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span>SCENE {activeScene.id} // {activeScene.title}</span>
                  </div>

                  <div className="text-[10px] text-slate-500 font-mono">
                    MARK VII CARBON NANO-ALLOY
                  </div>
                </div>
              </div>
            )}

            {/* Subtitles & Dialogue HUD */}
            {subtitlesVisible && activeScene.dialogue && (
              <div className="absolute bottom-12 inset-x-4 flex justify-center z-20 pointer-events-none">
                <div className="max-w-xl bg-black/85 backdrop-blur-md px-4 py-2 rounded-xl border border-cyan-500/40 text-center shadow-2xl">
                  <div className="flex items-center justify-center gap-1.5 mb-0.5">
                    {activeScene.dialogue.speaker === 'Warrior' ? (
                      <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-amber-400 px-1.5 py-0.2 rounded bg-amber-950/60 border border-amber-600/40">
                        WARRIOR
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-cyan-400 px-1.5 py-0.2 rounded bg-cyan-950/60 border border-cyan-600/40">
                        AI SYSTEM PROTOCOL
                      </span>
                    )}
                  </div>
                  <p className="text-sm md:text-base font-semibold text-white tracking-wide drop-shadow-md">
                    "{activeScene.dialogue.text}"
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cinematic Controls Bar */}
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 p-4 rounded-2xl flex flex-col gap-3">
        {/* Timeline Scrubber */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="text-cyan-400 font-bold">{formatTime(currentTime)}</span>
            <div className="flex items-center gap-4 text-[11px]">
              {SCENES.map((scene) => (
                <button
                  key={scene.id}
                  onClick={() => handleSeek(scene.startTime)}
                  className={`transition-colors flex items-center gap-1 ${
                    activeScene.id === scene.id
                      ? 'text-cyan-300 font-bold underline decoration-cyan-400 decoration-2 underline-offset-4'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <span>S{scene.id}</span>
                  <span className="hidden md:inline font-sans">{scene.title}</span>
                </button>
              ))}
            </div>
            <span>00:30.00</span>
          </div>

          {/* Interactive timeline slider */}
          <div className="relative flex items-center group">
            <input
              type="range"
              min={0}
              max={30}
              step={0.05}
              value={currentTime}
              onChange={(e) => handleSeek(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 hover:h-2.5 transition-all"
            />
            {/* Visual Scene Cut Markers on timeline */}
            <div className="absolute left-[20%] top-0 bottom-0 w-0.5 bg-cyan-600/60 pointer-events-none" title="6s Scene 2" />
            <div className="absolute left-[40%] top-0 bottom-0 w-0.5 bg-cyan-600/60 pointer-events-none" title="12s Scene 3" />
            <div className="absolute left-[73.3%] top-0 bottom-0 w-0.5 bg-cyan-600/60 pointer-events-none" title="22s Scene 4" />
          </div>
        </div>

        {/* Buttons Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-cyan-900/30 transition-all active:scale-95 cursor-pointer"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              <span>{isPlaying ? 'Pause' : currentTime >= 30 ? 'Replay' : 'Play 30s Movie'}</span>
            </button>

            <button
              onClick={handleRestart}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Restart from 0:00"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <div className="h-6 w-px bg-slate-800 mx-1" />

            {/* Mute button */}
            <button
              onClick={toggleMute}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title={isMuted ? 'Unmute Cinematic SFX' : 'Mute Cinematic SFX'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            </button>

            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 pl-1">
              <span>SFX:</span>
              <span className="text-cyan-400 font-mono">
                {activeScene.id === 1 && 'THUNDER & AMBIENCE'}
                {activeScene.id === 2 && 'NANOTECH SYNTHESIS'}
                {activeScene.id === 3 && 'HYDRAULIC CLANK & REACTOR'}
                {activeScene.id === 4 && 'REPULSOR THRUST'}
              </span>
              <span className="text-slate-700">|</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/70 text-cyan-300 border border-cyan-800/60 flex items-center gap-1">
                <Zap className="w-3 h-3 text-cyan-400" />
                METALLIC TRANSITIONS: ACTIVE
              </span>
              {isDirectorsMode && (
                <>
                  <span className="text-slate-700">|</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-600/60 flex items-center gap-1 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                    <Compass className="w-3 h-3 text-amber-400" />
                    DIRECTOR'S CAM: {directorZoom.toFixed(1)}X (P:{directorRotation.x.toFixed(0)}° Y:{directorRotation.y.toFixed(0)}°)
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Fullscreen Viewport"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* CAPTURE MOMENT PROMOTIONAL POSTER MODAL */}
      {showCaptureModal && capturedPosterUrl && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
          <div className="relative max-w-4xl w-full bg-slate-950 border border-amber-500/50 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.25)] overflow-hidden flex flex-col my-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border-b border-amber-500/30">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-400">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm sm:text-base text-amber-300 tracking-wider">
                    DIRECTOR'S MOMENT CAPTURE
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Scene 0{activeScene.id}: {activeScene.title} • 35mm Film Grain • High-Res Branded Poster
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCaptureModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-4 sm:p-6 flex flex-col lg:flex-row gap-5 items-center">
              {/* Snapshot Preview Display */}
              <div className="flex-1 w-full flex items-center justify-center bg-black rounded-xl p-2 border border-slate-800 shadow-inner">
                <div
                  className={`relative overflow-hidden rounded-lg shadow-2xl border border-slate-800 max-h-[58vh] ${
                    aspectRatio === '9:16' ? 'aspect-[9/16] max-w-[320px]' : 'aspect-[16/9] w-full'
                  }`}
                >
                  <img
                    src={capturedPosterUrl}
                    alt="Captured Promotional Still"
                    className="w-full h-full object-contain bg-black"
                  />
                  {isCapturing && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center gap-2 text-amber-300 font-mono text-xs">
                      <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
                      <span>Re-rendering with grain filter...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Adjustments & Controls Panel */}
              <div className="w-full lg:w-80 flex flex-col gap-4">
                {/* Branding Style Selector */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                    <span>Promotional Style</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setPromoStyle('marvel');
                        renderPromotionalSnapshot(filmGrainAmount, 'marvel');
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border text-left cursor-pointer ${
                        promoStyle === 'marvel'
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="font-display">Marvel Promo</div>
                      <div className="text-[10px] text-slate-500 font-normal mt-0.5">Title, quote & HUD</div>
                    </button>
                    <button
                      onClick={() => {
                        setPromoStyle('clean');
                        renderPromotionalSnapshot(filmGrainAmount, 'clean');
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border text-left cursor-pointer ${
                        promoStyle === 'clean'
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="font-display">Clean Still</div>
                      <div className="text-[10px] text-slate-500 font-normal mt-0.5">Minimalist watermark</div>
                    </button>
                  </div>
                </div>

                {/* Film-Grain Filter Intensity */}
                <div className="flex flex-col gap-1.5 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-300">35mm Film Grain Filter</span>
                    <span className="font-mono text-amber-400 font-bold">
                      {Math.round(filmGrainAmount * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={filmGrainAmount}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setFilmGrainAmount(val);
                      renderPromotionalSnapshot(val, promoStyle);
                    }}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Clean Digital</span>
                    <span>Subtle 35mm</span>
                    <span>Cinematic Gritty</span>
                  </div>
                </div>

                {/* Director Camera Metadata Pill */}
                <div className="p-3 bg-black/60 rounded-xl border border-slate-800/80 text-[11px] font-mono text-slate-400 flex flex-col gap-1">
                  <div className="text-amber-400 font-bold uppercase tracking-wider text-[10px]">
                    SHOT TELEMETRY
                  </div>
                  <div className="flex justify-between">
                    <span>Camera Angle:</span>
                    <span className="text-slate-200">
                      Y:{directorRotation.y.toFixed(1)}° • P:{directorRotation.x.toFixed(1)}°
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Zoom Factor:</span>
                    <span className="text-slate-200">{directorZoom.toFixed(2)}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Aspect / Format:</span>
                    <span className="text-cyan-400 font-bold">{aspectRatio} (High-Res PNG)</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 pt-2">
                  {/* Saved to Gallery Badge with Navigation */}
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-amber-300 font-mono text-[11px]">
                      <Check className="w-3.5 h-3.5 text-amber-400" />
                      <span>Saved to Stills Gallery</span>
                    </div>
                    {onNavigateToGallery && (
                      <button
                        onClick={() => {
                          setShowCaptureModal(false);
                          onNavigateToGallery();
                        }}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-[10px] flex items-center gap-1 transition-colors border border-amber-500/40 cursor-pointer"
                      >
                        <Images className="w-3 h-3" />
                        <span>View Gallery ↗</span>
                      </button>
                    )}
                  </div>

                  <button
                    onClick={downloadCapturedPoster}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-950/40 cursor-pointer active:scale-98 transition-all"
                  >
                    <Download className="w-4 h-4 text-black" />
                    <span>Download Promotional Poster</span>
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={copyPosterToClipboard}
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>Copy Image</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setShowCaptureModal(false)}
                      className="py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs border border-slate-800 transition-colors cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

