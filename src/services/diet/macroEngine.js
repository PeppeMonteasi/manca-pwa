/**
 * Mediterranean Meal & Macro Calculator Engine
 * Implementazione a 4 stadi con risolutore algebrico delle porzioni e rebalancing dinamico.
 */

import { INGREDIENTS, RECIPES, SUBSTITUTION_RULES } from './dietData';

// Configurazione standard macro Dieta Mediterranea:
// ~50-55% Carboidrati, ~15-20% Proteine, ~25-30% Grassi sani
export const MEDITERRANEAN_MACRO_RATIOS = {
  carbs_ratio: 0.525,  // 52.5% delle kcal da carboidrati (4 kcal/g)
  protein_ratio: 0.175,// 17.5% delle kcal da proteine (4 kcal/g)
  fat_ratio: 0.300     // 30.0% delle kcal da grassi sani (9 kcal/g)
};

// Pesi standard di ripartizione calorica dei pasti nella giornata
export const DEFAULT_SLOT_WEIGHTS_4 = {
  breakfast: 0.20, // 20%
  lunch: 0.40,     // 40%
  snack: 0.10,     // 10%
  dinner: 0.30     // 30%
};

export const DEFAULT_SLOT_WEIGHTS_2 = {
  lunch: 0.50,     // 50%
  dinner: 0.50     // 50%
};

// Ingredienti onnipresenti da ignorare nel calcolo di pantry coverage
export const UBIQUITOUS_PANTRY_STAPLES = new Set([
  'acqua', 'sale', 'pepe', 'origano', 'rosmarino', 'basilico', 'aglio'
]);

// Moltiplicatori del livello di attività fisica
export const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,       // Sedentario (lavoro d'ufficio, poco movimento)
  light: 1.375,         // Leggermente attivo (1-3 allenamenti/settimana)
  moderate: 1.55,       // Moderatamente attivo (3-5 allenamenti/settimana)
  very_active: 1.725,   // Molto attivo (6-7 allenamenti intensi/settimana)
  extra_active: 1.9     // Atleta professionista / lavoro pesante
};

// =========================================================================
// STAGE 1: TDEE, MEDITERRANEAN MACRO SPLIT & SLOT PARTITIONING
// =========================================================================

/**
 * Calcola BMR, TDEE e i macro target giornalieri secondo la Dieta Mediterranea
 */
export function calculateDailyTargets(profile) {
  const {
    weight_kg = 70,
    height_cm = 175,
    age = 30,
    biological_sex = 'male',
    activity_level = 'moderate',
    goal_delta = 0 // kcal (+/- deficit o surplus)
  } = profile;

  // 1. Basal Metabolic Rate (BMR) - Equazione Mifflin-St Jeor
  let bmr = 0;
  if (biological_sex === 'female') {
    bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) - 161;
  } else {
    bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) + 5;
  }

  // 2. TDEE = BMR * activity_multiplier + goal_delta
  const multiplier = ACTIVITY_MULTIPLIERS[activity_level] || 1.4;
  const tdee = Math.round(bmr * multiplier + Number(goal_delta || 0));
  const finalCalories = Math.max(1200, tdee); // Soglia di sicurezza minima

  // 3. Conversione in grammi di macronutrienti secondo proporzioni mediterranee
  const targetCarbsG = Math.round((finalCalories * MEDITERRANEAN_MACRO_RATIOS.carbs_ratio) / 4);
  const targetProteinG = Math.round((finalCalories * MEDITERRANEAN_MACRO_RATIOS.protein_ratio) / 4);
  const targetFatG = Math.round((finalCalories * MEDITERRANEAN_MACRO_RATIOS.fat_ratio) / 9);

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    daily_calories: finalCalories,
    daily_carbs_g: targetCarbsG,
    daily_protein_g: targetProteinG,
    daily_fat_g: targetFatG
  };
}

/**
 * Ripartisce il fabbisogno giornaliero sugli slot dei pasti attivi
 */
