/**
 * Cinematic Web Audio Procedural Sound Engine
 * Provides authentic Marvel-trailer cinematic sound effects (Braam, metallic armor locks,
 * lightning thunder, repulsor blast, reactor ignition, and cyber telemetry)
 */

class CinematicAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.85, this.ctx.currentTime, 0.05);
    }
  }

  public setMasterVolume(volume: number) {
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime, 0.05);
    }
  }

  /**
   * Deep Cinematic Trailer "BRAAM" / Bass Hit (0–6s, 12–22s, 22–30s)
   */
  public playCinematicBraam(intensity: number = 1.0) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;

    // Sub-bass oscillator
    const subOsc = this.ctx.createOscillator();
    subOsc.type = 'sawtooth';
    subOsc.frequency.setValueAtTime(55, t);
    subOsc.frequency.exponentialRampToValueAtTime(32, t + 1.8);

    // Brass-like overtone oscillator
    const brassOsc = this.ctx.createOscillator();
    brassOsc.type = 'triangle';
    brassOsc.frequency.setValueAtTime(110, t);
    brassOsc.frequency.exponentialRampToValueAtTime(65, t + 1.6);

    // Distortion / waveshaper for trailer grit
    const distortion = this.ctx.createWaveShaper();
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
      const x = (i * 2) / 256 - 1;
      curve[i] = (Math.PI + 4) * x / (Math.PI + 4 * Math.abs(x));
    }
    distortion.curve = curve;

    // Lowpass filter with sweeping resonance
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450 * intensity, t);
    filter.frequency.exponentialRampToValueAtTime(80, t + 2.2);
    filter.Q.setValueAtTime(4, t);

    // Envelope
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.9 * intensity, t + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 2.8);

    subOsc.connect(distortion);
    brassOsc.connect(distortion);
    distortion.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    subOsc.start(t);
    brassOsc.start(t);
    subOsc.stop(t + 2.9);
    brassOsc.stop(t + 2.9);
  }

  /**
   * Distant Thunder & Lightning Crack (Scene 1)
   */
  public playThunder() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 2.5;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(250, t);
    filter.frequency.linearRampToValueAtTime(70, t + 2.2);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.7, t + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 2.4);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    whiteNoise.start(t);
  }

  /**
   * Holographic Telemetry / Nanotech Digital Pulses (Scene 2)
   */
  public playNanotechActivation() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const pitches = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98];

    pitches.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const startTime = t + idx * 0.08;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, startTime + 0.15);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(startTime);
      osc.stop(startTime + 0.22);
    });
  }

  /**
   * Heavy Metallic Hydraulic Armor Clank / Lock (Scene 3)
   */
  public playArmorLock() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;

    // Metallic ring (High Q bandpass)
    const osc = this.ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(840, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.28);

    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(1200, t);
    bp.Q.setValueAtTime(9, t);

    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.4, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(bp);
    bp.connect(oscGain);
    oscGain.connect(this.masterGain);

    // Mechanical low thud
    const thud = this.ctx.createOscillator();
    thud.type = 'triangle';
    thud.frequency.setValueAtTime(160, t);
    thud.frequency.exponentialRampToValueAtTime(45, t + 0.2);

    const thudGain = this.ctx.createGain();
    thudGain.gain.setValueAtTime(0.7, t);
    thudGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    thud.connect(thudGain);
    thudGain.connect(this.masterGain);

    osc.start(t);
    thud.start(t);
    osc.stop(t + 0.36);
    thud.stop(t + 0.26);
  }

  /**
   * Arc Reactor Power Core Ignition (Scene 3)
   */
  public playReactorIgnition() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;

    // Rising high-pitch turbine whine
    const turbine = this.ctx.createOscillator();
    turbine.type = 'sine';
    turbine.frequency.setValueAtTime(120, t);
    turbine.frequency.exponentialRampToValueAtTime(1800, t + 1.2);

    const turbineGain = this.ctx.createGain();
    turbineGain.gain.setValueAtTime(0.01, t);
    turbineGain.gain.linearRampToValueAtTime(0.35, t + 0.8);
    turbineGain.gain.exponentialRampToValueAtTime(0.05, t + 2.0);

    turbine.connect(turbineGain);
    turbineGain.connect(this.masterGain);

    // Deep sub-hum
    const hum = this.ctx.createOscillator();
    hum.type = 'sawtooth';
    hum.frequency.setValueAtTime(60, t + 0.5);

    const humFilter = this.ctx.createBiquadFilter();
    humFilter.type = 'lowpass';
    humFilter.frequency.setValueAtTime(140, t);

    const humGain = this.ctx.createGain();
    humGain.gain.setValueAtTime(0.01, t + 0.5);
    humGain.gain.linearRampToValueAtTime(0.5, t + 1.2);
    humGain.gain.exponentialRampToValueAtTime(0.001, t + 2.6);

    hum.connect(humFilter);
    humFilter.connect(humGain);
    humGain.connect(this.masterGain);

    turbine.start(t);
    hum.start(t + 0.5);
    turbine.stop(t + 2.1);
    hum.stop(t + 2.7);
  }

  /**
   * Repulsor Energy Charge & Blast Propulsion (Scene 4)
   */
  public playRepulsorBlast() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;

    // High energy whine
    const charge = this.ctx.createOscillator();
    charge.type = 'sine';
    charge.frequency.setValueAtTime(400, t);
    charge.frequency.exponentialRampToValueAtTime(2600, t + 0.6);

    const chargeGain = this.ctx.createGain();
    chargeGain.gain.setValueAtTime(0.05, t);
    chargeGain.gain.linearRampToValueAtTime(0.4, t + 0.55);
    chargeGain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);

    charge.connect(chargeGain);
    chargeGain.connect(this.masterGain);

    // Blast noise burst
    const bufferSize = this.ctx.sampleRate * 1.5;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const blastFilter = this.ctx.createBiquadFilter();
    blastFilter.type = 'bandpass';
    blastFilter.frequency.setValueAtTime(800, t + 0.6);
    blastFilter.frequency.exponentialRampToValueAtTime(100, t + 1.8);
    blastFilter.Q.setValueAtTime(2, t);

    const blastGain = this.ctx.createGain();
    blastGain.gain.setValueAtTime(0.001, t);
    blastGain.gain.setValueAtTime(0.85, t + 0.6);
    blastGain.gain.exponentialRampToValueAtTime(0.001, t + 2.2);

    noise.connect(blastFilter);
    blastFilter.connect(blastGain);
    blastGain.connect(this.masterGain);

    charge.start(t);
    charge.stop(t + 0.75);
    noise.start(t + 0.6);
    noise.stop(t + 2.3);
  }

  /**
   * Subtle Metallic Transition Sound Effects for Scene Switching
   * Generates authentic Marvel-style metallic sliding whooshes, titanium latches,
   * pneumatic servo hisses, and resonant armor locks.
   */
  public playMetallicSceneTransition(toSceneId: number = 1) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;

    // 1. Subtle Metallic Sheath/Blade Slide Whoosh (Filtered White Noise Sweep)
    const noiseBufferSize = Math.floor(this.ctx.sampleRate * 0.35);
    const noiseBuffer = this.ctx.createBuffer(1, noiseBufferSize, this.ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBufferSize; i++) {
      noiseData[i] = Math.random() * 2 - 1;
    }
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(1400, t);
    noiseFilter.frequency.exponentialRampToValueAtTime(3800, t + 0.12);
    noiseFilter.frequency.exponentialRampToValueAtTime(900, t + 0.32);
    noiseFilter.Q.setValueAtTime(6.0, t); // High Q gives metallic resonance

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.001, t);
    noiseGain.gain.linearRampToValueAtTime(0.22, t + 0.05);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.34);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noiseSource.start(t);
    noiseSource.stop(t + 0.35);

    // 2. High-Tech Mechanical Titanium Click / Latch
    const clickOsc = this.ctx.createOscillator();
    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(toSceneId === 3 ? 1800 : 1200, t + 0.04);
    clickOsc.frequency.exponentialRampToValueAtTime(260, t + 0.16);

    const clickFilter = this.ctx.createBiquadFilter();
    clickFilter.type = 'highpass';
    clickFilter.frequency.setValueAtTime(800, t);

    const clickGain = this.ctx.createGain();
    clickGain.gain.setValueAtTime(0.001, t);
    clickGain.gain.setValueAtTime(0.28, t + 0.04);
    clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    clickOsc.connect(clickFilter);
    clickFilter.connect(clickGain);
    clickGain.connect(this.masterGain);
    clickOsc.start(t + 0.04);
    clickOsc.stop(t + 0.19);

    // 3. Subtle Metallic Ring / Harmonic Chime (Armor Resonance)
    const ringFreq = toSceneId === 3 ? 987.77 : toSceneId === 4 ? 1318.51 : 880;
    const ringOsc = this.ctx.createOscillator();
    ringOsc.type = 'sine';
    ringOsc.frequency.setValueAtTime(ringFreq, t + 0.06);

    const ringGain = this.ctx.createGain();
    ringGain.gain.setValueAtTime(0.001, t);
    ringGain.gain.linearRampToValueAtTime(0.12, t + 0.07);
    ringGain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    ringOsc.connect(ringGain);
    ringGain.connect(this.masterGain);
    ringOsc.start(t + 0.06);
    ringOsc.stop(t + 0.46);

    // 4. Scene 3 Specific: Secondary hydraulic armor plate latch
    if (toSceneId === 3) {
      const snapOsc = this.ctx.createOscillator();
      snapOsc.type = 'square';
      snapOsc.frequency.setValueAtTime(620, t + 0.14);
      snapOsc.frequency.exponentialRampToValueAtTime(90, t + 0.28);

      const snapFilter = this.ctx.createBiquadFilter();
      snapFilter.type = 'bandpass';
      snapFilter.frequency.setValueAtTime(1600, t + 0.14);
      snapFilter.Q.setValueAtTime(4, t);

      const snapGain = this.ctx.createGain();
      snapGain.gain.setValueAtTime(0.001, t);
      snapGain.gain.setValueAtTime(0.3, t + 0.14);
      snapGain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

      snapOsc.connect(snapFilter);
      snapFilter.connect(snapGain);
      snapGain.connect(this.masterGain);
      snapOsc.start(t + 0.14);
      snapOsc.stop(t + 0.31);
    }
  }

  /**
   * Speak dialogue with speech synthesis (fallback if Gemini TTS is buffering)
   */
  public speakDialogue(text: string, voiceType: 'warrior' | 'ai') {
    if (this.isMuted || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = voiceType === 'ai' ? 0.95 : 0.85;
      utterance.pitch = voiceType === 'ai' ? 0.8 : 0.65;
      utterance.volume = 0.95;

      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        if (voiceType === 'ai') {
          const robotVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Zira'));
          if (robotVoice) utterance.voice = robotVoice;
        } else {
          const maleVoice = voices.find(v => v.name.includes('Daniel') || v.name.includes('David') || v.name.includes('Alex') || v.name.includes('Guy'));
          if (maleVoice) utterance.voice = maleVoice;
        }
      }
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis notice:', e);
    }
  }
}

export const audioEngine = new CinematicAudioEngine();
