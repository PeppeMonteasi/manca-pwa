import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';
import { useAuth } from './AuthContext';
import { triggerHaptic } from '../services/haptics';
import { 
  generateFullPlan, 
  approveSlotInSession, 
  retrySlotInSession, 
  updatePantryInSession,
  calculateDailyTargets
} from '../services/diet/macroEngine';

const DietContext = createContext();

const DEFAULT_PROFILE = {
  weight_kg: 72,
  height_cm: 175,
  age: 30,
  biological_sex: 'male',
  activity_level: 'moderate',
  goal_delta: 0,
  constraints: {
    celiac: false,
    gluten_free: false,
    lactose_free: false,
    vegetarian: false,
    vegan: false,
    egg_free: false,
    nut_free: false
  },
  disliked_ingredients: []
};

const DEFAULT_PANTRY = [
  'pasta_grano',
  'olio_evo',
  'pomodorini',
  'uova_intere',
  'pane_casereccio',
  'zucchine',
  'riso_carnaroli',
  'petto_pollo',
  'mela'
];

export const DietProvider = ({ children }) => {
  const { user } = useAuth();

  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('manca_diet_profile');
      return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  const [pantryList, setPantryList] = useState(() => {
    try {
      const saved = localStorage.getItem('manca_diet_pantry');
      return saved ? JSON.parse(saved) : DEFAULT_PANTRY;
    } catch {
      return DEFAULT_PANTRY;
    }
  });

  const [slotMode, setSlotMode] = useState(() => {
    return localStorage.getItem('manca_diet_slot_mode') || '4_slots';
  });

  const [sessionPlan, setSessionPlan] = useState(() => {
    try {
      const saved = localStorage.getItem('manca_diet_session');
      if (saved) return JSON.parse(saved);
    } catch {}
    // Inizializza primo piano
    return generateFullPlan(DEFAULT_PROFILE, DEFAULT_PANTRY, '4_slots');
  });

  // Sincronizzazione Firebase Firestore
  useEffect(() => {
    if (isFirebaseConfigured && db && user?.id) {
      const dietDocRef = doc(db, 'users', user.id, 'settings', 'diet_engine');
      const unsubscribe = onSnapshot(dietDocRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data.profile) {
            setProfile(data.profile);
            localStorage.setItem('manca_diet_profile', JSON.stringify(data.profile));
          }
          if (data.pantryList) {
            setPantryList(data.pantryList);
            localStorage.setItem('manca_diet_pantry', JSON.stringify(data.pantryList));
          }
          if (data.sessionPlan) {
            setSessionPlan(data.sessionPlan);
            localStorage.setItem('manca_diet_session', JSON.stringify(data.sessionPlan));
          }
        }
      }, (err) => {
        console.error('Errore sincronizzazione Diet Firestore:', err);
      });

      return () => unsubscribe();
    }
  }, [user]);

  // Salva stato sessione
  const saveSession = async (newSession) => {
    setSessionPlan(newSession);
    localStorage.setItem('manca_diet_session', JSON.stringify(newSession));

    if (isFirebaseConfigured && db && user?.id) {
      try {
        const dietDocRef = doc(db, 'users', user.id, 'settings', 'diet_engine');
        await setDoc(dietDocRef, {
          profile,
          pantryList,
          sessionPlan: newSession,
          updatedAt: Date.now()
        }, { merge: true });
      } catch (e) {
        console.warn('Errore salvataggio Diet Firestore:', e);
      }
    }
  };

  // Genera o rigenera un piano completo
  const generateNewPlan = (overrideProfile, overridePantry, overrideMode) => {
    triggerHaptic('success');
    const prof = overrideProfile || profile;
    const pant = overridePantry || pantryList;
    const mode = overrideMode || slotMode;

    const newPlan = generateFullPlan(prof, pant, mode);
    saveSession(newPlan);
  };

  // Approva uno slot (con dynamic residual rebalancing)
  const approveSlot = (slotKey) => {
    triggerHaptic('medium');
    const updated = approveSlotInSession(sessionPlan, slotKey);
    saveSession(updated);
  };

  // Riprova/Reroll per uno slot
  const retrySlot = (slotKey) => {
    triggerHaptic('light');
    const updated = retrySlotInSession(sessionPlan, slotKey);
    saveSession(updated);
  };

  // Aggiorna la dispensa
  const updatePantry = (newPantry) => {
    setPantryList(newPantry);
    localStorage.setItem('manca_diet_pantry', JSON.stringify(newPantry));

    if (sessionPlan) {
      const updated = updatePantryInSession(sessionPlan, newPantry);
      saveSession(updated);
    }
  };

  // Aggiorna profilo biometrico
  const updateProfile = (newProfile) => {
    setProfile(newProfile);
    localStorage.setItem('manca_diet_profile', JSON.stringify(newProfile));
    generateNewPlan(newProfile, pantryList, slotMode);
  };

  // Cambia modalità slot (4 pasti vs 2 pasti)
  const handleSetSlotMode = (newMode) => {
    triggerHaptic('light');
    setSlotMode(newMode);
    localStorage.setItem('manca_diet_slot_mode', newMode);
    generateNewPlan(profile, pantryList, newMode);
  };

  // Calcola i target attuali dal profilo
  const targets = calculateDailyTargets(profile);

  return (
    <DietContext.Provider value={{
      profile,
      pantryList,
      slotMode,
      setSlotMode: handleSetSlotMode,
      sessionPlan,
      targets,
      generateNewPlan,
      approveSlot,
      retrySlot,
      updatePantry,
      updateProfile
    }}>
      {children}
    </DietContext.Provider>
  );
};

export const useDiet = () => {
  const context = useContext(DietContext);
  if (!context) {
    throw new Error('useDiet deve essere utilizzato dentro DietProvider');
  }
  return context;
};
