import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ShoppingProvider, useShopping, CATEGORIES, autoDetectCategory } from './context/ShoppingContext';
import { Header } from './components/Header';
import { Voicebox } from './components/Voicebox';
import { ManualAddModal } from './components/ManualAddModal';
import { FirebaseConfigModal } from './components/FirebaseConfigModal';
import { SSOModal } from './components/SSOModal';
import { ShoppingList } from './components/ShoppingList';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { ShareModal } from './components/ShareModal';
import { UnifiedAuthGate } from './components/UnifiedAuthGate';
import { ShoppingBag, CheckCircle2, AlertTriangle, Plus, Tag, Hash, Sparkles } from 'lucide-react';
import { triggerHaptic } from './services/haptics';

const SummaryStats = () => {
  const { items } = useShopping();
  const pending = items.filter(i => !i.completed);
  const urgent = pending.filter(i => i.priority === 'alta');
  const completed = items.filter(i => i.completed);

  return (
    <div className="summary-stats-grid">
      <div className="glass-panel summary-stat-card" style={{ padding: '0.85rem 0.9rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <div className="summary-stat-icon" style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <ShoppingBag size={18} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div className="summary-stat-val" style={{ fontSize: '1.25rem', fontWeight: 800, lineHeight: 1.2 }}>{pending.length}</div>
          <div className="summary-stat-lbl" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap' }}>Da Comprare</div>
        </div>
      </div>

      <div className="glass-panel summary-stat-card" style={{ padding: '0.85rem 0.9rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <div className="summary-stat-icon" style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <AlertTriangle size={18} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div className="summary-stat-val" style={{ fontSize: '1.25rem', fontWeight: 800, color: urgent.length > 0 ? '#ef4444' : 'inherit', lineHeight: 1.2 }}>{urgent.length}</div>
          <div className="summary-stat-lbl" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap' }}>Urgenti 🚨</div>
        </div>
      </div>

      <div className="glass-panel summary-stat-card" style={{ padding: '0.85rem 0.9rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <div className="summary-stat-icon" style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <CheckCircle2 size={18} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div className="summary-stat-val" style={{ fontSize: '1.25rem', fontWeight: 800, lineHeight: 1.2 }}>{completed.length}</div>
          <div className="summary-stat-lbl" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap' }}>Già Prese</div>
        </div>
      </div>
    </div>
  );
};

export function MainContent() {
  const { addItem, addMultipleItems } = useShopping();
  const { isFirebaseModalOpen, setIsFirebaseModalOpen } = useAuth();
  const [isInstallOpen, setIsInstallOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isManualAddOpen, setIsManualAddOpen] = useState(false);
  
  // Campi per inserimento rapido con quantità e reparto modificabili prima dell'invio
  const [quickInput, setQuickInput] = useState('');
  const [quickQuantity, setQuickQuantity] = useState('1');
  const [quickCategory, setQuickCategory] = useState('');

  const detectedCategory = autoDetectCategory(quickInput);
  const activeCategory = quickCategory || detectedCategory;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    
    triggerHaptic('success');
    addItem({
      name: quickInput.trim(),
      quantity: quickQuantity.trim() || '1',
      category: activeCategory
    });
    setQuickInput('');
    setQuickQuantity('1');
    setQuickCategory('');
  };

  return (
    <>
      <Header 
        onOpenInstall={() => setIsInstallOpen(true)}
        onOpenShare={() => setIsShareOpen(true)}
      />

      <main className="app-container">
        {/* Metric Cards Summary */}
        <SummaryStats />

        {/* 1. Voicebox con AI Semantica Open Source Multi-Articolo */}
        <Voicebox onAddMultipleItems={addMultipleItems} />

        {/* 2. Barra di Inserimento Rapido con Quantità e Reparto Responsive (100% visibile su mobile) */}
        <div className="glass-panel" style={{ padding: '1rem 1.15rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Plus size={16} color="var(--primary)" /> Aggiungi rapido
            </span>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                triggerHaptic('light');
                setIsManualAddOpen(true);
              }}
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
            >
              <Plus size={15} /> Tutti i dettagli
            </button>
          </div>

          <form onSubmit={handleQuickAdd}>
            <div className="quick-add-grid">
              {/* Nome */}
              <div className="field-name">
                <input
                  type="text"
                  className="quick-add-input"
                  placeholder="Cosa ti manca (es. Pane, Latte)..."
                  value={quickInput}
                  onChange={e => setQuickInput(e.target.value)}
                />
              </div>

              {/* Quantità modificabile prima di invio */}
              <div className="field-qty">
                <input
                  type="text"
                  className="quick-add-input"
                  placeholder="Quantità (es. 2 pz)"
                  value={quickQuantity}
                  onChange={e => setQuickQuantity(e.target.value)}
                />
              </div>

              {/* Reparto modificabile prima di invio */}
              <div className="field-cat">
                <select
                  className="quick-add-input"
                  value={quickCategory}
                  onChange={e => setQuickCategory(e.target.value)}
                >
                  <option value="">Auto: {CATEGORIES[detectedCategory]?.icon} {CATEGORIES[detectedCategory]?.name}</option>
                  {Object.values(CATEGORIES).map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Tasto Inserisci */}
              <button type="submit" className="field-submit btn btn-primary" style={{ padding: '0.75rem 1.25rem', fontWeight: 700 }}>
                Inserisci
              </button>
            </div>
          </form>
        </div>

        {/* 3. Lista della spesa organizzata con tutti gli attributi */}
        <ShoppingList onOpenManualAdd={() => {
          triggerHaptic('light');
          setIsManualAddOpen(true);
        }} />
      </main>

      {/* Floating Action Button mobile per inserimento rapido col pollice */}
      <div className="mobile-fab-container">
        <button
          type="button"
          className="mobile-fab-btn"
          onClick={() => {
            triggerHaptic('medium');
            setIsManualAddOpen(true);
          }}
          title="Aggiungi articolo"
          aria-label="Aggiungi articolo"
        >
          <Plus size={26} strokeWidth={2.5} />
        </button>
      </div>

      {/* Modali */}
      <ManualAddModal 
        isOpen={isManualAddOpen} 
        onClose={() => setIsManualAddOpen(false)} 
        onAddItem={addItem} 
      />
      <FirebaseConfigModal 
        isOpen={isFirebaseModalOpen} 
        onClose={() => setIsFirebaseModalOpen(false)} 
      />
      <SSOModal />
      <PWAInstallPrompt 
        isOpen={isInstallOpen} 
        onClose={() => setIsInstallOpen(false)} 
      />
      <ShareModal 
        isOpen={isShareOpen} 
        onClose={() => setIsShareOpen(false)} 
      />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ShoppingProvider>
        <UnifiedAuthGate>
          <MainContent />
        </UnifiedAuthGate>
      </ShoppingProvider>
    </AuthProvider>
  );
}
