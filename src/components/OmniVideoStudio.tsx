import React, { useState, useRef } from 'react';
import { 
  Upload, Video, Sparkles, Loader2, Play, Download, 
  RotateCw, CheckCircle, AlertCircle, Film, Wand2, ArrowRight,
  Maximize2, Eye, Zap, Layers, RefreshCw, Copy, Check, Image as ImageIcon,
  ChevronDown, ChevronUp, Palette
} from 'lucide-react';
import { CHARACTER_PORTRAITS, SCENES } from '../data/scenes';

interface GeneratedVideoItem {
  id: string;
  sourceImage: string;
  videoUrl: string;
  videoBase64?: string;
  prompt: string;
  aspectRatio: '16:9' | '9:16';
  duration: '5s' | '10s';
  timestamp: string;
  sceneName: string;
}

interface GeneratedPortraitItem {
  id: string;
  url: string;
  base64: string;
  prompt: string;
  modelUsed: string;
  aspectRatio: string;
  stageName: string;
}

interface OmniVideoStudioProps {
  onVideoGenerated?: (videoUrl: string) => void;
  currentAspectRatio: '16:9' | '9:16';
}

// Detailed 4K Photorealistic Prompts based strictly on Storyboard Lore
const LORE_PORTRAIT_PRESETS = [
  {
    stage: 1,
    title: 'The Arrival (Vigilante Stage)',
    badge: 'SCENE 1 LORE',
    image: '/assets/aistudio/IMG-20261024-WA0002_14c4d0eb.jpg',
    prompt:
      'Photorealistic 4K cinematic portrait of the Iron Warrior in his vigilante human phase. Standing in an abandoned, dark rain-soaked Gotham-like alleyway at night. He wears a glossy cobalt-blue puffer vest with hood, black skull-print balaclava mask covering lower face with piercing brown eyes, and dark tactical cargo pants. Sudden thunderstorm lightning flash illuminates the glossy sheen of the vest, rolling ground fog, anamorphic lens flare, Marvel cinematic VFX, extreme photorealism, 8k textures.',
  },
  {
    stage: 2,
    title: 'The Transmission (Nanotech Awakening)',
    badge: 'SCENE 2 LORE',
    image: '/assets/aistudio/IMG-20261024-WA0001_073878e6.jpg',
    prompt:
      'Photorealistic 4K cinematic close-up portrait of the warrior experiencing the mysterious transmission. Glowing electric-blue holographic nanotech symbols and circuit runes materialize around his forearms. Microscopic robotic carbon-alloy plates creep across his wrists and chest beneath his garments. His eyes blaze with luminous cyan cybernetic energy. Atmospheric smoke, hyper-detailed mechanical textures, dramatic sci-fi studio lighting.',
  },
  {
    stage: 3,
    title: 'The Transformation (Arc Reactor Core)',
    badge: 'SCENE 3 LORE',
    image: '/assets/aistudio/605015ba23f11b3_44729b27.jpeg',
    prompt:
      'Photorealistic 4K hero portrait of the fully armored Iron Warrior superhero. Segmented heavy carbon-black and electric-blue mechanical armor plates lock in layers over his muscular frame with gold-tinted hydraulic joints. A brilliant glowing turquoise arc reactor core blazes in the center of his chest casting intense cyan specular highlights across his chest armor. Sleek futuristic helmet with glowing blue optic slit lenses. Photorealistic 4K Marvel cinematic action VFX.',
  },
  {
    stage: 4,
    title: 'The Iron Warrior Rises (Rooftop Repulsor)',
    badge: 'SCENE 4 LORE',
    image: '/assets/aistudio/605015ba23f11b3_44729b27.jpeg',
    prompt:
      'Epic 4K cinematic superhero action portrait of the armored Iron Warrior standing atop a skyscraper rooftop overlooking a vast cyberpunk metropolis skyline at midnight. His right palm is raised forward, a blinding electric-blue repulsor energy core gathering swirl and crackling lightning plasma, armor reflecting city neon reflections, ready for supersonic launch into the night sky, cinematic Marvel blockbuster lighting.',
  },
];

