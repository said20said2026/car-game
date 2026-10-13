/**
 * Web Audio API synthesizer for the car racing game.
 * Generates dynamic engine RPM audio, tire drift screech, turbo nitro hiss,
 * coin bells, crash impacts, AND a high-octane procedural racing soundtrack.
 */

import { engineAudio } from './engineAudio';

// Note frequency definitions (Hz)
const N = {
  // Bass octave 2 & 3
  D2: 73.42,
  F2: 87.31,
  G2: 98.0,
  A2: 110.0,
  Bb2: 116.54,
  C3: 130.81,
  D3: 146.83,
  E3: 164.81,
  F3: 174.61,
  G3: 196.0,
  A3: 220.0,
  // Mid octave 4
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  A4: 440.0,
  Bb4: 466.16,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46,
};

class SoundEngine {
  private ctx: AudioContext | null = null;
  private sfxEnabled: boolean = true;
  private musicEnabled: boolean = true;
  private isEngineRunning: boolean = false;
  private isMusicPlaying: boolean = false;

  // Engine Audio Nodes
  private engineOsc: OscillatorNode | null = null;
  private engineSubOsc: OscillatorNode | null = null;
  private engineFilter: BiquadFilterNode | null = null;
  private engineGain: GainNode | null = null;

  // Background Music Nodes & Sequencer State
  private musicGain: GainNode | null = null;
  private musicFilter: BiquadFilterNode | null = null;
  private musicTimer: number | null = null;
  private musicNextTime: number = 0;
  private musicStep: number = 0;
  private musicVolume: number = 0.35;
  private sfxVolume: number = 0.8;
  private isNitroMusicActive: boolean = false;

  // Dynamic Speed & Pitch Modulation System
  private interactivePitchEnabled: boolean = true;
  private baseBpm: number = 126;
  private currentBpm: number = 126;
  private targetBpm: number = 126;
  private pitchMultiplier: number = 1.0;
  private targetPitchMultiplier: number = 1.0;
  private currentSpeedNormalized: number = 0;

  constructor() {
    // Sound initializes on user gesture to obey browser autoplay policies
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // ==========================================
  // Master SFX Controls & Volume
  // ==========================================
  public setEnabled(enabled: boolean) {
    this.sfxEnabled = enabled;
    engineAudio.setMuted(!enabled);
    if (!enabled && this.engineGain) {
      this.engineGain.gain.setValueAtTime(0, this.ctx?.currentTime || 0);
    }
  }

  public isEnabled(): boolean {
    return this.sfxEnabled;
  }

  public setVolume(volume: number) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    engineAudio.setVolume(this.sfxVolume);
  }

  public getVolume(): number {
    return this.sfxVolume;
  }

