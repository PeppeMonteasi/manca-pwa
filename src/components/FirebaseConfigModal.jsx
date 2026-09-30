import React, { useState } from 'react';
import { X, Flame, CheckCircle2, AlertTriangle, Copy, Terminal, ExternalLink } from 'lucide-react';
import { isFirebaseConfigured, getSavedFirebaseConfig, saveFirebaseConfig } from '../firebase/config';

export const FirebaseConfigModal = ({ isOpen, onClose }) => {
  const [configJson, setConfigJson] = useState(() => {
    const existing = getSavedFirebaseConfig();
    return existing ? JSON.stringify(existing, null, 2) : '';
  });
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    setError('');
    try {
      if (!configJson.trim()) {
        saveFirebaseConfig(null);
        return;
      }
      const parsed = JSON.parse(configJson);
      if (!parsed.apiKey || !parsed.projectId) {
        setError('Il JSON deve contenere almeno apiKey e projectId.');
        return;
      }
      saveFirebaseConfig(parsed);
    } catch (e) {
      setError('Formato JSON non valido. Assicurati di incollare il blocco firebaseConfig dalla console di Firebase.');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '540px' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.15rem' }}>
            <Flame size={24} color="#f59e0b" /> Stato & Configurazione Firebase
          </div>
          <button className="btn btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Status banner */}
        <div style={{
          padding: '0.85rem 1rem',
          borderRadius: 'var(--radius-md)',
          background: isFirebaseConfigured ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
          border: `1px solid ${isFirebaseConfigured ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem'
        }}>
          {isFirebaseConfigured ? (
            <>
              <CheckCircle2 size={20} color="#10b981" />
              <div>
                <strong style={{ fontSize: '0.9rem', color: '#10b981' }}>Firebase Attivo e Connesso!</strong>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>I dati si sincronizzano in tempo reale tra tutti i tuoi dispositivi.</p>
              </div>
            </>
          ) : (
            <>
              <AlertTriangle size={20} color="#f59e0b" />
              <div>
                <strong style={{ fontSize: '0.9rem', color: '#f59e0b' }}>Incolla qui la configurazione Firebase</strong>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Per sincronizzare il tuo progetto su Firebase e abilitare Google Auth reale.</p>
              </div>
            </>
          )}
        </div>

        {/* Instructions */}
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', lineHeight: '1.5' }}>
          Vai su <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>console.firebase.google.com</a> &gt; <em>Impostazioni Progetto</em> &gt; <em>Le tue app (Web)</em> e incolla qui il JSON di configurazione:
        </p>

        <textarea
          rows={6}
          className="quick-add-input"
          placeholder='{
  "apiKey": "AIzaSy...",
  "authDomain": "tuo-progetto.firebaseapp.com",
  "projectId": "tuo-progetto",
  "storageBucket": "tuo-progetto.firebasestorage.app",
  "messagingSenderId": "123...",
  "appId": "1:123:web:abc..."
}'
          value={configJson}
          onChange={e => setConfigJson(e.target.value)}
          style={{ fontFamily: 'monospace', fontSize: '0.8rem', width: '100%', marginBottom: '0.75rem', resize: 'vertical' }}
        />

        {error && (
          <div style={{ color: '#ef4444', fontSize: '0.82rem', marginBottom: '0.75rem' }}>
            {error}
          </div>
        )}

        {/* Deploy Command Helper */}
        <div style={{ background: 'var(--bg-main)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
            <Terminal size={14} /> Per pubblicare su Firebase Hosting:
          </div>
          <code style={{ fontSize: '0.8rem', color: '#38bdf8' }}>
            npm run build &amp;&amp; firebase deploy
          </code>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
            Chiudi
          </button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave}>
            Salva e Collega
          </button>
        </div>
      </div>
    </div>
  );
};