export function partitionSlots(dailyTargets, activeSlotKeys = ['breakfast', 'lunch', 'snack', 'dinner']) {
  const isTwoSlotMode = activeSlotKeys.length === 2 && activeSlotKeys.includes('lunch') && activeSlotKeys.includes('dinner');
  const slotWeights = isTwoSlotMode ? DEFAULT_SLOT_WEIGHTS_2 : DEFAULT_SLOT_WEIGHTS_4;

  const totalActiveWeight = activeSlotKeys.reduce((sum, key) => sum + (slotWeights[key] || 0.25), 0);

  const slotBudgets = {};

  activeSlotKeys.forEach(slotKey => {
    const rawWeight = slotWeights[slotKey] || 0.25;
    const normalizedWeight = rawWeight / totalActiveWeight;

    slotBudgets[slotKey] = {
      slot: slotKey,
      weight: normalizedWeight,
      target_kcal: Math.round(dailyTargets.daily_calories * normalizedWeight),
      target_carbs_g: Math.round(dailyTargets.daily_carbs_g * normalizedWeight),
      target_protein_g: Math.round(dailyTargets.daily_protein_g * normalizedWeight),
      target_fat_g: Math.round(dailyTargets.daily_fat_g * normalizedWeight)
    };
  });

  return slotBudgets;
}

// =========================================================================
// STAGE 2: STATIC CONSTRAINTS (HARD FILTERING & INGREDIENT MUTATION)
// =========================================================================

/**
 * Filtra e applica mutazioni di sostituzione 1:1 per soddisfare i vincoli dietetici statici
 */
export function filterAndMutateRecipe(recipe, constraints = {}, dislikedIngredients = []) {
  // 1. Controlla ingredienti sgraditi espliciti
  const dislikedSet = new Set(dislikedIngredients.map(d => d.trim().toLowerCase()));
  for (const item of recipe.ingredients) {
    const ing = INGREDIENTS[item.id];
    if (ing && dislikedSet.has(ing.name.toLowerCase())) {
      return null; // Escludi
    }
  }

  // 2. Clona gli ingredienti per eventuale mutazione in-memory
  const mutatedIngredients = [];
  const substitutionsApplied = [];

  for (const item of recipe.ingredients) {
    let ing = INGREDIENTS[item.id];
    if (!ing) return null;

    let targetIngId = item.id;

    // Controllo Celiachia / Senza Glutine
    if ((constraints.celiac || constraints.gluten_free) && ing.contains_gluten) {
      const subId = SUBSTITUTION_RULES.celiac[item.id] || SUBSTITUTION_RULES.gluten_free[item.id];
      if (subId && INGREDIENTS[subId]) {
        targetIngId = subId;
        substitutionsApplied.push({ from: ing.name, to: INGREDIENTS[subId].name });
      } else {
        return null; // Nessun sostituto valido: hard-filter
      }
    }

    // Controllo Intolleranza al Lattosio
    ing = INGREDIENTS[targetIngId];
    if (constraints.lactose_free && ing.contains_lactose) {
      const subId = SUBSTITUTION_RULES.lactose_free[targetIngId];
      if (subId && INGREDIENTS[subId]) {
        targetIngId = subId;
        substitutionsApplied.push({ from: ing.name, to: INGREDIENTS[subId].name });
      } else {
        return null; // Hard-filter
      }
    }

    // Controllo Vegetariano
    ing = INGREDIENTS[targetIngId];
    if (constraints.vegetarian && (ing.is_meat || ing.is_fish)) {
      const subId = SUBSTITUTION_RULES.vegetarian[targetIngId];
      if (subId && INGREDIENTS[subId]) {
        targetIngId = subId;
        substitutionsApplied.push({ from: ing.name, to: INGREDIENTS[subId].name });
      } else {
        return null; // Hard-filter
      }
    }

    // Controllo Vegano
    ing = INGREDIENTS[targetIngId];
    if (constraints.vegan && ing.is_animal_product) {
      const subId = SUBSTITUTION_RULES.vegan[targetIngId];
      if (subId && INGREDIENTS[subId]) {
        targetIngId = subId;
        substitutionsApplied.push({ from: ing.name, to: INGREDIENTS[subId].name });
      } else {
        return null; // Hard-filter
      }
    }

    // Controllo Uova
    ing = INGREDIENTS[targetIngId];
    if (constraints.egg_free && ing.contains_eggs) {
      return null;
    }

    // Controllo Frutta a guscio (noci/mandorle)
    if (constraints.nut_free && ing.contains_nuts) {
      return null;
    }

    mutatedIngredients.push({
      ...item,
      id: targetIngId,
      original_id: item.id
    });
  }

  return {
    ...recipe,
    ingredients: mutatedIngredients,
    substitutionsApplied
  };
}

