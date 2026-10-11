import React, { useState, useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import { X, Copy, Check, QrCode, Barcode, Hash, Maximize2, Sparkles, Image as ImageIcon } from 'lucide-react';
import { triggerHaptic } from '../../services/haptics';

export const CouponCodeModal = ({ coupon, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('auto'); // 'barcode' | 'qrcode' | 'text'
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const barcodeRef = useRef(null);
  const qrCanvasRef = useRef(null);
  const fullscreenBarcodeRef = useRef(null);
  const fullscreenQrCanvasRef = useRef(null);

  // Imposta la scheda predefinita all'apertura del modal
  useEffect(() => {
    if (coupon) {
      if (coupon.codeType === 'qrcode') {
        setActiveTab('qrcode');
      } else if (coupon.codeType === 'barcode') {
        setActiveTab('barcode');
      } else if (coupon.code) {
        // Se è puramente numerico o ha lunghezza tipica barcode (8, 12, 13 cifre), preferisci barcode
        if (/^\d{8,14}$/.test(coupon.code.trim())) {
          setActiveTab('barcode');
        } else {
          setActiveTab('qrcode');
        }
      } else {
        setActiveTab('barcode');
      }
    }
  }, [coupon]);

  // Render Barcode
  useEffect(() => {
    if (!coupon?.code) return;
    const renderBc = (el, width = 2.2, height = 75) => {
      if (!el) return;
      const clean = coupon.code.trim();
      let format = 'CODE128';
      if (/^\d{13}$/.test(clean)) format = 'EAN13';
      else if (/^\d{8}$/.test(clean)) format = 'EAN8';

      try {
        JsBarcode(el, clean, {
          format,
          lineColor: '#000000',
          background: '#ffffff',
          width,
          height,
          displayValue: true,
          fontSize: 16,
          font: 'monospace',
          textMargin: 6,
          margin: 10
        });
      } catch (err) {
        try {
          JsBarcode(el, clean, {
            format: 'CODE128',
            lineColor: '#000000',
            background: '#ffffff',
            width: 2,
            height,
            displayValue: true
          });
        } catch (e) {
          console.warn('Errore rendering barcode coupon:', e);
        }
      }
    };

    if (activeTab === 'barcode') {
      renderBc(barcodeRef.current, 2.2, 75);
    }
    if (isFullscreen) {
      renderBc(fullscreenBarcodeRef.current, 2.8, 120);
    }
  }, [coupon?.code, activeTab, isFullscreen]);

  // Render QR Code
  useEffect(() => {
    if (!coupon?.code) return;
    const renderQr = (canvas, width = 200) => {
      if (!canvas) return;
      QRCode.toCanvas(
        canvas,
        coupon.code.trim(),
        {
          width,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#ffffff'
          }
        },
        (err) => {
          if (err) console.warn('Errore rendering QR code coupon:', err);
        }
      );
    };

    if (activeTab === 'qrcode') {
      renderQr(qrCanvasRef.current, 210);
    }
    if (isFullscreen) {
      renderQr(fullscreenQrCanvasRef.current, 280);
    }
  }, [coupon?.code, activeTab, isFullscreen]);

  if (!isOpen || !coupon) return null;

  const handleCopyCode = async () => {
    if (!coupon.code) return;
    triggerHaptic('light');
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Clipboard non disponibile:', err);
    }
  };

  const toggleFullscreen = () => {
    triggerHaptic('medium');
    setIsFullscreen(!isFullscreen);
  };

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 10005 }}>
        <div 
          className="modal-card" 
          onClick={e => e.stopPropagation()}
          style={{
            maxWidth: '480px',
            maxHeight: '92vh',
            overflowY: 'auto',
            borderRadius: '24px',
            padding: '1.4rem 1.25rem',
            border: '2px solid var(--primary)',
            boxShadow: '0 0 35px rgba(16, 185, 129, 0.35)'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{
                width: 42,
                height: 42,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--primary) 0%, #059669 100%)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem'
              }}>
                🎁
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {coupon.supermarket}
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700 }}>
                  Buono Sconto: {coupon.value}
                </span>
              </div>
            </div>

            <button 
              type="button" 
              className="btn btn-icon" 
              onClick={onClose} 
              style={{ width: 36, height: 36 }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Dettagli sintetici del buono */}
          <div style={{
            background: 'var(--bg-main)',
            borderRadius: '14px',
            padding: '0.75rem 0.9rem',
            marginBottom: '1.15rem',
            fontSize: '0.82rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem'
          }}>
            {coupon.minSpend && coupon.minSpend !== 'Nessuno' && (
              <div><strong>Spesa minima:</strong> {coupon.minSpend}</div>
            )}
            {coupon.expiryDate && (
              <div><strong>Scadenza:</strong> {coupon.expiryDate}</div>
            )}
            {coupon.notes && (
              <div style={{ color: 'var(--text-secondary)' }}><em>{coupon.notes}</em></div>
            )}
          </div>

          {/* Selettore Modalità: Barcode / QR Code / Codice Numerico */}
          {coupon.code && (
            <div style={{
              display: 'flex',
              gap: '0.35rem',
              background: 'var(--bg-main)',
              padding: '0.3rem',
              borderRadius: '12px',
              marginBottom: '1rem'
            }}>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  triggerHaptic('light');
                  setActiveTab('barcode');
                }}
                style={{
                  flex: 1,
                  padding: '0.55rem 0.4rem',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  borderRadius: '9px',
                  background: activeTab === 'barcode' ? 'var(--primary)' : 'transparent',
                  color: activeTab === 'barcode' ? '#fff' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem'
                }}
              >
                <Barcode size={15} /> Barcode
              </button>

              <button
                type="button"
                className="btn"
                onClick={() => {
                  triggerHaptic('light');
                  setActiveTab('qrcode');
                }}
                style={{
                  flex: 1,
                  padding: '0.55rem 0.4rem',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  borderRadius: '9px',
                  background: activeTab === 'qrcode' ? 'var(--primary)' : 'transparent',
                  color: activeTab === 'qrcode' ? '#fff' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem'
                }}
              >
                <QrCode size={15} /> QR Code
              </button>

              <button
                type="button"
                className="btn"
                onClick={() => {
                  triggerHaptic('light');
                  setActiveTab('text');
                }}
                style={{
                  flex: 1,
                  padding: '0.55rem 0.4rem',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  borderRadius: '9px',
                  background: activeTab === 'text' ? 'var(--primary)' : 'transparent',
                  color: activeTab === 'text' ? '#fff' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem'
                }}
              >
                <Hash size={15} /> Codice
              </button>
            </div>
          )}

          {/* DISPLAY CODICE: Fondo Bianco Puro per Lettori Cassa */}
          <div 
            style={{
              background: '#ffffff',
              borderRadius: '18px',
              padding: '1.25rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.22)',
              position: 'relative'
            }}
          >
            {/* Tasto Ingrandisci a schermo intero */}
            {coupon.code && (
              <button
                type="button"
                onClick={toggleFullscreen}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  background: 'rgba(0, 0, 0, 0.08)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '4px 8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.7rem',
                  color: '#374151',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
                title="Ingrandisci a tutto schermo"
              >
                <Maximize2 size={13} />
                <span>Schermo Intero</span>
              </button>
            )}

            {/* 1. Vista Barcode */}
            {activeTab === 'barcode' && coupon.code && (
              <div style={{ maxWidth: '100%', overflowX: 'auto', display: 'flex', justifyContent: 'center' }}>
                <svg ref={barcodeRef} style={{ maxWidth: '100%', height: 'auto', display: 'block' }} />
              </div>
            )}

            {/* 2. Vista QR Code */}
            {activeTab === 'qrcode' && coupon.code && (
              <div style={{ padding: '0.5rem', display: 'flex', justifyContent: 'center' }}>
                <canvas ref={qrCanvasRef} style={{ maxWidth: '100%', height: 'auto', display: 'block', borderRadius: '8px' }} />
              </div>
            )}

            {/* 3. Vista Codice Alfanumerico / Numerico */}
            {activeTab === 'text' && coupon.code && (
              <div style={{ textAlign: 'center', padding: '1rem 0.5rem', width: '100%' }}>
                <div style={{
                  fontSize: '1.45rem',
                  fontWeight: 900,
                  fontFamily: 'monospace',
                  letterSpacing: '0.12em',
                  color: '#111827',
                  wordBreak: 'break-all',
                  marginBottom: '0.85rem'
                }}>
                  {coupon.code}
                </div>
              </div>
            )}

            {/* 4. Vista Foto/Screenshot del Buono */}
            {coupon.codeImage && (
              <div style={{ marginTop: coupon.code ? '1rem' : '0', width: '100%', textAlign: 'center' }}>
                <img 
                  src={coupon.codeImage} 
                  alt="Foto Buono Sconto" 
                  style={{ maxHeight: '180px', maxWidth: '100%', objectFit: 'contain', borderRadius: '10px' }} 
                />
              </div>
            )}

            {/* Se non c'è né codice né immagine */}
            {!coupon.code && !coupon.codeImage && (
              <div style={{ color: '#4b5563', padding: '1.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>🏷️</div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Nessun codice numerico o barcode inserito</div>
                <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: '0.2rem' }}>
                  Mostra direttamente questo buono alla cassa
                </div>
              </div>
            )}
          </div>

          {/* Valore testuale e pulsante Copia Codice */}
          {coupon.code && (
            <div style={{
              marginTop: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--bg-main)',
              borderRadius: '12px',
              padding: '0.65rem 0.85rem',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Codice Buono
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 800, fontFamily: 'monospace', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {coupon.code}
                </div>
              </div>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCopyCode}
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem', fontWeight: 700, flexShrink: 0 }}
              >
                {copied ? <><Check size={14} color="#10b981" /> Copiato!</> : <><Copy size={14} /> Copia</>}
              </button>
            </div>
          )}

          {/* Footer */}
          <div style={{ marginTop: '1.25rem' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onClose}
              style={{ width: '100%', padding: '0.75rem', fontWeight: 800 }}
            >
              Fatto
            </button>
          </div>
        </div>
      </div>

      {/* MODAL FULLSCREEN SCHERMO INTERO AD ALTA LUMINOSITÀ PER LA CASSA */}
      {isFullscreen && (
        <div 
          onClick={toggleFullscreen}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            textAlign: 'center',
            animation: 'fadeIn 0.2s ease'
          }}
        >
          {/* Tasto Chiudi */}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={toggleFullscreen}
            style={{
              position: 'absolute',
              top: 'calc(1.2rem + env(safe-area-inset-top))',
              right: '1.2rem',
              borderRadius: '99px',
              padding: '0.6rem 1.1rem',
              background: '#f3f4f6',
              border: '1px solid #d1d5db',
              color: '#111827',
              fontWeight: 700,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <X size={18} /> Chiudi
          </button>

          <div style={{ color: '#111827', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 800 }}>{coupon.supermarket} - {coupon.value}</span>
            <p style={{ fontSize: '0.95rem', color: '#6b7280', fontWeight: 600, marginTop: '0.2rem' }}>
              Mostra questo codice al lettore ottico della cassa
            </p>
          </div>

          <div style={{
            background: '#ffffff',
            padding: '1.5rem 1rem',
            borderRadius: '20px',
            border: '2px solid #e5e7eb',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
            maxWidth: '100%',
            overflowX: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            {activeTab === 'barcode' && coupon.code && (
              <svg ref={fullscreenBarcodeRef} style={{ maxWidth: '100%', height: 'auto' }} />
            )}

            {activeTab === 'qrcode' && coupon.code && (
              <canvas ref={fullscreenQrCanvasRef} style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }} />
            )}

            {activeTab === 'text' && coupon.code && (
              <div style={{ color: '#000000', fontWeight: 900, fontSize: '1.7rem', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
                {coupon.code}
              </div>
            )}

            {coupon.codeImage && (
              <img 
                src={coupon.codeImage} 
                alt="Foto Buono Sconto" 
                style={{ maxHeight: '240px', maxWidth: '100%', objectFit: 'contain', marginTop: coupon.code ? '1rem' : '0' }} 
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};
