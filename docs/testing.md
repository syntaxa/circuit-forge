# Стратегия автоматического тестирования Circuit Forge

## Обзор приложения

Circuit Forge — клиентское SPA-приложение для HIIT-тренировок. Стек: React 19, TypeScript, Vite, Tailwind CSS. Данные хранятся в `localStorage`, навигация — через внутренний `useState<AppScreen>`, внешних API нет.

**Ключевые области с бизнес-логикой:**

| Модуль | Сложность логики | Риск регрессий |
|--------|-----------------|----------------|
| `WorkoutGenerator` | Высокая (алгоритм подбора, ограничения сложности) | Высокий |
| `StorageService` | Средняя (CRUD, инициализация seed-данными) | Средний |
| `TTSService` | Низкая (обёртка над Web Speech API) | Низкий |
| `ScreenWorkout` | Высокая (таймер, фазы, двусторонние упражнения) | Высокий |
| `ScreenSetup` | Средняя (генерация плейлиста, отображение) | Средний |
| `ScreenDatabase` | Средняя (CRUD упражнений, формы) | Средний |
| `ScreenSettings` | Низкая (формы настроек) | Низкий |
| `App` (навигация) | Низкая (switch по экранам) | Низкий |

---

## Инструменты

| Инструмент | Назначение |
|------------|-----------|
| **Vitest** | Тест-раннер (нативная интеграция с Vite, быстрый, совместим с Jest API) |
| **React Testing Library** (`@testing-library/react`) | Тестирование компонентов через пользовательское поведение |
| **@testing-library/jest-dom** | Дополнительные матчеры для DOM (`toBeInTheDocument`, `toHaveTextContent`) |
| **@testing-library/user-event** | Симуляция реалистичных пользовательских событий |
| **jsdom** | DOM-окружение для Vitest |
| **vi.fn() / vi.mock()** | Мокирование модулей и браузерных API |

### Установка

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

### Конфигурация

**`vite.config.ts`** — добавить секцию `test`:

```ts
export default defineConfig({
  // ...существующая конфигурация...
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setup.ts',
    include: ['tests/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      include: ['services/**', 'components/**', 'App.tsx'],
    },
  },
});
```

**`tests/setup.ts`** — глобальная подготовка:

```ts
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  cleanup();
  localStorage.clear();
});

// Мок Web Speech API
Object.defineProperty(window, 'speechSynthesis', {
  value: {
    speak: vi.fn(),
    cancel: vi.fn(),
    getVoices: vi.fn(() => []),
  },
});

// Мок Audio
window.HTMLMediaElement.prototype.play = vi.fn(() => Promise.resolve());
window.HTMLMediaElement.prototype.pause = vi.fn();
```

**`package.json`** — скрипты:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

---

## Структура тестов

```
tests/
├── setup.ts                          # Глобальная подготовка
├── helpers.ts                        # Общие фабрики и утилиты
├── unit/
│   ├── workoutGenerator.test.ts      # Алгоритм генерации тренировки
│   ├── storageService.test.ts        # CRUD localStorage
│   └── ttsService.test.ts            # Обёртка TTS
├── components/
│   ├── Button.test.tsx               # Кнопка (варианты, disabled)
│   ├── CircularTimer.test.tsx        # Визуализация таймера
│   ├── ScreenSetup.test.tsx          # Экран подготовки
│   ├── ScreenWorkout.test.tsx        # Экран тренировки
│   ├── ScreenSettings.test.tsx       # Экран настроек
│   ├── ScreenDatabase.test.tsx       # Экран базы упражнений
│   ├── ScreenExerciseDetail.test.tsx # Модалка упражнения
│   └── ScreenAbout.test.tsx          # Экран «О приложении»
└── integration/
    ├── workoutFlow.test.tsx          # Полный цикл тренировки
    └── databaseSync.test.tsx         # Синхронизация базы и плейлиста
```

---

## Уровень 1: Юнит-тесты сервисов

### `tests/unit/workoutGenerator.test.ts`

Самый ценный набор тестов — покрывает основной алгоритм приложения.

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WorkoutGenerator } from '@/services/workoutGenerator';
import { StorageService } from '@/services/storageService';
import { MuscleGroup, Difficulty } from '@/types';

