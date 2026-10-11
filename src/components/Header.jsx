import React, { useState, useEffect } from 'react';
import { ShoppingBag, Sun, Moon, LogIn, Download, WifiOff, Share2, Flame, RefreshCw, LogOut, CreditCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useShopping } from '../context/ShoppingContext';
import { useCards } from '../context/CardsContext';
import { isFirebaseConfigured } from '../firebase/config';
import { triggerHaptic } from '../services/haptics';
import { useAppUpdate } from '../services/updateService';

export const Header = ({ onOpenShare, onOpenInstall }) => {
  const { user, setIsSSOModalOpen, setIsFirebaseModalOpen, logout } = useAuth();
  const { items, isSyncing } = useShopping();
  const { cards, setIsDrawerOpen } = useCards();
  const { updateAvailable, isUpdating, applyUpdate } = useAppUpdate();
  const [theme, setTheme] = useState(() => localStorage.getItem('manca_theme') || 'dark');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('manca_theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Rileva se l'app è già installata ed eseguita come PWA nativa
    const standaloneMode = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    setIsStandalone(standaloneMode);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleTheme = () => {
    triggerHaptic('light');
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const pendingCount = items.filter(i => !i.completed).length;

  return (
    <header className="app-header">
      <div className="header-content">
        {/* Brand */}
        <div className="brand">
          <div className="brand-icon">
            <ShoppingBag size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span>Manca!</span>
              <span className="brand-badge hide-on-mobile">Personale</span>
            </div>
            <div className="hide-on-mobile" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              {isSyncing ? (
                <><RefreshCw size={10} style={{ animation: 'spin 1s linear infinite' }} /> Sincronizzazione...</>
              ) : (
                pendingCount === 0 ? 'Tutto preso ✨' : `${pendingCount} da comprare`
              )}
            </div>
          </div>
        </div>

        {/* Offline Badge */}
        {isOffline && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            padding: '0.2rem 0.45rem',
            borderRadius: '99px',
            background: 'rgba(239, 68, 68, 0.15)',
            color: '#f87171',
            fontSize: '0.7rem',
            fontWeight: 700,
            border: '1px solid rgba(239, 68, 68, 0.3)',
            flexShrink: 0
          }}>
            <WifiOff size={12} /> <span className="hide-on-mobile">Offline</span>
          </div>
        )}

        {/* Actions */}
        <div className="header-actions">
          {/* Nuova versione pronta */}
          {updateAvailable && (
            <button
              type="button"
              className="btn-icon"
              onClick={applyUpdate}
              title="Nuova versione pronta! Tocca per aggiornare subito"
              style={{
                color: '#fff',
                background: 'var(--primary)',
                borderColor: 'var(--primary)',
                boxShadow: '0 0 12px rgba(16, 185, 129, 0.6)',
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={15} style={{ animation: isUpdating ? 'spin 1s linear infinite' : 'none' }} />
            </button>
          )}

          {/* Firebase Status Button */}
          <button 
            type="button"
            className="btn-icon" 
            onClick={() => {
              triggerHaptic('light');
              setIsFirebaseModalOpen(true);
            }}
            style={{
              color: isFirebaseConfigured ? '#10b981' : '#f59e0b',
              borderColor: isFirebaseConfigured ? 'rgba(16, 185, 129, 0.35)' : 'rgba(245, 158, 11, 0.35)'
            }}
            title={isFirebaseConfigured ? "Firebase Cloud Sincronizzato" : "Configura Firebase"}
          >
            <Flame size={17} color={isFirebaseConfigured ? '#10b981' : '#f59e0b'} />
          </button>

          {/* Loyalty Cards & Coupons Button */}
          <button 
            type="button" 
            className="btn-icon" 
            onClick={() => {
              triggerHaptic('light');
              setIsDrawerOpen(true);
            }} 
            title="Sportello Carte Fedeltà & Buoni Spesa"
            style={{
              position: 'relative',
              borderColor: 'rgba(16, 185, 129, 0.35)',
              color: 'var(--primary)'
            }}
          >
            <CreditCard size={18} />
            {cards.length > 0 && (
              <span style={{
                position: 'absolute',
                top: -3,
                right: -3,
                minWidth: '15px',
                height: '15px',
                padding: '0 3px',
                borderRadius: '99px',
                background: 'var(--primary)',
                color: '#fff',
                fontSize: '0.6rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.25)'
              }}>
                {cards.length}
              </span>
            )}
          </button>

          {/* Share Button */}
          <button 
            type="button" 
            className="btn-icon" 
            onClick={() => {
              triggerHaptic('light');
              onOpenShare();
            }} 
            title="Condividi lista spesa"
          >
            <Share2 size={17} />
          </button>

          {/* Theme Switcher */}
          <button 
            type="button" 
            className="btn-icon" 
            onClick={toggleTheme} 
            title="Cambia Tema"
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* Install PWA Button (icona compatta per non rubare spazio su mobile) */}
          {!isStandalone && (
            <button
              type="button"
              className="btn-icon"
              onClick={() => {
                triggerHaptic('light');
                onOpenInstall();
              }}
              title="Installa applicazione"
            >
              <Download size={16} />
            </button>
          )}

          {/* User Account / Profile */}
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }}>
              <img 
                src={user.avatar} 
                alt={user.name} 
                style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid var(--primary)', cursor: 'pointer', objectFit: 'cover' }}
                onClick={() => {
                  triggerHaptic('light');
                  setIsSSOModalOpen(true);
                }}
                title={`Accesso come ${user.name} (Tocca per gestire o disconnettere)`}
              />
              <button
                type="button"
                className="btn-icon hide-on-mobile"
                onClick={() => {
                  triggerHaptic('light');
                  logout();
                }}
                title="Disconnetti"
                style={{ width: 32, height: 32, color: '#ef4444' }}
              >
                <LogOut size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
