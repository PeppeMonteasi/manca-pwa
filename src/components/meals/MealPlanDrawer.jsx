import React from 'react';
import { X, UtensilsCrossed, RotateCcw, Calendar, Edit3, Plus, Sparkles, CheckCircle2 } from 'lucide-react';
import { useMealPlan, DAYS_OF_WEEK } from '../../context/MealPlanContext';
import { EditMealModal } from './EditMealModal';
import { triggerHaptic } from '../../services/haptics';

export const MealPlanDrawer = () => {
  const { 
    mealPlan, 
    isMealPlanOpen, 
    setIsMealPlanOpen, 
    setEditingMeal,
    resetWeek,
    loadExampleWeek
  } = useMealPlan();

  // Calcola quale giorno della settimana è oggi (0 = domenica, 1 = lunedì, ecc.)
  const todayDayNum = new Date().getDay();

  const handleClose = () => {
    triggerHaptic('light');
    setIsMealPlanOpen(false);
  };

  const handleCellClick = (day, mealType) => {
    triggerHaptic('light');
    const currentText = mealPlan[day.key]?.[mealType] || '';
    setEditingMeal({
      dayKey: day.key,
      dayName: day.name,
      mealType,
      currentText
    });
  };

  // Conta pasti pianificati
  let plannedCount = 0;
  DAYS_OF_WEEK.forEach(d => {
    if (mealPlan[d.key]?.lunch?.trim()) plannedCount++;
    if (mealPlan[d.key]?.dinner?.trim()) plannedCount++;
  });

  return (
    <>
      {/* Backdrop scuro */}
      {isMealPlanOpen && (
        <div 
          onClick={handleClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 9998,
            animation: 'fadeIn 0.2s ease'
          }}
        />
      )}

      {/* Sportello Laterale Menu Settimana (Slide da sinistra) */}
      <aside 
        className="meal-plan-drawer-aside"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '520px',
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border-color)',
          boxShadow: '10px 0 40px rgba(0, 0, 0, 0.5)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          transform: isMealPlanOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
          paddingTop: 'calc(0.75rem + env(safe-area-inset-top))',
          paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))'
        }}
      >
        {/* Header Drawer */}
        <div style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '0.75rem',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              background: 'rgba(245, 158, 11, 0.15)',
              color: '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <UtensilsCrossed size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                  Menu Settimana
                </h2>
                <span style={{
                  fontSize: '0.68rem',
                  padding: '0.15rem 0.45rem',
                  borderRadius: '99px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  fontWeight: 700
                }}>
                  {plannedCount}/14 Pasti
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Tocca qualsiasi cella per guardare o modificare
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <button
              type="button"
              className="btn btn-icon"
              onClick={handleClose}
              title="Chiudi sportello"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Barra di gestione rapida */}
        <div style={{
          padding: '0.6rem 1.25rem',
          background: 'rgba(255, 255, 255, 0.02)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '0.5rem',
          flexShrink: 0
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Lunedì ➔ Domenica
          </span>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              type="button"
              onClick={loadExampleWeek}
              style={{
                background: 'transparent',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '0.25rem 0.55rem',
                fontSize: '0.72rem',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
              title="Carica un menu tipico di esempio"
            >
              <Sparkles size={12} color="var(--primary)" /> Esempio
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Vuoi davvero svuotare tutti i pasti della settimana?')) {
                  resetWeek();
                }
              }}
              style={{
                background: 'transparent',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '0.25rem 0.55rem',
                fontSize: '0.72rem',
                color: '#ef4444',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
              title="Svuota l'intera tabella"
            >
              <RotateCcw size={12} /> Svuota
            </button>
          </div>
        </div>

        {/* Tabella Settimanale */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.85rem 1rem' }}>
          <div className="meal-plan-table-container">
            <table className="meal-plan-table">
              <thead>
                <tr>
                  <th style={{ width: '28%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Calendar size={13} /> Giorno
                    </div>
                  </th>
                  <th style={{ width: '36%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#f59e0b' }}>
                      ☀️ Pranzo
                    </div>
                  </th>
                  <th style={{ width: '36%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#a78bfa' }}>
                      🌙 Cena
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {DAYS_OF_WEEK.map((day) => {
                  const isToday = day.dayNum === todayDayNum;
                  const lunchDish = mealPlan[day.key]?.lunch || '';
                  const dinnerDish = mealPlan[day.key]?.dinner || '';

                  return (
                    <tr key={day.key} className={isToday ? 'row-today' : ''}>
                      {/* Cella Giorno */}
                      <td className="cell-day">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{day.name}</span>
                          </div>
                          {isToday && (
                            <span style={{
                              display: 'inline-block',
                              alignSelf: 'flex-start',
                              fontSize: '0.62rem',
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              padding: '0.1rem 0.35rem',
                              borderRadius: '4px',
                              background: 'var(--primary)',
                              color: '#fff',
                              letterSpacing: '0.04em'
                            }}>
                              Oggi
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Cella Pranzo */}
                      <td 
                        className={`cell-meal cell-lunch ${!lunchDish ? 'cell-empty' : ''}`}
                        onClick={() => handleCellClick(day, 'lunch')}
                        title={`Tocca per modificare pranzo di ${day.name}`}
                      >
                        <div className="meal-content-box">
                          {lunchDish ? (
                            <span className="meal-dish-text">{lunchDish}</span>
                          ) : (
                            <span className="meal-placeholder">
                              <Plus size={12} /> Aggiungi
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Cella Cena */}
                      <td 
                        className={`cell-meal cell-dinner ${!dinnerDish ? 'cell-empty' : ''}`}
                        onClick={() => handleCellClick(day, 'dinner')}
                        title={`Tocca per modificare cena di ${day.name}`}
                      >
                        <div className="meal-content-box">
                          {dinnerDish ? (
                            <span className="meal-dish-text">{dinnerDish}</span>
                          ) : (
                            <span className="meal-placeholder">
                              <Plus size={12} /> Aggiungi
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Suggerimento / Guida */}
          <div style={{
            marginTop: '1.25rem',
            padding: '0.85rem 1rem',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-color)',
            fontSize: '0.78rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.5
          }}>
            💡 <strong>Consiglio pratico</strong>: Clicca su qualsiasi pranzo o cena per modificare il piatto o aggiungere subito gli ingredienti mancanti alla tua lista della spesa!
          </div>
        </div>
      </aside>

      {/* Modale modifica pasto selezionato */}
      <EditMealModal />
    </>
  );
};