vi.mock('@/services/storageService');
```

| # | Тест-кейс | Что проверяем |
|---|-----------|---------------|
| 1 | `selectMuscleGroups` без истории | Возвращает ровно 3 уникальные группы мышц |
| 2 | `selectMuscleGroups` с историей | Возвращает 2 из предыдущей тренировки + 1 новую |
| 3 | `selectMuscleGroups` — все группы использованы | Корректный fallback при исчерпании групп |
| 4 | `generatePlaylist` — покрытие групп | Хотя бы одно упражнение из каждой целевой группы |
| 5 | `generatePlaylist` — количество | Возвращает ровно `count` упражнений |
| 6 | `generatePlaylist` — ограничение сложности | Нет двух HARD-упражнений подряд (или best effort за 10 попыток) |
| 7 | `generatePlaylist` — пустая база | Возвращает пустой массив при отсутствии кандидатов |
| 8 | `generatePlaylist` — одна группа | Работает корректно с одной целевой группой |

### `tests/unit/storageService.test.ts`

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { StorageService } from '@/services/storageService';
import { SEED_EXERCISES, DEFAULT_SETTINGS } from '@/constants';
```

| # | Тест-кейс | Что проверяем |
|---|-----------|---------------|
| 1 | `getExercises` — первый запуск | Инициализирует localStorage seed-данными и возвращает их |
| 2 | `getExercises` — повторный запуск | Возвращает ранее сохранённые данные |
| 3 | `saveExercises` | Корректно сериализует и сохраняет массив |
| 4 | `getSettings` — без данных | Возвращает `DEFAULT_SETTINGS` |
| 5 | `getSettings` — частичные данные | Мёржит с defaults (`{ ...DEFAULT_SETTINGS, ...saved }`) |
| 6 | `saveSettings` / `getSettings` roundtrip | Сохранённые настройки читаются обратно |
| 7 | `addLog` + `getLastLog` | Лог добавляется в начало, `getLastLog` возвращает его |
| 8 | `clearLastLog` | Удаляет только первый элемент истории |
| 9 | `clearHistory` | Полностью очищает историю |
| 10 | `getHistory` — пустая | Возвращает пустой массив |

### `tests/unit/ttsService.test.ts`

| # | Тест-кейс | Что проверяем |
|---|-----------|---------------|
| 1 | `speak` — вызов `speechSynthesis.speak` | Создаёт `SpeechSynthesisUtterance` с правильными параметрами |
| 2 | `speak` — предпочтение пользовательского голоса | Выбирается голос по `voiceURI`, если он English |
| 3 | `speak` — fallback на en-US | Если `voiceURI` не найден, берётся en-US |
| 4 | `speak` — без Speech API | Вызывает `onEnd` и не падает |
| 5 | `getVoices` — фильтрация | Возвращает только голоса с `lang.startsWith('en')` |

---

## Уровень 2: Тесты компонентов

### `tests/components/Button.test.tsx`

| # | Тест-кейс |
|---|-----------|
| 1 | Рендерит текст кнопки |
| 2 | Применяет CSS-классы для каждого варианта (`primary`, `secondary`, `danger`, `ghost`) |
| 3 | Вызывает `onClick` при клике |
| 4 | Не вызывает `onClick` при `disabled` |
| 5 | Применяет `fullWidth` класс |

### `tests/components/CircularTimer.test.tsx`

| # | Тест-кейс |
|---|-----------|
| 1 | Рендерит SVG с правильным `stroke-dashoffset` для прогресса 0, 0.5, 1 |
| 2 | Показывает label и sublabel |
| 3 | Показывает индикатор стороны (left/right) для двусторонних упражнений |

### `tests/components/ScreenSetup.test.tsx`

Мокировать: `WorkoutGenerator`, `StorageService`.

| # | Тест-кейс |
|---|-----------|
| 1 | Показывает список упражнений из сгенерированного плейлиста |
| 2 | Показывает бейджи групп мышц (amber для повторных, primary для новых) |
| 3 | Показывает статистику: кол-во упражнений, циклы, длительность |
| 4 | Кнопка «Обновить план» перегенерирует плейлист |
| 5 | Кнопка «Начать тренировку» вызывает `onStart` с плейлистом и группами |
| 6 | Клик по упражнению вызывает `onOpenExerciseDetail` |
| 7 | Кнопка «Забыть историю» вызывает `StorageService.clearHistory` и обновляет UI |

