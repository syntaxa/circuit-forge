import React from 'react';
import ReactDOM from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import './tailwind.css';
import App from './App';

// Принудительная проверка обновлений PWA при загрузке и раз в час
const CHECK_INTERVAL_MS = 60 * 60 * 1000;
registerSW({
  immediate: true,
  onRegisteredSW(swUrl, registration) {
    if (!registration) return;
    // Проверка сразу при загрузке
    registration.update();
    // Периодическая проверка, пока приложение открыто
    setInterval(async () => {
      if (registration.installing || !navigator) return;
      if ('connection' in navigator && !navigator.onLine) return;
      try {
        const resp = await fetch(swUrl, {
          cache: 'no-store',
          headers: { cache: 'no-store', 'cache-control': 'no-cache' },
        });
        if (resp?.status === 200) await registration.update();
      } catch {
        // Игнорируем ошибки сети при фоновой проверке
      }
    }, CHECK_INTERVAL_MS);
  },
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);