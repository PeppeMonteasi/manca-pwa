import React from 'react';
import { ShieldAlert, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AccessDeniedScreen = ({ userEmail }) => {
  const { logout } = useAuth();

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 99999,
      background: 'radial-gradient(circle at 50% 30%, #1e1b2e 0%, #090d16 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <div style={{
        maxWidth: '420px',
        width: '100%',
        background: 'rgba(17, 24, 39, 0.95)',
        border: '1px solid rgba(239, 68, 68, 0.4)',
        borderRadius: '24px',
        padding: '2.5rem 2rem',
        boxShadow: '0 0 50px rgba(239, 68, 68, 0.25)'
      }}>
        <div style={{
          width: 76,
          height: 76,
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.15)',
          color: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          boxShadow: '0 0 30px rgba(239, 68, 68, 0.3)'
        }}>
          <ShieldAlert size={40} />
        </div>

        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f9fafb', marginBottom: '0.6rem' }}>
          Accesso Negato
        </h2>

        <p style={{ fontSize: '0.9rem', color: '#9ca3af', marginBottom: '1.25rem', lineHeight: '1.5' }}>
          Questa applicazione è strettamente riservata al suo unico proprietario. L'account:
        </p>

        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          padding: '0.6rem 1rem',
          borderRadius: '12px',
          color: '#f87171',
          fontSize: '0.88rem',
          fontWeight: 600,
          marginBottom: '1.75rem',
          wordBreak: 'break-all'
        }}>
          {userEmail || 'Account sconosciuto'}
        </div>

        <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '1.75rem' }}>
          Non sei autorizzato a visualizzare o modificare questa lista della spesa.
        </p>

        <button
          type="button"
          className="btn btn-primary"
          style={{ width: '100%', background: '#ef4444', padding: '0.85rem' }}
          onClick={logout}
        >
          <LogOut size={18} /> Esci dall'account
        </button>
      </div>
    </div>
  );
};
