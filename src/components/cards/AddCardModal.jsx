import React, { useState } from 'react';
import { X, Plus, CreditCard, Palette, Camera, Check, Store } from 'lucide-react';
import { useCards, SUPERMARKET_PRESETS, THEME_COLORS } from '../../context/CardsContext';
import { triggerHaptic } from '../../services/haptics';

export const AddCardModal = ({ isOpen, onClose }) => {
  const { addCard } = useCards();

  const [supermarket, setSupermarket] = useState('Esselunga');
  const [value, setValue] = useState('');
  const [barcodeImage, setBarcodeImage] = useState('');
  const [selectedColor, setSelectedColor] = useState(THEME_COLORS[0]);

  if (!isOpen) return null;

  // Quando si seleziona un preset di supermercato, aggiorna anche il colore predefinito
  const handleSelectPreset = (preset) => {
    triggerHaptic('light');
    setSupermarket(preset.name);
    const matchingColor = THEME_COLORS.find(c => c.hex.toLowerCase() === preset.color.toLowerCase()) || {
      hex: preset.color,
      bg: preset.bg || `linear-gradient(135deg, ${preset.color} 0%, #1e293b 100%)`
    };
    setSelectedColor(matchingColor);
  };

  // Caricamento e compressione foto del codice a barre
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    triggerHaptic('light');
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Ridimensionamento su canvas per mantenere le dimensioni leggere (< 100KB)
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600;
        const scale = Math.min(1, MAX_WIDTH / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.82);
        setBarcodeImage(compressedBase64);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!supermarket.trim() || !value.trim()) return;

    addCard({
      supermarket: supermarket.trim(),
      value: value.trim(),
      barcode: value.trim(),
      barcodeImage: barcodeImage,
      color: selectedColor.hex,
      bg: selectedColor.bg
    });

    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 10000 }}>
      <div 
        className="modal-card" 
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '520px',
          maxHeight: '92vh',
          overflowY: 'auto',
          borderRadius: '24px',
          padding: '1.5rem 1.25rem'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Nuova Carta Fedeltà
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0, fontWeight: 500 }}>
                Salva la tessera del supermercato con codice a barre
              </p>
            </div>
          </div>
          <button className="btn btn-icon" onClick={onClose} style={{ width: 36, height: 36 }}>
            <X size={18} />
          </button>
        </div>

        {/* Anteprima Live Carta */}
        <div style={{
          background: selectedColor.bg,
          borderRadius: '16px',
          padding: '1.15rem 1.25rem',
          color: '#ffffff',
          marginBottom: '1.25rem',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '110px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              {supermarket || 'Nome Supermercato'}
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, background: 'rgba(255, 255, 255, 0.25)', padding: '0.2rem 0.6rem', borderRadius: '99px', textTransform: 'uppercase' }}>
              Tessera Fedeltà
            </span>
          </div>

          <div style={{ marginTop: '1.2rem', fontFamily: 'monospace', fontSize: '1.15rem', fontWeight: 800, letterSpacing: '0.12em', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
            {value || '•••• •••• ••••'}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Preset Supermercati */}
          <div style={{ marginBottom: '1.1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.45rem', textTransform: 'uppercase' }}>
              <Store size={14} /> Scegli Supermercato
            </label>
            <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.35rem', scrollbarWidth: 'none' }}>
              {SUPERMARKET_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="preset-chip"
                  onClick={() => handleSelectPreset(p)}
                  style={{
                    background: supermarket.toLowerCase() === p.name.toLowerCase() ? 'var(--primary)' : undefined,
                    color: supermarket.toLowerCase() === p.name.toLowerCase() ? 'white' : undefined,
                    borderColor: supermarket.toLowerCase() === p.name.toLowerCase() ? 'var(--primary)' : undefined,
                    fontWeight: supermarket.toLowerCase() === p.name.toLowerCase() ? 700 : 500,
                    fontSize: '0.82rem',
                    padding: '0.45rem 0.75rem'
                  }}
                >
                  {p.icon} {p.name}
                </button>
              ))}
            </div>
            <input
              type="text"
              required
              className="quick-add-input"
              value={supermarket}
              onChange={e => setSupermarket(e.target.value)}
              placeholder="Oppure scrivi nome supermercato..."
              style={{ marginTop: '0.5rem', fontSize: '0.95rem', fontWeight: 600 }}
            />
          </div>

          {/* Numero Tessera / Codice a Barre */}
          <div style={{ marginBottom: '1.1rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
              Numero Carta / Codice a Barre (Valore) <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              required
              className="quick-add-input"
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder="Es. 0400012345678 (13 cifre o alfanumerico)"
              style={{ fontSize: '1.05rem', fontWeight: 700, fontFamily: 'monospace' }}
            />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
              Questo valore verrà convertito automaticamente in codice a barre leggibile alla cassa.
            </span>
          </div>

          {/* Opzione: Carica Foto o Immagine del Codice a Barre */}
          <div style={{ marginBottom: '1.15rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
              <Camera size={14} /> Foto Codice a Barre (Opzionale)
            </label>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <label 
                className="btn btn-secondary" 
                style={{ cursor: 'pointer', padding: '0.65rem 1rem', fontSize: '0.85rem', flex: 1, display: 'flex', justifyContent: 'center', gap: '0.45rem' }}
              >
                <Camera size={16} /> Carica foto / Scatta
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment" 
                  onChange={handleImageUpload} 
                  style={{ display: 'none' }} 
                />
              </label>

              {barcodeImage && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setBarcodeImage('')}
                  style={{ color: '#ef4444', padding: '0.65rem 0.85rem', fontSize: '0.82rem' }}
                >
                  Rimuovi foto
                </button>
              )}
            </div>

            {barcodeImage && (
              <div style={{ marginTop: '0.65rem', textAlign: 'center', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '12px' }}>
                <img src={barcodeImage} alt="Anteprima codice" style={{ maxHeight: '90px', maxWidth: '100%', objectFit: 'contain' }} />
              </div>
            )}
          </div>

          {/* Scelta Colore Tema Supermercato */}
          <div style={{ marginBottom: '1.4rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
              <Palette size={14} /> Colore Tema Carta
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(42px, 1fr))', gap: '0.5rem' }}>
              {THEME_COLORS.map((tc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setSelectedColor(tc);
                  }}
                  style={{
                    height: '42px',
                    borderRadius: '12px',
                    background: tc.bg,
                    border: selectedColor.hex === tc.hex ? '3px solid #ffffff' : '2px solid transparent',
                    cursor: 'pointer',
                    boxShadow: selectedColor.hex === tc.hex ? '0 0 12px rgba(255,255,255,0.6)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    transition: 'transform 0.15s ease'
                  }}
                  title={tc.label}
                >
                  {selectedColor.hex === tc.hex && <Check size={18} strokeWidth={3} />}
                </button>
              ))}
            </div>
          </div>

          {/* Bottoni Azione */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="button" className="btn btn-secondary" style={{ flex: 1, padding: '0.85rem' }} onClick={onClose}>
              Annulla
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2, padding: '0.85rem', fontWeight: 800, fontSize: '0.98rem' }}>
              <Plus size={18} /> Salva Carta Fedeltà
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
