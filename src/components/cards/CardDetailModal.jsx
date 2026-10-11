import React, { useState } from 'react';
import { X, Trash2, Tag, Calendar, ShoppingBag, Plus, Check, Percent, DollarSign, AlertCircle, Clock, Sparkles, QrCode, Barcode, Hash, Image as ImageIcon } from 'lucide-react';
import { useCards } from '../../context/CardsContext';
import { BarcodeRenderer } from './BarcodeRenderer';
import { CouponCodeModal } from './CouponCodeModal';
import { triggerHaptic } from '../../services/haptics';

export const CardDetailModal = ({ card, isOpen, onClose }) => {
  const { deleteCard, getCouponsForSupermarket, addCoupon, toggleCouponUsed, deleteCoupon } = useCards();

  const [isAddingCoupon, setIsAddingCoupon] = useState(false);
  const [couponVal, setCouponVal] = useState('');
  const [couponType, setCouponType] = useState('euro'); // 'euro' | 'percent'
  const [minSpend, setMinSpend] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [couponNotes, setCouponNotes] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponCodeType, setCouponCodeType] = useState('barcode'); // 'barcode' | 'qrcode' | 'text'
  const [couponCodeImage, setCouponCodeImage] = useState('');
  const [selectedCouponForCode, setSelectedCouponForCode] = useState(null);

  if (!isOpen || !card) return null;

  const coupons = getCouponsForSupermarket(card.supermarket);

  const handleCouponImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600;
        const scale = Math.min(1, MAX_WIDTH / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.82);
        setCouponCodeImage(compressedBase64);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleCreateCoupon = (e) => {
    e.preventDefault();
    if (!couponVal.trim()) return;

    const formattedVal = couponType === 'euro' 
      ? `${couponVal.trim()} €` 
      : `${couponVal.trim()}%`;

    const formattedMinSpend = minSpend.trim() 
      ? (minSpend.includes('€') ? minSpend.trim() : `${minSpend.trim()} €`)
      : 'Nessuno';

    addCoupon({
      supermarket: card.supermarket,
      value: formattedVal,
      minSpend: formattedMinSpend,
      expiryDate: expiryDate || '',
      notes: couponNotes.trim(),
      code: couponCode.trim(),
      codeType: couponCodeType,
      codeImage: couponCodeImage
    });

    setCouponVal('');
    setMinSpend('');
    setExpiryDate('');
    setCouponNotes('');
    setCouponCode('');
    setCouponCodeType('barcode');
    setCouponCodeImage('');
    setIsAddingCoupon(false);
  };

  const handleDeleteCard = () => {
    if (window.confirm(`Vuoi davvero eliminare la carta fedeltà ${card.supermarket}?`)) {
      deleteCard(card.id);
      onClose();
    }
  };

  // Helper per calcolare se un buono è scaduto o in scadenza
  const getExpiryStatus = (dateStr) => {
    if (!dateStr) return null;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const exp = new Date(dateStr);
    exp.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: 'Scaduto', color: '#ef4444', isExpired: true };
    }
    if (diffDays <= 3) {
      return { label: `Scade tra ${diffDays} gg`, color: '#f59e0b', isExpiringSoon: true };
    }
    return { label: `Scadenza: ${dateStr}`, color: '#10b981', isExpiringSoon: false };
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 10000 }}>
      <div 
        className="modal-card" 
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '560px',
          maxHeight: '94vh',
          overflowY: 'auto',
          borderRadius: '24px',
          padding: '1.5rem 1.25rem',
          border: `2px solid ${card.color || 'var(--primary)'}`,
          boxShadow: `0 0 40px ${card.color ? card.color + '44' : 'rgba(16, 185, 129, 0.3)'}`
        }}
      >
        {/* Header con Supermercato e Colore */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: '14px',
              background: card.bg || card.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '1.4rem',
              boxShadow: '0 4px 14px rgba(0,0,0,0.25)'
            }}>
              💳
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                {card.supermarket}
              </h2>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Tessera Fedeltà &amp; Buoni Sconto
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <button 
              type="button" 
              className="btn btn-icon" 
              onClick={handleDeleteCard} 
              title="Elimina questa carta"
              style={{ width: 38, height: 38, color: '#ef4444' }}
            >
              <Trash2 size={17} />
            </button>
            <button 
              type="button" 
              className="btn btn-icon" 
              onClick={onClose} 
              title="Chiudi"
              style={{ width: 38, height: 38 }}
            >
              <X size={19} />
            </button>
          </div>
        </div>

        {/* 1. SEZIONE CODICE A BARRE DIGITALE / FOTO */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Codice a Barre alla Cassa
            </label>
            <span style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 700 }}>
              Tocca il barcode per ingrandire
            </span>
          </div>

          <BarcodeRenderer 
            barcode={card.barcode || card.value} 
            barcodeImage={card.barcodeImage} 
            supermarket={card.supermarket} 
            value={card.value}
            color={card.color}
          />
        </div>

        {/* 2. SEZIONE BUONI SCONTO DEL SUPERMERCATO */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Tag size={18} color="var(--primary)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Buoni Sconto ({coupons.filter(c => !c.used).length} attivi)
              </h3>
            </div>

            {!isAddingCoupon && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  triggerHaptic('light');
                  setIsAddingCoupon(true);
                }}
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem', fontWeight: 700 }}
              >
                <Plus size={15} /> Registra Buono
              </button>
            )}
          </div>

          {/* Form Registrazione Nuovo Buono */}
          {isAddingCoupon && (
            <form 
              onSubmit={handleCreateCoupon}
              style={{
                background: 'var(--bg-surface)',
                border: '1.5px solid var(--primary)',
                borderRadius: '16px',
                padding: '1.15rem 1rem',
                marginBottom: '1.25rem',
                animation: 'slideUp 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Sparkles size={16} /> Nuovo Buono per {card.supermarket}
                </span>
                <button
                  type="button"
                  className="btn btn-icon"
                  onClick={() => setIsAddingCoupon(false)}
                  style={{ width: 28, height: 28 }}
                >
                  <X size={14} />
                </button>
              </div>

              {/* Valore e Tipo (€ o %) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '0.65rem', marginBottom: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
                    Valore Sconto <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    className="quick-add-input"
                    value={couponVal}
                    onChange={e => setCouponVal(e.target.value)}
                    placeholder="Es. 10 o 20"
                    style={{ fontSize: '1.05rem', fontWeight: 800 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
                    Tipo
                  </label>
                  <div style={{ display: 'flex', gap: '0.3rem', height: '48px' }}>
                    <button
                      type="button"
                      className="btn"
                      onClick={() => setCouponType('euro')}
                      style={{
                        flex: 1,
                        padding: 0,
                        background: couponType === 'euro' ? 'var(--primary)' : 'var(--bg-main)',
                        color: couponType === 'euro' ? 'white' : 'var(--text-secondary)',
                        fontWeight: 800,
                        fontSize: '1rem'
                      }}
                    >
                      €
                    </button>
                    <button
                      type="button"
                      className="btn"
                      onClick={() => setCouponType('percent')}
                      style={{
                        flex: 1,
                        padding: 0,
                        background: couponType === 'percent' ? 'var(--primary)' : 'var(--bg-main)',
                        color: couponType === 'percent' ? 'white' : 'var(--text-secondary)',
                        fontWeight: 800,
                        fontSize: '1rem'
                      }}
                    >
                      %
                    </button>
                  </div>
                </div>
              </div>

              {/* Minimo di Spesa & Data di Scadenza */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
                    Minimo di Spesa
                  </label>
                  <input
                    type="text"
                    className="quick-add-input"
                    value={minSpend}
                    onChange={e => setMinSpend(e.target.value)}
                    placeholder="Es. 50 € (opzionale)"
                    style={{ fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
                    Data di Scadenza
                  </label>
                  <input
                    type="date"
                    className="quick-add-input"
                    value={expiryDate}
                    onChange={e => setExpiryDate(e.target.value)}
                    style={{ fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              {/* Codice Buono / Barcode / QR Code */}
              <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
                  Codice Buono / Barcode / QR (Opzionale)
                </label>
                <input
                  type="text"
                  className="quick-add-input"
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value)}
                  placeholder="Es. 0400098765432 o SCONTO10"
                  style={{ fontSize: '0.95rem', fontFamily: 'monospace', fontWeight: 700 }}
                />

                {/* Selettore tipo formato visualizzazione codice */}
                {couponCode.trim() && (
                  <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.45rem' }}>
                    <button
                      type="button"
                      className="btn"
                      onClick={() => setCouponCodeType('barcode')}
                      style={{
                        flex: 1,
                        padding: '0.4rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: couponCodeType === 'barcode' ? 'var(--primary)' : 'var(--bg-main)',
                        color: couponCodeType === 'barcode' ? '#fff' : 'var(--text-secondary)',
                        borderRadius: '8px'
                      }}
                    >
                      <Barcode size={13} style={{ marginRight: 3, verticalAlign: 'middle' }} /> Barcode
                    </button>
                    <button
                      type="button"
                      className="btn"
                      onClick={() => setCouponCodeType('qrcode')}
                      style={{
                        flex: 1,
                        padding: '0.4rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: couponCodeType === 'qrcode' ? 'var(--primary)' : 'var(--bg-main)',
                        color: couponCodeType === 'qrcode' ? '#fff' : 'var(--text-secondary)',
                        borderRadius: '8px'
                      }}
                    >
                      <QrCode size={13} style={{ marginRight: 3, verticalAlign: 'middle' }} /> QR Code
                    </button>
                    <button
                      type="button"
                      className="btn"
                      onClick={() => setCouponCodeType('text')}
                      style={{
                        flex: 1,
                        padding: '0.4rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: couponCodeType === 'text' ? 'var(--primary)' : 'var(--bg-main)',
                        color: couponCodeType === 'text' ? '#fff' : 'var(--text-secondary)',
                        borderRadius: '8px'
                      }}
                    >
                      <Hash size={13} style={{ marginRight: 3, verticalAlign: 'middle' }} /> Solo Codice
                    </button>
                  </div>
                )}
              </div>

              {/* Caricamento Foto / Screenshot Buono */}
              <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
                  Foto o Screenshot del Buono (Opzionale)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <label 
                    className="btn btn-secondary" 
                    style={{ 
                      padding: '0.45rem 0.85rem', 
                      fontSize: '0.78rem', 
                      fontWeight: 700, 
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <ImageIcon size={14} /> Carica Immagine
                    <input 
                      type="file" 
                      accept="image/*" 
                      capture="environment"
                      onChange={handleCouponImageUpload} 
                      style={{ display: 'none' }} 
                    />
                  </label>

                  {couponCodeImage && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <img 
                        src={couponCodeImage} 
                        alt="Anteprima buono" 
                        style={{ width: 34, height: 34, objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-color)' }} 
                      />
                      <button 
                        type="button" 
                        className="btn btn-icon" 
                        onClick={() => setCouponCodeImage('')}
                        style={{ width: 28, height: 28, color: '#ef4444' }}
                        title="Rimuovi immagine"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Note / Descrizione */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
                  Note / Condizioni (Opzionale)
                </label>
                <input
                  type="text"
                  className="quick-add-input"
                  value={couponNotes}
                  onChange={e => setCouponNotes(e.target.value)}
                  placeholder="Es. Valido solo sabato su spesa totale"
                  style={{ fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.65rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsAddingCoupon(false)}
                  style={{ flex: 1, padding: '0.65rem' }}
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 2, padding: '0.65rem', fontWeight: 800 }}
                >
                  <Plus size={16} /> Salva Buono
                </button>
              </div>
            </form>
          )}

          {/* Elenco Buoni Registrati */}
          {coupons.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '1.75rem 1rem',
              background: 'var(--bg-surface)',
              borderRadius: '16px',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)'
            }}>
              <div style={{ fontSize: '2.2rem', marginBottom: '0.35rem' }}>🎁</div>
              <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                Nessun buono registrato per {card.supermarket}
              </p>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
                Registra i tuoi coupon cartacei o digitali per non dimenticarli prima della cassa!
              </p>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsAddingCoupon(true)}
                style={{ fontSize: '0.85rem' }}
              >
                <Plus size={15} /> Aggiungi primo buono
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {coupons.map((coupon) => {
                const status = getExpiryStatus(coupon.expiryDate);

                return (
                  <div
                    key={coupon.id}
                    style={{
                      background: coupon.used ? 'var(--bg-main)' : 'var(--bg-surface)',
                      border: `1.5px solid ${coupon.used ? 'var(--border-color)' : 'rgba(16, 185, 129, 0.35)'}`,
                      borderRadius: '16px',
                      padding: '0.9rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.75rem',
                      opacity: coupon.used ? 0.6 : 1,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {/* Valore e dettagli */}
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap' }}>
                        <span style={{
                          fontSize: '1.25rem',
                          fontWeight: 800,
                          color: coupon.used ? 'var(--text-muted)' : 'var(--primary)',
                          textDecoration: coupon.used ? 'line-through' : 'none'
                        }}>
                          {coupon.value}
                        </span>

                        {coupon.minSpend && coupon.minSpend !== 'Nessuno' && (
                          <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', borderRadius: '6px', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', fontWeight: 700 }}>
                            Min. {coupon.minSpend}
                          </span>
                        )}

                        {status && (
                          <span style={{
                            fontSize: '0.7rem',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '6px',
                            background: status.color + '22',
                            color: status.color,
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}>
                            <Calendar size={11} /> {status.label}
                          </span>
                        )}
                      </div>

                      {coupon.notes && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                          {coupon.notes}
                        </div>
                      )}

                      {/* Tasto per visualizzare Codice a Barre / QR Code / Codice Numerico per la Cassa */}
                      {(coupon.code || coupon.codeImage) && (
                        <div style={{ marginTop: '0.55rem' }}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerHaptic('medium');
                              setSelectedCouponForCode(coupon);
                            }}
                            className="btn"
                            style={{
                              padding: '0.35rem 0.7rem',
                              fontSize: '0.78rem',
                              fontWeight: 800,
                              borderRadius: '8px',
                              background: coupon.used ? 'var(--bg-main)' : 'var(--primary)',
                              color: coupon.used ? 'var(--text-secondary)' : '#ffffff',
                              border: coupon.used ? '1px solid var(--border-color)' : 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              boxShadow: coupon.used ? 'none' : '0 2px 8px rgba(16, 185, 129, 0.35)',
                              cursor: 'pointer'
                            }}
                            title="Tocca per visualizzare il codice a barre o QR per la cassa"
                          >
                            {coupon.codeType === 'qrcode' ? <QrCode size={14} /> : <Barcode size={14} />}
                            <span>{coupon.code ? (coupon.code.length > 14 ? `${coupon.code.slice(0, 12)}...` : coupon.code) : 'Mostra Codice / QR'}</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Azioni Buono: Toggle Usato & Elimina */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={() => toggleCouponUsed(coupon.id)}
                        className={`preset-chip ${coupon.used ? '' : 'active'}`}
                        style={{
                          fontSize: '0.78rem',
                          padding: '0.4rem 0.7rem',
                          background: coupon.used ? 'rgba(255, 255, 255, 0.08)' : 'rgba(16, 185, 129, 0.2)',
                          color: coupon.used ? 'var(--text-muted)' : 'var(--primary)',
                          borderColor: coupon.used ? 'var(--border-color)' : 'var(--primary)',
                          fontWeight: 700
                        }}
                        title={coupon.used ? "Segna come non usato" : "Segna come utilizzato"}
                      >
                        {coupon.used ? 'Usato ✓' : 'Da Usare'}
                      </button>

                      <button
                        type="button"
                        className="btn btn-icon"
                        onClick={() => deleteCoupon(coupon.id)}
                        title="Elimina buono"
                        style={{ width: 34, height: 34, color: '#ef4444' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal di Visualizzazione Codice a Barre / QR Code del Buono */}
      <CouponCodeModal 
        coupon={selectedCouponForCode} 
        isOpen={Boolean(selectedCouponForCode)} 
        onClose={() => setSelectedCouponForCode(null)} 
      />
    </div>
  );
};
