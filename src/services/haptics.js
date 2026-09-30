// Utility per feedback aptico (vibrazione) su dispositivi mobili
export const triggerHaptic = (type = 'light') => {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      if (type === 'light') {
        navigator.vibrate(12);
      } else if (type === 'medium') {
        navigator.vibrate(25);
      } else if (type === 'success') {
        navigator.vibrate([15, 60, 20]);
      } else if (type === 'warning') {
        navigator.vibrate([30, 40, 30]);
      }
    } catch (e) {
      // Dispositivi non supportati o permessi non concessi
    }
  }
};
