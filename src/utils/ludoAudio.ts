// Professional Ludo Game Audio and Sound Manager utilizing Web Audio API
// This provides latency-free, highly reliable synthesizer sound effects
// that work flawlessly offline, on all devices, and bypass CORS issues.

class LudoAudioService {
  private ctx: AudioContext | null = null;
  private bgmAudio: HTMLAudioElement | null = null;
  
  public isMutedBGM: boolean = false;
  public isMutedSFX: boolean = false;
  public bgmVolume: number = 0.2;
  public sfxVolume: number = 0.4;
  
  private listeners: (() => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.isMutedBGM = localStorage.getItem('ludo_bgm_muted') === 'true';
      this.isMutedSFX = localStorage.getItem('ludo_sfx_muted') === 'true';
      this.bgmVolume = parseFloat(localStorage.getItem('ludo_bgm_volume') || '0.2');
      this.sfxVolume = parseFloat(localStorage.getItem('ludo_sfx_volume') || '0.4');
      
      // Pre-initialize background music element
      this.bgmAudio = new Audio("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3");
      this.bgmAudio.loop = true;
      this.bgmAudio.volume = this.bgmVolume;
    }
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  private initCtx(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        try {
          this.ctx = new AudioCtx();
        } catch (e) {
          console.warn("Failed to create AudioContext", e);
        }
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // BGM Controls
  public startBGM() {
    if (this.isMutedBGM || !this.bgmAudio) return;
    this.initCtx();
    
    this.bgmAudio.volume = this.bgmVolume;
    this.bgmAudio.play().catch(err => {
      console.log("BGM autoplay prevented or failed. Will play on first interaction.", err);
    });
  }

  public stopBGM() {
    if (this.bgmAudio) {
      this.bgmAudio.pause();
    }
  }

  public toggleBGM() {
    this.isMutedBGM = !this.isMutedBGM;
    localStorage.setItem('ludo_bgm_muted', String(this.isMutedBGM));
    
    if (this.isMutedBGM) {
      this.stopBGM();
    } else {
      this.startBGM();
    }
    this.notify();
  }

  public setBGMVolume(volume: number) {
    this.bgmVolume = Math.max(0, Math.min(1, volume));
    localStorage.setItem('ludo_bgm_volume', String(this.bgmVolume));
    if (this.bgmAudio) {
      this.bgmAudio.volume = this.bgmVolume;
    }
    this.notify();
  }

  // SFX Controls
  public toggleSFX() {
    this.isMutedSFX = !this.isMutedSFX;
    localStorage.setItem('ludo_sfx_muted', String(this.isMutedSFX));
    this.notify();
  }

  public setSFXVolume(volume: number) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    localStorage.setItem('ludo_sfx_volume', String(this.sfxVolume));
    this.notify();
  }

  // --- SYNTHESIZED SOUND EFFECTS ---

  // 1. Realistic tumbling/spinning dice roll sound
  public playDiceRoll() {
    if (this.isMutedSFX) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const steps = 6;
    for (let i = 0; i < steps; i++) {
      const playTime = now + i * 0.08;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      // Downward frequency sweep simulating mechanical rolling
      osc.frequency.setValueAtTime(140 + Math.random() * 60, playTime);
      osc.frequency.exponentialRampToValueAtTime(40, playTime + 0.07);

      gain.gain.setValueAtTime(this.sfxVolume * 0.7, playTime);
      gain.gain.exponentialRampToValueAtTime(0.01, playTime + 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);

      try {
        osc.start(playTime);
        osc.stop(playTime + 0.08);
      } catch (e) {}
    }
  }

  // 2. Beautiful popping and rising piece move sound
  public playPieceMove() {
    if (this.isMutedSFX) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(293.66, now); // D4
    osc.frequency.exponentialRampToValueAtTime(587.33, now + 0.12); // D5

    gain.gain.setValueAtTime(this.sfxVolume * 0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    try {
      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {}
  }

  // 3. Cybernetic knockout energy punch sound
  public playKnockout() {
    if (this.isMutedSFX) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Sub base boom
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(160, now);
    osc1.frequency.exponentialRampToValueAtTime(35, now + 0.35);

    gain1.gain.setValueAtTime(this.sfxVolume, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    // Cyber laser sweep
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(900, now);
    osc2.frequency.exponentialRampToValueAtTime(120, now + 0.2);

    gain2.gain.setValueAtTime(this.sfxVolume * 0.6, now);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    try {
      osc1.start(now);
      osc1.stop(now + 0.35);
      osc2.start(now);
      osc2.stop(now + 0.2);
    } catch (e) {}
  }

  // 4. Safe zone entry - beautiful shining chord
  public playSafeZone() {
    if (this.isMutedSFX) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [329.63, 392.00, 523.25, 659.25]; // E4, G4, C5, E5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.06);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.5, now + i * 0.06 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.06 + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      try {
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.35);
      } catch (e) {}
    });
  }

  // 5. Piece reached home safely - cheerful celebratory chord sweep
  public playHomeReach() {
    if (this.isMutedSFX) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const melody = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C major arpeggio
    melody.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.05);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.6, now + i * 0.05 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.05 + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      try {
        osc.start(now + i * 0.05);
        osc.stop(now + i * 0.05 + 0.3);
      } catch (e) {}
    });
  }

  // 6. User turn alert - dual clear synth bell ring
  public playYourTurn() {
    if (this.isMutedSFX) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [659.25, 987.77]; // E5, B5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.1);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.7, now + i * 0.1 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      try {
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.45);
      } catch (e) {}
    });
  }

  // 7. Victory match finished - massive triumphal synth theme
  public playWin() {
    if (this.isMutedSFX) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const chords = [
      [261.63, 329.63, 392.00, 523.25], // C Major
      [349.23, 440.00, 523.25, 698.46], // F Major
      [392.00, 493.88, 587.33, 783.99], // G Major
      [523.25, 659.25, 783.99, 1046.50] // C Major Octave Up
    ];

    chords.forEach((chord, chordIdx) => {
      const startTime = now + chordIdx * 0.25;
      chord.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.3, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        try {
          osc.start(startTime);
          osc.stop(startTime + 0.5);
        } catch (e) {}
      });
    });
  }

  // 8. Defeat match finished - mournful sliding down synthesizer
  public playLose() {
    if (this.isMutedSFX) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [349.23, 311.13, 277.18, 220.00]; // descending minor/diminished feel
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + i * 0.18);
      osc.frequency.linearRampToValueAtTime(freq - 40, now + i * 0.18 + 0.25);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(this.sfxVolume * 0.4, now + i * 0.18 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.18 + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      try {
        osc.start(now + i * 0.18);
        osc.stop(now + i * 0.18 + 0.35);
      } catch (e) {}
    });
  }

  // 9. Player join room SFX
  public playPlayerJoin() {
    if (this.isMutedSFX) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(349.23, now); // F4
    osc.frequency.exponentialRampToValueAtTime(523.25, now + 0.18); // C5

    gain.gain.setValueAtTime(this.sfxVolume * 0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);

    try {
      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {}
  }

  // 10. Emote or chat message received SFX
  public playEmote() {
    if (this.isMutedSFX) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(700, now);
    osc.frequency.setValueAtTime(1000, now + 0.04);

    gain.gain.setValueAtTime(this.sfxVolume * 0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    try {
      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {}
  }
}

export const ludoAudio = new LudoAudioService();
