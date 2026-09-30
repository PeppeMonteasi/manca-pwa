import React, { useState } from 'react';
import { Chrome, ShieldCheck, AlertCircle, ExternalLink, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AccessDeniedScreen } from './AccessDeniedScreen';
import { isUserAuthorized } from '../services/security';

export const UnifiedAuthGate = ({ children }) => {
  const { user, loginWithGoogle } = useAuth();
  const [googleError, setGoogleError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setGoogleError('');
    setIsLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error('Google Auth Error:', err);
      if (err.code === 'auth/operation-not-allowed' || err.message?.includes('operation-not-allowed')) {
        setGoogleError('operation-not-allowed');
      } else {
        setGoogleError(err.message || 'Errore durante l\'accesso con Google.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Se l'utente è loggato ma l'email NON è nella whitelist, blocca immediatamente!
  if (user && user.email && !isUserAuthorized(user.email)) {
    return <AccessDeniedScreen userEmail={user.email} />;
  }

  // 2. Se l'utente è loggato ed autorizzato, mostra direttamente l'applicazione!
  if (user) {
    return children;
  }

  // 3. Se non è loggato, mostra la schermata di login Single Sign-On
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 99999,
      background: 'radial-gradient(circle at 50% 25%, #111827 0%, #090d16 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      textAlign: 'center'
    }}>
      <div style={{
        maxWidth: '440px',
        width: '100%',
        background: 'rgba(17, 24, 39, 0.95)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: '24px',
        padding: '2.75rem 2rem',
        boxShadow: '0 0 50px rgba(16, 185, 129, 0.2)'
      }}>
        {/* Brand Logo */}
        <div style={{
          width: 76,
          height: 76,
          borderRadius: '22px',
          background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          boxShadow: '0 8px 32px rgba(16, 185, 129, 0.4)'
        }}>
          <ShieldCheck size={42} />
        </div>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f9fafb', marginBottom: '0.4rem', letterSpacing: '-0.02em' }}>
          Manca!
        </h1>
        <p style={{ fontSize: '0.92rem', color: '#9ca3af', marginBottom: '2rem', lineHeight: '1.4' }}>
          La tua lista spesa privata e sincronizzata ovunque.
        </p>

        {/* Alert se Google non è abilitato nella console */}
        {googleError === 'operation-not-allowed' && (
          <div style={{
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            borderRadius: '14px',
            padding: '1rem',
            marginBottom: '1.5rem',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f59e0b', fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.35rem' }}>
              <AlertCircle size={16} /> Attiva Google nella Console Firebase
            </div>
            <p style={{ fontSize: '0.8rem', color: '#d1d5db', lineHeight: '1.4', marginBottom: '0.75rem' }}>
              Il provider Google va abilitato una sola volta con un clic nella console del tuo progetto:
            </p>
            <a
              href={import.meta.env.VITE_FIREBASE_PROJECT_ID ? `https://console.firebase.google.com/project/${import.meta.env.VITE_FIREBASE_PROJECT_ID}/authentication/providers` : 'https://console.firebase.google.com/'}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.82rem',
                color: '#10b981',
                fontWeight: 700,
                textDecoration: 'underline',
                marginBottom: '0.75rem'
              }}
            >
              Apri Console Firebase &gt; Abilita Google <ExternalLink size={13} />
            </a>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
              (Spunta <em>Abilita</em>, scegli la tua email di supporto e premi Salva).
            </div>
          </div>
        )}

        {/* Errore generico */}
        {googleError && googleError !== 'operation-not-allowed' && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '0.75rem',
            marginBottom: '1.5rem',
            color: '#f87171',
            fontSize: '0.82rem'
          }}>
            {googleError}
          </div>
        )}

        {/* Bottone Login Google SSO */}
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '1rem',
            fontSize: '1rem',
            fontWeight: 700,
            gap: '0.85rem',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            background: 'rgba(255, 255, 255, 0.08)',
            color: '#f9fafb',
            cursor: isLoading ? 'wait' : 'pointer'
          }}
        >
          <Chrome size={22} color="#ea4335" />
          <span>{isLoading ? 'Accesso in corso...' : 'Entra con Google SSO'}</span>
        </button>
      </div>
    </div>
  );
};