### `tests/components/ScreenWorkout.test.tsx`

Самый комплексный набор — требует `vi.useFakeTimers()`.

| # | Тест-кейс |
|---|-----------|
| 1 | Начинается с фазы PREP (5 секунд) |
| 2 | Переключается на WORK по окончании PREP |
| 3 | Переключается на следующее упражнение по окончании WORK |
| 4 | Двустороннее упражнение — показывает «L» и «R», переключается на полпути |
| 5 | Пауза: таймер останавливается, кнопка меняет текст |
| 6 | Возобновление: таймер продолжает |
| 7 | Финиш: вызывает `onFinish` после последнего цикла |
| 8 | Отмена: показывает подтверждение, вызывает `onCancel` |
| 9 | `isPausedByOverlay` ставит таймер на паузу |
| 10 | TTS: вызывает `speakEnglish` с названием упражнения |

### `tests/components/ScreenSettings.test.tsx`

| # | Тест-кейс |
|---|-----------|
| 1 | Отображает текущие значения настроек из `StorageService` |
| 2 | Изменение `exerciseDuration` сохраняет через `StorageService.saveSettings` |
| 3 | Список голосов показывает только английские голоса |
| 4 | Кнопка «Очистить историю» вызывает `clearLastLog` |

### `tests/components/ScreenDatabase.test.tsx`

| # | Тест-кейс |
|---|-----------|
| 1 | Показывает список упражнений из базы |
| 2 | Добавление: заполнение формы + сохранение → появляется в списке |
| 3 | Редактирование: клик на упражнение → форма заполняется → сохранение |
| 4 | Удаление: подтверждение → упражнение исчезает из списка |
| 5 | Валидация: нельзя сохранить без заполнения обязательных полей |

### `tests/components/ScreenExerciseDetail.test.tsx`

| # | Тест-кейс |
|---|-----------|
| 1 | Рендерится через `createPortal` в `document.body` |
| 2 | Показывает название, описание, группу мышц, сложность |
| 3 | Показывает шаги выполнения |
| 4 | Кнопка закрытия вызывает `onClose` |

### `tests/components/ScreenAbout.test.tsx`

| # | Тест-кейс |
|---|-----------|
| 1 | Рендерит описание приложения |
| 2 | Кнопка «Назад» вызывает `onBack` |

---

## Уровень 3: Интеграционные тесты

### `tests/integration/workoutFlow.test.tsx`

Тестирует сквозной сценарий через `App` без мокирования сервисов.

| # | Сценарий |
|---|----------|
| 1 | **Полный цикл:** Экран настройки → нажатие «Начать» → переход на экран тренировки → завершение → возврат на настройку |
| 2 | **Отмена тренировки:** Начать → отменить → подтвердить → возврат на настройку |
| 3 | **Настройки влияют на тренировку:** Изменить длительность → начать → таймер использует новое значение |

### `tests/integration/databaseSync.test.tsx`

| # | Сценарий |
|---|----------|
| 1 | Редактирование упражнения в базе → возврат на экран настройки → плейлист содержит обновлённые данные |
| 2 | Удаление упражнения из базы → плейлист не содержит удалённого упражнения |

---

## Вспомогательный модуль `tests/helpers.ts`

Фабрики тестовых данных для единообразия:

```ts
import { Exercise, MuscleGroup, Difficulty, Settings, WorkoutLog } from '@/types';

export function createExercise(overrides: Partial<Exercise> = {}): Exercise {
  return {
    id: crypto.randomUUID(),
    name: 'Test Exercise',
    description: 'Test description',
    muscleGroup: MuscleGroup.ARMS,
    difficulty: Difficulty.MEDIUM,
    biSided: false,
    steps: 'Step 1\nStep 2',
    ...overrides,
  };
}

export function createSettings(overrides: Partial<Settings> = {}): Settings {
  return {
    exerciseDuration: 30,
    exercisesPerCycle: 10,
    cycleCount: 2,
    ttsVoiceURI: null,
    ...overrides,
  };
}

export function createWorkoutLog(overrides: Partial<WorkoutLog> = {}): WorkoutLog {
  return {
    date: new Date().toISOString(),
    muscleGroupsUsed: [MuscleGroup.ARMS, MuscleGroup.LEGS, MuscleGroup.ABS],
    ...overrides,
  };
}
```

