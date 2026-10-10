import React, { useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';
import { Maximize2, X, Image as ImageIcon } from 'lucide-react';
import { triggerHaptic } from '../../services/haptics';

export const BarcodeRenderer = ({ barcode, barcodeImage, supermarket, value, color }) => {
  const svgRef = useRef(null);
  const [renderError, setRenderError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!barcode || !svgRef.current) return;

    try {
      setRenderError(false);
      // Rilevamento automatico formato (se 13 cifre numeriche è EAN13, altrimenti CODE128)
      const cleanCode = String(barcode).trim();
      let format = 'CODE128';
      if (/^\d{13}$/.test(cleanCode)) {
        format = 'EAN13';
      } else if (/^\d{8}$/.test(cleanCode)) {
        format = 'EAN8';
      }

      JsBarcode(svgRef.current, cleanCode, {
        format: format,
        lineColor: '#000000',
        background: '#ffffff',
        width: 2.2,
        height: 75,
        displayValue: true,
        fontSize: 15,
        font: 'monospace',
        textMargin: 6,
        margin: 10
      });
    } catch (err) {
      console.warn('Errore rendering Barcode nativo (riprovo con CODE128 generico):', err);
      try {
        JsBarcode(svgRef.current, String(barcode).trim(), {
          format: 'CODE128',
          lineColor: '#000000',
          background: '#ffffff',
          width: 2,
          height: 75,
          displayValue: true
        });
      } catch (fallbackErr) {
        setRenderError(true);
      }
    }
  }, [barcode]);

  const toggleFullscreen = () => {
    triggerHaptic('medium');
    setIsFullscreen(!isFullscreen);
  };

  const hasBarcode = Boolean(barcode && !renderError);
  const hasImage = Boolean(barcodeImage);

  if (!hasBarcode && !hasImage) {
    return (
      <div style={{
        background: '#ffffff',
        borderRadius: '14px',
        padding: '1.25rem 1rem',
        textAlign: 'center',
        color: '#1f2937'
      }}>
        <div style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '0.1em', fontFamily: 'monospace' }}>
          {value || 'NESSUN CODICE'}
        </div>
        <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '0.25rem' }}>
          Numero tessera fedeltà
        </div>
      </div>
    );
  }

  return (
    <>
      <div 
        onClick={toggleFullscreen}
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '0.85rem 0.65rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden'
        }}
        title="Tocca per ingrandire alla cassa"
      >
        {/* Pulsante Ingrandisci in alto a destra */}
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: 'rgba(0, 0, 0, 0.08)',
          borderRadius: '8px',
          padding: '4px 6px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '0.7rem',
          color: '#374151',
          fontWeight: 700
        }}>
          <Maximize2 size={13} />
          <span>Ingrandisci</span>
        </div>

        {/* 1. Barcode Generato */}
        {hasBarcode && (
          <div style={{ maxWidth: '100%', overflowX: 'auto', display: 'flex', justifyContent: 'center' }}>
            <svg ref={svgRef} style={{ maxWidth: '100%', height: 'auto', display: 'block' }}></svg>
          </div>
        )}

        {/* 2. Immagine Codice a Barre / Tessera caricata dall'utente */}
        {hasImage && (
          <div style={{ marginTop: hasBarcode ? '0.6rem' : '0', width: '100%', textAlign: 'center' }}>
            <img 
              src={barcodeImage} 
              alt="Codice a barre foto" 
              style={{ maxHeight: '110px', maxWidth: '100%', objectFit: 'contain', borderRadius: '8px' }} 
            />
          </div>
        )}

        {/* Dettaglio numerico leggibile */}
        {value && !hasBarcode && (
          <div style={{ color: '#111827', fontWeight: 800, fontSize: '1.15rem', fontFamily: 'monospace', letterSpacing: '0.05em', marginTop: '0.4rem' }}>
            {value}
          </div>
        )}
      </div>

      {/* MODAL INGRANDITO A SCHERMO INTERO AD ALTA LUMINOSITÀ PER LA CASSA */}
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
            <span style={{ fontSize: '1.75rem', fontWeight: 800 }}>{supermarket}</span>
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
            {hasBarcode && (
              <svg 
                ref={el => {
                  if (el && barcode) {
                    try {
                      JsBarcode(el, String(barcode).trim(), {
                        format: /^\d{13}$/.test(String(barcode).trim()) ? 'EAN13' : 'CODE128',
                        lineColor: '#000000',
                        background: '#ffffff',
                        width: 2.8,
                        height: 120,
                        displayValue: true,
                        fontSize: 18,
                        font: 'monospace',
                        textMargin: 8,
                        margin: 12
                      });
                    } catch (e) {
                      try {
                        JsBarcode(el, String(barcode).trim(), {
                          format: 'CODE128',
                          width: 2.5,
                          height: 120,
                          displayValue: true
                        });
                      } catch (err) {}
                    }
                  }
                }}
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            )}

            {hasImage && (
              <img 
                src={barcodeImage} 
                alt="Codice a barre foto" 
                style={{ maxHeight: '200px', maxWidth: '100%', objectFit: 'contain', marginTop: hasBarcode ? '1rem' : '0' }} 
              />
            )}

            {value && (
              <div style={{ color: '#000000', fontWeight: 800, fontSize: '1.4rem', fontFamily: 'monospace', marginTop: '0.8rem', letterSpacing: '0.08em' }}>
                {value}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
