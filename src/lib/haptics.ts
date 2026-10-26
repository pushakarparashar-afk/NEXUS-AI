// Progressive enhancement for mobile and supported haptic feedback devices
class HapticsManager {
  private isEnabled: boolean = false;

  constructor() {
    try {
      const saved = localStorage.getItem('nexus_haptics_enabled');
      this.isEnabled = saved === 'true';
    } catch {
      this.isEnabled = false;
    }
  }

  public isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'vibrate' in navigator;
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    try {
      localStorage.setItem('nexus_haptics_enabled', String(enabled));
    } catch {}
  }

  public getEnabled(): boolean {
    return this.isEnabled;
  }

  public trigger(pattern: 'save' | 'warning' | 'error' | 'confirm') {
    if (!this.isEnabled || !this.isSupported()) return;

    try {
      switch (pattern) {
        case 'save':
          navigator.vibrate(25); // very short 25ms pulse
          break;
        case 'confirm':
          navigator.vibrate([15, 30, 20]);
          break;
        case 'warning':
          navigator.vibrate([40, 60, 40]);
          break;
        case 'error':
          navigator.vibrate([60, 40, 60, 40, 80]);
          break;
      }
    } catch {
      // Graceful fallback
    }
  }
}

export const hapticsService = new HapticsManager();
