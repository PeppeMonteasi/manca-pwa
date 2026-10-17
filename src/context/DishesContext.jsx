import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';
import { useAuth } from './AuthContext';
import { INITIAL_DISHES, DISH_CATEGORIES } from '../services/dishes/dishesData';
import { triggerHaptic } from '../services/haptics';

const DishesContext = createContext();

export const DishesProvider = ({ children }) => {
  const { user } = useAuth();

  // Catalogo Piatti Personale
  const [dishes, setDishes] = useState(() => {
    try {
      const saved = localStorage.getItem('manca_dishes_catalog');
      return saved ? JSON.parse(saved) : INITIAL_DISHES;
    } catch {
      return INITIAL_DISHES;
    }
  });

  // Piano del giorno generato
  const [dayPlan, setDayPlan] = useState(() => {
    try {
      const saved = localStorage.getItem('manca_generated_day_plan');
      if (saved) return JSON.parse(saved);
    } catch {}
    // Default iniziale
    return null;
  });

  // Sincronizzazione Firestore per il catalogo piatti
  useEffect(() => {
    if (isFirebaseConfigured && db && user?.id) {
      const dishesDocRef = doc(db, 'users', user.id, 'settings', 'dishes_catalog');
      const unsubscribe = onSnapshot(dishesDocRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data.dishes && Array.isArray(data.dishes)) {
            setDishes(data.dishes);
            localStorage.setItem('manca_dishes_catalog', JSON.stringify(data.dishes));
          }
        }
      }, (err) => {
        console.warn('Errore sincronizzazione Dishes Firestore:', err);
      });

      return () => unsubscribe();
    }
  }, [user]);

  // Salva catalogo piatti
  const saveDishes = async (newDishes) => {
    setDishes(newDishes);
    localStorage.setItem('manca_dishes_catalog', JSON.stringify(newDishes));

    if (isFirebaseConfigured && db && user?.id) {
      try {
        const dishesDocRef = doc(db, 'users', user.id, 'settings', 'dishes_catalog');
        await setDoc(dishesDocRef, {
          dishes: newDishes,
          updatedAt: Date.now()
        }, { merge: true });
      } catch (err) {
        console.warn('Errore salvataggio Dishes Firestore:', err);
      }
    }
  };

  // Salva piano del giorno generato
  const saveDayPlan = (newPlan) => {
    setDayPlan(newPlan);
    localStorage.setItem('manca_generated_day_plan', JSON.stringify(newPlan));
  };

  // Generatore Piano Giornaliero Intelligente (non casuale a caso, ma con rotazione e buon senso)
  const generateDayPlan = () => {
    triggerHaptic('success');

    // 1. Candidati per il Pranzo (preferenza a primi, riso, insalate, piatti unici)
    const lunchCandidates = dishes.filter(d => d.mealType === 'lunch' || d.mealType === 'both');
    const poolLunch = lunchCandidates.length > 0 ? lunchCandidates : dishes;
    const lunchDish = poolLunch[Math.floor(Math.random() * poolLunch.length)];

    // 2. Candidati per la Cena (preferenza a secondi: carne, pesce, uova, legumi, diversi dal pranzo)
    const dinnerCandidates = dishes.filter(d => 
      (d.mealType === 'dinner' || d.mealType === 'both') &&
      d.id !== lunchDish.id &&
      d.category !== lunchDish.category
    );

    const fallbackDinner = dishes.filter(d => d.id !== lunchDish.id);
    const poolDinner = dinnerCandidates.length > 0 ? dinnerCandidates : (fallbackDinner.length > 0 ? fallbackDinner : dishes);
    const dinnerDish = poolDinner[Math.floor(Math.random() * poolDinner.length)];

    const newPlan = {
      lunch: lunchDish,
      dinner: dinnerDish,
      generatedAt: Date.now()
    };

    saveDayPlan(newPlan);
    return newPlan;
  };

  // Inizializza al primo caricamento se nullo
  useEffect(() => {
    if (!dayPlan && dishes.length > 0) {
      generateDayPlan();
    }
  }, []);

  // Cambia solo un pasto (Pranzo o Cena) pescando un'alternativa dalla lista
  const changeMeal = (slotKey) => {
    triggerHaptic('light');
    if (!dayPlan) return;

    const currentDishId = dayPlan[slotKey]?.id;
    const otherSlotKey = slotKey === 'lunch' ? 'dinner' : 'lunch';
    const otherDishId = dayPlan[otherSlotKey]?.id;

    // Filtra candidati validi per questo slot
    const candidates = dishes.filter(d => 
      (d.mealType === slotKey || d.mealType === 'both') &&
      d.id !== currentDishId &&
      d.id !== otherDishId
    );

    const pool = candidates.length > 0 ? candidates : dishes.filter(d => d.id !== currentDishId);
    if (pool.length === 0) return;

    const newDish = pool[Math.floor(Math.random() * pool.length)];
    const updatedPlan = {
      ...dayPlan,
      [slotKey]: newDish
    };

    saveDayPlan(updatedPlan);
  };

  // Aggiungi un nuovo piatto al catalogo
  const addDish = (newDishData) => {
    triggerHaptic('success');
    const newDish = {
      id: `dish-custom-${Date.now()}`,
      name: newDishData.name.trim(),
      mealType: newDishData.mealType || 'both',
      category: newDishData.category || 'primi',
      ingredients: Array.isArray(newDishData.ingredients) 
        ? newDishData.ingredients 
        : (newDishData.ingredients || '').split(',').map(s => s.trim()).filter(Boolean)
    };

    const updated = [newDish, ...dishes];
    saveDishes(updated);
  };

  // Modifica un piatto esistente
  const updateDish = (updatedDish) => {
    triggerHaptic('medium');
    const updated = dishes.map(d => d.id === updatedDish.id ? {
      ...updatedDish,
      ingredients: Array.isArray(updatedDish.ingredients)
        ? updatedDish.ingredients
        : (updatedDish.ingredients || '').split(',').map(s => s.trim()).filter(Boolean)
    } : d);

    saveDishes(updated);

    // Se il piatto modificato è nel piano attuale del giorno, aggiorna anche lì
    if (dayPlan) {
      let planModified = false;
      const newPlan = { ...dayPlan };
      if (newPlan.lunch?.id === updatedDish.id) {
        newPlan.lunch = updatedDish;
        planModified = true;
      }
      if (newPlan.dinner?.id === updatedDish.id) {
        newPlan.dinner = updatedDish;
        planModified = true;
      }
      if (planModified) saveDayPlan(newPlan);
    }
  };

  // Cancella un piatto
  const deleteDish = (dishId) => {
    triggerHaptic('medium');
    const updated = dishes.filter(d => d.id !== dishId);
    saveDishes(updated);
  };

  // Ripristina ricettario iniziale
  const resetDishesToDefault = () => {
    triggerHaptic('heavy');
    saveDishes(INITIAL_DISHES);
    generateDayPlan();
  };

  return (
    <DishesContext.Provider value={{
      dishes,
      dayPlan,
      generateDayPlan,
      changeMeal,
      addDish,
      updateDish,
      deleteDish,
      resetDishesToDefault,
      categories: DISH_CATEGORIES
    }}>
      {children}
    </DishesContext.Provider>
  );
};

export const useDishes = () => {
  const context = useContext(DishesContext);
  if (!context) {
    throw new Error('useDishes deve essere utilizzato all\'interno di DishesProvider');
  }
  return context;
};