  // ==========================================
  // Interactive Speed-Responsive Background Music
  // ==========================================
  public setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    if (!enabled) {
      this.stopMusic();
    } else {
      // If was previously running in game, start smoothly
      if (this.isEngineRunning && !this.isMusicPlaying) {
        this.startMusic();
      }
    }
  }

  public isMusicEnabled(): boolean {
    return this.musicEnabled;
  }

  public toggleMusic(): boolean {
    const next = !this.musicEnabled;
    this.setMusicEnabled(next);
    return next;
  }

  public setMusicVolume(volume: number) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setTargetAtTime(
        this.musicEnabled ? this.musicVolume : 0,
        this.ctx.currentTime,
        0.05
      );
    }
  }

  public getMusicVolume(): number {
    return this.musicVolume;
  }

  public setInteractivePitchEnabled(enabled: boolean) {
    this.interactivePitchEnabled = enabled;
    if (!enabled) {
      this.targetPitchMultiplier = 1.0;
      this.targetBpm = this.baseBpm;
    }
  }

  public isInteractivePitchEnabled(): boolean {
    return this.interactivePitchEnabled;
  }

  /**
   * Dynamically modulates background music pitch, tempo, and timbre
   * according to the vehicle's real-time speed, throttle, and nitro state.
   */
  public updateMusicSpeed(speedNormalized: number, isAccelerating: boolean, isNitro: boolean) {
    this.currentSpeedNormalized = Math.max(0, speedNormalized);
    if (!this.interactivePitchEnabled) {
      this.pitchMultiplier = 1.0;
      this.currentBpm = this.baseBpm;
      return;
    }

    const clampedSpeed = Math.min(1.35, this.currentSpeedNormalized);

    // Dynamic Pitch Ratio:
    // Speed 0: 1.00 (Base key)
    // Speed 1.0 (Top speed): ~1.19 (+3 semitones / exciting minor third shift)
    // Nitro (1.0 - 1.35): up to 1.28 - 1.33 (+4.5 semitones / perfect fourth rush)
    let targetPitch = 1.0 + Math.min(1.0, clampedSpeed) * 0.18;
    let targetTempo = this.baseBpm + Math.min(1.0, clampedSpeed) * 26; // 126 -> 152 BPM

    if (isNitro) {
      targetPitch += 0.10; // Extra pitch spike for high-octane nitrous surge
      targetTempo += 16;   // Turbo tempo surge up to ~168 BPM
    } else if (isAccelerating && clampedSpeed > 0.05) {
      targetPitch += 0.03; // Throttle bite
    }

    this.targetPitchMultiplier = targetPitch;
    this.targetBpm = targetTempo;

    // Smooth inertia smoothing (faster rise on acceleration, smooth musical descent on deceleration)
    const pitchLerpSpeed = isAccelerating ? 0.14 : 0.06;
    const tempoLerpSpeed = isAccelerating ? 0.12 : 0.05;

    this.pitchMultiplier += (this.targetPitchMultiplier - this.pitchMultiplier) * pitchLerpSpeed;
    this.currentBpm += (this.targetBpm - this.currentBpm) * tempoLerpSpeed;

    // Modulate lowpass filter cutoff dynamically
    if (this.musicFilter && this.ctx) {
      // Cutoff opens from 3400 Hz up to 9500 Hz (or 11500 Hz during nitro)
      const targetFilterFreq = 3400 + Math.min(1.0, clampedSpeed) * 4800 + (isNitro ? 3200 : 0);
      this.musicFilter.frequency.setTargetAtTime(targetFilterFreq, this.ctx.currentTime, 0.08);
    }
  }

  /**
   * Retrieves current interactive music status for HUD meters and telemetry
   */
  public getMusicStatus() {
    const semitones = +(12 * Math.log2(Math.max(0.01, this.pitchMultiplier))).toFixed(1);
    return {
      isPlaying: this.isMusicPlaying,
      bpm: Math.round(this.currentBpm),
      pitchMultiplier: +(this.pitchMultiplier).toFixed(2),
      pitchSemitones: semitones,
      speedPercent: Math.round(this.currentSpeedNormalized * 100),
      volume: Math.round(this.musicVolume * 100),
      interactivePitchEnabled: this.interactivePitchEnabled,
    };
  }

  private initMusicChain() {
    if (!this.ctx) return;
    if (!this.musicGain) {
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.musicGain.connect(this.ctx.destination);
    }

    if (!this.musicFilter) {
      this.musicFilter = this.ctx.createBiquadFilter();
      this.musicFilter.type = 'lowpass';
      this.musicFilter.frequency.setValueAtTime(4500, this.ctx.currentTime);
      this.musicFilter.Q.setValueAtTime(1.4, this.ctx.currentTime);
      this.musicFilter.connect(this.musicGain);
    }
  }

  public startMusic() {
    if (!this.musicEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    this.initMusicChain();
    if (this.isMusicPlaying) return;

    this.isMusicPlaying = true;
    const now = this.ctx.currentTime;

    if (this.musicGain) {
      this.musicGain.gain.cancelScheduledValues(now);
      this.musicGain.gain.setValueAtTime(0.01, now);
      this.musicGain.gain.linearRampToValueAtTime(this.musicVolume, now + 0.3);
    }

    this.musicNextTime = now + 0.05;

    // Scheduler tick every 25ms with 120ms lookahead
    if (this.musicTimer !== null) {
      window.clearInterval(this.musicTimer);
    }

    this.musicTimer = window.setInterval(() => {
      this.scheduler();
    }, 25);
  }

  public pauseMusic() {
    if (!this.isMusicPlaying) return;
    if (this.musicTimer !== null) {
      window.clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
    }
    this.isMusicPlaying = false;
  }

  public resumeMusic() {
    if (!this.musicEnabled) return;
    if (this.isMusicPlaying) return;
    this.startMusic();
  }

  public stopMusic() {
    if (this.musicTimer !== null) {
      window.clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
    if (this.musicGain && this.ctx) {
      try {
        this.musicGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.08);
      } catch {}
    }
    this.isMusicPlaying = false;
    this.musicStep = 0;
    this.pitchMultiplier = 1.0;
    this.targetPitchMultiplier = 1.0;
    this.currentBpm = this.baseBpm;
  }

  public setNitroMusicMode(active: boolean) {
    if (this.isNitroMusicActive === active) return;
    this.isNitroMusicActive = active;
    if (!this.ctx || !this.musicFilter || !this.musicGain) return;

    const now = this.ctx.currentTime;
    if (active) {
      // Excite filter cutoff & volume surge during nitro
      this.musicFilter.frequency.setTargetAtTime(10500, now, 0.06);
      this.musicGain.gain.setTargetAtTime(Math.min(1, this.musicVolume * 1.25), now, 0.06);
    } else {
      this.musicFilter.frequency.setTargetAtTime(4500, now, 0.15);
      this.musicGain.gain.setTargetAtTime(this.musicVolume, now, 0.15);
    }
  }

  private scheduler() {
    if (!this.ctx || !this.isMusicPlaying) return;

    // Interactive Dynamic BPM tied to vehicle speed!
    // 1 beat = 60 / currentBpm
    // 16th step = (60 / currentBpm) / 4
    const effectiveBpm = Math.max(90, Math.min(200, this.currentBpm));
    const stepDuration = 60 / effectiveBpm / 4;
    const lookahead = 0.12;

    while (this.musicNextTime < this.ctx.currentTime + lookahead) {
      this.playMusicStep(this.musicStep, this.musicNextTime);
      this.musicNextTime += stepDuration;
      this.musicStep = (this.musicStep + 1) % 64; // 4-bar loop (64 steps)
    }
  }

  private playMusicStep(step: number, time: number) {
    if (!this.ctx || !this.musicFilter) return;

    // --- 1. DRUMS SECTION ---
    // 4-on-the-floor Kick (beats 0, 4, 8, 12 in each 16-step bar)
    const isKickStep = step % 4 === 0;
    // Add syncopated pre-kick at steps 14, 30, 46, 62 for driving arcade feel
    const isSyncopatedKick = step % 16 === 14;
    if (isKickStep || isSyncopatedKick) {
      this.playKick(time, isKickStep);
    }

    // Snare / Clap on beats 2 & 4 (steps 4, 12, 20, 28, 36, 44, 52, 60)
    if (step % 8 === 4) {
      this.playSnare(time);
    }

    // Hi-Hats: every 8th note, plus accents on offbeats
    if (step % 2 === 0) {
      const isOffbeat = step % 4 === 2;
      this.playHiHat(time, isOffbeat);
    }

    // --- 2. BASSLINE SECTION (Rolling 16th-note synthwave bass) ---
    const bassNote = this.getBassNoteForStep(step);
    if (bassNote) {
      const isAccent = step % 4 === 0 || step % 4 === 3;
      this.playBass(bassNote, time, isAccent);
    }

    // --- 3. SYNTH ARPEGGIO / LEAD RIFF ---
    const leadNote = this.getLeadNoteForStep(step);
    if (leadNote) {
      this.playLeadNote(leadNote, time, 0.095);
    }
  }

  private playKick(time: number, isDownbeat: boolean) {
    if (!this.ctx || !this.musicFilter) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, time);
      osc.frequency.exponentialRampToValueAtTime(36, time + 0.08);

      gain.gain.setValueAtTime(isDownbeat ? 0.32 : 0.22, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

      osc.connect(gain);
      gain.connect(this.musicFilter);

      osc.start(time);
      osc.stop(time + 0.11);
    } catch {}
  }

  private playSnare(time: number) {
    if (!this.ctx || !this.musicFilter) return;
    try {
      // Noise burst
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.12);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.03));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const hp = this.ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.setValueAtTime(1000, time);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.18, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.11);

      // Body tone
      const body = this.ctx.createOscillator();
      const bodyGain = this.ctx.createGain();
      body.type = 'triangle';
      body.frequency.setValueAtTime(200, time);
      body.frequency.exponentialRampToValueAtTime(80, time + 0.06);
      bodyGain.gain.setValueAtTime(0.14, time);
      bodyGain.gain.exponentialRampToValueAtTime(0.001, time + 0.07);

      noise.connect(hp);
      hp.connect(gain);
      gain.connect(this.musicFilter);

      body.connect(bodyGain);
      bodyGain.connect(this.musicFilter);

      noise.start(time);
      noise.stop(time + 0.12);
      body.start(time);
      body.stop(time + 0.08);
    } catch {}
  }

  private playHiHat(time: number, isOffbeat: boolean) {
    if (!this.ctx || !this.musicFilter) return;
    try {
      const dur = isOffbeat ? 0.065 : 0.03;
      const bufferSize = Math.floor(this.ctx.sampleRate * dur);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * (isOffbeat ? 0.022 : 0.01)));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const hp = this.ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.setValueAtTime(7500, time);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(isOffbeat ? 0.12 : 0.06, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

      noise.connect(hp);
      hp.connect(gain);
      gain.connect(this.musicFilter);

      noise.start(time);
      noise.stop(time + dur);
    } catch {}
  }

  private getBassNoteForStep(step: number): number | null {
    // 4 bars progression (D minor -> F major -> G minor -> Bb/A turnaround)
    const bar = Math.floor(step / 16);
    const sub = step % 16;

    // Leave subtle breathers on certain 16ths for rhythmic groove
    if (sub === 7 || sub === 15) return null;

    if (bar === 0) {
      // D minor
      return sub % 2 === 0 ? N.D2 : sub === 3 || sub === 11 ? N.D3 : N.D2;
    } else if (bar === 1) {
      // F major
      return sub % 2 === 0 ? N.F2 : sub === 3 || sub === 11 ? N.F3 : N.C3;
    } else if (bar === 2) {
      // G minor
      return sub % 2 === 0 ? N.G2 : sub === 3 || sub === 11 ? N.G3 : N.D3;
    } else {
      // Turnaround: Bb2 -> A2
      if (sub < 8) {
        return sub % 2 === 0 ? N.Bb2 : N.F2;
      } else {
        return sub % 2 === 0 ? N.A2 : N.E3;
      }
    }
  }

  private playBass(freq: number, time: number, isAccent: boolean) {
    if (!this.ctx || !this.musicFilter) return;
    try {
      const dynamicPitch = this.interactivePitchEnabled ? this.pitchMultiplier : 1.0;
      const pitchedFreq = freq * dynamicPitch;

      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(pitchedFreq, time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime((isAccent ? 580 : 380) * dynamicPitch, time);
      filter.frequency.exponentialRampToValueAtTime(140 * dynamicPitch, time + 0.09);
      filter.Q.setValueAtTime(2.8, time);

      gain.gain.setValueAtTime(isAccent ? 0.2 : 0.14, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicFilter);

      osc.start(time);
      osc.stop(time + 0.11);
    } catch {}
  }

  private getLeadNoteForStep(step: number): number | null {
    // Catchy arcade synth lead sequence across 64 steps
    const bar = Math.floor(step / 16);
    const sub = step % 16;

    // Bar 0: D minor heroic racing motif
    if (bar === 0) {
      const pattern = [N.D4, N.F4, N.A4, N.D5, N.C5, N.A4, N.F4, N.G4, N.A4, N.D4, N.F4, N.A4, N.C5, N.D5, null, null];
      return pattern[sub];
    }
    // Bar 1: F major speed ascent
    if (bar === 1) {
      const pattern = [N.F4, N.A4, N.C5, N.F5, N.E5, N.C5, N.A4, N.Bb4, N.C5, N.F4, N.A4, N.C5, N.E5, N.F5, null, null];
      return pattern[sub];
    }
    // Bar 2: G minor power rush
    if (bar === 2) {
      const pattern = [N.G4, N.Bb4, N.D5, N.G4, N.F4, N.D5, N.Bb4, N.C5, N.D5, N.G4, N.Bb4, N.D5, N.F5, N.G4, null, null];
      return pattern[sub];
    }
    // Bar 3: Climactic climax & loop return
    const pattern = [N.Bb4, N.D5, N.F5, N.D5, N.A4, N.C5, N.E5, N.C5, N.A4, N.E5, N.D5, N.C5, N.A4, N.F4, N.E4, null];
    return pattern[sub];
  }

  private playLeadNote(freq: number, time: number, dur: number) {
    if (!this.ctx || !this.musicFilter) return;
    try {
      const dynamicPitch = this.interactivePitchEnabled ? this.pitchMultiplier : 1.0;
      const pitchedFreq = freq * dynamicPitch;
      const tempoScale = Math.min(1.3, 126 / Math.max(100, this.currentBpm));
      const adjustedDur = dur * tempoScale;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(pitchedFreq, time);

      gain.gain.setValueAtTime(0.065, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + adjustedDur);

      osc.connect(gain);
      gain.connect(this.musicFilter);

      osc.start(time);
      osc.stop(time + adjustedDur + 0.01);

      // Add unison detuned supersaw layer when speeding or during nitro
      if (this.currentSpeedNormalized > 0.45 || this.isNitroMusicActive) {
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(pitchedFreq, time);
        osc2.detune.setValueAtTime(this.isNitroMusicActive ? 14 : 9, time);

        gain2.gain.setValueAtTime(0.035, time);
        gain2.gain.exponentialRampToValueAtTime(0.001, time + adjustedDur);

        osc2.connect(gain2);
        gain2.connect(this.musicFilter);

        osc2.start(time);
        osc2.stop(time + adjustedDur + 0.01);
      }
    } catch {}
  }

  // ==========================================
  // Sound Effects (Engine, Nitro, Drift, Crash)
  // ==========================================
  public startEngine() {
    if (!this.sfxEnabled) return;
    this.initContext();
    engineAudio.start();
    this.isEngineRunning = true;
  }

  public updateEngine(speedNormalized: number, isAccelerating: boolean, isNitro: boolean) {
    if (!this.sfxEnabled) {
      engineAudio.setMuted(true);
      return;
    }
    engineAudio.setMuted(false);
    engineAudio.update(speedNormalized, isAccelerating, isNitro);
  }

  public stopEngine() {
    engineAudio.stop();
    this.isEngineRunning = false;
  }

  public playCoin() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.setValueAtTime(1318.51, now + 0.07); // E6

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch {}
  }

  public playNitroBoost() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.5);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.frequency.exponentialRampToValueAtTime(3200, now + 0.4);
      filter.Q.setValueAtTime(3, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + 0.5);
    } catch {}
  }

  public playDrift() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.linearRampToValueAtTime(380, now + 0.2);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, now);
      filter.Q.setValueAtTime(4, now);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {}
  }

  public playCrash() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.6);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.15));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, now);
      filter.frequency.exponentialRampToValueAtTime(80, now + 0.5);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + 0.6);
    } catch {}
  }

  public playNearMiss() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(750, now + 0.12);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch {}
  }

  public playClick() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {}
  }
}

export const soundManager = new SoundEngine();
export { engineAudio, EngineAudio } from './engineAudio';
