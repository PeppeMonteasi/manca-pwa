import React, { useState, useEffect } from 'react';
import { Lock, ShieldCheck, KeyRound, Delete, AlertCircle, CheckCircle2 } from 'lucide-react';
import { verifyPin, setMasterPin, hasConfiguredPin, MASTER_PIN_ENV } from '../services/security';

export const PinLockScreen = ({ isUnlocked, onUnlock }) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState(hasConfiguredPin() ? 'unlock' : 'setup_first'); // 'unlock' | 'setup_first' | 'setup_confirm'
  const [tempFirstPin, setTempFirstPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [shake, setShake] = useState(false);

  // Ascolto digitazione da tastiera fisica (PC / Mac)
  useEffect(() => {
    if (isUnlocked) return;

    const handleKeyDown = (e) => {
      if (/^[0-9]$/.test(e.key)) {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin, isUnlocked, step, tempFirstPin]);

  const triggerError = (msg) => {
    setErrorMsg(msg);
    setShake(true);
    setTimeout(() => setShake(false), 500);
    setPin('');
  };

  const handleDigit = async (digit) => {
    if (pin.length >= 8) return;
    const nextPin = pin + digit;
    setPin(nextPin);
    setErrorMsg('');

    // Quando raggiunge 8 cifre
    if (nextPin.length === 8) {
      if (step === 'unlock') {
        const isValid = await verifyPin(nextPin);
        if (isValid) {
          onUnlock();
        } else {
          triggerError('PIN errato! Riprova.');
        }
      } else if (step === 'setup_first') {
        setTempFirstPin(nextPin);
        setPin('');
        setStep('setup_confirm');
      } else if (step === 'setup_confirm') {
        if (nextPin === tempFirstPin) {
          await setMasterPin(nextPin);
          onUnlock();
        } else {
          setTempFirstPin('');
          setStep('setup_first');
          triggerError('I due PIN non coincidono. Ricomincia la configurazione.');
        }
      }
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handleClear = () => {
    setPin('');
    setErrorMsg('');
  };

  if (isUnlocked) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'radial-gradient(circle at 50% 20%, #111827 0%, #090d16 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      userSelect: 'none'
    }}>
      <div style={{
        maxWidth: '360px',
        width: '100%',
        textAlign: 'center',
        animation: shake ? 'shake 0.4s ease' : 'fadeIn 0.25s ease'
      }}>
        {/* Icon Lock */}
        <div style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: 'rgba(16, 185, 129, 0.12)',
          border: '2px solid rgba(16, 185, 129, 0.4)',
          color: '#10b981',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem',
          boxShadow: '0 0 30px rgba(16, 185, 129, 0.25)'
        }}>
          {step === 'unlock' ? <Lock size={34} /> : <KeyRound size={34} />}
        </div>

        {/* Title */}
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f9fafb', marginBottom: '0.4rem' }}>
          {step === 'unlock' && 'Inserisci PIN di Sblocco'}
          {step === 'setup_first' && 'Crea il tuo PIN a 8 cifre'}
          {step === 'setup_confirm' && 'Conferma il PIN a 8 cifre'}
        </h2>

        <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '1.75rem' }}>
          {step === 'unlock' && 'Questa app è riservata. Digita il codice a 8 cifre.'}
          {step === 'setup_first' && 'Imposta un codice segreto di 8 cifre per proteggere la tua lista.'}
          {step === 'setup_confirm' && 'Digita nuovamente il PIN di 8 cifre per confermarlo.'}
        </p>

        {/* 8 Dots Indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          {[...Array(8)].map((_, idx) => {
            const isFilled = idx < pin.length;
            return (
              <div
                key={idx}
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: isFilled ? 'var(--primary)' : 'rgba(255, 255, 255, 0.1)',
                  border: `2px solid ${isFilled ? 'var(--primary)' : 'rgba(255, 255, 255, 0.25)'}`,
                  boxShadow: isFilled ? '0 0 12px var(--primary)' : 'none',
                  transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              />
            );
          })}
        </div>

        {/* Error message */}
        {errorMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            color: '#ef4444',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '1.25rem'
          }}>
            <AlertCircle size={16} /> {errorMsg}
          </div>
        )}

        {/* Numeric Keypad Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.85rem',
          maxWidth: '300px',
          margin: '0 auto 1.5rem'
        }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(String(digit))}
              style={{
                height: '62px',
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#f9fafb',
                fontSize: '1.5rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                outline: 'none'
              }}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.94)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
              onTouchStart={e => e.currentTarget.style.transform = 'scale(0.94)'}
              onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              {digit}
            </button>
          ))}

          {/* Clear button */}
          <button
            type="button"
            onClick={handleClear}
            style={{
              height: '62px',
              borderRadius: '16px',
              background: 'transparent',
              border: 'none',
              color: '#9ca3af',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            Annulla
          </button>

          {/* 0 Button */}
          <button
            type="button"
            onClick={() => handleDigit('0')}
            style={{
              height: '62px',
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#f9fafb',
              fontSize: '1.5rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              outline: 'none'
            }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.94)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            onTouchStart={e => e.currentTarget.style.transform = 'scale(0.94)'}
            onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            0
          </button>

          {/* Backspace button */}
          <button
            type="button"
            onClick={handleBackspace}
            style={{
              height: '62px',
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#f9fafb',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Cancella"
          >
            <Delete size={22} />
          </button>
        </div>

        {/* Security Footer Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#6b7280' }}>
          <ShieldCheck size={14} color="#10b981" /> Protetto con Hashing SHA-256
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }
      `}</style>
    </div>
  );
};
