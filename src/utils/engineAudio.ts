/**
 * Realistic Web Audio API Engine Synthesizer
 * 
 * Generates an authentic, high-fidelity car engine acoustic simulation:
 * - Multi-harmonic cylinder firing pulses (primary + stereo-detuned secondary)
 * - Deep sub-bass exhaust drone for low-end combustion rumble
 * - Dynamic throttle aggression: pitch surges sharply as the car accelerates
 * - Realistic 6-speed transmission simulation with acoustic gear shift drops
 * - Resonant exhaust manifold & variable intake filter (sweeps from 220Hz to 4200Hz)
 * - Soft-clipping combustion waveshaper distortion for throaty engine rasp
 * - High-speed turbocharger turbine spool & blow-off valve (BOV) flutter on throttle release
 */

export class EngineAudio {
  private ctx: AudioContext | null = null;
  private isRunning: boolean = false;
  private isMuted: boolean = false;

  // Audio Nodes
  private primaryOsc: OscillatorNode | null = null;
  private secondaryOsc: OscillatorNode | null = null;
  private subOsc: OscillatorNode | null = null;
  private turboOsc: OscillatorNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private intakeFilterNode: BiquadFilterNode | null = null;
  private distortionNode: WaveShaperNode | null = null;
  private masterGain: GainNode | null = null;
  private turboGain: GainNode | null = null;

  // Real-time acoustic tracking states
  private currentRpm: number = 850; // Idle RPM
  private targetRpm: number = 850;
  private wasAccelerating: boolean = false;
  private currentGearIndex: number = 0;
  private volumeMultiplier: number = 1.0;

  constructor() {
    // Lazily initialized on first user gesture
  }

  /**
   * Initializes or resumes the AudioContext safely
   */
  private initContext(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  /**
   * Generates a warm non-linear saturation curve for throaty combustion rasp
   */
  private makeDistortionCurve(amount: number = 24): Float32Array {
    const k = amount;
    const nSamples = 44100;
    const curve = new Float32Array(nSamples);
    const deg = Math.PI / 180;

    for (let i = 0; i < nSamples; i++) {
      const x = (i * 2) / nSamples - 1;
      // Hyperbolic tangent-like smooth clipping curve
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  /**
   * Starts engine sound playback
   */
  public start(): void {
    if (this.isRunning) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // 1. Primary engine cylinder bank (sawtooth combustion pulses)
      this.primaryOsc = ctx.createOscillator();
      this.primaryOsc.type = 'sawtooth';
      this.primaryOsc.frequency.setValueAtTime(38, now); // ~850 RPM base firing frequency

      // 2. Secondary cylinder bank with acoustic detune (+5 cents) for realistic phase chorusing
      this.secondaryOsc = ctx.createOscillator();
      this.secondaryOsc.type = 'sawtooth';
      this.secondaryOsc.frequency.setValueAtTime(38, now);
      this.secondaryOsc.detune.setValueAtTime(6.5, now);

      // 3. Sub-bass oscillator for chest-thumping low-end exhaust rumble
      this.subOsc = ctx.createOscillator();
      this.subOsc.type = 'triangle';
      this.subOsc.frequency.setValueAtTime(19, now);

      // 4. Turbocharger whistle oscillator (high-frequency spool)
      this.turboOsc = ctx.createOscillator();
      this.turboOsc.type = 'sine';
      this.turboOsc.frequency.setValueAtTime(1400, now);

      this.turboGain = ctx.createGain();
      this.turboGain.gain.setValueAtTime(0, now);
      this.turboOsc.connect(this.turboGain);

      // 5. Waveshaper distortion node for combustion rasp
      this.distortionNode = ctx.createWaveShaper();
      this.distortionNode.curve = this.makeDistortionCurve(22) as unknown as Float32Array<ArrayBuffer>;
      this.distortionNode.oversample = '2x';

      // 6. Dual-stage resonant filters:
      // A. Exhaust manifold lowpass
      this.filterNode = ctx.createBiquadFilter();
      this.filterNode.type = 'lowpass';
      this.filterNode.frequency.setValueAtTime(280, now);
      this.filterNode.Q.setValueAtTime(3.8, now);

      // B. Resonant intake roar bandpass
      this.intakeFilterNode = ctx.createBiquadFilter();
      this.intakeFilterNode.type = 'bandpass';
      this.intakeFilterNode.frequency.setValueAtTime(450, now);
      this.intakeFilterNode.Q.setValueAtTime(2.2, now);

      // 7. Master Gain node
      this.masterGain = ctx.createGain();
      const initialVol = this.isMuted ? 0 : 0.08 * this.volumeMultiplier;
      this.masterGain.gain.setValueAtTime(initialVol, now);

      // Audio Graph Routing:
      // [primaryOsc + secondaryOsc + subOsc] -> distortion -> [filterNode + intakeFilterNode] -> masterGain -> destination
      // turboGain -> masterGain -> destination
      this.primaryOsc.connect(this.distortionNode);
      this.secondaryOsc.connect(this.distortionNode);
      this.subOsc.connect(this.distortionNode);

      this.distortionNode.connect(this.filterNode);
      this.filterNode.connect(this.masterGain);

      this.distortionNode.connect(this.intakeFilterNode);
      this.intakeFilterNode.connect(this.masterGain);

      this.turboGain.connect(this.masterGain);
      this.masterGain.connect(ctx.destination);

      // Start all oscillators
      this.primaryOsc.start(now);
      this.secondaryOsc.start(now);
      this.subOsc.start(now);
      this.turboOsc.start(now);

      this.isRunning = true;
    } catch {
      this.isRunning = false;
    }
  }

  /**
   * Triggers a realistic turbo blow-off valve (BOV) air release flutter
   */
  private triggerBlowOffValve(): void {
    if (!this.ctx || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.28);
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);

      // Filtered noise with fluttering envelope
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.08));
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const bovFilter = this.ctx.createBiquadFilter();
      bovFilter.type = 'bandpass';
      bovFilter.frequency.setValueAtTime(3200, now);
      bovFilter.frequency.exponentialRampToValueAtTime(1400, now + 0.25);
      bovFilter.Q.setValueAtTime(3.5, now);