// =========================================================================
// STAGE 3: DYNAMIC PANTRY SCORING & MEDITERRANEAN BALANCING
// =========================================================================

/**
 * Calcola il punteggio di copertura dispensa (Pantry Coverage Ratio)
 */
export function calculatePantryCoverage(recipe, pantryList = []) {
  const pantrySet = new Set(pantryList.map(p => p.trim().toLowerCase()));

  // Filtra ingredienti core ignorando spezie ubiquitarie
  const coreIngredients = recipe.ingredients.filter(item => !UBIQUITOUS_PANTRY_STAPLES.has(item.id));
  if (coreIngredients.length === 0) return { ratio: 1, owned: [], missing: [] };

  const owned = [];
  const missing = [];

  for (const item of coreIngredients) {
    const ing = INGREDIENTS[item.id];
    if (!ing) continue;

    // Controlla per ID o nome o parte del nome
    const nameLower = ing.name.toLowerCase();
    const isPresent = pantrySet.has(item.id.toLowerCase()) || 
                      Array.from(pantrySet).some(p => nameLower.includes(p) || p.includes(nameLower));

    if (isPresent) {
      owned.push(ing);
    } else {
      missing.push(ing);
    }
  }

  const ratio = owned.length / coreIngredients.length;
  return { ratio, owned, missing };
}

/**
 * Calcola il punteggio di rotazione mediterranea (penalizza ripetizioni dello stesso gruppo proteico nel giorno)
 */
export function calculateRotationScore(recipe, usedFoodGroups = []) {
  const category = recipe.mediterranean_category;
  if (!category) return 1.0;

  // Se il gruppo (es. 'fish', 'legumes', 'white_meat', 'eggs', 'dairy') è già stato usato oggi, penalizza
  const occurrences = usedFoodGroups.filter(cat => cat === category).length;
  if (occurrences === 0) return 1.0;     // Perfetta rotazione
  if (occurrences === 1) return 0.4;     // Penalità moderata
  return 0.1;                            // Penalità forte
}

/**
 * Seleziona la migliore ricetta candidata per uno slot
 */
export function rankCandidateRecipes(candidates, pantryList = [], usedFoodGroups = [], rejectedRecipeIds = new Set()) {
  const validCandidates = candidates.filter(r => !rejectedRecipeIds.has(r.id));
  if (validCandidates.length === 0) return null;

  const scored = validCandidates.map(recipe => {
    const pantry = calculatePantryCoverage(recipe, pantryList);
    const rotation = calculateRotationScore(recipe, usedFoodGroups);

    // Score pesato: 60% dispensa + 35% rotazione + 5% tie-breaker casuale controllato
    const tieBreaker = Math.random() * 0.05;
    const compositeScore = (pantry.ratio * 0.60) + (rotation * 0.35) + tieBreaker;

    return {
      recipe,
      pantry,
      rotation,
      compositeScore
    };
  });

  scored.sort((a, b) => b.compositeScore - a.compositeScore);
  return scored[0];
}

// =========================================================================
// STAGE 4: PORTION SCALING SOLVER (MATHEMATICAL MACRO FITTING)
// =========================================================================

/**
 * Risoluzione di un sistema lineare 3x3 tramite eliminazione gaussiana
 */
