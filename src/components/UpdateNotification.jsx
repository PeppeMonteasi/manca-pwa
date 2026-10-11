import React from 'react';
import { RefreshCw, Sparkles } from 'lucide-react';
import { useAppUpdate } from '../services/updateService';

export const UpdateNotification = () => {
  const { updateAvailable, isUpdating, applyUpdate } = useAppUpdate();

  if (!updateAvailable) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '5rem',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      maxWidth: '92%',
      width: '420px',
      background: 'rgba(15, 23, 42, 0.95)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(16, 185, 129, 0.4)',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(16, 185, 129, 0.25)',
      borderRadius: '16px',
      padding: '0.85rem 1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '0.75rem',
      animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: '10px',
          background: 'rgba(16, 185, 129, 0.15)',
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <Sparkles size={18} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>Nuova versione pronta!</div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Tocca per aggiornare subito
          </div>
        </div>
      </div>

      <button
        type="button"
        className="btn btn-primary"
        onClick={applyUpdate}
        disabled={isUpdating}
        style={{
          padding: '0.55rem 0.9rem',
          fontSize: '0.8rem',
          fontWeight: 700,
          whiteSpace: 'nowrap',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          flexShrink: 0
        }}
      >
        <RefreshCw size={14} style={{ animation: isUpdating ? 'spin 1s linear infinite' : 'none' }} />
        {isUpdating ? 'Riavvio...' : 'Aggiorna'}
      </button>
    </div>
  );
};
