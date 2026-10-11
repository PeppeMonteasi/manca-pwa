import { useState, useEffect } from 'react';
import { triggerHaptic } from './haptics';

/**
 * Forza l'aggiornamento dell'applicazione:
 * 1. Cancella tutte le cache del CacheStorage (PWA Shell).
 * 2. Annulla la registrazione dei Service Worker obsoleti.
 * 3. Ricarica la pagina forzando il bypass della cache tramite query param univoco.
 */
export async function forceUpdateApp() {
  triggerHaptic('medium');
  try {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      console.log('[UpdateService] Caches svuotate con successo');
    }

    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const reg of registrations) {
        if (reg.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
        await reg.unregister();
      }
      console.log('[UpdateService] Service Worker resettati');
    }
  } catch (err) {
    console.error('[UpdateService] Errore durante forceUpdateApp:', err);
  }

  // Ricarica con timestamp per bypassare la cache del browser
  const baseUrl = window.location.origin + window.location.pathname;
  window.location.href = `${baseUrl}?updated=${Date.now()}`;
}

/**
 * Hook per rilevare quando è disponibile un nuovo aggiornamento del Service Worker
 */
export function useAppUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.ready.then(registration => {
      // Se c'è già un worker in attesa
      if (registration.waiting) {
        setUpdateAvailable(true);
      }

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateAvailable(true);
            }
          });
        }
      });
    });
  }, []);

  const applyUpdate = async () => {
    setIsUpdating(true);
    await forceUpdateApp();
  };

  return { updateAvailable, isUpdating, applyUpdate };
}
