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
      // getVoices() already returns only English voices
      const v = TTSService.getVoices();
      // Sort voices alphabetically
      v.sort((a, b) => a.name.localeCompare(b.name));
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
    StorageService.saveSettings({
      ...settings,
      breakDuration: Math.max(3, Number(settings.breakDuration) || 3),
    });
    onBack();
  };

  const handleClearLastWorkout = () => {
    StorageService.clearLastLog();
    setLastLog(StorageService.getLastLog());
  };

  return (
    <div className="p-4 max-w-lg mx-auto pb-20 animate-fade-in min-w-0">
      <h2 className="text-2xl font-bold mb-4 text-primary">Настройки</h2>
      
      <div className="space-y-4">
        <div className="bg-surface p-3.5 rounded-xl border border-slate-700 min-w-0">
          <h3 className="text-sm font-medium text-white mb-3">Параметры тренировки</h3>
          {/* Сетка: подпись | − | значение (число + сек) | + — кнопки выровнены по колонкам */}
          <div className="grid grid-cols-[1fr_2rem_auto_2rem] gap-x-2 gap-y-2.5 items-center">
            {/* Время упражнения */}
            <span className="text-white min-w-0">Время упражнения, сек</span>
            <button
              type="button"
              onClick={() => setSettings({ ...settings, exerciseDuration: Math.max(1, settings.exerciseDuration - 1) })}
              className="w-8 h-8 rounded-md bg-dark border border-slate-600 text-slate-300 hover:text-white hover:border-slate-500 flex items-center justify-center font-bold text-lg leading-none"
              aria-label="Уменьшить"
            >
              −
            </button>
            <div className="flex items-center min-w-0">
              <input
                id="exerciseDuration"
                type="number"
                min={1}
                value={settings.exerciseDuration}
                onChange={(e) => setSettings({ ...settings, exerciseDuration: Number(e.target.value) })}
                onFocus={(e) => e.target.select()}
                className="w-12 text-center py-1 rounded bg-transparent border border-transparent text-white focus:border-primary focus:bg-dark focus:outline-none no-number-spinner"
              />
            </div>
            <button
              type="button"
              onClick={() => setSettings({ ...settings, exerciseDuration: settings.exerciseDuration + 1 })}
              className="w-8 h-8 rounded-md bg-dark border border-slate-600 text-slate-300 hover:text-white hover:border-slate-500 flex items-center justify-center font-bold text-lg leading-none"
              aria-label="Увеличить"
            >
              +
            </button>

            {/* Между упражнениями */}
            <span className="text-white min-w-0">Между упражнениями, сек</span>
            <button
              type="button"
              onClick={() => setSettings({ ...settings, breakDuration: Math.max(3, (settings.breakDuration ?? 4) - 1) })}
              className="w-8 h-8 rounded-md bg-dark border border-slate-600 text-slate-300 hover:text-white hover:border-slate-500 flex items-center justify-center font-bold text-lg leading-none"
              aria-label="Уменьшить перерыв"
            >
              −
            </button>
            <div className="flex items-center min-w-0">
              <input
                id="breakDuration"
                type="number"
                min={3}
                value={settings.breakDuration}
                onChange={(e) => setSettings({ ...settings, breakDuration: Math.max(3, Number(e.target.value) || 3) })}
                onFocus={(e) => e.target.select()}
                className="w-12 text-center py-1 rounded bg-transparent border border-transparent text-white focus:border-primary focus:bg-dark focus:outline-none no-number-spinner"
              />
            </div>
            <button
              type="button"
              onClick={() => setSettings({ ...settings, breakDuration: (settings.breakDuration ?? 4) + 1 })}
              className="w-8 h-8 rounded-md bg-dark border border-slate-600 text-slate-300 hover:text-white hover:border-slate-500 flex items-center justify-center font-bold text-lg leading-none"
              aria-label="Увеличить перерыв"
            >
              +
            </button>

            {/* Упражнений в круге */}
            <span className="text-white min-w-0">Упражнений в круге</span>
            <button
              type="button"
              onClick={() => setSettings({ ...settings, exercisesPerCycle: Math.max(3, settings.exercisesPerCycle - 1) })}
              className="w-8 h-8 rounded-md bg-dark border border-slate-600 text-slate-300 hover:text-white hover:border-slate-500 flex items-center justify-center font-bold text-lg leading-none"
              aria-label="Уменьшить"
            >
              −
            </button>
            <div className="flex items-center min-w-0">
              <input
                id="exercisesPerCycle"
                type="number"
                min={3}
                value={settings.exercisesPerCycle}
                onChange={(e) => setSettings({ ...settings, exercisesPerCycle: Number(e.target.value) })}
                onFocus={(e) => e.target.select()}
                className="w-12 text-center py-1 rounded bg-transparent border border-transparent text-white focus:border-primary focus:bg-dark focus:outline-none no-number-spinner"
              />
            </div>
            <button
              type="button"
              onClick={() => setSettings({ ...settings, exercisesPerCycle: settings.exercisesPerCycle + 1 })}
              className="w-8 h-8 rounded-md bg-dark border border-slate-600 text-slate-300 hover:text-white hover:border-slate-500 flex items-center justify-center font-bold text-lg leading-none"
              aria-label="Увеличить"
            >
              +
            </button>

            {/* Количество кругов */}
            <span className="text-white min-w-0">Количество кругов</span>
            <button
              type="button"
              onClick={() => setSettings({ ...settings, cycleCount: Math.max(1, (settings.cycleCount ?? 2) - 1) })}
              className="w-8 h-8 rounded-md bg-dark border border-slate-600 text-slate-300 hover:text-white hover:border-slate-500 flex items-center justify-center font-bold text-lg leading-none"
              aria-label="Уменьшить количество кругов"
            >
              −
            </button>
            <div className="flex items-center min-w-0">
              <input
                id="cycleCount"
                type="number"
                min={1}
                value={settings.cycleCount}
                onChange={(e) => setSettings({ ...settings, cycleCount: Number(e.target.value) })}
                onFocus={(e) => e.target.select()}
                className="w-12 text-center py-1 rounded bg-transparent border border-transparent text-white focus:border-primary focus:bg-dark focus:outline-none no-number-spinner"
              />
            </div>
            <button
              type="button"
              onClick={() => setSettings({ ...settings, cycleCount: (settings.cycleCount ?? 2) + 1 })}
              className="w-8 h-8 rounded-md bg-dark border border-slate-600 text-slate-300 hover:text-white hover:border-slate-500 flex items-center justify-center font-bold text-lg leading-none"
              aria-label="Увеличить количество кругов"
            >
              +
            </button>
          </div>
        </div>

        <div className="bg-surface p-3.5 rounded-xl border border-slate-700 min-w-0">
          <label className="block text-sm font-medium text-slate-400 mb-2">Голос озвучки</label>
          <select 
            value={settings.ttsVoiceURI || ''}
            onChange={(e) => setSettings({...settings, ttsVoiceURI: e.target.value})}
            className="w-full min-w-0 max-w-full bg-dark text-white p-2.5 rounded-lg border border-slate-600 focus:border-primary outline-none truncate pr-8"
          >
            <option value="">
              {defaultVoiceName ?? 'По умолчанию (English)'}
            </option>
            {voices.map(v => (
              <option key={v.voiceURI} value={v.voiceURI}>{v.name}</option>
            ))}
          </select>
        </div>

        <div className="bg-surface p-3.5 rounded-xl border border-slate-700 min-w-0">
          <h3 className="text-sm font-medium text-slate-400 mb-2">Сохранённые данные</h3>
          <p className="text-xs text-slate-500 mb-2 break-words">Группы мышц в последней полностью завершённой тренировке (используются для подбора следующих упражнений):</p>
          {lastLog ? (
            <>
              <p className="text-white mb-2.5">
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

        <div className="pt-2 flex gap-3">
          <Button variant="secondary" onClick={onBack} fullWidth>Отмена</Button>
          <Button onClick={handleSave} fullWidth>Сохранить</Button>
        </div>
      </div>
    </div>
  );
};