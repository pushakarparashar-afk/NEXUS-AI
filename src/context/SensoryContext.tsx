import React, { createContext, useContext, useEffect, useState } from 'react';
import { soundService } from '@/lib/sound';
import { hapticsService } from '@/lib/haptics';

interface SensoryContextType {
  soundEnabled: boolean;
  soundVolume: number;
  hapticsEnabled: boolean;
  hapticsSupported: boolean;
  reducedMotion: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  setSoundVolume: (volume: number) => void;
  setHapticsEnabled: (enabled: boolean) => void;
  setReducedMotion: (reduced: boolean) => void;
  playSound: (type: 'create' | 'resolve' | 'save' | 'sla_warning' | 'error' | 'ai_done' | 'notification') => void;
  triggerHaptic: (pattern: 'save' | 'warning' | 'error' | 'confirm') => void;
  restoreDefaults: () => void;
}

const SensoryContext = createContext<SensoryContextType | undefined>(undefined);

export const SensoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => soundService.getEnabled());
  const [soundVolume, setSoundVolumeState] = useState<number>(() => soundService.getVolume());
  const [hapticsEnabled, setHapticsEnabledState] = useState<boolean>(() => hapticsService.getEnabled());
  const [hapticsSupported] = useState<boolean>(() => hapticsService.isSupported());
  const [reducedMotion, setReducedMotionState] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      const handler = (e: MediaQueryListEvent) => setReducedMotionState(e.matches);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, []);

  const setSoundEnabled = (enabled: boolean) => {
    soundService.setEnabled(enabled);
    setSoundEnabledState(enabled);
  };

  const setSoundVolume = (vol: number) => {
    soundService.setVolume(vol);
    setSoundVolumeState(vol);
  };

  const setHapticsEnabled = (enabled: boolean) => {
    hapticsService.setEnabled(enabled);
    setHapticsEnabledState(enabled);
  };

  const setReducedMotion = (reduced: boolean) => {
    setReducedMotionState(reduced);
  };

  const playSound = (type: 'create' | 'resolve' | 'save' | 'sla_warning' | 'error' | 'ai_done' | 'notification') => {
    soundService.play(type);
  };

  const triggerHaptic = (pattern: 'save' | 'warning' | 'error' | 'confirm') => {
    hapticsService.trigger(pattern);
  };

  const restoreDefaults = () => {
    setSoundEnabled(false);
    setSoundVolume(0.3);
    setHapticsEnabled(false);
  };

  return (
    <SensoryContext.Provider
      value={{
        soundEnabled,
        soundVolume,
        hapticsEnabled,
        hapticsSupported,
        reducedMotion,
        setSoundEnabled,
        setSoundVolume,
        setHapticsEnabled,
        setReducedMotion,
        playSound,
        triggerHaptic,
        restoreDefaults,
      }}
    >
      {children}
    </SensoryContext.Provider>
  );
};

export const useSensory = () => {
  const ctx = useContext(SensoryContext);
  if (!ctx) throw new Error('useSensory must be used within SensoryProvider');
  return ctx;
};