      const bovGain = this.ctx.createGain();
      bovGain.gain.setValueAtTime(0.045 * this.volumeMultiplier, now);
      bovGain.gain.exponentialRampToValueAtTime(0.001, now + 0.27);

      noiseSource.connect(bovFilter);
      bovFilter.connect(bovGain);
      bovGain.connect(this.ctx.destination);

      noiseSource.start(now);
      noiseSource.stop(now + 0.28);
    } catch {}
  }

  /**
   * Updates RPM and audio pitch based on normalized speed (0.0 to 1.0+) and driving state.
   * Pitch and intensity surge sharply as the car accelerates!
   */
  public update(speedNormalized: number, isAccelerating: boolean = false, isNitro: boolean = false): void {
    if (!this.ctx || !this.isRunning || !this.primaryOsc || !this.filterNode || !this.masterGain) {
      return;
    }

    if (this.isMuted) {
      this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
      return;
    }

    const clampedSpeed = Math.max(0, Math.min(1.3, speedNormalized));

    // Simulated 6-speed high-performance racing transmission
    const gears = [
      { min: 0.00, max: 0.18, minRpm: 850,  maxRpm: 7200 }, // 1st gear
      { min: 0.18, max: 0.38, minRpm: 3400, maxRpm: 7500 }, // 2nd gear
      { min: 0.38, max: 0.58, minRpm: 3800, maxRpm: 7800 }, // 3rd gear
      { min: 0.58, max: 0.78, minRpm: 4200, maxRpm: 8200 }, // 4th gear
      { min: 0.78, max: 0.98, minRpm: 4600, maxRpm: 8600 }, // 5th gear
      { min: 0.98, max: 1.35, minRpm: 5000, maxRpm: 9200 }, // 6th gear
    ];

    let gearIdx = 0;
    for (let i = 0; i < gears.length; i++) {
      if (clampedSpeed >= gears[i].min && clampedSpeed <= gears[i].max) {
        gearIdx = i;
        break;
      }
      if (i === gears.length - 1 && clampedSpeed > gears[i].max) {
        gearIdx = i;
      }
    }
    const gear = gears[gearIdx];

    // Detect BOV blow-off valve trigger on throttle release
    if (this.wasAccelerating && !isAccelerating && (clampedSpeed > 0.4 || isNitro)) {
      this.triggerBlowOffValve();
    }
    this.wasAccelerating = isAccelerating;
    this.currentGearIndex = gearIdx;

    // Progress within current gear
    const gearSpan = gear.max - gear.min || 0.2;
    const gearProgress = Math.max(0, Math.min(1, (clampedSpeed - gear.min) / gearSpan));

    // Calculate base RPM
    let targetRpm = gear.minRpm + Math.pow(gearProgress, 1.1) * (gear.maxRpm - gear.minRpm);

    // Throttle response: pitch increases sharply with vehicle acceleration!
    if (isAccelerating) {
      targetRpm += 950 + clampedSpeed * 750;
    }
    // High-rev screamer when Nitro boost is engaged
    if (isNitro) {
      targetRpm += 1600;
    }

    // Dynamic smoothing: climbs fast under throttle, coasts down gradually
    const lerpRate = isAccelerating ? 0.32 : 0.18;
    this.targetRpm = Math.min(9400, targetRpm);
    this.currentRpm += (this.targetRpm - this.currentRpm) * lerpRate;

    // Convert RPM to base firing frequency (Hz)
    // 6-cylinder engine firing pulses: freq = (RPM / 60) * 3
    const baseFreq = Math.max(34, (this.currentRpm / 60) * 2.85);
    const subFreq = baseFreq * 0.5;

    // Filter frequencies open wide with RPM and throttle aggression
    const filterFreq = Math.min(4200, 260 + (this.currentRpm / 8500) * 2600 + (isAccelerating ? 800 : 0));
    const intakeFreq = Math.min(3200, 420 + (this.currentRpm / 8500) * 2000 + (isAccelerating ? 600 : 0));

    // Dynamic volume increases with speed and acceleration intensity
    const engineVolume = Math.min(
      0.22,
      (0.06 + clampedSpeed * 0.08 + (isAccelerating ? 0.04 : 0) + (isNitro ? 0.03 : 0)) * this.volumeMultiplier
    );

    const now = this.ctx.currentTime;
    const smoothTime = 0.04;

    try {
      this.primaryOsc.frequency.setTargetAtTime(baseFreq, now, smoothTime);

      if (this.secondaryOsc) {
        this.secondaryOsc.frequency.setTargetAtTime(baseFreq, now, smoothTime);
      }

      if (this.subOsc) {
        this.subOsc.frequency.setTargetAtTime(subFreq, now, smoothTime);
      }

      this.filterNode.frequency.setTargetAtTime(filterFreq, now, smoothTime);

      if (this.intakeFilterNode) {
        this.intakeFilterNode.frequency.setTargetAtTime(intakeFreq, now, smoothTime);
      }

      this.masterGain.gain.setTargetAtTime(engineVolume, now, smoothTime);

      // Turbocharger whistle modulation: pitch increases sharply with speed & nitro
      if (this.turboOsc && this.turboGain) {
        if (isNitro || (isAccelerating && clampedSpeed > 0.35)) {
          const turboFreq = 1800 + clampedSpeed * 2600 + (isNitro ? 1200 : 0);
          const turboVol = (isNitro ? 0.065 : clampedSpeed * 0.035) * this.volumeMultiplier;
          this.turboOsc.frequency.setTargetAtTime(turboFreq, now, 0.06);
          this.turboGain.gain.setTargetAtTime(turboVol, now, 0.06);
        } else {
          this.turboGain.gain.setTargetAtTime(0, now, 0.12);
        }
      }
    } catch {}
  }

  /**
   * Stops engine sound playback
   */
  public stop(): void {
    if (!this.ctx || !this.isRunning) return;

    try {
      const now = this.ctx.currentTime;
      if (this.masterGain) {
        this.masterGain.gain.setTargetAtTime(0, now, 0.05);
      }

      setTimeout(() => {
        try {
          this.primaryOsc?.stop();
          this.secondaryOsc?.stop();
          this.subOsc?.stop();
          this.turboOsc?.stop();

          this.primaryOsc?.disconnect();
          this.secondaryOsc?.disconnect();
          this.subOsc?.disconnect();
          this.turboOsc?.disconnect();
          this.distortionNode?.disconnect();
          this.filterNode?.disconnect();
          this.intakeFilterNode?.disconnect();
          this.masterGain?.disconnect();
          this.turboGain?.disconnect();
        } catch {}

        this.primaryOsc = null;
        this.secondaryOsc = null;
        this.subOsc = null;
        this.turboOsc = null;
        this.distortionNode = null;
        this.filterNode = null;
        this.intakeFilterNode = null;
        this.masterGain = null;
        this.turboGain = null;
        this.isRunning = false;
        this.currentRpm = 850;
      }, 70);
    } catch {
      this.isRunning = false;
    }
  }

  /**
   * Sets volume multiplier (0.0 to 1.0)
   */
  public setVolume(volume: number): void {
    this.volumeMultiplier = Math.max(0, Math.min(1, volume));
    if (this.ctx && this.masterGain && !this.isMuted) {
      this.masterGain.gain.setTargetAtTime(0.08 * this.volumeMultiplier, this.ctx.currentTime, 0.05);
    }
  }

  /**
   * Sets mute state
   */
  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.08 * this.volumeMultiplier, this.ctx.currentTime);
    }
  }

  /**
   * Returns whether engine audio is running
   */
  public getIsRunning(): boolean {
    return this.isRunning;
  }
}

// Global singleton instance for clean consumption
export const engineAudio = new EngineAudio();
