import React, { useState, useEffect } from 'react';
import { X, Download, Share, PlusSquare, Smartphone, Monitor } from 'lucide-react';

export const PWAInstallPrompt = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`Risultato installazione: ${outcome}`);
      setDeferredPrompt(null);
      onClose();
    } else {
      alert('Apri il menu del browser e seleziona "Aggiungi a schermata Home" o "Installa App"');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.15rem' }}>
            <Download size={22} color="var(--primary)" /> Installa Manca! come App
          </div>
          <button className="btn btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: '1.5' }}>
          Installa questa Progressive Web App per aprirla velocemente come un'applicazione nativa dal tuo PC, Telefono o Tablet, **anche senza connessione internet**.
        </p>

        {isIOS ? (
          <div style={{ background: 'var(--bg-main)', padding: '1.1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.6rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Smartphone size={18} color="var(--primary)" /> Su iPhone o iPad (Safari):
            </h4>
            <ol style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              <li>Tocca il pulsante <strong>Condividi</strong> <Share size={14} style={{ verticalAlign: 'middle' }} /> in basso in Safari.</li>
              <li>Scorri verso il basso e tocca <strong>"Aggiungi alla schermata Home"</strong> <PlusSquare size={14} style={{ verticalAlign: 'middle' }} />.</li>
              <li>Tocca <strong>Aggiungi</strong> in alto a destra.</li>
            </ol>
          </div>
        ) : (
          <div style={{ background: 'var(--bg-main)', padding: '1.1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.6rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Monitor size={18} color="var(--primary)" /> Su Android o Computer (Chrome/Edge):
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1rem' }}>
              Clicca il pulsante qui sotto per avviare l'installazione guidata sul tuo sistema operativo.
            </p>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleInstallClick}>
              <Download size={18} /> Installa Ora
            </button>
          </div>
        )}

        <button className="btn btn-secondary" style={{ width: '100%' }} onClick={onClose}>
          Ho capito
        </button>
      </div>
    </div>
  );
};