function solveLinear3x3(A, b) {
  const n = 3;
  const M = [
    [...A[0], b[0]],
    [...A[1], b[1]],
    [...A[2], b[2]]
  ];

  for (let i = 0; i < n; i++) {
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(M[k][i]) > Math.abs(M[maxRow][i])) {
        maxRow = k;
      }
    }
    [M[i], M[maxRow]] = [M[maxRow], M[i]];

    if (Math.abs(M[i][i]) < 1e-7) return null; // Singolare

    for (let k = i + 1; k < n; k++) {
      const factor = M[k][i] / M[i][i];
      for (let j = i; j <= n; j++) {
        M[k][j] -= factor * M[i][j];
      }
    }
  }

  const x = [0, 0, 0];
  for (let i = n - 1; i >= 0; i--) {
    let sum = M[i][n];
    for (let j = i + 1; j < n; j++) {
      sum -= M[i][j] * x[j];
    }
    x[i] = sum / M[i][i];
  }

  return x;
}

/**
 * Risolutore matematico di porzionatura per colpire i target macro dello slot
 */
export function scaleRecipePortions(recipe, targetSlotVector) {
  const {
    target_carbs_g: targetC,
    target_protein_g: targetP,
    target_fat_g: targetF
  } = targetSlotVector;

  // 1. Separa gli ingredienti per ruolo
  let primaryCarb = null;
  let primaryProtein = null;
  let primaryFat = null;
  const secondaryAndFixed = [];

  for (const item of recipe.ingredients) {
    const ing = INGREDIENTS[item.id];
    if (!ing) continue;

    if (item.scaling_role === 'PRIMARY_CARB' && !primaryCarb) {
      primaryCarb = { ...item, profile: ing };
    } else if (item.scaling_role === 'PRIMARY_PROTEIN' && !primaryProtein) {
      primaryProtein = { ...item, profile: ing };
    } else if (item.scaling_role === 'PRIMARY_FAT' && !primaryFat) {
      primaryFat = { ...item, profile: ing };
    } else {
      secondaryAndFixed.push({ ...item, profile: ing });
    }
  }

  // 2. Calcola apporto di base degli ingredienti secondari e fissi
  let baselineC = 0;
  let baselineP = 0;
  let baselineF = 0;

  for (const item of secondaryAndFixed) {
    const factor = item.base_grams / 100;
    baselineC += factor * item.profile.carbs_g;
    baselineP += factor * item.profile.protein_g;
    baselineF += factor * item.profile.fat_g;
  }

  // 3. Calcola il target residuo per i ruoli primari
  const residualC = Math.max(0, targetC - baselineC);
  const residualP = Math.max(0, targetP - baselineP);
  const residualF = Math.max(0, targetF - baselineF);

  let multCarb = 1.0;
  let multProtein = 1.0;
  let multFat = 1.0;

  // Costruzione e risoluzione del sistema algebrico in base ai ruoli primari presenti
  if (primaryCarb && primaryProtein && primaryFat) {
    const Wc = primaryCarb.base_grams / 100;
    const Wp = primaryProtein.base_grams / 100;
    const Wf = primaryFat.base_grams / 100;

    const A = [
      [Wc * primaryCarb.profile.carbs_g, Wp * primaryProtein.profile.carbs_g, Wf * primaryFat.profile.carbs_g],
      [Wc * primaryCarb.profile.protein_g, Wp * primaryProtein.profile.protein_g, Wf * primaryFat.profile.protein_g],
      [Wc * primaryCarb.profile.fat_g, Wp * primaryProtein.profile.fat_g, Wf * primaryFat.profile.fat_g]
    ];
    const b = [residualC, residualP, residualF];

    const solution = solveLinear3x3(A, b);
    if (solution && solution.every(v => !isNaN(v) && v > 0)) {
      multCarb = solution[0];
      multProtein = solution[1];
      multFat = solution[2];
    } else {
      // Fallback a proporzione singola dominante
      if (primaryCarb.profile.carbs_g > 0) multCarb = residualC / (Wc * primaryCarb.profile.carbs_g);
      if (primaryProtein.profile.protein_g > 0) multProtein = residualP / (Wp * primaryProtein.profile.protein_g);
      if (primaryFat.profile.fat_g > 0) multFat = residualF / (Wf * primaryFat.profile.fat_g);
    }
  } else {
    // Gestione ricette con 1 o 2 ruoli primari (es. snack, porzioni mono-ingrediente)
    if (primaryCarb && primaryCarb.profile.carbs_g > 0) {
      multCarb = residualC / ((primaryCarb.base_grams / 100) * primaryCarb.profile.carbs_g);
    }
    if (primaryProtein && primaryProtein.profile.protein_g > 0) {
      multProtein = residualP / ((primaryProtein.base_grams / 100) * primaryProtein.profile.protein_g);
    }
    if (primaryFat && primaryFat.profile.fat_g > 0) {
      multFat = residualF / ((primaryFat.base_grams / 100) * primaryFat.profile.fat_g);
    }
  }

  // 4. Culinary Clamping: limitazione moltiplicatori tra 0.4x e 2.2x per mantenere edibilità e consistenza
  multCarb = Math.min(Math.max(multCarb, 0.4), 2.2);
  multProtein = Math.min(Math.max(multProtein, 0.4), 2.2);
  multFat = Math.min(Math.max(multFat, 0.3), 2.0);

  // 5. Arrotondamento culinario ai 5g più vicini
  const round5 = (grams) => Math.max(5, Math.round(grams / 5) * 5);

  const scaledIngredients = recipe.ingredients.map(item => {
    const ing = INGREDIENTS[item.id];
    let grams = item.base_grams;

    if (item.scaling_role === 'PRIMARY_CARB') {
      grams = round5(item.base_grams * multCarb);
    } else if (item.scaling_role === 'PRIMARY_PROTEIN') {
      grams = round5(item.base_grams * multProtein);
    } else if (item.scaling_role === 'PRIMARY_FAT') {
      grams = round5(item.base_grams * multFat);
    } else if (item.scaling_role === 'SECONDARY_SCALABLE') {
      // Le verdure rimangono a porzione standard o scalano leggermente
      grams = item.base_grams;
    } else {
      // FIXED
      grams = item.base_grams;
    }

    return {
      ...item,
      name: ing.name,
      scaled_grams: grams,
      profile: ing
    };
  });

  // 6. Ricalcolo esatto actual_macros dai grammi finali arrotondati
  let actualC = 0;
  let actualP = 0;
  let actualF = 0;

  for (const item of scaledIngredients) {
    const factor = item.scaled_grams / 100;
    actualC += factor * item.profile.carbs_g;
    actualP += factor * item.profile.protein_g;
    actualF += factor * item.profile.fat_g;
  }

  const actualKcal = Math.round((actualC * 4) + (actualP * 4) + (actualF * 9));

  // 7. Iniezione dei grammi scalati nelle istruzioni della ricetta
  const formattedSteps = (recipe.template_steps || []).map(step => {
    let text = step;
    for (const item of scaledIngredients) {
      const placeholder = `{${item.original_id || item.id}}`;
      text = text.replace(new RegExp(placeholder, 'g'), `${item.scaled_grams}g di ${item.name}`);
    }
    return text;
  });

  return {
    ...recipe,
    ingredients: scaledIngredients,
    formatted_steps: formattedSteps,
    actual_macros: {
      kcal: actualKcal,
      carbs_g: Math.round(actualC),
      protein_g: Math.round(actualP),
      fat_g: Math.round(actualF)
    }
  };
}

