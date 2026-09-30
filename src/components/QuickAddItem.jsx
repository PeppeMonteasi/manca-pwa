import React, { useState } from 'react';
import { Plus, Mic, MicOff, Sparkles, Tag, AlertCircle } from 'lucide-react';
import { useShopping, CATEGORIES, autoDetectCategory } from '../context/ShoppingContext';

const QUICK_PRESETS = [
  { name: '🥛 Latte', category: 'latticini' },
  { name: '🍳 Uova', category: 'latticini' },
  { name: '🍞 Pane', category: 'dispensa' },
  { name: '☕ Caffè', category: 'dispensa' },
  { name: '🍝 Pasta', category: 'dispensa' },
  { name: '🍎 Mele', category: 'frutta' },
  { name: '💧 Acqua', category: 'bevande' },
  { name: '🧼 Detersivo', category: 'casa' },
  { name: '🍕 Pizza', category: 'surgelati' }
];

export const QuickAddItem = () => {
  const { addItem, isRecording, startVoiceInput } = useShopping();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState('');
  const [priority, setPriority] = useState('media');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const detectedCat = autoDetectCategory(name);
  const activeCategory = category || detectedCat;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    addItem({
      name,
      category: activeCategory,
      quantity,
      priority
    });

    setName('');
    setQuantity('');
    setCategory('');
    setPriority('media');
    setShowAdvanced(false);
  };

  const handleVoiceClick = () => {
    startVoiceInput((spokenText) => {
      setName(spokenText);
    });
  };

  const handlePresetClick = (preset) => {
    addItem({
      name: preset.name.replace(/^[\p{Emoji}\s]+/u, ''),
      category: preset.category
    });
  };

  return (
    <div className="glass-panel quick-add-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '1.05rem' }}>
          <Sparkles size={18} color="var(--primary)" /> Aggiungi cosa ti manca
        </div>
        <button 
          type="button" 
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600 }}
        >
          {showAdvanced ? 'Meno opzioni' : '+ Più dettagli'}
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="quick-add-input-group">
          <input
            type="text"
            className="quick-add-input"
            placeholder='Es. "Mi manca il latte", "Uova fresche"...'
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {/* Voice Input Button */}
          <button
            type="button"
            className={`btn btn-icon ${isRecording ? 'btn-voice recording' : ''}`}
            onClick={handleVoiceClick}
            title="Ditta a voce cosa ti manca"
          >
            {isRecording ? <MicOff size={20} /> : <Mic size={20} color={name ? 'var(--primary)' : 'inherit'} />}
          </button>

          {/* Add Submit Button */}
          <button type="submit" className="btn btn-primary" style={{ padding: '0.85rem 1.25rem' }}>
            <Plus size={20} /> <span style={{ display: 'none', smDisplay: 'inline' }}>Aggiungi</span>
          </button>
        </div>

        {/* Auto Category Preview */}
        {name.trim() && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.6rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <Tag size={14} /> Reparto rilevato:
            <span className={`category-badge ${CATEGORIES[activeCategory]?.class || 'cat-altro'}`}>
              {CATEGORIES[activeCategory]?.icon} {CATEGORIES[activeCategory]?.name}
            </span>
          </div>
        )}

        {/* Advanced details (Quantity & Priority) */}
        {showAdvanced && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Quantità/Note</label>
              <input
                type="text"
                className="quick-add-input"
                placeholder="Es. 2 litri, 1 kg"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                style={{ fontSize: '0.88rem', padding: '0.5rem 0.75rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Reparto Custom</label>
              <select
                className="quick-add-input"
                value={category}
                onChange={e => setCategory(e.target.value)}
                style={{ fontSize: '0.88rem', padding: '0.5rem 0.75rem' }}
              >
                <option value="">Auto-detect ({CATEGORIES[detectedCat]?.name})</option>
                {Object.values(CATEGORIES).map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Priorità</label>
              <select
                className="quick-add-input"
                value={priority}
                onChange={e => setPriority(e.target.value)}
                style={{ fontSize: '0.88rem', padding: '0.5rem 0.75rem' }}
              >
                <option value="bassa">🟢 Bassa</option>
                <option value="media">🟡 Media</option>
                <option value="alta">🚨 Urgente</option>
              </select>
            </div>
          </div>
        )}

        {/* Quick Presets */}
        <div className="quick-presets">
          {QUICK_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              className="preset-chip"
              onClick={() => handlePresetClick(preset)}
            >
              + {preset.name}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
};