---

## Мокирование браузерных API

### localStorage

Vitest + jsdom предоставляет `localStorage` из коробки. Очищается в `afterEach` через `localStorage.clear()`.

### Web Speech API

```ts
const mockVoices: SpeechSynthesisVoice[] = [
  { voiceURI: 'en-us-1', name: 'US English', lang: 'en-US', default: true, localService: true },
  { voiceURI: 'en-gb-1', name: 'UK English', lang: 'en-GB', default: false, localService: true },
  { voiceURI: 'ru-1', name: 'Russian', lang: 'ru-RU', default: false, localService: true },
] as SpeechSynthesisVoice[];

vi.spyOn(window.speechSynthesis, 'getVoices').mockReturnValue(mockVoices);
```

### Audio (звуки)

Мокируется глобально в `setup.ts` — `HTMLMediaElement.prototype.play` / `.pause`.

### Таймеры

Для `ScreenWorkout` использовать `vi.useFakeTimers()` и `vi.advanceTimersByTime()`:

```ts
beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

it('переключается с PREP на WORK через 5 секунд', () => {
  render(<ScreenWorkout playlist={playlist} ... />);
  vi.advanceTimersByTime(5000);
  expect(screen.getByText(/название упражнения/)).toBeInTheDocument();
});
```

---

## Приоритеты покрытия

### Фаза 1 — Фундамент (высокий приоритет)

1. **`workoutGenerator.test.ts`** — ядро бизнес-логики, максимальная ценность
2. **`storageService.test.ts`** — основа персистентности данных
3. **`tests/helpers.ts`** + `tests/setup.ts` — инфраструктура

### Фаза 2 — Компоненты (средний приоритет)

4. **`ScreenWorkout.test.tsx`** — сложная логика таймера и фаз
5. **`ScreenSetup.test.tsx`** — ключевой экран пользователя
6. **`ScreenDatabase.test.tsx`** — CRUD-операции
7. **`Button.test.tsx`** — базовый переиспользуемый компонент

### Фаза 3 — Полнота (низкий приоритет)

8. **`ScreenSettings.test.tsx`**
9. **`CircularTimer.test.tsx`**
10. **`ScreenExerciseDetail.test.tsx`**
11. **`ScreenAbout.test.tsx`**
12. **`ttsService.test.ts`**

### Фаза 4 — Интеграция

13. **`workoutFlow.test.tsx`**
14. **`databaseSync.test.tsx`**

---

## Целевые метрики

| Метрика | Цель |
|---------|------|
| Покрытие строк (`services/`) | ≥ 90% |
| Покрытие строк (`components/`) | ≥ 70% |
| Покрытие ветвлений (`workoutGenerator`) | ≥ 85% |
| Время прогона всех тестов | < 10 секунд |

---

## Запуск

```bash
# Все тесты однократно
npm test

# Watch-режим при разработке
npm run test:watch

# С отчётом покрытия
npm run test:coverage
```

---

## Перечень задач по реализации автотестов

Ниже — пошаговый список задач для внедрения автотестов в соответствии со стратегией и архитектурой приложения.

### Подготовка инфраструктуры

| # | Задача | Описание |
|---|--------|----------|
| 1 | Установить зависимости | `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom` (dev) |
| 2 | Настроить Vitest в `vite.config.ts` | Секция `test`: `environment: 'jsdom'`, `globals: true`, `setupFiles`, `include`, `coverage` |
| 3 | Создать `tests/setup.ts` | Подключение jest-dom, `afterEach` (cleanup, `localStorage.clear()`), моки `speechSynthesis` и `HTMLMediaElement.prototype.play/pause` |
| 4 | Добавить скрипты в `package.json` | `test`, `test:watch`, `test:coverage` |
| 5 | Создать `tests/helpers.ts` | Фабрики `createExercise`, `createSettings`, `createWorkoutLog` для тестовых данных |

### Фаза 1 — Юнит-тесты сервисов (фундамент)