// =========================================================================
// STAGE 5: STATE TRANSITIONS & RESIDUAL REBALANCING WORKFLOW
// =========================================================================

/**
 * Genera il piano completo iniziale per la giornata
 */
export function generateFullPlan(profile, pantryList = [], slotMode = '4_slots') {
  const dailyTargets = calculateDailyTargets(profile);
  const activeSlotKeys = slotMode === '2_slots' ? ['lunch', 'dinner'] : ['breakfast', 'lunch', 'snack', 'dinner'];
  const slotBudgets = partitionSlots(dailyTargets, activeSlotKeys);

  const usedFoodGroups = [];
  const rejectedRecipeIds = new Set();
  const slotsState = {};

  for (const slotKey of activeSlotKeys) {
    const budget = slotBudgets[slotKey];

    // Stage 2: Filtra e muta ricette idonee per questo slot
    const candidates = RECIPES
      .filter(r => r.slots.includes(slotKey))
      .map(r => filterAndMutateRecipe(r, profile.constraints || {}, profile.disliked_ingredients || []))
      .filter(Boolean);

    // Stage 3: Classifica e seleziona il top candidate
    const topScored = rankCandidateRecipes(candidates, pantryList, usedFoodGroups, rejectedRecipeIds);

    if (topScored) {
      // Stage 4: Solver di porzionatura
      const scaledRecipe = scaleRecipePortions(topScored.recipe, budget);
      usedFoodGroups.push(topScored.recipe.mediterranean_category);

      slotsState[slotKey] = {
        slot: slotKey,
        status: 'PROPOSED', // 'PROPOSED' | 'APPROVED'
        budget,
        proposal: {
          recipe: scaledRecipe,
          pantryCoverage: topScored.pantry,
          rotationScore: topScored.rotation
        },
        actual_macros: scaledRecipe.actual_macros
      };
    } else {
      slotsState[slotKey] = {
        slot: slotKey,
        status: 'PENDING',
        budget,
        proposal: null,
        actual_macros: { kcal: 0, carbs_g: 0, protein_g: 0, fat_g: 0 }
      };
    }
  }

  return {
    profile,
    pantryList,
    dailyTargets,
    slotMode,
    rejectedRecipeIds: Array.from(rejectedRecipeIds),
    slots: slotsState
  };
}

