import React, { useState } from 'react';
import { X, Plus, Sparkles, Check, ShoppingCart, Tag, AlertTriangle, Store, FileText, DollarSign } from 'lucide-react';
import { CATEGORIES } from '../context/ShoppingContext';
import { triggerHaptic } from '../services/haptics';

const MEASURE_UNITS = [
  'pz (pezzi)', 'kg', 'g (grammi)', 'etti', 'litri', 'conf. (confezione)',
  'bottiglie', 'pacchi', 'barattoli', 'scatole', 'fette', 'casse'
];

const STORES = ['Tutti', 'Esselunga', 'Coop', 'Conad', 'Lidl', 'Carrefour', 'Eurospin', 'Aldi', 'Altro'];

export const ManualAddModal = ({ isOpen, onClose, onAddItem }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('frutta');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('pz (pezzi)');
  const [priority, setPriority] = useState('media');
  const [supermarket, setSupermarket] = useState('Tutti');
  const [notes, setNotes] = useState('');
  const [price, setPrice] = useState('');
  const [keepOpen, setKeepOpen] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    triggerHaptic('success');
    onAddItem({
      name: name.trim(),
      category,
      quantity: `${quantity} ${unit.split(' ')[0]}`.trim(),
      priority,
      supermarket,
      notes: notes.trim(),
      price: price ? `€${price}` : ''
    });

    if (keepOpen) {
      setName('');
      setNotes('');
      setPrice('');
    } else {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.15rem' }}>
            <ShoppingCart size={22} color="var(--primary)" /> Inserimento Manuale
          </div>
          <button className="btn btn-icon" onClick={() => {
            triggerHaptic('light');
            onClose();
          }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Nome Prodotto */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Nome Prodotto / Articolo <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              required
              className="quick-add-input"
              placeholder="Es. Latte Intero, Pasta Barilla, Mele..."
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
            />
          </div>

          {/* Reparto Supermercato */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              <Tag size={15} /> Reparto / Categoria
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(115px, 1fr))', gap: '0.4rem' }}>
              {Object.values(CATEGORIES).map(cat => (
                <button
                  type="button"
                  key={cat.id}
                  className="preset-chip"
                  onClick={() => {
                    triggerHaptic('light');
                    setCategory(cat.id);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    justifyContent: 'flex-start',
                    background: category === cat.id ? 'var(--primary-light)' : undefined,
                    borderColor: category === cat.id ? 'var(--primary)' : undefined,
                    color: category === cat.id ? 'var(--primary)' : undefined,
                    fontWeight: category === cat.id ? 700 : 500
                  }}
                >
                  <span>{cat.icon}</span>
                  <span style={{ fontSize: '0.78rem' }}>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quantità e Unità di Misura */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Quantità
              </label>
              <input
                type="number"
                step="any"
                min="0.1"
                className="quick-add-input"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Unità
              </label>
              <select
                className="quick-add-input"
                value={unit}
                onChange={e => setUnit(e.target.value)}
              >
                {MEASURE_UNITS.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Priorità & Supermercato */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                <AlertTriangle size={14} /> Priorità
              </label>
              <select
                className="quick-add-input"
                value={priority}
                onChange={e => setPriority(e.target.value)}
              >
                <option value="bassa">🟢 Bassa</option>
                <option value="media">🟡 Media</option>
                <option value="alta">🔴 Urgente</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                <Store size={14} /> Negozio
              </label>
              <select
                className="quick-add-input"
                value={supermarket}
                onChange={e => setSupermarket(e.target.value)}
              >
                {STORES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Note, Marca e Prezzo stimato */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '0.65rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                <FileText size={14} /> Note / Marca
              </label>
              <input
                type="text"
                className="quick-add-input"
                placeholder="Es. Senza lattosio"
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                <DollarSign size={14} /> Prezzo (€)
              </label>
              <input
                type="number"
                step="0.01"
                className="quick-add-input"
                placeholder="2.50"
                value={price}
                onChange={e => setPrice(e.target.value)}
              />
            </div>
          </div>

          {/* Checkbox Aggiungi Continuo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <input
              type="checkbox"
              id="keepOpenCheckbox"
              checked={keepOpen}
              onChange={e => setKeepOpen(e.target.checked)}
              style={{ width: 18, height: 18, accentColor: 'var(--primary)', cursor: 'pointer' }}
            />
            <label htmlFor="keepOpenCheckbox" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              Rimani qui per inserire un altro articolo
            </label>
          </div>

          {/* Bottoni Azione */}
          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
              Chiudi
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2, fontWeight: 700 }}>
              <Plus size={18} /> Inserisci nella Spesa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
