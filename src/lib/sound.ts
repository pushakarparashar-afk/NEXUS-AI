// Web Audio API synthesized sound generator for enterprise feedback
// Zero external assets required, fully non-blocking, muted by default

class SoundManager {
  private ctx: AudioContext | null = null;
  private isEnabled: boolean = false;
  private volume: number = 0.3; // 0.0 to 1.0 default

  constructor() {
    // Read persisted sound preference from localStorage
    try {
      const savedEnabled = localStorage.getItem('nexus_sound_enabled');
      const savedVolume = localStorage.getItem('nexus_sound_volume');
      this.isEnabled = savedEnabled === 'true'; // Muted by default unless user enabled
      if (savedVolume) {
        this.volume = Math.max(0, Math.min(1, parseFloat(savedVolume)));
      }
    } catch {
      this.isEnabled = false;
    }
  }

  private initContext(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    try {
      localStorage.setItem('nexus_sound_enabled', String(enabled));
    } catch {}
    if (enabled) {
      this.initContext();
    }
  }

  public getEnabled(): boolean {
    return this.isEnabled;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    try {
      localStorage.setItem('nexus_sound_volume', String(this.volume));
    } catch {}
  }

  public getVolume(): number {
    return this.volume;
  }

  public play(type: 'create' | 'resolve' | 'save' | 'sla_warning' | 'error' | 'ai_done' | 'notification') {
    if (!this.isEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(this.volume, now);
      masterGain.connect(ctx.destination);

      switch (type) {
        case 'create': {
          // Cheerful ascending two-tone chime (F5 -> A5)
          const osc1 = ctx.createOscillator();
          const gain1 = ctx.createGain();
          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(698.46, now); // F5
          osc1.frequency.exponentialRampToValueAtTime(880.00, now + 0.12); // A5
          gain1.gain.setValueAtTime(0.15, now);
          gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
          osc1.connect(gain1);
          gain1.connect(masterGain);
          osc1.start(now);
          osc1.stop(now + 0.25);
          break;
        }

        case 'resolve': {
          // Harmonious resolution chord (C5 -> E5 -> G5)
          const notes = [523.25, 659.25, 783.99];
          notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.06);
            gain.gain.setValueAtTime(0.12, now + idx * 0.06);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4 + idx * 0.05);
            osc.connect(gain);
            gain.connect(masterGain);
            osc.start(now + idx * 0.06);
            osc.stop(now + 0.45);
          });
          break;
        }

        case 'save': {
          // Subtle soft confirmation tick
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.exponentialRampToValueAtTime(1200, now + 0.06);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now);
          osc.stop(now + 0.1);
          break;
        }

        case 'sla_warning': {
          // Muted amber cautionary pulse (two short mid-low pulses)
          [0, 0.14].forEach((offset) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, now + offset);
            gain.gain.setValueAtTime(0.12, now + offset);
            gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.09);
            osc.connect(gain);
            gain.connect(masterGain);
            osc.start(now + offset);
            osc.stop(now + offset + 0.1);
          });
          break;
        }

        case 'error': {
          // Low dissonance buzz
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(150, now);
          osc.frequency.exponentialRampToValueAtTime(110, now + 0.18);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now);
          osc.stop(now + 0.2);
          break;
        }

        case 'ai_done': {
          // Ethereal dual bell chime (D6 & A6)
          const osc1 = ctx.createOscillator();
          const gain1 = ctx.createGain();
          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(1174.66, now); // D6
          gain1.gain.setValueAtTime(0.08, now);
          gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
          osc1.connect(gain1);
          gain1.connect(masterGain);
          osc1.start(now);
          osc1.stop(now + 0.3);

          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(1760.00, now + 0.08); // A6
          gain2.gain.setValueAtTime(0.06, now + 0.08);
          gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
          osc2.connect(gain2);
          gain2.connect(masterGain);
          osc2.start(now + 0.08);
          osc2.stop(now + 0.35);
          break;
        }

        case 'notification': {
          // Crisp soft droplet ping
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(987.77, now); // B5
          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now);
          osc.stop(now + 0.15);
          break;
        }
      }
    } catch {
      // Audio playback silently catches any browser restriction
    }
  }
}

export const soundService = new SoundManager();