/**
 * Azione APPROVE_SLOT:
 * Marca lo slot come APPROVED e ricalcola dinamicamente il budget residuo sugli slot sbloccati
 */
export function approveSlotInSession(sessionState, slotKey) {
  const currentSlot = sessionState.slots[slotKey];
  if (!currentSlot || !currentSlot.proposal) return sessionState;

  // 1. Marca slot come APPROVED
  const updatedSlots = {
    ...sessionState.slots,
    [slotKey]: {
      ...currentSlot,
      status: 'APPROVED'
    }
  };

  // 2. Dynamic Residual Rebalancing
  // Somma i macro effettivi di tutti gli slot già approvati
  let approvedC = 0;
  let approvedP = 0;
  let approvedF = 0;

  Object.values(updatedSlots).forEach(s => {
    if (s.status === 'APPROVED' && s.actual_macros) {
      approvedC += s.actual_macros.carbs_g;
      approvedP += s.actual_macros.protein_g;
      approvedF += s.actual_macros.fat_g;
    }
  });

  const remainingC = Math.max(0, sessionState.dailyTargets.daily_carbs_g - approvedC);
  const remainingP = Math.max(0, sessionState.dailyTargets.daily_protein_g - approvedP);
  const remainingF = Math.max(0, sessionState.dailyTargets.daily_fat_g - approvedF);

  // Trova gli slot rimanenti ancora sbloccati (PROPOSED o PENDING)
  const unlockedSlots = Object.values(updatedSlots).filter(s => s.status !== 'APPROVED');
  const totalUnlockedWeight = unlockedSlots.reduce((sum, s) => sum + (s.budget.weight || 0.25), 0);

  if (unlockedSlots.length > 0 && totalUnlockedWeight > 0) {
    unlockedSlots.forEach(unlocked => {
      const share = (unlocked.budget.weight || 0.25) / totalUnlockedWeight;
      const rebalancedBudget = {
        ...unlocked.budget,
        target_carbs_g: Math.round(remainingC * share),
        target_protein_g: Math.round(remainingP * share),
        target_fat_g: Math.round(remainingF * share),
        target_kcal: Math.round(((remainingC * share) * 4) + ((remainingP * share) * 4) + ((remainingF * share) * 9))
      };

      // Ricalcola il solver della ricetta proposta su questo slot sbloccato
      let rebalancedProposal = unlocked.proposal;
      let actualMacros = unlocked.actual_macros;

      if (unlocked.proposal?.recipe) {
        const reScaled = scaleRecipePortions(unlocked.proposal.recipe, rebalancedBudget);
        rebalancedProposal = {
          ...unlocked.proposal,
          recipe: reScaled
        };
        actualMacros = reScaled.actual_macros;
      }

      updatedSlots[unlocked.slot] = {
        ...unlocked,
        budget: rebalancedBudget,
        proposal: rebalancedProposal,
        actual_macros: actualMacros
      };
    });
  }

  return {
    ...sessionState,
    slots: updatedSlots
  };
}

