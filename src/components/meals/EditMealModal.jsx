import React, { useState, useEffect } from 'react';
import { X, Check, Trash2, ShoppingBag, Utensils, Sparkles } from 'lucide-react';
import { useMealPlan } from '../../context/MealPlanContext';
import { useShopping } from '../../context/ShoppingContext';
import { triggerHaptic } from '../../services/haptics';

const QUICK_SUGGESTIONS = [
  'Pasta al pomodoro',
  'Risotto ai funghi',
  'Pollo con verdure',
  'Pesce al forno',
  'Uova / Frittata',
  'Legumi & Zuppa',
  'Insalatona mista',
  'Pizza',
  'Cena fuori / Asporto'
];

export const EditMealModal = () => {
  const { editingMeal, setEditingMeal, updateMeal, clearMeal } = useMealPlan();
  const { addItem } = useShopping();
  const [dishText, setDishText] = useState('');
  const [addedToShopping, setAddedToShopping] = useState(false);

  useEffect(() => {
    if (editingMeal) {
      setDishText(editingMeal.currentText || '');
      setAddedToShopping(false);
    }
  }, [editingMeal]);

  if (!editingMeal) return null;

  const handleSave = (e) => {
    if (e) e.preventDefault();
    updateMeal(editingMeal.dayKey, editingMeal.mealType, dishText);
    setEditingMeal(null);
  };

  const handleClear = () => {
    clearMeal(editingMeal.dayKey, editingMeal.mealType);
    setEditingMeal(null);
  };

  const handleAddDishToShopping = () => {
    if (!dishText.trim()) return;
    triggerHaptic('success');
    addItem({
      name: dishText.trim(),
      quantity: '1',
      category: 'altro',
      notes: `Per ${editingMeal.dayName} (${editingMeal.mealType === 'lunch' ? 'Pranzo' : 'Cena'})`
    });
    setAddedToShopping(true);
  };

  const isLunch = editingMeal.mealType === 'lunch';

  return (
    <div className="modal-backdrop" onClick={() => setEditingMeal(null)}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              background: isLunch ? 'rgba(245, 158, 11, 0.15)' : 'rgba(139, 92, 246, 0.15)',
              color: isLunch ? '#f59e0b' : '#8b5cf6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem'
            }}>
              {isLunch ? '☀️' : '🌙'}
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                {editingMeal.dayName}
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Modifica {isLunch ? 'Pranzo' : 'Cena'}
              </span>
            </div>
          </div>
          <button 
            type="button" 
            className="btn btn-icon" 
            onClick={() => setEditingMeal(null)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
              Cosa si mangia?
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                autoFocus
                className="quick-add-input"
                placeholder="Es. Pasta al pesto, Orata al forno..."
                value={dishText}
                onChange={e => setDishText(e.target.value)}
                style={{ width: '100%', fontSize: '1rem', paddingRight: '2.5rem' }}
              />
              {dishText && (
                <button
                  type="button"
                  onClick={() => setDishText('')}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Idee e suggerimenti rapidi */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Sparkles size={13} color="var(--primary)" /> Idee rapide:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {QUICK_SUGGESTIONS.map((sug, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setDishText(sug);
                  }}
                  style={{
                    padding: '0.3rem 0.65rem',
                    borderRadius: '99px',
                    border: '1px solid var(--border-color)',
                    background: dishText === sug ? 'var(--primary-light)' : 'rgba(255,255,255,0.04)',
                    color: dishText === sug ? 'var(--primary)' : 'var(--text-secondary)',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          {/* Tasto Aggiungi a Lista Spesa */}
          {dishText.trim() && (
            <div style={{ marginBottom: '1.25rem', padding: '0.65rem 0.8rem', background: 'rgba(16, 185, 129, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShoppingBag size={15} color="var(--primary)" /> Ti serve per la spesa?
              </span>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleAddDishToShopping}
                disabled={addedToShopping}
                style={{
                  fontSize: '0.75rem',
                  padding: '0.35rem 0.7rem',
                  borderColor: addedToShopping ? 'transparent' : 'rgba(16, 185, 129, 0.35)',
                  color: addedToShopping ? '#10b981' : 'inherit'
                }}
              >
                {addedToShopping ? '✓ Aggiunto' : '+ Metti in lista spesa'}
              </button>
            </div>
          )}

          {/* Azioni Salva / Cancella */}
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            {editingMeal.currentText && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleClear}
                style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                title="Svuota questo pasto"
              >
                <Trash2 size={16} />
              </button>
            )}
            <button
              type="button"
              className="btn btn-secondary"
              style={{ flex: 1 }}
              onClick={() => setEditingMeal(null)}
            >
              Annulla
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 2 }}
            >
              <Check size={16} /> Salva Pasto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
