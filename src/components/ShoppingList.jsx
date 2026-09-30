import React, { useState } from 'react';
import { Check, Trash2, Search, ShoppingCart, CheckCircle2, Store, FileText, Plus } from 'lucide-react';
import { useShopping, CATEGORIES } from '../context/ShoppingContext';
import { triggerHaptic } from '../services/haptics';

export const ShoppingList = ({ onOpenManualAdd }) => {
  const {
    items,
    toggleItem,
    removeItem,
    clearCompleted,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory
  } = useShopping();

  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'completed'

  const filteredItems = items.filter(item => {
    const isCompletedMatch = activeTab === 'completed' ? item.completed : !item.completed;
    const isCategoryMatch = selectedCategory === 'all' || item.category === selectedCategory;
    const isSearchMatch = (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.quantity && item.quantity.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (item.supermarket && item.supermarket.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return isCompletedMatch && isCategoryMatch && isSearchMatch;
  });

  const groupedItems = filteredItems.reduce((acc, item) => {
    const cat = item.category || 'altro';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const pendingTotal = items.filter(i => !i.completed).length;
  const completedTotal = items.filter(i => i.completed).length;

  const handleToggle = (id) => {
    triggerHaptic('success');
    toggleItem(id);
  };

  const handleRemove = (id) => {
    triggerHaptic('light');
    removeItem(id);
  };

  return (
    <div className="glass-panel" style={{ padding: '1.15rem' }}>
      {/* List Header with Tabs and Manual Add Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.65rem', marginBottom: '1rem' }}>
        {/* Tabs */}
        <div className="tabs-nav" style={{ flex: '1 1 260px' }}>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('pending');
            }}
          >
            <ShoppingCart size={16} /> Cose da Comprare ({pendingTotal})
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('completed');
            }}
          >
            <CheckCircle2 size={16} /> Già Prese ({completedTotal})
          </button>
        </div>

        {/* Dedicated Manual Add Button */}
        <button
          type="button"
          className="btn btn-primary"
          onClick={onOpenManualAdd}
          style={{ padding: '0.55rem 0.95rem', fontSize: '0.85rem', fontWeight: 700, flexShrink: 0 }}
        >
          <Plus size={17} /> Dettagli
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', marginBottom: '1rem' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Cerca per nome, negozio, note..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="quick-add-input"
            style={{ paddingLeft: '36px', fontSize: '0.88rem', padding: '0.65rem 0.85rem 0.65rem 36px' }}
          />
        </div>

        {/* Category Filter Pills (con scorrimento orizzontale nativo touch) */}
        <div className="categories-scroll">
          <button
            type="button"
            className={`preset-chip ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => {
              triggerHaptic('light');
              setSelectedCategory('all');
            }}
            style={{
              background: selectedCategory === 'all' ? 'var(--primary)' : undefined,
              color: selectedCategory === 'all' ? 'white' : undefined,
              borderColor: selectedCategory === 'all' ? 'var(--primary)' : undefined
            }}
          >
            Tutti i reparti
          </button>
          {Object.values(CATEGORIES).map(cat => (
            <button
              type="button"
              key={cat.id}
              className="preset-chip"
              onClick={() => {
                triggerHaptic('light');
                setSelectedCategory(selectedCategory === cat.id ? 'all' : cat.id);
              }}
              style={{
                background: selectedCategory === cat.id ? 'var(--primary-light)' : undefined,
                borderColor: selectedCategory === cat.id ? 'var(--primary)' : undefined,
                color: selectedCategory === cat.id ? 'var(--primary)' : undefined
              }}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* List Header Actions */}
      {activeTab === 'completed' && completedTotal > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.85rem' }}>
          <button 
            type="button"
            className="btn btn-secondary" 
            onClick={() => {
              triggerHaptic('warning');
              clearCompleted();
            }}
            style={{ fontSize: '0.78rem', color: '#ef4444', padding: '0.35rem 0.7rem' }}
          >
            <Trash2 size={13} /> Svuota già prese
          </button>
        </div>
      )}

      {/* Items Grouped by Category */}
      {Object.keys(groupedItems).length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.4rem' }}>
            {activeTab === 'pending' ? '🛒' : '✨'}
          </div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.35rem', color: 'var(--text-main)' }}>
            {activeTab === 'pending' ? 'Nessun articolo da comprare' : 'Nessun prodotto tra quelli già presi'}
          </h3>
          <p style={{ fontSize: '0.85rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>
            {activeTab === 'pending'
              ? 'Usa il Voicebox vocale o la barra rapida per aggiungere cosa ti manca.'
              : 'I prodotti spuntati e acquistati compariranno qui.'}
          </p>
          {activeTab === 'pending' && (
            <button type="button" className="btn btn-primary" onClick={onOpenManualAdd}>
              <Plus size={16} /> Aggiungi Articolo
            </button>
          )}
        </div>
      ) : (
        Object.entries(groupedItems).map(([catId, catItems]) => {
          const catInfo = CATEGORIES[catId] || CATEGORIES.altro;
          return (
            <div key={catId} style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem', paddingLeft: '0.15rem' }}>
                <span>{catInfo.icon}</span>
                <span>{catInfo.name}</span>
                <span style={{ fontSize: '0.72rem', opacity: 0.65, fontWeight: 500 }}>({catItems.length})</span>
              </div>

              <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                {catItems.map(item => (
                  <div key={item.id} className={`shopping-item ${item.completed ? 'completed' : ''}`}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                      <div
                        className={`custom-checkbox ${item.completed ? 'checked' : ''}`}
                        onClick={() => handleToggle(item.id)}
                        role="checkbox"
                        aria-checked={item.completed}
                      >
                        {item.completed && <Check size={16} strokeWidth={3} />}
                      </div>

                      {/* Miniatura Immagine Prodotto */}
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: '9px',
                        overflow: 'hidden',
                        flexShrink: 0,
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem'
                      }}>
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            loading="lazy"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        ) : (
                          <span>{catInfo.icon}</span>
                        )}
                      </div>

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <span className="item-name" style={{ fontWeight: 600, fontSize: '0.92rem', wordBreak: 'break-word' }}>
                            {item.name}
                          </span>

                          {item.priority === 'alta' && !item.completed && (
                            <span style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', fontWeight: 700, whiteSpace: 'nowrap' }}>
                              🚨 Urgente
                            </span>
                          )}

                          {item.supermarket && item.supermarket !== 'Tutti' && (
                            <span style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.2rem', whiteSpace: 'nowrap' }}>
                              <Store size={11} /> {item.supermarket}
                            </span>
                          )}

                          {item.price && (
                            <span style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontWeight: 700, whiteSpace: 'nowrap' }}>
                              {item.price}
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '0.15rem', flexWrap: 'wrap' }}>
                          {item.quantity && (
                            <span>Quantità: <strong style={{ color: 'var(--text-main)' }}>{item.quantity}</strong></span>
                          )}
                          {item.notes && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                              <FileText size={11} /> {item.notes}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                      <button
                        type="button"
                        className="btn btn-icon"
                        style={{ width: 34, height: 34, border: 'none', background: 'transparent', color: 'var(--text-muted)' }}
                        onClick={() => handleRemove(item.id)}
                        title="Elimina articolo"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
