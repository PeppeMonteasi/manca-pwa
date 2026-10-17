import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  Check, 
  RotateCcw, 
  ShoppingBag, 
  Calendar, 
  Sliders, 
  Package, 
  Flame, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  Plus, 
  X,
  Apple,
  Fish,
  Utensils
} from 'lucide-react';
import { useDiet } from '../../context/DietContext';
import { useMealPlan, DAYS_OF_WEEK } from '../../context/MealPlanContext';
import { useShopping } from '../../context/ShoppingContext';
import { INGREDIENTS } from '../../services/diet/dietData';
import { triggerHaptic } from '../../services/haptics';

export const DietPlannerScreen = ({ onBack }) => {
  const { 
    profile, 
    pantryList, 
    slotMode, 
    setSlotMode, 
    sessionPlan, 
    targets, 
    generateNewPlan, 
    approveSlot, 
    retrySlot, 
    updatePantry, 
    updateProfile 
  } = useDiet();

  const { updateMeal } = useMealPlan();
  const { addItem, items: shoppingItems } = useShopping();

  const [activeTab, setActiveTab] = useState('plan'); // 'plan' | 'biometrics' | 'pantry'
  const [selectedDayToApply, setSelectedDayToApply] = useState('monday');
  const [applySuccessMsg, setApplySuccessMsg] = useState('');
  const [shoppingSuccessMsg, setShoppingSuccessMsg] = useState('');
  const [expandedSlots, setExpandedSlots] = useState({ lunch: true, dinner: true, breakfast: false, snack: false });

  // Form temporaneo biometria
  const [bioForm, setBioForm] = useState({ ...profile });
  const [newDislikedInput, setNewDislikedInput] = useState('');
  const [customPantryInput, setCustomPantryInput] = useState('');

  const toggleSlotExpand = (slotKey) => {
    triggerHaptic('light');
    setExpandedSlots(prev => ({ ...prev, [slotKey]: !prev[slotKey] }));
  };

  // Salva parametri biometrici
  const handleSaveBiometrics = (e) => {
    e.preventDefault();
    triggerHaptic('success');
    updateProfile(bioForm);
    setActiveTab('plan');
  };

  // Aggiungi ingrediente sgradito
  const handleAddDisliked = (e) => {
    e.preventDefault();
    if (!newDislikedInput.trim()) return;
    const item = newDislikedInput.trim().toLowerCase();
    if (!bioForm.disliked_ingredients.includes(item)) {
      setBioForm(prev => ({
        ...prev,
        disliked_ingredients: [...prev.disliked_ingredients, item]
      }));
    }
    setNewDislikedInput('');
  };

  const handleRemoveDisliked = (item) => {
    setBioForm(prev => ({
      ...prev,
      disliked_ingredients: prev.disliked_ingredients.filter(d => d !== item)
    }));
  };

  // Gestione dispensa
  const handleTogglePantryItem = (ingId) => {
    triggerHaptic('light');
    let updated;
    if (pantryList.includes(ingId)) {
      updated = pantryList.filter(id => id !== ingId);
    } else {
      updated = [...pantryList, ingId];
    }
    updatePantry(updated);
  };

  const handleAddCustomPantry = (e) => {
    e.preventDefault();
    if (!customPantryInput.trim()) return;
    const name = customPantryInput.trim().toLowerCase();
    if (!pantryList.includes(name)) {
      updatePantry([...pantryList, name]);
    }
    setCustomPantryInput('');
  };

  // Sincronizza dispensa dalla lista spesa (articoli contrassegnati come già presi)
  const handleSyncFromShopping = () => {
    triggerHaptic('medium');
    const takenItems = shoppingItems
      .filter(i => i.completed)
      .map(i => i.name.toLowerCase().trim());

    const combined = Array.from(new Set([...pantryList, ...takenItems]));
    updatePantry(combined);
  };

  // 1. Applica i pasti approvati/proposti al giorno selezionato del piano settimanale
  const handleApplyToWeeklyPlan = () => {
    triggerHaptic('success');
    const slots = sessionPlan.slots || {};

    // Pranzo
    if (slots.lunch?.proposal?.recipe) {
      const lunchTitle = slots.lunch.proposal.recipe.title;
      updateMeal(selectedDayToApply, 'lunch', lunchTitle);
    }

    // Cena
    if (slots.dinner?.proposal?.recipe) {
      const dinnerTitle = slots.dinner.proposal.recipe.title;
      updateMeal(selectedDayToApply, 'dinner', dinnerTitle);
    }

    const dayName = DAYS_OF_WEEK.find(d => d.key === selectedDayToApply)?.name || 'giorno';
    setApplySuccessMsg(`Pasti applicati con successo a ${dayName}!`);
    setTimeout(() => setApplySuccessMsg(''), 4000);
  };

  // 2. Aggiungi tutti gli ingredienti mancanti alla lista della spesa dell'app
  const handleAddMissingToShoppingList = () => {
    triggerHaptic('success');
    let addedCount = 0;
    const slots = sessionPlan.slots || {};

    Object.values(slots).forEach(s => {
      const missing = s.proposal?.pantryCoverage?.missing || [];
      missing.forEach(ing => {
        addItem({
          name: ing.name,
          quantity: '1',
          category: 'altro',
          notes: `Per dieta mediterranea (${s.slot})`
        });
        addedCount++;
      });
    });

    setShoppingSuccessMsg(`Aggiunti ${addedCount} ingredienti mancanti alla Lista Spesa!`);
    setTimeout(() => setShoppingSuccessMsg(''), 4500);
  };

  // Calcola somma macro totali attuali dei pasti
  let totalActualKcal = 0;
  let totalActualC = 0;
  let totalActualP = 0;
  let totalActualF = 0;

  if (sessionPlan?.slots) {
    Object.values(sessionPlan.slots).forEach(s => {
      if (s.actual_macros) {
        totalActualKcal += s.actual_macros.kcal;
        totalActualC += s.actual_macros.carbs_g;
        totalActualP += s.actual_macros.protein_g;
        totalActualF += s.actual_macros.fat_g;
      }
    });
  }

  const slotLabels = {
    breakfast: { name: 'Colazione', icon: '☕', color: '#38bdf8' },
    lunch: { name: 'Pranzo', icon: '☀️', color: '#f59e0b' },
    snack: { name: 'Spuntino', icon: '🍎', color: '#10b981' },
    dinner: { name: 'Cena', icon: '🌙', color: '#8b5cf6' }
  };

  return (
    <div className="diet-planner-page">
      {/* Top Header di Navigazione */}
      <header className="diet-page-header">
        <button 
          type="button" 
          className="btn btn-secondary btn-back"
          onClick={() => {
            triggerHaptic('light');
            onBack();
          }}
        >
          <ArrowLeft size={18} />
          <span>Torna all'App</span>
        </button>

        <div className="diet-page-title-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
              Piano Dieta Mediterranea
            </h1>
            <span className="diet-pro-badge">Macro Engine</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0.15rem 0 0 0' }}>
            Calcolo fabbisogno TDEE, proporzioni e porzioni scalate al grammo
          </p>
        </div>

        <div style={{ width: 80, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => generateNewPlan()}
            title="Rigenera intera giornata"
            style={{ fontSize: '0.75rem', padding: '0.45rem 0.65rem', gap: '0.3rem' }}
          >
            <RotateCcw size={14} />
            <span className="hide-on-mobile">Rigenera</span>
          </button>
        </div>
      </header>

      {/* Tabs di Navigazione */}
      <div className="diet-tabs-nav">
        <button
          type="button"
          className={`diet-tab-btn ${activeTab === 'plan' ? 'active' : ''}`}
          onClick={() => {
            triggerHaptic('light');
            setActiveTab('plan');
          }}
        >
          <Utensils size={15} />
          <span>Pasti &amp; Macro</span>
        </button>
        <button
          type="button"
          className={`diet-tab-btn ${activeTab === 'biometrics' ? 'active' : ''}`}
          onClick={() => {
            triggerHaptic('light');
            setActiveTab('biometrics');
          }}
        >
          <Sliders size={15} />
          <span>Biometria &amp; Dieta</span>
        </button>
        <button
          type="button"
          className={`diet-tab-btn ${activeTab === 'pantry' ? 'active' : ''}`}
          onClick={() => {
            triggerHaptic('light');
            setActiveTab('pantry');
          }}
        >
          <Package size={15} />
          <span>Dispensa &amp; Frigo ({pantryList.length})</span>
        </button>
      </div>

      <div className="diet-page-container">
        {/* ========================================================= */}
        {/* TAB 1: PIANO PASTI & MACRO */}
        {/* ========================================================= */}
        {activeTab === 'plan' && (
          <div>
            {/* Dashboard Target vs Effettivo */}
            <div className="diet-summary-card">
              <div className="diet-summary-header">
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    Fabbisogno Giornaliero (Mifflin-St Jeor)
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.15rem' }}>
                    <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)' }}>
                      {totalActualKcal}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      / {targets.daily_calories} kcal target
                    </span>
                  </div>
                </div>

                {/* Selettore 4 pasti vs 2 pasti */}
                <div className="diet-mode-toggle">
                  <button
                    type="button"
                    className={`diet-mode-btn ${slotMode === '4_slots' ? 'active' : ''}`}
                    onClick={() => setSlotMode('4_slots')}
                  >
                    4 Pasti
                  </button>
                  <button
                    type="button"
                    className={`diet-mode-btn ${slotMode === '2_slots' ? 'active' : ''}`}
                    onClick={() => setSlotMode('2_slots')}
                  >
                    Pranzo &amp; Cena
                  </button>
                </div>
              </div>

              {/* Barre di confronto Macro */}
              <div className="diet-macros-grid">
                {/* Carboidrati */}
                <div className="macro-bar-card">
                  <div className="macro-bar-label">
                    <span>🍞 Carboidrati (52.5%)</span>
                    <strong>{totalActualC}g / {targets.daily_carbs_g}g</strong>
                  </div>
                  <div className="macro-progress-track">
                    <div 
                      className="macro-progress-fill" 
                      style={{ 
                        width: `${Math.min(100, (totalActualC / (targets.daily_carbs_g || 1)) * 100)}%`,
                        background: '#38bdf8'
                      }} 
                    />
                  </div>
                </div>

                {/* Proteine */}
                <div className="macro-bar-card">
                  <div className="macro-bar-label">
                    <span>🥩 Proteine (17.5%)</span>
                    <strong>{totalActualP}g / {targets.daily_protein_g}g</strong>
                  </div>
                  <div className="macro-progress-track">
                    <div 
                      className="macro-progress-fill" 
                      style={{ 
                        width: `${Math.min(100, (totalActualP / (targets.daily_protein_g || 1)) * 100)}%`,
                        background: '#10b981'
                      }} 
                    />
                  </div>
                </div>

                {/* Grassi */}
                <div className="macro-bar-card">
                  <div className="macro-bar-label">
                    <span>🥑 Grassi Buoni (30%)</span>
                    <strong>{totalActualF}g / {targets.daily_fat_g}g</strong>
                  </div>
                  <div className="macro-progress-track">
                    <div 
                      className="macro-progress-fill" 
                      style={{ 
                        width: `${Math.min(100, (totalActualF / (targets.daily_fat_g || 1)) * 100)}%`,
                        background: '#f59e0b'
                      }} 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Banner di successo o notifiche */}
            {applySuccessMsg && (
              <div className="diet-alert-success">
                <CheckCircle2 size={18} />
                <span>{applySuccessMsg}</span>
              </div>
            )}
            {shoppingSuccessMsg && (
              <div className="diet-alert-success">
                <ShoppingBag size={18} />
                <span>{shoppingSuccessMsg}</span>
              </div>
            )}

            {/* Lista degli Slot dei Pasti */}
            <div className="diet-slots-list">
              {sessionPlan?.slots && Object.entries(sessionPlan.slots).map(([slotKey, slotData]) => {
                const info = slotLabels[slotKey] || { name: slotKey, icon: '🍽️', color: 'var(--primary)' };
                const isApproved = slotData.status === 'APPROVED';
                const recipe = slotData.proposal?.recipe;
                const pantryCoverage = slotData.proposal?.pantryCoverage;
                const isExpanded = !!expandedSlots[slotKey];

                return (
                  <div key={slotKey} className={`diet-slot-card ${isApproved ? 'is-approved' : ''}`}>
                    {/* Header Slot */}
                    <div className="diet-slot-header" onClick={() => toggleSlotExpand(slotKey)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <span style={{ fontSize: '1.25rem' }}>{info.icon}</span>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>
                              {info.name}
                            </h3>
                            <span style={{
                              fontSize: '0.65rem',
                              fontWeight: 800,
                              padding: '0.15rem 0.45rem',
                              borderRadius: '99px',
                              background: isApproved ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.18)',
                              color: isApproved ? '#10b981' : '#f59e0b',
                              textTransform: 'uppercase'
                            }}>
                              {isApproved ? '✓ Approvato' : 'Proposto'}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            Target: {slotData.budget?.target_kcal} kcal (C: {slotData.budget?.target_carbs_g}g | P: {slotData.budget?.target_protein_g}g | F: {slotData.budget?.target_fat_g}g)
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {slotData.actual_macros && (
                          <div style={{ textAlign: 'right', marginRight: '0.25rem' }}>
                            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)' }}>
                              {slotData.actual_macros.kcal} kcal
                            </div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                              C:{slotData.actual_macros.carbs_g} P:{slotData.actual_macros.protein_g} F:{slotData.actual_macros.fat_g}
                            </div>
                          </div>
                        )}
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </div>

                    {/* Contenuto Dettagliato Ricetta */}
                    {isExpanded && recipe && (
                      <div className="diet-slot-body">
                        {/* Titolo e Categoria Ricetta */}
                        <div style={{ marginBottom: '0.75rem' }}>
                          <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.35rem 0', color: 'var(--text-main)' }}>
                            {recipe.title}
                          </h4>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
                            <span className="diet-tag">
                              🥗 {recipe.mediterranean_category}
                            </span>
                            <span className="diet-tag">
                              <Clock size={11} /> {recipe.prep_time_min} min
                            </span>
                            {recipe.substitutionsApplied?.length > 0 && (
                              <span className="diet-tag diet-tag-sub">
                                🔄 Sostituzioni attive
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Copertura Dispensa */}
                        {pantryCoverage && (
                          <div className="diet-pantry-badge-box">
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <Package size={14} color="var(--primary)" />
                              Dispensa: <strong>{Math.round(pantryCoverage.ratio * 100)}%</strong> ({pantryCoverage.owned.length} presenti)
                            </span>
                            {pantryCoverage.missing.length > 0 && (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.35rem' }}>
                                <span style={{ fontSize: '0.72rem', color: '#ef4444', fontWeight: 600 }}>Mancano:</span>
                                {pantryCoverage.missing.map(m => (
                                  <span key={m.id} className="missing-ing-chip">
                                    + {m.name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Ingredienti Scalati al Grammo */}
                        <div style={{ marginBottom: '0.85rem' }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                            Ingredienti e Porzioni Scalate (Solver Matematico):
                          </div>
                          <div className="diet-ingredients-grid">
                            {recipe.ingredients.map(ing => (
                              <div key={ing.id} className="diet-ing-row">
                                <span className="diet-ing-name">
                                  {ing.name}
                                </span>
                                <span className="diet-ing-grams">
                                  {ing.scaled_grams}g
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Istruzioni con grammi iniettati */}
                        <div style={{ marginBottom: '1rem', background: 'rgba(255,255,255,0.02)', padding: '0.65rem 0.8rem', borderRadius: '8px' }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                            Preparazione rapida:
                          </div>
                          <ol style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                            {recipe.formatted_steps.map((st, i) => (
                              <li key={i} style={{ marginBottom: '0.25rem' }}>{st}</li>
                            ))}
                          </ol>
                        </div>

                        {/* Barra Azioni Slot (Approva / Riprova Reroll) */}
                        <div className="diet-slot-actions">
                          {!isApproved ? (
                            <>
                              <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => retrySlot(slotKey)}
                                style={{ flex: 1, gap: '0.4rem', fontSize: '0.82rem' }}
                                title="Scarta questa ricetta e generane un'altra per questo pasto"
                              >
                                <RotateCcw size={15} />
                                <span>Riprova (Altra Ricetta)</span>
                              </button>
                              <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => approveSlot(slotKey)}
                                style={{ flex: 1.5, gap: '0.4rem', fontSize: '0.82rem' }}
                              >
                                <Check size={16} />
                                <span>Approva Pasto</span>
                              </button>
                            </>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                              <span style={{ fontSize: '0.82rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <CheckCircle2 size={16} /> Pasto approvato &amp; bloccato
                              </span>
                              <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => retrySlot(slotKey)}
                                style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                              >
                                Cambia
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Barra Azioni Globali: Applica a Piano Settimanale & Spesa */}
            <div className="diet-global-actions-card">
              <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 0.75rem 0' }}>
                Cosa vuoi fare con questa giornata?
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {/* 1. Applica a un giorno del menu */}
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <select
                    className="quick-add-input"
                    value={selectedDayToApply}
                    onChange={e => setSelectedDayToApply(e.target.value)}
                    style={{ flex: 1, fontSize: '0.85rem' }}
                  >
                    {DAYS_OF_WEEK.map(d => (
                      <option key={d.key} value={d.key}>
                        Applica a: {d.name}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleApplyToWeeklyPlan}
                    style={{ whiteSpace: 'nowrap', gap: '0.4rem', fontSize: '0.85rem' }}
                  >
                    <Calendar size={15} />
                    <span>Invia a Settimana</span>
                  </button>
                </div>

                {/* 2. Metti ingredienti mancanti nella lista della spesa */}
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleAddMissingToShoppingList}
                  style={{ width: '100%', justifyContent: 'center', gap: '0.5rem', borderColor: 'rgba(16, 185, 129, 0.4)' }}
                >
                  <ShoppingBag size={16} color="var(--primary)" />
                  <span>Aggiungi ingredienti mancanti alla Lista Spesa</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: BIOMETRIA & VINCOLI DIETA */}
        {/* ========================================================= */}
        {activeTab === 'biometrics' && (
          <form onSubmit={handleSaveBiometrics} className="diet-card-section">
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 1rem 0' }}>
              I Tuoi Parametri Biometrici &amp; Obiettivi
            </h2>

            <div className="diet-form-grid">
              {/* Peso */}
              <div>
                <label className="diet-input-label">Peso corporeo (kg)</label>
                <input
                  type="number"
                  step="0.5"
                  className="quick-add-input"
                  value={bioForm.weight_kg}
                  onChange={e => setBioForm({ ...bioForm, weight_kg: Number(e.target.value) })}
                  required
                />
              </div>

              {/* Altezza */}
              <div>
                <label className="diet-input-label">Altezza (cm)</label>
                <input
                  type="number"
                  className="quick-add-input"
                  value={bioForm.height_cm}
                  onChange={e => setBioForm({ ...bioForm, height_cm: Number(e.target.value) })}
                  required
                />
              </div>

              {/* Età */}
              <div>
                <label className="diet-input-label">Età (anni)</label>
                <input
                  type="number"
                  className="quick-add-input"
                  value={bioForm.age}
                  onChange={e => setBioForm({ ...bioForm, age: Number(e.target.value) })}
                  required
                />
              </div>

              {/* Sesso biologico */}
              <div>
                <label className="diet-input-label">Sesso biologico</label>
                <select
                  className="quick-add-input"
                  value={bioForm.biological_sex}
                  onChange={e => setBioForm({ ...bioForm, biological_sex: e.target.value })}
                >
                  <option value="male">Uomo (Mifflin-St Jeor +5)</option>
                  <option value="female">Donna (Mifflin-St Jeor -161)</option>
                </select>
              </div>

              {/* Attività fisica */}
              <div style={{ gridColumn: 'span 2' }}>
                <label className="diet-input-label">Livello di Attività Fisica Quotidiana</label>
                <select
                  className="quick-add-input"
                  value={bioForm.activity_level}
                  onChange={e => setBioForm({ ...bioForm, activity_level: e.target.value })}
                >
                  <option value="sedentary">Sedentario (lavoro d'ufficio, poco o nessun esercizio - x1.2)</option>
                  <option value="light">Leggermente attivo (1-3 allenamenti a settimana - x1.375)</option>
                  <option value="moderate">Moderatamente attivo (3-5 allenamenti a settimana - x1.55)</option>
                  <option value="very_active">Molto attivo (6-7 allenamenti intensi a settimana - x1.725)</option>
                  <option value="extra_active">Estremamente attivo / Lavoro fisico pesante (x1.9)</option>
                </select>
              </div>

              {/* Obiettivo calorico */}
              <div style={{ gridColumn: 'span 2' }}>
                <label className="diet-input-label">Obiettivo Nutrizionale</label>
                <select
                  className="quick-add-input"
                  value={bioForm.goal_delta}
                  onChange={e => setBioForm({ ...bioForm, goal_delta: Number(e.target.value) })}
                >
                  <option value="0">Mantenimento del peso forma (Deficit 0 kcal)</option>
                  <option value="-300">Dimagrimento graduale sostenibile (-300 kcal/die)</option>
                  <option value="-500">Definizione / Perdita grasso decisa (-500 kcal/die)</option>
                  <option value="250">Aumento massa magra controllato (+250 kcal/die)</option>
                </select>
              </div>
            </div>

            {/* Vincoli Statici & Intolleranze */}
            <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.65rem' }}>
                Intolleranze, Celiachia &amp; Preferenze Etiche
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                Il motore attiverà la sostituzione culinaria automatica 1:1 degli ingredienti non conformi (es. pasta di grano ➔ pasta gluten-free).
              </p>

              <div className="diet-checkboxes-grid">
                <label className="diet-checkbox-label">
                  <input
                    type="checkbox"
                    checked={bioForm.constraints.celiac || bioForm.constraints.gluten_free}
                    onChange={e => setBioForm({
                      ...bioForm,
                      constraints: { ...bioForm.constraints, celiac: e.target.checked, gluten_free: e.target.checked }
                    })}
                  />
                  <span>Celiachia / Senza Glutine</span>
                </label>

                <label className="diet-checkbox-label">
                  <input
                    type="checkbox"
                    checked={bioForm.constraints.lactose_free}
                    onChange={e => setBioForm({
                      ...bioForm,
                      constraints: { ...bioForm.constraints, lactose_free: e.target.checked }
                    })}
                  />
                  <span>Senza Lattosio</span>
                </label>

                <label className="diet-checkbox-label">
                  <input
                    type="checkbox"
                    checked={bioForm.constraints.vegetarian}
                    onChange={e => setBioForm({
                      ...bioForm,
                      constraints: { ...bioForm.constraints, vegetarian: e.target.checked }
                    })}
                  />
                  <span>Vegetariano (no carne/pesce)</span>
                </label>

                <label className="diet-checkbox-label">
                  <input
                    type="checkbox"
                    checked={bioForm.constraints.vegan}
                    onChange={e => setBioForm({
                      ...bioForm,
                      constraints: { ...bioForm.constraints, vegan: e.target.checked }
                    })}
                  />
                  <span>Vegano (100% vegetale)</span>
                </label>

                <label className="diet-checkbox-label">
                  <input
                    type="checkbox"
                    checked={bioForm.constraints.egg_free}
                    onChange={e => setBioForm({
                      ...bioForm,
                      constraints: { ...bioForm.constraints, egg_free: e.target.checked }
                    })}
                  />
                  <span>Senza Uova</span>
                </label>

                <label className="diet-checkbox-label">
                  <input
                    type="checkbox"
                    checked={bioForm.constraints.nut_free}
                    onChange={e => setBioForm({
                      ...bioForm,
                      constraints: { ...bioForm.constraints, nut_free: e.target.checked }
                    })}
                  />
                  <span>Senza Frutta a Guscio (noci/mandorle)</span>
                </label>
              </div>
            </div>

            {/* Ingredienti Sgraditi Esclusi */}
            <div style={{ marginTop: '1.25rem' }}>
              <label className="diet-input-label">Ingredienti che non ti piacciono (Esclusi dal calcolo)</label>
              <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Es. melanzane, cipolla, funghi..."
                  className="quick-add-input"
                  value={newDislikedInput}
                  onChange={e => setNewDislikedInput(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button type="button" className="btn btn-secondary" onClick={handleAddDisliked}>
                  + Aggiungi
                </button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {bioForm.disliked_ingredients.map(item => (
                  <span key={item} className="diet-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    {item}
                    <X size={12} style={{ cursor: 'pointer' }} onClick={() => handleRemoveDisliked(item)} />
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
                Salva Parametri &amp; Ricalcola Dieta
              </button>
            </div>
          </form>
        )}

        {/* ========================================================= */}
        {/* TAB 3: DISPENSA & FRIGO */}
        {/* ========================================================= */}
        {activeTab === 'pantry' && (
          <div className="diet-card-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                  Cosa hai in Frigo &amp; Dispensa?
                </h2>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
                  Il motore calcola la "Pantry Coverage Ratio" per proporre prioritariamente piatti che usano ingredienti che hai già in casa.
                </p>
              </div>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleSyncFromShopping}
                style={{ fontSize: '0.78rem', gap: '0.35rem' }}
                title="Aggiunge alla dispensa tutti gli articoli spuntati/acquistati nella lista della spesa"
              >
                <Package size={14} /> Sincronizza da Spesa Acquistata
              </button>
            </div>

            {/* Input rapido elemento custom */}
            <form onSubmit={handleAddCustomPantry} style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem' }}>
              <input
                type="text"
                placeholder="Aggiungi ingrediente in dispensa (es. orata, uova, riso)..."
                className="quick-add-input"
                value={customPantryInput}
                onChange={e => setCustomPantryInput(e.target.value)}
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn btn-primary">
                + Inserisci
              </button>
            </form>

            {/* Lista chip ingredienti mediterranei cliccabili per spunta veloce */}
            <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
              Tocca per indicare cosa hai già in casa:
            </div>
            <div className="diet-pantry-grid">
              {Object.values(INGREDIENTS).map(ing => {
                const isSelected = pantryList.includes(ing.id) || 
                                   pantryList.some(p => ing.name.toLowerCase().includes(p) || p.includes(ing.name.toLowerCase()));

                return (
                  <button
                    key={ing.id}
                    type="button"
                    className={`diet-pantry-chip ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleTogglePantryItem(ing.id)}
                  >
                    {isSelected && <Check size={13} />}
                    <span>{ing.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
