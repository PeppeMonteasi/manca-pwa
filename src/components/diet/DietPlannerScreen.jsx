import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  RotateCcw, 
  ShoppingBag, 
  Calendar, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Utensils, 
  BookOpen, 
  CheckCircle2,
  Search,
  Tag
} from 'lucide-react';
import { useDishes } from '../../context/DishesContext';
import { useMealPlan, DAYS_OF_WEEK } from '../../context/MealPlanContext';
import { useShopping } from '../../context/ShoppingContext';
import { triggerHaptic } from '../../services/haptics';

export const DietPlannerScreen = ({ onBack }) => {
  const { 
    dishes, 
    dayPlan, 
    generateDayPlan, 
    changeMeal, 
    addDish, 
    updateDish, 
    deleteDish, 
    resetDishesToDefault, 
    categories 
  } = useDishes();

  const { updateMeal } = useMealPlan();
  const { addItem } = useShopping();

  const [activeTab, setActiveTab] = useState('plan'); // 'plan' | 'recipes'
  const [selectedDayToApply, setSelectedDayToApply] = useState('monday');
  const [successBanner, setSuccessBanner] = useState('');
  
  // Filtri tab ricettario
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modale Aggiungi/Modifica Piatto
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState(null); // null = nuovo piatto
  const [dishFormData, setDishFormData] = useState({
    name: '',
    mealType: 'both',
    category: 'primi',
    ingredients: ''
  });

  // Mostra notifica temporanea
  const showBanner = (msg) => {
    setSuccessBanner(msg);
    setTimeout(() => setSuccessBanner(''), 4000);
  };

  // 1. Applica i piatti del giorno generati al Piano Settimanale
  const handleApplyToWeek = () => {
    if (!dayPlan) return;
    triggerHaptic('success');

    if (dayPlan.lunch) {
      updateMeal(selectedDayToApply, 'lunch', dayPlan.lunch.name);
    }
    if (dayPlan.dinner) {
      updateMeal(selectedDayToApply, 'dinner', dayPlan.dinner.name);
    }

    const dayObj = DAYS_OF_WEEK.find(d => d.key === selectedDayToApply);
    showBanner(`Pasti inseriti con successo in ${dayObj?.name || 'settimana'}!`);
  };

  // 2. Aggiungi gli ingredienti di un singolo piatto alla lista della spesa
  const handleAddDishIngredientsToShopping = (dish, mealLabel) => {
    if (!dish || !dish.ingredients || dish.ingredients.length === 0) return;
    triggerHaptic('success');

    dish.ingredients.forEach(ingName => {
      addItem({
        name: ingName,
        quantity: '1',
        category: 'altro',
        notes: `Per ${dish.name} (${mealLabel})`
      });
    });

    showBanner(`Aggiunti ${dish.ingredients.length} ingredienti di "${dish.name}" alla Lista Spesa!`);
  };

  // 3. Aggiungi TUTTI gli ingredienti del giorno alla spesa
  const handleAddAllDayIngredientsToShopping = () => {
    if (!dayPlan) return;
    triggerHaptic('success');
    let count = 0;

    const allIngs = [];
    if (dayPlan.lunch?.ingredients) {
      dayPlan.lunch.ingredients.forEach(ing => allIngs.push({ name: ing, forDish: dayPlan.lunch.name, meal: 'Pranzo' }));
    }
    if (dayPlan.dinner?.ingredients) {
      dayPlan.dinner.ingredients.forEach(ing => allIngs.push({ name: ing, forDish: dayPlan.dinner.name, meal: 'Cena' }));
    }

    allIngs.forEach(item => {
      addItem({
        name: item.name,
        quantity: '1',
        category: 'altro',
        notes: `Per ${item.forDish} (${item.meal})`
      });
      count++;
    });

    showBanner(`Aggiunti tutti i ${count} ingredienti della giornata alla Lista Spesa!`);
  };

  // Gestione apertura form per nuovo piatto
  const handleOpenNewDishModal = () => {
    triggerHaptic('light');
    setEditingDish(null);
    setDishFormData({
      name: '',
      mealType: 'both',
      category: 'primi',
      ingredients: ''
    });
    setIsDishModalOpen(true);
  };

  // Gestione apertura form per modificare piatto esistente
  const handleOpenEditDishModal = (dish) => {
    triggerHaptic('light');
    setEditingDish(dish);
    setDishFormData({
      name: dish.name,
      mealType: dish.mealType || 'both',
      category: dish.category || 'primi',
      ingredients: Array.isArray(dish.ingredients) ? dish.ingredients.join(', ') : (dish.ingredients || '')
    });
    setIsDishModalOpen(true);
  };

  // Salva piatto (nuovo o modificato)
  const handleSaveDishForm = (e) => {
    e.preventDefault();
    if (!dishFormData.name.trim()) return;

    if (editingDish) {
      updateDish({
        ...editingDish,
        ...dishFormData
      });
      showBanner(`Piatto "${dishFormData.name}" aggiornato!`);
    } else {
      addDish(dishFormData);
      showBanner(`Piatto "${dishFormData.name}" aggiunto al ricettario!`);
    }

    setIsDishModalOpen(false);
  };

  // Piatti filtrati per tab ricettario
  const filteredDishes = dishes.filter(d => {
    const matchCat = categoryFilter === 'all' || d.category === categoryFilter;
    const matchSearch = !searchQuery.trim() || 
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.ingredients && d.ingredients.some(i => i.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchCat && matchSearch;
  });

  const getCategoryMeta = (catId) => {
    return categories.find(c => c.id === catId) || { name: catId, icon: '🍽️', color: 'var(--primary)' };
  };

  return (
    <div className="diet-planner-page">
      {/* Header Top di Navigazione */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', justifyContent: 'center' }}>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
              Pasti del Giorno
            </h1>
            <span className="diet-pro-badge">Ricettario</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0.15rem 0 0 0' }}>
            Genera pranzi e cene intelligenti dal tuo catalogo piatti
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => generateDayPlan()}
          title="Genera nuova combinazione per la giornata"
          style={{ fontSize: '0.78rem', padding: '0.45rem 0.75rem', gap: '0.35rem' }}
        >
          <Sparkles size={14} />
          <span className="hide-on-mobile">Nuovo Piano</span>
        </button>
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
          <Utensils size={16} />
          <span>Piano del Giorno</span>
        </button>

        <button
          type="button"
          className={`diet-tab-btn ${activeTab === 'recipes' ? 'active' : ''}`}
          onClick={() => {
            triggerHaptic('light');
            setActiveTab('recipes');
          }}
        >
          <BookOpen size={16} />
          <span>I Miei Piatti ({dishes.length})</span>
        </button>
      </div>

      <div className="diet-page-container">
        {/* Banner Notifica Azione */}
        {successBanner && (
          <div className="diet-alert-success">
            <CheckCircle2 size={18} />
            <span>{successBanner}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 1: PIANO DEL GIORNO */}
        {/* ========================================================= */}
        {activeTab === 'plan' && (
          <div>
            {/* Box Introduttivo */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.025)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '0.85rem 1rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem'
            }}>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Menu proposto per oggi
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Selezionato dalla tua lista di piatti con rotazione primi/secondi
                </div>
              </div>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => generateDayPlan()}
                style={{ fontSize: '0.75rem', padding: '0.4rem 0.65rem', gap: '0.35rem' }}
              >
                <RotateCcw size={13} /> Rigenera
              </button>
            </div>

            {/* Scheda PRANZO */}
            <div className="day-meal-card" style={{ borderLeft: '4px solid #f59e0b', marginBottom: '1.25rem' }}>
              <div className="day-meal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.35rem' }}>☀️</span>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#f59e0b', letterSpacing: '0.04em' }}>
                      Pranzo
                    </div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0.15rem 0 0 0' }}>
                      {dayPlan?.lunch?.name || 'Nessun piatto selezionato'}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => changeMeal('lunch')}
                  title="Pesca un altro piatto per pranzo dalla lista"
                  style={{ fontSize: '0.75rem', padding: '0.4rem 0.65rem', gap: '0.35rem' }}
                >
                  <RotateCcw size={13} />
                  <span>Cambia Piatto</span>
                </button>
              </div>

              {/* Dettagli e Ingredienti Pranzo */}
              {dayPlan?.lunch && (
                <div className="day-meal-body">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
                    <span className="diet-tag">
                      {getCategoryMeta(dayPlan.lunch.category).icon} {getCategoryMeta(dayPlan.lunch.category).name}
                    </span>
                  </div>

                  {dayPlan.lunch.ingredients && dayPlan.lunch.ingredients.length > 0 && (
                    <div style={{ marginBottom: '0.85rem' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                        Ingredienti necessari:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        {dayPlan.lunch.ingredients.map((ing, i) => (
                          <span key={i} className="ingredient-pill">
                            {ing}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => handleAddDishIngredientsToShopping(dayPlan.lunch, 'Pranzo')}
                      style={{ fontSize: '0.78rem', gap: '0.35rem' }}
                    >
                      <ShoppingBag size={14} color="var(--primary)" />
                      <span>+ Metti ingredienti in Lista Spesa</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Scheda CENA */}
            <div className="day-meal-card" style={{ borderLeft: '4px solid #8b5cf6', marginBottom: '1.5rem' }}>
              <div className="day-meal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.35rem' }}>🌙</span>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#a78bfa', letterSpacing: '0.04em' }}>
                      Cena
                    </div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0.15rem 0 0 0' }}>
                      {dayPlan?.dinner?.name || 'Nessun piatto selezionato'}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => changeMeal('dinner')}
                  title="Pesca un altro piatto per cena dalla lista"
                  style={{ fontSize: '0.75rem', padding: '0.4rem 0.65rem', gap: '0.35rem' }}
                >
                  <RotateCcw size={13} />
                  <span>Cambia Piatto</span>
                </button>
              </div>

              {/* Dettagli e Ingredienti Cena */}
              {dayPlan?.dinner && (
                <div className="day-meal-body">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
                    <span className="diet-tag">
                      {getCategoryMeta(dayPlan.dinner.category).icon} {getCategoryMeta(dayPlan.dinner.category).name}
                    </span>
                  </div>

                  {dayPlan.dinner.ingredients && dayPlan.dinner.ingredients.length > 0 && (
                    <div style={{ marginBottom: '0.85rem' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                        Ingredienti necessari:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        {dayPlan.dinner.ingredients.map((ing, i) => (
                          <span key={i} className="ingredient-pill">
                            {ing}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => handleAddDishIngredientsToShopping(dayPlan.dinner, 'Cena')}
                      style={{ fontSize: '0.78rem', gap: '0.35rem' }}
                    >
                      <ShoppingBag size={14} color="var(--primary)" />
                      <span>+ Metti ingredienti in Lista Spesa</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Pannello Azioni: Invia a Settimana & Spesa Totale */}
            <div className="diet-global-actions-card">
              <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 0.85rem 0' }}>
                Azioni sul Piano del Giorno
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {/* 1. Applica a un giorno della settimana */}
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <select
                    className="quick-add-input"
                    value={selectedDayToApply}
                    onChange={e => setSelectedDayToApply(e.target.value)}
                    style={{ flex: 1, fontSize: '0.85rem' }}
                  >
                    {DAYS_OF_WEEK.map(d => (
                      <option key={d.key} value={d.key}>
                        Assegna a: {d.name}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleApplyToWeek}
                    style={{ whiteSpace: 'nowrap', gap: '0.4rem', fontSize: '0.85rem' }}
                  >
                    <Calendar size={15} />
                    <span>Invia a Settimana</span>
                  </button>
                </div>

                {/* 2. Metti tutti gli ingredienti del giorno nella lista spesa */}
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleAddAllDayIngredientsToShopping}
                  style={{ width: '100%', justifyContent: 'center', gap: '0.5rem', borderColor: 'rgba(16, 185, 129, 0.4)' }}
                >
                  <ShoppingBag size={16} color="var(--primary)" />
                  <span>Aggiungi tutti gli ingredienti di oggi alla Lista Spesa</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: I MIEI PIATTI (RICETTARIO PERSONALIZZABILE) */}
        {/* ========================================================= */}
        {activeTab === 'recipes' && (
          <div>
            {/* Top Bar Ricettario */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.65rem' }}>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                  Il Tuo Ricettario Personale
                </h2>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0.15rem 0 0 0' }}>
                  I piatti tra cui il generatore sceglierà per i tuoi pranzi e cene
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleOpenNewDishModal}
                  style={{ fontSize: '0.8rem', padding: '0.5rem 0.85rem', gap: '0.35rem' }}
                >
                  <Plus size={16} />
                  <span>Nuovo Piatto</span>
                </button>
              </div>
            </div>

            {/* Barra Ricerca & Filtro Categoria */}
            <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Cerca piatto o ingrediente..."
                  className="quick-add-input"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '36px', fontSize: '0.85rem' }}
                />
              </div>

              {/* Chips Categorie */}
              <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                <button
                  type="button"
                  className={`category-filter-chip ${categoryFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setCategoryFilter('all')}
                >
                  Tutti ({dishes.length})
                </button>
                {categories.map(cat => {
                  const count = dishes.filter(d => d.category === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      className={`category-filter-chip ${categoryFilter === cat.id ? 'active' : ''}`}
                      onClick={() => setCategoryFilter(cat.id)}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.name} ({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Lista Piatti */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {filteredDishes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-secondary)' }}>
                  Nessun piatto trovato con questi filtri.
                </div>
              ) : (
                filteredDishes.map(dish => {
                  const catMeta = getCategoryMeta(dish.category);
                  const mealLabel = dish.mealType === 'lunch' ? 'Solo Pranzo' : dish.mealType === 'dinner' ? 'Solo Cena' : 'Pranzo & Cena';

                  return (
                    <div key={dish.id} className="dish-catalog-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                            <span style={{ fontSize: '1rem' }}>{catMeta.icon}</span>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                              {dish.name}
                            </h4>
                          </div>

                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', alignItems: 'center', margin: '0.35rem 0' }}>
                            <span className="diet-tag" style={{ fontSize: '0.68rem' }}>
                              {catMeta.name}
                            </span>
                            <span className="diet-tag" style={{ fontSize: '0.68rem', color: '#10b981' }}>
                              {mealLabel}
                            </span>
                          </div>

                          {/* Ingredienti */}
                          {dish.ingredients && dish.ingredients.length > 0 && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                              <span style={{ fontWeight: 600 }}>Ingredienti: </span>
                              {dish.ingredients.join(', ')}
                            </div>
                          )}
                        </div>

                        {/* Azioni Modifica / Elimina */}
                        <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0 }}>
                          <button
                            type="button"
                            className="btn btn-icon"
                            onClick={() => handleOpenEditDishModal(dish)}
                            title="Modifica piatto"
                            style={{ width: 30, height: 30 }}
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-icon"
                            onClick={() => {
                              if (window.confirm(`Vuoi eliminare "${dish.name}" dal ricettario?`)) {
                                deleteDish(dish.id);
                              }
                            }}
                            title="Elimina piatto"
                            style={{ width: 30, height: 30, color: '#ef4444' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Tasto Ripristina Ricettario Iniziale in fondo */}
            <div style={{ marginTop: '2rem', textAlign: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Vuoi ripristinare il catalogo piatti iniziale?')) {
                    resetDishesToDefault();
                  }
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.75rem',
                  textDecoration: 'underline',
                  cursor: 'pointer'
                }}
              >
                Ripristina ricette di base predefinite
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODALE AGGIUNGI / MODIFICA PIATTO */}
      {isDishModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsDishModalOpen(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '460px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                {editingDish ? 'Modifica Piatto' : 'Aggiungi Nuovo Piatto'}
              </h3>
              <button 
                type="button" 
                className="btn btn-icon" 
                onClick={() => setIsDishModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveDishForm}>
              {/* Nome Piatto */}
              <div style={{ marginBottom: '1rem' }}>
                <label className="diet-input-label">Nome del piatto</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Es. Risotto alla zucca e salsiccia"
                  className="quick-add-input"
                  value={dishFormData.name}
                  onChange={e => setDishFormData({ ...dishFormData, name: e.target.value })}
                />
              </div>

              {/* Idoneo per */}
              <div style={{ marginBottom: '1rem' }}>
                <label className="diet-input-label">Adatto per quale pasto?</label>
                <select
                  className="quick-add-input"
                  value={dishFormData.mealType}
                  onChange={e => setDishFormData({ ...dishFormData, mealType: e.target.value })}
                >
                  <option value="both">Sia Pranzo che Cena</option>
                  <option value="lunch">Solo Pranzo (tipicamente primi/pasta)</option>
                  <option value="dinner">Solo Cena (tipicamente secondi/leggeri)</option>
                </select>
              </div>

              {/* Categoria */}
              <div style={{ marginBottom: '1rem' }}>
                <label className="diet-input-label">Categoria</label>
                <select
                  className="quick-add-input"
                  value={dishFormData.category}
                  onChange={e => setDishFormData({ ...dishFormData, category: e.target.value })}
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ingredienti */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="diet-input-label">Ingredienti (separati da virgola)</label>
                <textarea
                  rows="3"
                  placeholder="Es. Riso Carnaroli, Zucca, Salsiccia, Cipolla, Parmigiano"
                  className="quick-add-input"
                  value={dishFormData.ingredients}
                  onChange={e => setDishFormData({ ...dishFormData, ingredients: e.target.value })}
                  style={{ resize: 'vertical' }}
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Serviranno quando cliccherai per aggiungerli alla lista della spesa.
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => setIsDishModalOpen(false)}
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1.5 }}
                >
                  <Check size={16} /> Salva Piatto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
