import React, { useState } from 'react';
import { X, ShieldCheck, Chrome, Mail, Lock, User, LogOut, CheckCircle2, Flame } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isFirebaseConfigured } from '../firebase/config';

export const SSOModal = () => {
  const { user, loginWithGoogle, loginWithEmail, logout, isSSOModalOpen, setIsSSOModalOpen, setIsFirebaseModalOpen } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState('');

  if (!isSSOModalOpen) return null;

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!email || !password) {
      setAuthError('Inserisci sia email che password');
      return;
    }
    try {
      await loginWithEmail(email, password, isRegistering);
    } catch (err) {
      setAuthError(err.message || 'Errore durante l\'autenticazione');
    }
  };

  return (
    <div className="modal-backdrop" onClick={() => setIsSSOModalOpen(false)}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.15rem' }}>
            <ShieldCheck size={22} color="var(--primary)" /> Autenticazione &amp; Profilo
          </div>
          <button className="btn btn-icon" onClick={() => setIsSSOModalOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {user ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <img 
              src={user.avatar} 
              alt={user.name} 
              style={{ width: 76, height: 76, borderRadius: '50%', margin: '0 auto 1rem', border: '3px solid var(--primary)' }}
            />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>{user.name}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>{user.email}</p>
            <div style={{ display: 'inline-block', marginBottom: '1.25rem' }}>
              <span className="brand-badge">
                Accesso con {user.provider}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsSSOModalOpen(false)}>
                Chiudi
              </button>
              <button className="btn btn-primary" style={{ flex: 1, background: '#ef4444' }} onClick={logout}>
                <LogOut size={16} /> Disconnetti
              </button>
            </div>
          </div>
        ) : (
          <div>
            {!isFirebaseConfigured && (
              <div style={{
                background: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                padding: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '1rem',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span>⚠️ Firebase non ancora configurato</span>
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: '#f59e0b', fontWeight: 700, textDecoration: 'underline', cursor: 'pointer' }}
                  onClick={() => {
                    setIsSSOModalOpen(false);
                    setIsFirebaseModalOpen(true);
                  }}
                >
                  Configura
                </button>
              </div>
            )}

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: '1.4' }}>
              Accedi con il tuo account Google per sincronizzare la lista della spesa automaticamente da PC, Telefono e Tablet.
            </p>

            {/* Google SSO Button */}
            <button 
              type="button"
              className="btn btn-secondary" 
              style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', marginBottom: '1.25rem', gap: '0.75rem', border: '1px solid rgba(255, 255, 255, 0.15)' }}
              onClick={loginWithGoogle}
            >
              <Chrome size={20} color="#ea4335" />
              <span>Accedi con Google SSO</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>OPPURE CON EMAIL</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
            </div>

            {/* Email form */}
            <form onSubmit={handleEmailAuth}>
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="email"
                    required
                    placeholder="tua.email@esempio.it"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="quick-add-input"
                    style={{ paddingLeft: '36px', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="password"
                    required
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="quick-add-input"
                    style={{ paddingLeft: '36px', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              {authError && (
                <div style={{ color: '#ef4444', fontSize: '0.82rem', marginBottom: '0.75rem' }}>
                  {authError}
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '0.75rem' }}>
                {isRegistering ? 'Crea Account' : 'Accedi'}
              </button>

              <div style={{ textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => setIsRegistering(!isRegistering)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  {isRegistering ? 'Hai già un account? Accedi' : 'Non hai un account? Registrati'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
