/**
 * EngineAudio: High-Fidelity Web Audio API Engine RPM Synthesizer
 * 
 * Simulates realistic car engine acoustics:
 * - Multi-harmonic cylinder firing pulses (sawtooth + triangle)
 * - Dynamic RPM modulation tied to vehicle speed & throttle
 * - 5-speed simulated transmission gear shifts (rises & drops during acceleration)
 * - Exhaust pipe resonance via resonant BiquadFilter
 * - Soft waveshaper distortion curve for throaty combustion growl
 * - High-speed turbocharger spool whistle during Nitro boost
 */

export class EngineAudio {
  private ctx: AudioContext | null = null;
  private isRunning: boolean = false;
  private isMuted: boolean = false;

  // Audio Nodes
  private primaryOsc: OscillatorNode | null = null;
  private subOsc: OscillatorNode | null = null;
  private turboOsc: OscillatorNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private distortionNode: WaveShaperNode | null = null;
  private masterGain: GainNode | null = null;
  private turboGain: GainNode | null = null;

  // Smoothing states
  private currentRpm: number = 850; // Idle RPM
  private targetRpm: number = 850;

  constructor() {
    // Context is created lazily on user gesture
  }

  /**
   * Initializes or resumes the AudioContext
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
   * Generates a soft sigmoid curve for realistic combustion distortion
   */
  private makeDistortionCurve(amount: number = 20): Float32Array {
    const k = amount;
    const nSamples = 44100;
    const curve = new Float32Array(nSamples);
    const deg = Math.PI / 180;

    for (let i = 0; i < nSamples; i++) {
      const x = (i * 2) / nSamples - 1;
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

      // 1. Primary engine oscillator (sawtooth cylinder pulses)
      this.primaryOsc = ctx.createOscillator();
      this.primaryOsc.type = 'sawtooth';
      this.primaryOsc.frequency.setValueAtTime(42, now); // ~850 RPM base frequency

      // 2. Sub-bass oscillator for low-end exhaust rumble
      this.subOsc = ctx.createOscillator();
      this.subOsc.type = 'triangle';
      this.subOsc.frequency.setValueAtTime(21, now);

      // 3. Turbocharger whistle oscillator (high-frequency spool)
      this.turboOsc = ctx.createOscillator();
      this.turboOsc.type = 'sine';
      this.turboOsc.frequency.setValueAtTime(1200, now);

      // 4. Turbo Gain Node
      this.turboGain = ctx.createGain();
      this.turboGain.gain.setValueAtTime(0, now);
      this.turboOsc.connect(this.turboGain);

      // 5. Waveshaper distortion node for combustion rasp
      this.distortionNode = ctx.createWaveShaper();
      this.distortionNode.curve = this.makeDistortionCurve(18) as unknown as Float32Array<ArrayBuffer>;
      this.distortionNode.oversample = '2x';

      // 6. Resonant lowpass filter simulating exhaust muffler & manifold
      this.filterNode = ctx.createBiquadFilter();
      this.filterNode.type = 'lowpass';
      this.filterNode.frequency.setValueAtTime(260, now);
      this.filterNode.Q.setValueAtTime(3.2, now);

      // 7. Master Gain node for volume control & mute
      this.masterGain = ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.08, now);

      // Routing:
      // primaryOsc & subOsc -> distortion -> filter -> masterGain -> destination
      // turboGain -> masterGain -> destination
      this.primaryOsc.connect(this.distortionNode);
      this.subOsc.connect(this.distortionNode);
      this.distortionNode.connect(this.filterNode);
      this.filterNode.connect(this.masterGain);
      this.turboGain.connect(this.masterGain);
      this.masterGain.connect(ctx.destination);

      // Start oscillators
      this.primaryOsc.start(now);
      this.subOsc.start(now);
      this.turboOsc.start(now);

      this.isRunning = true;
    } catch {
      this.isRunning = false;
    }
  }

  /**
   * Updates RPM and audio pitch based on normalized speed (0.0 to 1.0) and driving state
   * @param speedNormalized Ratio of current speed to top speed (0.0 to 1.0+)
   * @param isAccelerating Whether throttle is engaged
   * @param isNitro Whether nitro boost is active
   */
  public update(speedNormalized: number, isAccelerating: boolean = false, isNitro: boolean = false): void {
    if (!this.ctx || !this.isRunning || !this.primaryOsc || !this.filterNode || !this.masterGain) {
      return;
    }

    if (this.isMuted) {
      this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
      return;
    }

    const clampedSpeed = Math.max(0, Math.min(1.2, speedNormalized));

    // Simulated 5-speed transmission gear ratios
    // As the car gains speed, the gear shifts up, causing the RPM to climb and drop realistically
    const gears = [
      { min: 0.0, max: 0.22, minRpm: 900, maxRpm: 6800 },
      { min: 0.22, max: 0.44, minRpm: 3200, maxRpm: 7200 },
      { min: 0.44, max: 0.68, minRpm: 3600, maxRpm: 7400 },
      { min: 0.68, max: 0.88, minRpm: 4000, maxRpm: 7600 },
      { min: 0.88, max: 1.25, minRpm: 4400, maxRpm: 8200 },
    ];

    let gear = gears[0];
    for (let i = 0; i < gears.length; i++) {
      if (clampedSpeed >= gears[i].min && clampedSpeed <= gears[i].max) {
        gear = gears[i];
        break;
      }
      if (i === gears.length - 1 && clampedSpeed > gears[i].max) {
        gear = gears[i];
      }
    }

    // Progress within current gear
    const gearSpan = gear.max - gear.min || 0.2;
    const gearProgress = Math.max(0, Math.min(1, (clampedSpeed - gear.min) / gearSpan));

    // Calculate base RPM
    let targetRpm = gear.minRpm + gearProgress * (gear.maxRpm - gear.minRpm);

    // Throttle bump when accelerating
    if (isAccelerating) {
      targetRpm += 400;
    }
    // High-rev bump when Nitro is engaged
    if (isNitro) {
      targetRpm += 900;
    }

    // Smooth RPM interpolation
    this.targetRpm = targetRpm;
    this.currentRpm += (this.targetRpm - this.currentRpm) * 0.25;

    // Convert RPM to base firing frequency (Hz)
    // 6-cylinder 4-stroke engine: firing freq = (RPM / 60) * 3
    const baseFreq = Math.max(38, (this.currentRpm / 60) * 2.5);
    const subFreq = baseFreq * 0.5;

    // Resonant filter frequency opens with RPM & throttle
    const filterFreq = Math.min(3200, 240 + (this.currentRpm / 8000) * 1600 + (isAccelerating ? 350 : 0));

    // Dynamic engine volume (grows at high speed and throttle)
    const engineVolume = Math.min(0.18, 0.05 + clampedSpeed * 0.07 + (isAccelerating ? 0.03 : 0) + (isNitro ? 0.02 : 0));

    const now = this.ctx.currentTime;
    const smoothTime = 0.06;

    try {
      this.primaryOsc.frequency.setTargetAtTime(baseFreq, now, smoothTime);

      if (this.subOsc) {
        this.subOsc.frequency.setTargetAtTime(subFreq, now, smoothTime);
      }

      this.filterNode.frequency.setTargetAtTime(filterFreq, now, smoothTime);
      this.masterGain.gain.setTargetAtTime(engineVolume, now, smoothTime);

      // Turbocharger whistle modulation
      if (this.turboOsc && this.turboGain) {
        if (isNitro || clampedSpeed > 0.65) {
          const turboFreq = 1600 + clampedSpeed * 1800 + (isNitro ? 800 : 0);
          const turboVol = isNitro ? 0.06 : clampedSpeed * 0.025;
          this.turboOsc.frequency.setTargetAtTime(turboFreq, now, 0.08);
          this.turboGain.gain.setTargetAtTime(turboVol, now, 0.08);
        } else {
          this.turboGain.gain.setTargetAtTime(0, now, 0.15);
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
          this.subOsc?.stop();
          this.turboOsc?.stop();
          this.primaryOsc?.disconnect();
          this.subOsc?.disconnect();
          this.turboOsc?.disconnect();
          this.distortionNode?.disconnect();
          this.filterNode?.disconnect();
          this.masterGain?.disconnect();
          this.turboGain?.disconnect();
        } catch {}

        this.primaryOsc = null;
        this.subOsc = null;
        this.turboOsc = null;
        this.distortionNode = null;
        this.filterNode = null;
        this.masterGain = null;
        this.turboGain = null;
        this.isRunning = false;
        this.currentRpm = 850;
      }, 70);
    } catch {
      this.isRunning = false;
    }
  }

  private volumeMultiplier: number = 1.0;

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