| # | Задача | Файл | Детали |
|---|--------|------|--------|
| 6 | Тесты `WorkoutGenerator` | `tests/unit/workoutGenerator.test.ts` | 8 кейсов: `selectMuscleGroups` без истории / с историей / все группы; `generatePlaylist` — покрытие групп, количество, нет двух HARD подряд, пустая база, одна группа |
| 7 | Тесты `StorageService` | `tests/unit/storageService.test.ts` | 10 кейсов: инициализация seed, CRUD упражнений, get/save Settings (defaults, roundtrip), addLog/getLastLog, clearLastLog, clearHistory, getHistory пустая |
| 8 | Тесты `TTSService` | `tests/unit/ttsService.test.ts` | 5 кейсов: вызов speak с параметрами, предпочтение voiceURI, fallback en-US, отсутствие Speech API, getVoices — фильтр по `lang.startsWith('en')` |

### Фаза 2 — Тесты компонентов (средний приоритет)

| # | Задача | Файл | Детали |
|---|--------|------|--------|
| 9 | Тесты `Button` | `tests/components/Button.test.tsx` | Рендер текста, варианты (primary/secondary/danger/ghost), onClick, disabled, fullWidth |
| 10 | Тесты `CircularTimer` | `tests/components/CircularTimer.test.tsx` | SVG stroke-dashoffset (0, 0.5, 1), label/sublabel, индикатор стороны (L/R) |
| 11 | Тесты `ScreenWorkout` | `tests/components/ScreenWorkout.test.tsx` | С `vi.useFakeTimers()`: PREP→WORK, переходы упражнений, двусторонние (L/R), пауза/возобновление, финиш, отмена с подтверждением, isPausedByOverlay, вызов TTS |
| 12 | Тесты `ScreenSetup` | `tests/components/ScreenSetup.test.tsx` | Моки WorkoutGenerator и StorageService; плейлист, бейджи групп, статистика, «Обновить план», «Начать тренировку», клик по упражнению, «Забыть историю» |
| 13 | Тесты `ScreenDatabase` | `tests/components/ScreenDatabase.test.tsx` | Список упражнений, добавление/редактирование/удаление, валидация обязательных полей |

### Фаза 3 — Остальные компоненты (низкий приоритет)

| # | Задача | Файл | Детали |
|---|--------|------|--------|
| 14 | Тесты `ScreenSettings` | `tests/components/ScreenSettings.test.tsx` | Отображение настроек, сохранение exerciseDuration, список голосов (en), «Очистить историю» |
| 15 | Тесты `ScreenExerciseDetail` | `tests/components/ScreenExerciseDetail.test.tsx` | Рендер через createPortal, название/описание/группа/сложность/шаги, кнопка закрытия |
| 16 | Тесты `ScreenAbout` | `tests/components/ScreenAbout.test.tsx` | Описание приложения, кнопка «Назад» |

### Фаза 4 — Интеграционные тесты

| # | Задача | Файл | Детали |
|---|--------|------|--------|
| 17 | Интеграция: цикл тренировки | `tests/integration/workoutFlow.test.tsx` | Без моков: настройка → «Начать» → тренировка → завершение → возврат; отмена с подтверждением; влияние настроек на длительность таймера |
| 18 | Интеграция: база и плейлист | `tests/integration/databaseSync.test.tsx` | Редактирование/удаление упражнения в базе → плейлист на экране настройки отражает изменения |

### Финализация и CI

| # | Задача | Описание |
|---|--------|----------|
| 19 | Проверить покрытие | Запуск `npm run test:coverage`, достижение целей: services ≥ 90%, components ≥ 70%, ветвления workoutGenerator ≥ 85% |
| 20 | Добавить тесты в CI (опционально) | В `.github/workflows/` добавить job с `npm ci` и `npm test` перед или параллельно деплою (например, в `deploy-pages.yml`) |

### Сводка

- **Задачи 1–5:** инфраструктура (один раз).
- **Задачи 6–8:** юнит-тесты сервисов (высокий приоритет).
- **Задачи 9–13:** ключевые компоненты (ScreenWorkout, ScreenSetup, ScreenDatabase, Button, CircularTimer).
- **Задачи 14–16:** остальные экраны.
- **Задачи 17–18:** интеграционные сценарии.
- **Задачи 19–20:** метрики и CI.

Рекомендуемый порядок выполнения: 1 → 5 → 6 → 7 → 8 → 9 → 11 → 12 → 13, затем 10, 14–18 по приоритету, в конце 19–20.
