import React from 'react';
import { Volume2, VolumeX, Smartphone, RefreshCw, Music, Check, Play } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { useSensory } from '@/context/SensoryContext';

interface SensorySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SensorySettingsModal: React.FC<SensorySettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    soundEnabled,
    soundVolume,
    hapticsEnabled,
    hapticsSupported,
    setSoundEnabled,
    setSoundVolume,
    setHapticsEnabled,
    playSound,
    triggerHaptic,
    restoreDefaults,
  } = useSensory();

  const previewSounds: Array<{ id: 'create' | 'resolve' | 'save' | 'sla_warning' | 'error' | 'ai_done'; label: string; desc: string }> = [
    { id: 'create', label: 'Ticket Created', desc: 'Ascending two-tone chime' },
    { id: 'resolve', label: 'Ticket Resolved', desc: 'Harmonious chord triad' },
    { id: 'save', label: 'Action Saved', desc: 'Soft confirmation tick' },
    { id: 'sla_warning', label: 'SLA Warning', desc: 'Cautionary dual pulse' },
    { id: 'ai_done', label: 'AI Ready', desc: 'Ethereal bell chime' },
    { id: 'error', label: 'Validation Error', desc: 'Low dissonance pulse' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sensory & Feedback Preferences"
      description="Configure Web Audio API synthesized enterprise chimes and progressive haptics."
      maxWidth="md"
    >
      <div className="space-y-6">
        {/* Sound Effects Master Switch */}
        <div className="rounded-xl bg-slate-800/40 border border-slate-700/60 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Audio Feedback</h4>
                <p className="text-xs text-slate-400">Synthesized pure-tone cues (Web Audio API)</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Volume Slider */}
          <div className="space-y-1.5 pt-2 border-t border-slate-700/40">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Master Volume</span>
              <span className="font-mono text-indigo-400">{Math.round(soundVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={soundVolume}
              disabled={!soundEnabled}
              onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer disabled:opacity-40"
            />
          </div>

          {/* Preview Cues */}
          <div className="pt-2 border-t border-slate-700/40 space-y-2">
            <span className="text-xs font-semibold text-slate-300 block">Preview Sound Effects</span>
            <div className="grid grid-cols-2 gap-2">
              {previewSounds.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  disabled={!soundEnabled}
                  onClick={() => playSound(s.id)}
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-900/60 border border-slate-700/60 text-xs text-slate-300 hover:text-white hover:bg-slate-750 hover:border-slate-600 disabled:opacity-40 transition-colors"
                >
                  <span className="truncate">{s.label}</span>
                  <Play className="w-3 h-3 text-indigo-400 flex-shrink-0 ml-1.5" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Haptic Feedback Switch */}
        <div className="rounded-xl bg-slate-800/40 border border-slate-700/60 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-white">Haptic Vibration</h4>
                  {!hapticsSupported && (
                    <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.2 rounded font-medium">
                      Desktop / Unsupported
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">Micro-pulses on supported touch devices</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={hapticsEnabled}
                disabled={!hapticsSupported}
                onChange={(e) => {
                  setHapticsEnabled(e.target.checked);
                  if (e.target.checked) triggerHaptic('confirm');
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600 disabled:opacity-40"></div>
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={restoreDefaults}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Restore Defaults</span>
          </button>
          <Button variant="primary" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};