/**
 * Azione RETRY_SLOT (Reroll):
 * Scarta la ricetta attuale, la aggiunge ai rejected ed esegue un re-rank & solve solo per questo slot
 */
export function retrySlotInSession(sessionState, slotKey) {
  const currentSlot = sessionState.slots[slotKey];
  if (!currentSlot) return sessionState;

  const rejectedSet = new Set(sessionState.rejectedRecipeIds || []);
  if (currentSlot.proposal?.recipe?.id) {
    rejectedSet.add(currentSlot.proposal.recipe.id);
  }

  // Identifica categorie già approvate negli altri slot
  const usedFoodGroups = Object.values(sessionState.slots)
    .filter(s => s.slot !== slotKey && s.status === 'APPROVED' && s.proposal?.recipe?.mediterranean_category)
    .map(s => s.proposal.recipe.mediterranean_category);

  // Filtra e muta ricette idonee per questo slot
  const candidates = RECIPES
    .filter(r => r.slots.includes(slotKey))
    .map(r => filterAndMutateRecipe(r, sessionState.profile.constraints || {}, sessionState.profile.disliked_ingredients || []))
    .filter(Boolean);

  const topScored = rankCandidateRecipes(candidates, sessionState.pantryList || [], usedFoodGroups, rejectedSet);

  if (!topScored) {
    // Se tutte le ricette sono state esaurite nei reject, svuota il set di scarto per questo slot
    rejectedSet.clear();
  }

  const newTopScored = topScored || rankCandidateRecipes(candidates, sessionState.pantryList || [], usedFoodGroups, rejectedSet);

  if (newTopScored) {
    const scaledRecipe = scaleRecipePortions(newTopScored.recipe, currentSlot.budget);

    const updatedSlots = {
      ...sessionState.slots,
      [slotKey]: {
        ...currentSlot,
        status: 'PROPOSED',
        proposal: {
          recipe: scaledRecipe,
          pantryCoverage: newTopScored.pantry,
          rotationScore: newTopScored.rotation
        },
        actual_macros: scaledRecipe.actual_macros
      }
    };

    return {
      ...sessionState,
      rejectedRecipeIds: Array.from(rejectedSet),
      slots: updatedSlots
    };
  }

  return sessionState;
}

/**
 * Azione UPDATE_DYNAMIC_PANTRY:
 * Aggiorna la dispensa dell'utente e ricalcola i punteggi degli slot non approvati
 */
export function updatePantryInSession(sessionState, newPantryList) {
  const updatedSlots = { ...sessionState.slots };

  Object.values(updatedSlots).forEach(slot => {
    if (slot.status !== 'APPROVED' && slot.proposal?.recipe) {
      const newCoverage = calculatePantryCoverage(slot.proposal.recipe, newPantryList);
      updatedSlots[slot.slot] = {
        ...slot,
        proposal: {
          ...slot.proposal,
          pantryCoverage: newCoverage
        }
      };
    }
  });

  return {
    ...sessionState,
    pantryList: newPantryList,
    slots: updatedSlots
  };
}
