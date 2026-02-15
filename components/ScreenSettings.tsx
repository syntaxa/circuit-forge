import React, { useEffect, useMemo, useState } from 'react';
import { Settings } from '../types';
import { StorageService } from '../services/storageService';
import { TTSService } from '../services/ttsService';
import { Button } from './Button';

interface ScreenSettingsProps {
  onBack: () => void;
}

export const ScreenSettings: React.FC<ScreenSettingsProps> = ({ onBack }) => {
  const [settings, setSettings] = useState<Settings>(StorageService.getSettings());
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [lastLog, setLastLog] = useState<ReturnType<typeof StorageService.getLastLog>>(StorageService.getLastLog());

  const defaultVoiceName = useMemo(
    () => TTSService.getDefaultVoice()?.name ?? null,
    [voices]
  );

  useEffect(() => {
    const loadVoices = () => {
      const v = TTSService.getVoices();
      // Sort voices: Russian first, then others alphabetically
      v.sort((a, b) => {
        const aIsRu = a.lang.toLowerCase().includes('ru');
        const bIsRu = b.lang.toLowerCase().includes('ru');
        if (aIsRu && !bIsRu) return -1;
        if (!aIsRu && bIsRu) return 1;
        return a.name.localeCompare(b.name);
      });
      setVoices(v);
    };

    loadVoices();
    // Chrome loads voices asynchronously
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const handleSave = () => {
    StorageService.saveSettings(settings);
    onBack();
  };

  const handleClearLastWorkout = () => {
    StorageService.clearLastLog();
    setLastLog(StorageService.getLastLog());
  };

  return (
    <div className="p-4 max-w-lg mx-auto pb-20 animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 text-primary">Настройки</h2>
      
      <div className="space-y-6">
        <div className="bg-surface p-4 rounded-xl border border-slate-700">
          <label className="block text-sm font-medium text-slate-400 mb-2">Время упражнения (сек)</label>
          <input 
            type="number" 
            value={settings.exerciseDuration}
            onChange={(e) => setSettings({...settings, exerciseDuration: Number(e.target.value)})}
            className="w-full bg-dark text-white p-3 rounded-lg border border-slate-600 focus:border-primary outline-none"
          />
        </div>

        <div className="bg-surface p-4 rounded-xl border border-slate-700">
          <label className="block text-sm font-medium text-slate-400 mb-2">Упражнений в круге</label>
          <input 
            type="number" 
            min={3}
            value={settings.exercisesPerCycle}
            onChange={(e) => setSettings({...settings, exercisesPerCycle: Number(e.target.value)})}
            className="w-full bg-dark text-white p-3 rounded-lg border border-slate-600 focus:border-primary outline-none"
          />
        </div>

        <div className="bg-surface p-4 rounded-xl border border-slate-700">
          <label className="block text-sm font-medium text-slate-400 mb-2">Количество кругов</label>
          <input 
            type="number"
            min={1} 
            value={settings.cycleCount}
            onChange={(e) => setSettings({...settings, cycleCount: Number(e.target.value)})}
            className="w-full bg-dark text-white p-3 rounded-lg border border-slate-600 focus:border-primary outline-none"
          />
        </div>

        <div className="bg-surface p-4 rounded-xl border border-slate-700">
          <label className="block text-sm font-medium text-slate-400 mb-2">Голос озвучки</label>
          <select 
            value={settings.ttsVoiceURI || ''}
            onChange={(e) => setSettings({...settings, ttsVoiceURI: e.target.value})}
            className="w-full bg-dark text-white p-3 rounded-lg border border-slate-600 focus:border-primary outline-none"
          >
            <option value="">
              {defaultVoiceName ?? 'По умолчанию (Русский)'}
            </option>
            {voices.map(v => (
              <option key={v.voiceURI} value={v.voiceURI}>{v.name} ({v.lang})</option>
            ))}
          </select>
        </div>

        <div className="bg-surface p-4 rounded-xl border border-slate-700">
          <h3 className="text-sm font-medium text-slate-400 mb-2">Сохранённые данные</h3>
          <p className="text-xs text-slate-500 mb-2">Группы мышц в последней полностью завершённой тренировке (используются для подбора следующих упражнений):</p>
          {lastLog ? (
            <>
              <p className="text-white mb-3">
                {lastLog.muscleGroupsUsed.join(', ')}
              </p>
              <Button variant="secondary" onClick={handleClearLastWorkout} fullWidth>
                Очистить данные последней тренировки
              </Button>
            </>
          ) : (
            <p className="text-slate-500 text-sm">Нет данных о завершённых тренировках.</p>
          )}
        </div>

        <div className="pt-4 flex gap-3">
          <Button variant="secondary" onClick={onBack} fullWidth>Отмена</Button>
          <Button onClick={handleSave} fullWidth>Сохранить</Button>
        </div>
      </div>
    </div>
  );
};