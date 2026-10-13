import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';
import { useAuth } from './AuthContext';
import { triggerHaptic } from '../services/haptics';

const MealPlanContext = createContext();

export const DAYS_OF_WEEK = [
  { id: 'monday', key: 'monday', name: 'Lunedì', short: 'LUN', dayNum: 1 },
  { id: 'tuesday', key: 'tuesday', name: 'Martedì', short: 'MAR', dayNum: 2 },
  { id: 'wednesday', key: 'wednesday', name: 'Mercoledì', short: 'MER', dayNum: 3 },
  { id: 'thursday', key: 'thursday', name: 'Giovedì', short: 'GIO', dayNum: 4 },
  { id: 'friday', key: 'friday', name: 'Venerdì', short: 'VEN', dayNum: 5 },
  { id: 'saturday', key: 'saturday', name: 'Sabato', short: 'SAB', dayNum: 6 },
  { id: 'sunday', key: 'sunday', name: 'Domenica', short: 'DOM', dayNum: 0 },
];

export const MEAL_TYPES = [
  { id: 'lunch', label: 'Pranzo', icon: '☀️', color: '#f59e0b' },
  { id: 'dinner', label: 'Cena', icon: '🌙', color: '#8b5cf6' }
];

const INITIAL_MEAL_PLAN = {
  monday: { lunch: 'Pasta al pomodoro e basilico', dinner: 'Petto di pollo con insalata' },
  tuesday: { lunch: 'Riso con verdure di stagione', dinner: 'Frittata con zucchine' },
  wednesday: { lunch: 'Pasta e ceci', dinner: 'Salmone al forno con patate' },
  thursday: { lunch: 'Gnocchi al pesto', dinner: 'Tagliata con rucola e grana' },
  friday: { lunch: 'Spaghetti alle vongole / tonno', dinner: 'Filetto di orata e spinaci' },
  saturday: { lunch: 'Piadina con crudo e mozzarella', dinner: 'Pizza' },
  sunday: { lunch: 'Lasagna della domenica', dinner: 'Pasto leggero / minestrone' },
};

export const MealPlanProvider = ({ children }) => {
  const { user } = useAuth();

  const [mealPlan, setMealPlan] = useState(() => {
    try {
      const saved = localStorage.getItem('manca_meal_plan');
      return saved ? JSON.parse(saved) : INITIAL_MEAL_PLAN;
    } catch {
      return INITIAL_MEAL_PLAN;
    }
  });

  const [isMealPlanOpen, setIsMealPlanOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null); // { dayKey, mealType, currentText, dayName }

  // Sincronizzazione Firebase Firestore quando loggato
  useEffect(() => {
    if (isFirebaseConfigured && db && user?.id) {
      const mealDocRef = doc(db, 'users', user.id, 'settings', 'meal_plan');
      const unsubscribe = onSnapshot(mealDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data && data.plan) {
            setMealPlan(data.plan);
            localStorage.setItem('manca_meal_plan', JSON.stringify(data.plan));
          }
        }
      }, (err) => {
        console.error('Errore sincronizzazione Firestore meal plan:', err);
      });

      return () => unsubscribe();
    }
  }, [user]);

  // Salva stato locale e invia a Firestore
  const savePlan = async (newPlan) => {
    setMealPlan(newPlan);
    localStorage.setItem('manca_meal_plan', JSON.stringify(newPlan));

    if (isFirebaseConfigured && db && user?.id) {
      try {
        const mealDocRef = doc(db, 'users', user.id, 'settings', 'meal_plan');
        await setDoc(mealDocRef, {
          plan: newPlan,
          updatedAt: Date.now()
        }, { merge: true });
      } catch (err) {
        console.error('Errore salvataggio Firestore meal plan:', err);
      }
    }
  };

  // Modifica pasto per giorno e tipo
  const updateMeal = (dayKey, mealType, text) => {
    triggerHaptic('medium');
    const updated = {
      ...mealPlan,
      [dayKey]: {
        ...(mealPlan[dayKey] || {}),
        [mealType]: text.trim()
      }
    };
    savePlan(updated);
  };

  // Cancella pasto
  const clearMeal = (dayKey, mealType) => {
    triggerHaptic('light');
    const updated = {
      ...mealPlan,
      [dayKey]: {
        ...(mealPlan[dayKey] || {}),
        [mealType]: ''
      }
    };
    savePlan(updated);
  };

  // Svuota l'intera settimana per ricominciare
  const resetWeek = () => {
    triggerHaptic('heavy');
    const emptyPlan = {};
    DAYS_OF_WEEK.forEach(day => {
      emptyPlan[day.key] = { lunch: '', dinner: '' };
    });
    savePlan(emptyPlan);
  };

  // Ripristina menu di esempio
  const loadExampleWeek = () => {
    triggerHaptic('success');
    savePlan(INITIAL_MEAL_PLAN);
  };

  return (
    <MealPlanContext.Provider value={{
      mealPlan,
      updateMeal,
      clearMeal,
      resetWeek,
      loadExampleWeek,
      isMealPlanOpen,
      setIsMealPlanOpen,
      editingMeal,
      setEditingMeal
    }}>
      {children}
    </MealPlanContext.Provider>
  );
};

export const useMealPlan = () => {
  const context = useContext(MealPlanContext);
  if (!context) {
    throw new Error('useMealPlan deve essere usato all\'interno di MealPlanProvider');
  }
  return context;
};