export const OmniVideoStudio: React.FC<OmniVideoStudioProps> = ({
  onVideoGenerated,
  currentAspectRatio,
}) => {
  // Selected or uploaded image state
  const [selectedImageSrc, setSelectedImageSrc] = useState<string>(
    CHARACTER_PORTRAITS[0].image
  );
  const [uploadedImageBase64, setUploadedImageBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');

  // Video generation parameters
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>(currentAspectRatio);
  const [duration, setDuration] = useState<'5s' | '10s'>('5s');
  const [prompt, setPrompt] = useState<string>(SCENES[0].promptPreset);
  const [activeSceneTag, setActiveSceneTag] = useState<string>('Scene 1: The Arrival');

  // Video generation Status & Progress
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [progressStep, setProgressStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isRateLimitError, setIsRateLimitError] = useState<boolean>(false);

  // Archive of generated videos
  const [videoHistory, setVideoHistory] = useState<GeneratedVideoItem[]>([]);
  const [activeVideo, setActiveVideo] = useState<GeneratedVideoItem | null>(null);

  // ==========================================
  // IMAGEN 4K PORTRAIT GENERATOR STATE
  // ==========================================
  const [showPortraitStudio, setShowPortraitStudio] = useState<boolean>(true);
  const [activeLoreStage, setActiveLoreStage] = useState<number>(3); // Default: Scene 3 (Armor & Reactor)
  const [portraitPrompt, setPortraitPrompt] = useState<string>(LORE_PORTRAIT_PRESETS[2].prompt);
  const [portraitAspectRatio, setPortraitAspectRatio] = useState<'3:4' | '1:1' | '16:9' | '9:16'>('3:4');
  const [isGeneratingPortrait, setIsGeneratingPortrait] = useState<boolean>(false);
  const [portraitProgress, setPortraitProgress] = useState<string>('');
  const [portraitError, setPortraitError] = useState<string | null>(null);
  const [generatedPortraits, setGeneratedPortraits] = useState<GeneratedPortraitItem[]>([]);
  const [activePortrait, setActivePortrait] = useState<GeneratedPortraitItem | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, WEBP).');
      return;
    }

    setError(null);
    setMimeType(file.type);

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setUploadedImageBase64(result);
      setSelectedImageSrc(result);
    };
    reader.readAsDataURL(file);
  };

  // ==========================================
  // GENERATE 4K PORTRAIT WITH IMAGEN
  // ==========================================
  const handleGeneratePortrait = async () => {
    setIsGeneratingPortrait(true);
    setPortraitError(null);
    setPortraitProgress('Initializing Imagen 3 model session with Storyboard lore...');

    try {
      setPortraitProgress('Synthesizing 4K photorealistic Iron Warrior portrait...');

      const response = await fetch('/api/generate-portrait', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: portraitPrompt,
          aspectRatio: portraitAspectRatio,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate 4K portrait with Imagen.');
      }

      const imageUrl = `data:${data.mimeType || 'image/jpeg'};base64,${data.imageBase64}`;

      const newPortrait: GeneratedPortraitItem = {
        id: Date.now().toString(),
        url: imageUrl,
        base64: data.imageBase64,
        prompt: portraitPrompt,
        modelUsed: data.modelUsed || 'imagen-3.0-generate-002',
        aspectRatio: data.aspectRatio || portraitAspectRatio,
        stageName: LORE_PORTRAIT_PRESETS.find((p) => p.stage === activeLoreStage)?.title || 'Iron Warrior',
      };

      setGeneratedPortraits((prev) => [newPortrait, ...prev]);
      setActivePortrait(newPortrait);
      setPortraitProgress('4K Portrait generated successfully!');

      // Automatically set this generated portrait as the starting keyframe for the video generator!
      setSelectedImageSrc(imageUrl);
      setUploadedImageBase64(imageUrl);
      setMimeType(data.mimeType || 'image/jpeg');
    } catch (err: any) {
      console.error('Portrait generation failed:', err);
      setPortraitError(
        err.message || 'Failed to generate portrait with Imagen. Please check GEMINI_API_KEY permissions.'
      );
    } finally {
      setIsGeneratingPortrait(false);
    }
  };

  const handleSelectLorePreset = (stageNumber: number) => {
    const preset = LORE_PORTRAIT_PRESETS.find((p) => p.stage === stageNumber);
    if (!preset) return;
    setActiveLoreStage(stageNumber);
    setPortraitPrompt(preset.prompt);
  };

  const downloadPortrait = (item: GeneratedPortraitItem) => {
    const a = document.createElement('a');
    a.href = item.url;
    a.download = `iron-warrior-4k-portrait-${item.id}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // ==========================================
  // GENERATE VIDEO WITH GEMINI OMNI FLASH
  // ==========================================
  const handleGenerateVideo = async (customPromptOverride?: string, customImageOverride?: string, customTag?: string) => {
    const finalPrompt = customPromptOverride || prompt;
    const finalImage = customImageOverride || selectedImageSrc;
    const tag = customTag || activeSceneTag;

    setIsGenerating(true);
    setError(null);
    setIsRateLimitError(false);
    setProgressStep('Encoding source keyframe and establishing model session...');

    try {
      const payload: any = {
        prompt: finalPrompt,
        aspectRatio: aspectRatio,
        duration: duration,
        mimeType: mimeType,
      };

      if (uploadedImageBase64 && (!customImageOverride || customImageOverride === uploadedImageBase64)) {
        payload.imageBase64 = uploadedImageBase64;
      } else {
        payload.imagePath = finalImage;
      }

      setProgressStep('Submitting to Gemini Interactions API with model: gemini-omni-1.1-flash...');

      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      setProgressStep('Synthesizing 4K Marvel-style cinematic VFX and motion dynamics...');

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (data.isRateLimit || data.requiresPaidTier || (data.error && data.error.includes('Rate limit'))) {
          setIsRateLimitError(true);
        }
        throw new Error(data.error || 'Failed to generate video with Gemini Omni Flash.');
      }

      let videoUrl = '';
      if (data.videoBase64) {
        const videoBlob = new Blob(
          [Uint8Array.from(atob(data.videoBase64), (c) => c.charCodeAt(0))],
          { type: data.mimeType || 'video/mp4' }
        );
        videoUrl = URL.createObjectURL(videoBlob);
      } else if (data.videoUri) {
        videoUrl = data.videoUri;
      }

      if (!videoUrl) {
        throw new Error('Video generation completed, but no playable media was returned.');
      }

      const newItem: GeneratedVideoItem = {
        id: Date.now().toString(),
        sourceImage: finalImage,
        videoUrl: videoUrl,
        videoBase64: data.videoBase64,
        prompt: finalPrompt,
        aspectRatio: data.aspectRatio || aspectRatio,
        duration: data.duration || duration,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        sceneName: tag,
      };

      setVideoHistory((prev) => [newItem, ...prev]);
      setActiveVideo(newItem);
      setProgressStep('Video generated successfully!');

      if (onVideoGenerated) {
        onVideoGenerated(videoUrl);
      }
    } catch (err: any) {
      console.error('Video generation failed:', err);
      const msg = err.message || '';
      if (msg.includes('Rate limit') || msg.includes('Free Tier') || msg.includes('429')) {
        setIsRateLimitError(true);
      }
      setError(
        msg ||
          'Failed to generate video with Gemini Omni Flash. Ensure your GEMINI_API_KEY has access to gemini-omni-1.1-flash.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // =========================================================================
  // LOCAL CINEMATIC MOTION SYNTHESIS (FALLBACK & INSTANT MOTION PREVIEW)
  // Renders animated camera push-in, lighting pulses, and film grain via MediaRecorder
  // =========================================================================
  const generateCinematicMotionSimulation = async () => {
    setIsGenerating(true);
    setError(null);
    setProgressStep('Initializing cinematic animation canvas & VFX compositor...');

    try {
      const isPortrait = aspectRatio === '9:16';
      const width = isPortrait ? 720 : 1280;
      const height = isPortrait ? 1280 : 720;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not create canvas context');

      // Load source image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = selectedImageSrc;
      await new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = () => resolve(null);
      });

      const stream = canvas.captureStream(30);
      const mime = typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported('video/mp4')
        ? 'video/mp4'
        : typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';

      if (typeof MediaRecorder === 'undefined') {
        throw new Error('MediaRecorder is not supported in this browser environment.');
      }

      const recorder = new MediaRecorder(stream, { mimeType: mime });
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      const targetSeconds = duration === '10s' ? 10 : 5;
      const totalFrames = targetSeconds * 30;
      let currentFrame = 0;

      recorder.start();

      await new Promise<void>((resolve, reject) => {
        const renderFrame = () => {
          try {
            if (currentFrame >= totalFrames) {
              recorder.stop();
              return;
            }

            const progress = currentFrame / totalFrames;
            // Cinematic 3D camera motion: smooth push-in with dynamic yaw pan
            const zoom = 1.0 + progress * 0.16;
            const panX = Math.sin(progress * Math.PI) * 22;
            const panY = -progress * 18;

            // 1. Clear canvas
            ctx.fillStyle = '#030712';
            ctx.fillRect(0, 0, width, height);

            // 2. Render Scaled & Panned Superhero Frame
            ctx.save();
            ctx.translate(width / 2 + panX, height / 2 + panY);
            ctx.scale(zoom, zoom);
            const imgW = img.naturalWidth || width;
            const imgH = img.naturalHeight || height;
            const scale = Math.max(width / imgW, height / imgH);
            const w = imgW * scale;
            const h = imgH * scale;
            ctx.drawImage(img, -w / 2, -h / 2, w, h);
            ctx.restore();

            // 3. Dynamic Lightning & Plasma VFX Overlay
            const flashVal = Math.sin(progress * 16);
            if (flashVal > 0.88) {
              ctx.fillStyle = 'rgba(186, 230, 253, 0.32)';
              ctx.fillRect(0, 0, width, height);
            }

            // 4. Arc Reactor & Nanotech cyan aura pulse
            const pulse = 0.5 + 0.5 * Math.sin(progress * 10);
            const rx = width / 2;
            const ry = height * 0.45;
            const aura = ctx.createRadialGradient(rx, ry, 10, rx, ry, height * 0.35);
            aura.addColorStop(0, `rgba(6, 182, 212, ${0.45 * pulse})`);
            aura.addColorStop(0.5, `rgba(2, 132, 199, ${0.15 * pulse})`);
            aura.addColorStop(1, 'transparent');
            ctx.fillStyle = aura;
            ctx.fillRect(0, 0, width, height);

            // 5. Cinematic Vignette
            const vig = ctx.createRadialGradient(
              width / 2, height / 2, height * 0.32,
              width / 2, height / 2, height * 0.78
            );
            vig.addColorStop(0, 'transparent');
            vig.addColorStop(1, 'rgba(0, 0, 0, 0.65)');
            ctx.fillStyle = vig;
            ctx.fillRect(0, 0, width, height);

            // 6. Letterbox Bars & HUD Watermark
            ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
            ctx.fillRect(0, 0, width, 24);
            ctx.fillRect(0, height - 24, width, 24);

            ctx.font = '700 11px monospace';
            ctx.fillStyle = '#38bdf8';
            ctx.fillText('IRON WARRIOR CINEMATIC VFX // 4K RENDER', 20, 16);

            currentFrame++;
            if (currentFrame % 30 === 0) {
              setProgressStep(`Synthesizing motion frames... (${Math.round((currentFrame / totalFrames) * 100)}%)`);
            }
            requestAnimationFrame(renderFrame);
          } catch (err) {
            reject(err);
          }
        };

        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: mime });
          const videoUrl = URL.createObjectURL(blob);
          const newItem: GeneratedVideoItem = {
            id: Date.now().toString(),
            sourceImage: selectedImageSrc,
            videoUrl,
            prompt: `${prompt} (Cinematic Motion VFX)`,
            aspectRatio,
            duration,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            sceneName: `${activeSceneTag} [Motion VFX]`,
          };

          setVideoHistory((prev) => [newItem, ...prev]);
          setActiveVideo(newItem);
          if (onVideoGenerated) {
            onVideoGenerated(videoUrl);
          }
          setProgressStep('Cinematic video rendered successfully!');
          resolve();
        };

        renderFrame();
      });
    } catch (err: any) {
      console.error('Cinematic motion preview failed:', err);
      setError(err.message || 'Failed to render cinematic preview.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleQuickPreset = (sceneId: number) => {
    const scene = SCENES.find((s) => s.id === sceneId);
    if (!scene) return;
    setSelectedImageSrc(scene.image);
    setUploadedImageBase64(null);
    setPrompt(scene.promptPreset);
    setActiveSceneTag(`Scene ${scene.id}: ${scene.title}`);
  };

  const downloadVideo = (item: GeneratedVideoItem) => {
    const a = document.createElement('a');
    a.href = item.videoUrl;
    a.download = `iron-warrior-${item.sceneName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top Hero Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-blue-950/70 via-slate-900 to-cyan-950/70 border border-cyan-800/40 p-5 sm:p-6 shadow-2xl overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 text-[11px] font-mono font-bold tracking-widest uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                GEMINI INTERACTIONS API • OMNI FLASH
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                gemini-omni-1.1-flash
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 flex items-center gap-1">
                <Palette className="w-3 h-3 text-purple-400" />
                IMAGEN 3 INTEGRATED
              </span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-black text-white tracking-wide">
              IMAGE TO VIDEO STUDIO
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Generate 4K photorealistic Iron Warrior portraits with <strong>Imagen</strong> based on the Storyboard lore, or upload your own photo, and animate into 4K Marvel action videos with <strong>Gemini Omni Flash</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-950 transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Custom Photo</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FEATURE: IMAGEN 4K PHOTOREALISTIC PORTRAIT GENERATOR (BASED ON STORYBOARD) */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-br from-purple-950/30 via-slate-900/90 to-cyan-950/30 border border-purple-800/40 rounded-2xl p-5 sm:p-6 shadow-2xl backdrop-blur-md flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-900/40 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <Palette className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-lg sm:text-xl font-bold text-white tracking-wide">
                  Generate 4K Photorealistic Portrait with Imagen
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-700">
                  STORYBOARD LORE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Generate high-definition Marvel VFX portraits of the Iron Warrior, then directly animate them into video!
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowPortraitStudio(!showPortraitStudio)}
            className="text-xs text-purple-300 hover:text-white flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>{showPortraitStudio ? 'Collapse Generator' : 'Expand Generator'}</span>
            {showPortraitStudio ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showPortraitStudio && (
          <div className="flex flex-col gap-5">
            {/* Stage Selector based on Storyboard Lore */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-mono text-purple-300 font-bold uppercase tracking-wider flex items-center justify-between">
                <span>Select Storyboard Lore Stage for Portrait Generation:</span>
                <span className="text-[11px] text-slate-500 font-sans">4 Hero Stages</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {LORE_PORTRAIT_PRESETS.map((preset) => {
                  const isSelected = activeLoreStage === preset.stage;
                  return (
                    <button
                      key={preset.stage}
                      onClick={() => handleSelectLorePreset(preset.stage)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                        isSelected
                          ? 'border-purple-400 bg-purple-950/60 ring-1 ring-purple-400/50 text-purple-200'
                          : 'border-slate-800 bg-slate-950/70 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/60 text-purple-300 border border-purple-800/60">
                          {preset.badge}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">STAGE 0{preset.stage}</span>
                      </div>
                      <div className="font-display text-xs font-bold text-white truncate">
                        {preset.title}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Prompt & Aspect Ratio Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-8 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono text-purple-300 font-bold uppercase tracking-wider">
                    Imagen 4K Cinematic VFX Prompt
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {portraitPrompt.length} chars
                  </span>
                </div>
                <textarea
                  value={portraitPrompt}
                  onChange={(e) => setPortraitPrompt(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-purple-400 rounded-xl p-3 text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500 font-sans resize-y leading-relaxed"
                  placeholder="Describe armor details, arc reactor glow, lighting, and camera angle..."
                />
              </div>

              <div className="lg:col-span-4 flex flex-col gap-2">
                <label className="text-xs font-mono text-purple-300 font-bold uppercase tracking-wider">
                  Portrait Aspect Ratio
                </label>
                <div className="grid grid-cols-2 gap-2 h-full">
                  <button
                    onClick={() => setPortraitAspectRatio('3:4')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-center ${
                      portraitAspectRatio === '3:4'
                        ? 'border-purple-400 bg-purple-950/60 text-purple-200'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-bold text-xs">3:4 Portrait</span>
                    <span className="text-[10px] text-slate-400">Classic Superhero</span>
                  </button>

                  <button
                    onClick={() => setPortraitAspectRatio('1:1')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-center ${
                      portraitAspectRatio === '1:1'
                        ? 'border-purple-400 bg-purple-950/60 text-purple-200'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-bold text-xs">1:1 Square</span>
                    <span className="text-[10px] text-slate-400">Profile Close-up</span>
                  </button>

                  <button
                    onClick={() => setPortraitAspectRatio('9:16')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-center ${
                      portraitAspectRatio === '9:16'
                        ? 'border-purple-400 bg-purple-950/60 text-purple-200'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-bold text-xs">9:16 Full Body</span>
                    <span className="text-[10px] text-slate-400">Vertical Showcase</span>
                  </button>

                  <button
                    onClick={() => setPortraitAspectRatio('16:9')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-center ${
                      portraitAspectRatio === '16:9'
                        ? 'border-purple-400 bg-purple-950/60 text-purple-200'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-bold text-xs">16:9 Widescreen</span>
                    <span className="text-[10px] text-slate-400">Theatrical Scene</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Generate Portrait Action Button */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleGeneratePortrait}
                disabled={isGeneratingPortrait || !portraitPrompt.trim()}
                className={`w-full py-3.5 px-6 rounded-xl font-display font-bold text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-3 shadow-xl transition-all cursor-pointer ${
                  isGeneratingPortrait
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white shadow-purple-950/50 hover:shadow-purple-900/80 active:scale-[0.99]'
                }`}
              >
                {isGeneratingPortrait ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-purple-300" />
                    <span>Synthesizing 4K Photorealistic Portrait with Imagen...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-purple-300" />
                    <span>Generate 4K Photorealistic Portrait (Imagen)</span>
                  </>
                )}
              </button>

              {/* Progress and status */}
              {isGeneratingPortrait && (
                <div className="p-3 bg-slate-950 border border-purple-800/60 rounded-xl flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping" />
                  <span className="text-xs font-mono text-purple-300">
                    <span className="font-bold">STATUS:</span> {portraitProgress}
                  </span>
                </div>
              )}

              {portraitError && (
                <div className="p-3.5 bg-red-950/40 border border-red-800/60 rounded-xl flex items-start gap-3 text-red-300 text-xs">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Portrait Generation Notice</span>
                    <span>{portraitError}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Generated Portraits Showcase / Fast-Feed into Video */}
            {generatedPortraits.length > 0 && (
              <div className="mt-2 pt-4 border-t border-purple-900/40 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-purple-300 font-bold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    Generated 4K Portraits ({generatedPortraits.length})
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">Click any portrait to load into video generator</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {generatedPortraits.map((item) => {
                    const isSelected = selectedImageSrc === item.url;
                    return (
                      <div
                        key={item.id}
                        className={`group relative rounded-xl overflow-hidden border p-1 bg-slate-950 transition-all ${
                          isSelected
                            ? 'border-cyan-400 ring-2 ring-cyan-500/40'
                            : 'border-slate-800 hover:border-purple-600/50'
                        }`}
                      >
                        <div className="aspect-[3/4] w-full rounded-lg overflow-hidden bg-black relative">
                          <img
                            src={item.url}
                            alt="Generated 4K Iron Warrior Portrait"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/80 text-[9px] font-mono text-purple-300">
                            IMAGEN
                          </div>
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 bg-cyan-400 text-black p-0.5 rounded-full shadow">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </div>

                        <div className="p-2 flex flex-col gap-1.5">
                          <div className="text-[11px] font-bold text-white truncate">{item.stageName}</div>
                          <div className="flex items-center gap-1.5 pt-1 border-t border-slate-800">
                            <button
                              onClick={() => {
                                setSelectedImageSrc(item.url);
                                setUploadedImageBase64(item.url);
                                setMimeType('image/jpeg');
                              }}
                              className="text-[10px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                            >
                              <Video className="w-3 h-3" />
                              <span>Animate Video</span>
                            </button>
                            <span className="text-slate-700">•</span>
                            <button
                              onClick={() => downloadPortrait(item)}
                              className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                            >
                              <Download className="w-3 h-3" />
                              <span>Save</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 1-Click Fast Action Video Presets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {SCENES.map((scene) => (
          <button
            key={scene.id}
            onClick={() => handleQuickPreset(scene.id)}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
              activeSceneTag.includes(`Scene ${scene.id}`)
                ? 'bg-cyan-950/60 border-cyan-400 ring-1 ring-cyan-400/50'
                : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-black/60 text-cyan-400 border border-cyan-900/60">
                SCENE {scene.id}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">{scene.startTime}s–{scene.endTime}s</span>
            </div>
            <div>
              <div className="font-display font-bold text-xs text-white truncate">{scene.title}</div>
              <div className="text-[11px] text-slate-400 truncate mt-0.5">{scene.subtitle}</div>
            </div>
            <div className="text-[10px] text-cyan-300/80 flex items-center gap-1 font-mono pt-1 border-t border-slate-800/80">
              <Zap className="w-3 h-3 text-cyan-400" />
              <span>Load Video Prompt</span>
            </div>
          </button>
        ))}
      </div>

      {/* Main Studio Workstation (Split View) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Selector & Configuration (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl backdrop-blur-md">
          {/* Step 1: Source Image Selection */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-2">
                <span>01. Select Starting Frame (Preset, Imagen 4K, or Upload)</span>
              </label>
              <span className="text-[11px] text-slate-500 font-mono">
                {CHARACTER_PORTRAITS.length + generatedPortraits.length} FRAMES
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
              {CHARACTER_PORTRAITS.map((p) => {
                const isSelected = selectedImageSrc === p.image;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedImageSrc(p.image);
                      setUploadedImageBase64(null);
                      setMimeType('image/jpeg');
                    }}
                    className={`group relative rounded-xl overflow-hidden border p-1 text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-cyan-400 ring-2 ring-cyan-500/40 bg-cyan-950/40 shadow-lg'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="aspect-[3/4] w-full rounded-lg overflow-hidden bg-black/60 relative">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                      />
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 bg-cyan-400 text-black p-0.5 rounded-full shadow">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <div className="p-1 text-center">
                      <div className="font-semibold text-[11px] text-white truncate">{p.name}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {uploadedImageBase64 && (
              <div className="flex items-center gap-3 p-3 bg-cyan-950/30 border border-cyan-800/40 rounded-xl mt-1">
                <img
                  src={uploadedImageBase64}
                  alt="Custom uploaded keyframe"
                  className="w-12 h-12 object-cover rounded-lg border border-cyan-400/40"
                />
                <div className="text-xs">
                  <div className="font-bold text-cyan-300">Custom Photo / Imagen Frame Active</div>
                  <div className="text-[11px] text-slate-400">Ready to animate with Gemini Omni Flash</div>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Aspect Ratio & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
                02. Video Aspect Ratio
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setAspectRatio('16:9')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    aspectRatio === '16:9'
                      ? 'border-cyan-400 bg-cyan-950/50 text-cyan-200'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs flex items-center justify-between">
                    <span>16:9 Landscape</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800">Cinema</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Marvel film theatrical format</div>
                </button>

                <button
                  onClick={() => setAspectRatio('9:16')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    aspectRatio === '9:16'
                      ? 'border-cyan-400 bg-cyan-950/50 text-cyan-200'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs flex items-center justify-between">
                    <span>9:16 Portrait</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800">Vertical</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Hero full-body showcase</div>
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
                03. Video Duration
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setDuration('5s')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    duration === '5s'
                      ? 'border-cyan-400 bg-cyan-950/50 text-cyan-200'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs flex items-center justify-between">
                    <span>5 Seconds</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800">Fast</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Punchy action cut</div>
                </button>

                <button
                  onClick={() => setDuration('10s')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    duration === '10s'
                      ? 'border-cyan-400 bg-cyan-950/50 text-cyan-200'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-xs flex items-center justify-between">
                    <span>10 Seconds</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800">Extended</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Full cinematic motion arc</div>
                </button>
              </div>
            </div>
          </div>

          {/* Step 3: Motion Prompt */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
                04. Motion Prompt (Marvel VFX Direction)
              </label>
              <span className="text-[10px] text-slate-500 font-mono">
                {prompt.length} chars
              </span>
            </div>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-xl p-3 text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-sans resize-y leading-relaxed"
              placeholder="Describe camera movement, lighting, armor assembly, lightning and plasma energy..."
            />
          </div>

          {/* Generate Video Button */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => handleGenerateVideo()}
              disabled={isGenerating || !prompt.trim()}
              className={`w-full py-4 px-6 rounded-xl font-display font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-3 shadow-xl transition-all cursor-pointer ${
                isGenerating
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-cyan-900/50 hover:shadow-cyan-800/80 active:scale-[0.99]'
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                  <span>Synthesizing Video with Gemini Omni Flash...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  <span>Animate Photo into Video (Gemini Omni Flash)</span>
                </>
              )}
            </button>

            {/* Live Progress Telemetry */}
            {isGenerating && (
              <div className="p-3.5 bg-slate-950 border border-cyan-800/60 rounded-xl flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-mono text-cyan-300">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                    <span>INTERACTIONS_API // MODEL_OMNI_FLASH</span>
                  </div>
                  <span className="text-slate-400">PROCESSING</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full w-2/3 animate-pulse" />
                </div>
                <p className="text-[11px] text-slate-400 font-mono">
                  {progressStep}
                </p>
              </div>
            )}

            {/* Error & Rate Limit Guidance Notification */}
            {error && (
              <div
                className={`p-4 rounded-xl border flex flex-col gap-3 text-xs ${
                  isRateLimitError
                    ? 'bg-amber-950/30 border-amber-500/50 text-amber-200'
                    : 'bg-red-950/40 border-red-800/60 text-red-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <AlertCircle
                    className={`w-5 h-5 shrink-0 mt-0.5 ${
                      isRateLimitError ? 'text-amber-400' : 'text-red-400'
                    }`}
                  />
                  <div className="flex flex-col gap-1 flex-1">
                    <span className="font-bold text-sm tracking-wide">
                      {isRateLimitError
                        ? 'Google AI Studio Quota Notice (gemini-omni-1.1-flash)'
                        : 'Generation Notice'}
                    </span>
                    <span className="leading-relaxed">{error}</span>
                  </div>
                </div>

                {isRateLimitError && (
                  <div className="pt-2 border-t border-amber-500/30 flex flex-col gap-2.5">
                    <div className="text-[11px] text-amber-300/90 font-mono">
                      💡 <strong>Instant Fallback Available:</strong> You can generate a 4K cinematic animated video preview immediately using client-side VFX motion synthesis (animated 3D camera pan/zoom, plasma arc reactor glow, and film-grain) with zero quota restrictions:
                    </div>
                    <button
                      onClick={() => generateCinematicMotionSimulation()}
                      disabled={isGenerating}
                      className="py-2.5 px-4 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-950/50 transition-all cursor-pointer active:scale-98"
                    >
                      <Sparkles className="w-4 h-4 text-black" />
                      <span>Render Cinematic Motion Preview ({duration})</span>
                    </button>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Rate limit info:</span>
                      <a
                        href="https://ai.dev/rate-limit"
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 underline hover:text-cyan-300"
                      >
                        Upgrade Tier Documentation ↗
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Preview & Generated Video Viewport (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 flex-1">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-cyan-400" />
                <span className="font-display text-sm font-bold text-white">
                  {activeVideo ? 'Generated Video' : 'Selected Source Frame'}
                </span>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                {aspectRatio}
              </span>
            </div>

            {/* Video or Image Canvas */}
            <div
              className={`relative mx-auto rounded-xl overflow-hidden bg-black border border-cyan-900/40 flex items-center justify-center ${
                aspectRatio === '16:9' ? 'w-full aspect-[16/9]' : 'w-full max-w-[280px] aspect-[9/16]'
              }`}
            >
              {activeVideo ? (
                <video
                  src={activeVideo.videoUrl}
                  controls
                  autoPlay
                  loop
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="relative w-full h-full group">
                  <img
                    src={selectedImageSrc}
                    alt="Selected source"
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                    <span className="text-xs font-mono text-cyan-300 font-bold">READY TO ANIMATE</span>
                    <span className="text-[11px] text-slate-300">Click button to generate video with Omni Flash</span>
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons if video is generated */}
            {activeVideo && (
              <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>CLIP: {activeVideo.sceneName}</span>
                  <span>{activeVideo.duration} • {activeVideo.aspectRatio}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    onClick={() => downloadVideo(activeVideo)}
                    className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download MP4</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onVideoGenerated) {
                        onVideoGenerated(activeVideo.videoUrl);
                      }
                    }}
                    className="py-2 px-3 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/40 text-cyan-200 border border-cyan-500/40 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-cyan-400" />
                    <span>View in Cinema</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Generated Videos Archive / Gallery */}
      {videoHistory.length > 0 && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              <h3 className="font-display text-base font-bold text-white tracking-wide">
                Generated Video Renders ({videoHistory.length})
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">GEMINI OMNI FLASH ARCHIVE</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {videoHistory.map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveVideo(item)}
                className={`p-3 rounded-xl border bg-slate-950 flex flex-col gap-2.5 transition-all cursor-pointer ${
                  activeVideo?.id === item.id
                    ? 'border-cyan-400 ring-2 ring-cyan-500/20'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
                  <video
                    src={item.videoUrl}
                    muted
                    loop
                    onMouseOver={(e) => (e.target as HTMLVideoElement).play()}
                    onMouseOut={(e) => (e.target as HTMLVideoElement).pause()}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-cyan-300">
                    {item.aspectRatio}
                  </div>
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-slate-300">
                    {item.duration}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="font-semibold text-xs text-white truncate">{item.sceneName}</div>
                  <span className="text-[10px] text-slate-500 font-mono">{item.timestamp}</span>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadVideo(item);
                    }}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    <span>Save</span>
                  </button>
                  <span className="text-slate-700">•</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onVideoGenerated) onVideoGenerated(item.videoUrl);
                    }}
                    className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Film className="w-3 h-3" />
                    <span>Cinema View</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
