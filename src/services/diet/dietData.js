/**
 * Database degli Ingredienti e Ricette della Dieta Mediterranea
 * Ogni ingrediente include profilo nutrizionale per 100g, allergeni e gruppi di sostituzione culinaria.
 * Ogni ricetta include ruoli di scaling, porzione base e tag di rotazione mediterranea.
 */

// ==========================================
// 1. DATABASE INGREDIENTI
// ==========================================
export const INGREDIENTS = {
  // --- CARBOIDRATI PRIMARI & CEREALI ---
  pasta_grano: {
    id: 'pasta_grano',
    name: 'Pasta di semola / integrale',
    kcal: 355,
    carbs_g: 72,
    protein_g: 12.5,
    fat_g: 1.5,
    fiber_g: 3.5,
    contains_gluten: true,
    contains_lactose: false,
    is_animal_product: false,
    sub_group: 'pasta'
  },
  pasta_gf: {
    id: 'pasta_gf',
    name: 'Pasta senza glutine (riso/mais)',
    kcal: 350,
    carbs_g: 78,
    protein_g: 6,
    fat_g: 1.5,
    fiber_g: 2.0,
    contains_gluten: false,
    contains_lactose: false,
    is_animal_product: false,
    sub_group: 'pasta'
  },
  riso_carnaroli: {
    id: 'riso_carnaroli',
    name: 'Riso Carnaroli / Integrale',
    kcal: 350,
    carbs_g: 77,
    protein_g: 7.5,
    fat_g: 1.0,
    fiber_g: 2.5,
    contains_gluten: false,
    contains_lactose: false,
    is_animal_product: false,
    sub_group: 'rice'
  },
  farro: {
    id: 'farro',
    name: 'Farro perlato',
    kcal: 335,
    carbs_g: 67,
    protein_g: 14,
    fat_g: 2.5,
    fiber_g: 7.0,
    contains_gluten: true,
    contains_lactose: false,
    is_animal_product: false,
    sub_group: 'grains'
  },
  quinoa: {
    id: 'quinoa',
    name: 'Quinoa',
    kcal: 368,
    carbs_g: 64,
    protein_g: 14,
    fat_g: 6.0,
    fiber_g: 7.0,
    contains_gluten: false,
    contains_lactose: false,
    is_animal_product: false,
    sub_group: 'grains'
  },
  pane_casereccio: {
    id: 'pane_casereccio',
    name: 'Pane casereccio / integrale',
    kcal: 265,
    carbs_g: 49,
    protein_g: 9,
    fat_g: 3.0,
    fiber_g: 4.5,
    contains_gluten: true,
    contains_lactose: false,
    is_animal_product: false,
    sub_group: 'bread'
  },
  pane_gf: {
    id: 'pane_gf',
    name: 'Pane senza glutine',
    kcal: 240,
    carbs_g: 50,
    protein_g: 4,
    fat_g: 2.0,
    fiber_g: 3.0,
    contains_gluten: false,
    contains_lactose: false,
    is_animal_product: false,
    sub_group: 'bread'
  },
  patate: {
    id: 'patate',
    name: 'Patate fresche',
    kcal: 77,
    carbs_g: 17,
    protein_g: 2.0,
    fat_g: 0.1,
    fiber_g: 2.1,
    contains_gluten: false,
    contains_lactose: false,
    is_animal_product: false,
    sub_group: 'tubers'
  },
  avena_fiocchi: {
    id: 'avena_fiocchi',
    name: 'Fiocchi d\'avena integrali',
    kcal: 370,
    carbs_g: 60,
    protein_g: 13,
    fat_g: 7.0,
    fiber_g: 10.0,
    contains_gluten: false, // cert. gf compatibile
    contains_lactose: false,
    is_animal_product: false,
    sub_group: 'cereals'
  },
  fette_biscottate: {
    id: 'fette_biscottate',
    name: 'Fette biscottate integrali',
    kcal: 385,
    carbs_g: 70,
    protein_g: 11,
    fat_g: 5.5,
    fiber_g: 6.0,
    contains_gluten: true,
    contains_lactose: false,
    is_animal_product: false,
    sub_group: 'crisps'
  },
  fette_gf: {
    id: 'fette_gf',
    name: 'Fette biscottate senza glutine',
    kcal: 375,
    carbs_g: 75,
    protein_g: 5,
    fat_g: 4.5,
    fiber_g: 4.0,
    contains_gluten: false,
    contains_lactose: false,
    is_animal_product: false,
    sub_group: 'crisps'
  },

  // --- PROTEINE PRIMARIE (CARNI, PESCI, LEGUMI, UOVA, FORMAGGI) ---
  petto_pollo: {
    id: 'petto_pollo',
    name: 'Petto di pollo',
    kcal: 110,
    carbs_g: 0,
    protein_g: 23,
    fat_g: 1.5,
    fiber_g: 0,
    contains_gluten: false,
    contains_lactose: false,
    is_meat: true,
    is_fish: false,
    is_animal_product: true,
    sub_group: 'poultry'
  },
  fesa_tacchino: {
    id: 'fesa_tacchino',
    name: 'Fesa di tacchino',
    kcal: 105,
    carbs_g: 0,
    protein_g: 24,
    fat_g: 1.0,
    fiber_g: 0,
    contains_gluten: false,
    contains_lactose: false,
    is_meat: true,
    is_fish: false,
    is_animal_product: true,
    sub_group: 'poultry'
  },
  filetto_salmone: {
    id: 'filetto_salmone',
    name: 'Filetto di salmone fresco',
    kcal: 185,
    carbs_g: 0,
    protein_g: 20,
    fat_g: 12.0,
    fiber_g: 0,
    contains_gluten: false,
    contains_lactose: false,
    is_meat: false,
    is_fish: true,
    is_animal_product: true,
    sub_group: 'fish_fatty'
  },
  filetto_orata: {
    id: 'filetto_orata',
    name: 'Filetto di orata / spigola',
    kcal: 95,
    carbs_g: 0,
    protein_g: 20,
    fat_g: 1.5,
    fiber_g: 0,
    contains_gluten: false,
    contains_lactose: false,
    is_meat: false,
    is_fish: true,
    is_animal_product: true,
    sub_group: 'fish_lean'
  },
  merluzzo: {
    id: 'merluzzo',
    name: 'Filetto di merluzzo / nasello',
    kcal: 82,
    carbs_g: 0,
    protein_g: 18,
    fat_g: 0.7,
    fiber_g: 0,
    contains_gluten: false,
    contains_lactose: false,
    is_meat: false,
    is_fish: true,
    is_animal_product: true,
    sub_group: 'fish_lean'
  },
  tonno_naturale: {
    id: 'tonno_naturale',
    name: 'Tonno al naturale',
    kcal: 100,
    carbs_g: 0,
    protein_g: 24,
    fat_g: 0.5,
    fiber_g: 0,
    contains_gluten: false,
    contains_lactose: false,
    is_meat: false,
    is_fish: true,
    is_animal_product: true,
    sub_group: 'fish_lean'
  },
  ceci_cotti: {
    id: 'ceci_cotti',
    name: 'Ceci lessati',
    kcal: 120,
    carbs_g: 17,
    protein_g: 7.0,
    fat_g: 2.5,
    fiber_g: 5.5,
    contains_gluten: false,
    contains_lactose: false,
    is_meat: false,
    is_fish: false,
    is_animal_product: false,
    sub_group: 'legumes'
  },
  lenticchie_cotte: {
    id: 'lenticchie_cotte',
    name: 'Lenticchie lessate',
    kcal: 115,
    carbs_g: 18,
    protein_g: 9.0,
    fat_g: 0.5,
    fiber_g: 6.0,
    contains_gluten: false,
    contains_lactose: false,
    is_meat: false,
    is_fish: false,
    is_animal_product: false,
    sub_group: 'legumes'
  },
  uova_intere: {
    id: 'uova_intere',
    name: 'Uova intere fresche',
    kcal: 140,
    carbs_g: 0.5,
    protein_g: 12.5,
    fat_g: 10.0,
    fiber_g: 0,
    contains_gluten: false,
    contains_lactose: false,
    contains_eggs: true,
    is_meat: false,
    is_fish: false,
    is_animal_product: true,
    sub_group: 'eggs'
  },
  ricotta_vaccina: {
    id: 'ricotta_vaccina',
    name: 'Ricotta vaccina fresca',
    kcal: 145,
    carbs_g: 3.5,
    protein_g: 11,
    fat_g: 9.5,
    fiber_g: 0,
    contains_gluten: false,
    contains_lactose: true,
    is_meat: false,
    is_fish: false,
    is_animal_product: true,
    sub_group: 'ricotta'
  },
  ricotta_delact: {
    id: 'ricotta_delact',
    name: 'Ricotta senza lattosio',
    kcal: 140,
    carbs_g: 3.5,
    protein_g: 11,
    fat_g: 9.0,
    fiber_g: 0,
    contains_gluten: false,
    contains_lactose: false,
    is_meat: false,
    is_fish: false,
    is_animal_product: true,
    sub_group: 'ricotta'
  },
  mozzarella: {
    id: 'mozzarella',
    name: 'Mozzarella fior di latte',
    kcal: 250,
    carbs_g: 1.0,
    protein_g: 18,
    fat_g: 19.0,
    fiber_g: 0,
    contains_gluten: false,
    contains_lactose: true,
    is_meat: false,
    is_fish: false,
    is_animal_product: true,
    sub_group: 'mozzarella'
  },
  mozzarella_delact: {
    id: 'mozzarella_delact',
    name: 'Mozzarella senza lattosio',
    kcal: 245,
    carbs_g: 1.0,
    protein_g: 18,
    fat_g: 18.5,
    fiber_g: 0,
    contains_gluten: false,
    contains_lactose: false,
    is_meat: false,
    is_fish: false,
    is_animal_product: true,
    sub_group: 'mozzarella'
  },
  yogurt_greco: {
    id: 'yogurt_greco',
    name: 'Yogurt greco 0%',
    kcal: 55,
    carbs_g: 3.5,
    protein_g: 10,
    fat_g: 0.2,
    fiber_g: 0,
    contains_gluten: false,
    contains_lactose: true,
    is_meat: false,
    is_fish: false,
    is_animal_product: true,
    sub_group: 'yogurt'
  },
  yogurt_soia: {
    id: 'yogurt_soia',
    name: 'Yogurt di soia naturale',
    kcal: 50,
    carbs_g: 2.5,
    protein_g: 4.0,
    fat_g: 2.5,
    fiber_g: 1.0,
    contains_gluten: false,
    contains_lactose: false,
    is_meat: false,
    is_fish: false,
    is_animal_product: false,
    sub_group: 'yogurt'
  },
  tofu: {
    id: 'tofu',
    name: 'Tofu al naturale',
    kcal: 85,
    carbs_g: 1.5,
    protein_g: 9.0,
    fat_g: 5.0,
    fiber_g: 1.2,
    contains_gluten: false,
    contains_lactose: false,
    is_meat: false,
    is_fish: false,
    is_animal_product: false,
    sub_group: 'plant_protein'
  },
  manzo_magro: {
    id: 'manzo_magro',
    name: 'Tagliata di manzo magro',
    kcal: 130,
    carbs_g: 0,
    protein_g: 21,
    fat_g: 5.0,
    fiber_g: 0,
    contains_gluten: false,
    contains_lactose: false,
    is_meat: true,
    is_fish: false,
    is_animal_product: true,
    sub_group: 'red_meat'
  },

  // --- GRASSI SANI & LIPIDI PRIMARI ---
  olio_evo: {
    id: 'olio_evo',
    name: 'Olio extravergine d\'oliva (EVO)',
    kcal: 884,
    carbs_g: 0,
    protein_g: 0,
    fat_g: 100.0,
    fiber_g: 0,
    contains_gluten: false,
    contains_lactose: false,
    is_animal_product: false,
    sub_group: 'oil'
  },
  noci: {
    id: 'noci',
    name: 'Noci sgusciate',
    kcal: 654,
    carbs_g: 7,
    protein_g: 15,
    fat_g: 65.0,
    fiber_g: 6.7,
    contains_gluten: false,
    contains_lactose: false,
    contains_nuts: true,
    is_animal_product: false,
    sub_group: 'nuts'
  },
  mandorle: {
    id: 'mandorle',
    name: 'Mandorle pelate',
    kcal: 575,
    carbs_g: 9,
    protein_g: 21,
    fat_g: 50.0,
    fiber_g: 12.0,
    contains_gluten: false,
    contains_lactose: false,
    contains_nuts: true,
    is_animal_product: false,
    sub_group: 'nuts'
  },

  // --- VERDURE & SECONDARY SCALABLE ---
  pomodorini: {
    id: 'pomodorini',
    name: 'Pomodorini freschi / passata',
    kcal: 20,
    carbs_g: 3.5,
    protein_g: 1.0,
    fat_g: 0.2,
    fiber_g: 1.5,
    contains_gluten: false,
    contains_lactose: false,
    is_animal_product: false
  },
  zucchine: {
    id: 'zucchine',
    name: 'Zucchine verdi',
    kcal: 15,
    carbs_g: 2.5,
    protein_g: 1.3,
    fat_g: 0.2,
    fiber_g: 1.2,
    contains_gluten: false,
    contains_lactose: false,
    is_animal_product: false
  },
  spinaci: {
    id: 'spinaci',
    name: 'Spinaci freschi / cotti',
    kcal: 23,
    carbs_g: 3.0,
    protein_g: 2.9,
    fat_g: 0.4,
    fiber_g: 2.2,
    contains_gluten: false,
    contains_lactose: false,
    is_animal_product: false
  },
  insalata_mista: {
    id: 'insalata_mista',
    name: 'Insalata mista / rucola',
    kcal: 18,
    carbs_g: 2.0,
    protein_g: 1.5,
    fat_g: 0.2,
    fiber_g: 1.8,
    contains_gluten: false,
    contains_lactose: false,
    is_animal_product: false
  },
  mirtilli: {
    id: 'mirtilli',
    name: 'Mirtilli freschi / frutti di bosco',
    kcal: 57,
    carbs_g: 14,
    protein_g: 0.7,
    fat_g: 0.3,
    fiber_g: 2.4,
    contains_gluten: false,
    contains_lactose: false,
    is_animal_product: false
  },
  mela: {
    id: 'mela',
    name: 'Mela fresca',
    kcal: 52,
    carbs_g: 13,
    protein_g: 0.3,
    fat_g: 0.2,
    fiber_g: 2.4,
    contains_gluten: false,
    contains_lactose: false,
    is_animal_product: false
  },

  // --- AROMI & INGREDIENTI FISSI (FIXED) ---
  basilico: {
    id: 'basilico',
    name: 'Basilico fresco',
    kcal: 23,
    carbs_g: 2.7,
    protein_g: 3.2,
    fat_g: 0.6,
    fiber_g: 1.6,
    contains_gluten: false,
    contains_lactose: false,
    is_animal_product: false
  },
  rosmarino: {
    id: 'rosmarino',
    name: 'Rosmarino ed erbe aromatiche',
    kcal: 0,
    carbs_g: 0,
    protein_g: 0,
    fat_g: 0,
    fiber_g: 0,
    contains_gluten: false,
    contains_lactose: false,
    is_animal_product: false
  },
  aglio: {
    id: 'aglio',
    name: 'Spicchio d\'aglio',
    kcal: 5,
    carbs_g: 1,
    protein_g: 0.2,
    fat_g: 0,
    fiber_g: 0.1,
    contains_gluten: false,
    contains_lactose: false,
    is_animal_product: false
  },
  miele: {
    id: 'miele',
    name: 'Miele millefiori',
    kcal: 304,
    carbs_g: 82,
    protein_g: 0.3,
    fat_g: 0,
    fiber_g: 0,
    contains_gluten: false,
    contains_lactose: false,
    is_animal_product: true
  }
};

// ==========================================
// 2. SOSTITUZIONI CULINARIE AUTOMATICHE (1:1)
// ==========================================
export const SUBSTITUTION_RULES = {
  // Se l'utente è celiaco / gluten-free
  celiac: {
    pasta_grano: 'pasta_gf',
    pane_casereccio: 'pane_gf',
    fette_biscottate: 'fette_gf',
    farro: 'quinoa'
  },
  gluten_free: {
    pasta_grano: 'pasta_gf',
    pane_casereccio: 'pane_gf',
    fette_biscottate: 'fette_gf',
    farro: 'quinoa'
  },
  // Se l'utente è intollerante al lattosio
  lactose_free: {
    ricotta_vaccina: 'ricotta_delact',
    mozzarella: 'mozzarella_delact',
    yogurt_greco: 'yogurt_soia'
  },
  // Se l'utente è vegetariano
  vegetarian: {
    petto_pollo: 'tofu',
    fesa_tacchino: 'tofu',
    filetto_salmone: 'ceci_cotti',
    filetto_orata: 'lenticchie_cotte',
    merluzzo: 'tofu',
    tonno_naturale: 'ceci_cotti',
    manzo_magro: 'ceci_cotti'
  },
  // Se l'utente è vegano
  vegan: {
    petto_pollo: 'tofu',
    fesa_tacchino: 'tofu',
    filetto_salmone: 'ceci_cotti',
    filetto_orata: 'lenticchie_cotte',
    merluzzo: 'tofu',
    tonno_naturale: 'ceci_cotti',
    manzo_magro: 'ceci_cotti',
    uova_intere: 'tofu',
    ricotta_vaccina: 'tofu',
    mozzarella: 'tofu',
    yogurt_greco: 'yogurt_soia',
    miele: 'mirtilli'
  }
};

// ==========================================
// 3. DATABASE RICETTE MEDITERRANEE
// ==========================================
export const RECIPES = [
  // --- COLAZIONE (BREAKFAST) ---
  {
    id: 'rec_porridge_frutti_noci',
    title: 'Porridge mediterraneo d\'avena, mirtilli e noci',
    slots: ['breakfast'],
    mediterranean_category: 'whole_grains',
    prep_time_min: 10,
    ingredients: [
      { id: 'avena_fiocchi', base_grams: 50, scaling_role: 'PRIMARY_CARB' },
      { id: 'yogurt_greco', base_grams: 120, scaling_role: 'PRIMARY_PROTEIN' },
      { id: 'noci', base_grams: 15, scaling_role: 'PRIMARY_FAT' },
      { id: 'mirtilli', base_grams: 80, scaling_role: 'SECONDARY_SCALABLE' }
    ],
    template_steps: [
      'Cuoci a fiamma dolce {avena_fiocchi} di fiocchi d\'avena con un goccio d\'acqua.',
      'Amalgama {yogurt_greco} di yogurt per dare cremosità e proteine.',
      'Guarnisci con {mirtilli} di mirtilli freschi e {noci} di noci tritate.'
    ]
  },
  {
    id: 'rec_pane_ricotta_miele_mandorle',
    title: 'Pane tostato integrale con ricotta e mandorle',
    slots: ['breakfast', 'snack'],
    mediterranean_category: 'dairy',
    prep_time_min: 5,
    ingredients: [
      { id: 'pane_casereccio', base_grams: 60, scaling_role: 'PRIMARY_CARB' },
      { id: 'ricotta_vaccina', base_grams: 100, scaling_role: 'PRIMARY_PROTEIN' },
      { id: 'mandorle', base_grams: 15, scaling_role: 'PRIMARY_FAT' },
      { id: 'miele', base_grams: 10, scaling_role: 'FIXED' }
    ],
    template_steps: [
      'Tosta {pane_casereccio} di pane integrale fino a doratura.',
      'Spalma {ricotta_vaccina} di ricotta fresca.',
      'Aggiungi un filo di miele e {mandorle} di mandorle croccanti.'
    ]
  },
  {
    id: 'rec_yogurt_fette_mandorle',
    title: 'Coppa di yogurt greco con fette biscottate e mandorle',
    slots: ['breakfast'],
    mediterranean_category: 'dairy',
    prep_time_min: 5,
    ingredients: [
      { id: 'fette_biscottate', base_grams: 40, scaling_role: 'PRIMARY_CARB' },
      { id: 'yogurt_greco', base_grams: 150, scaling_role: 'PRIMARY_PROTEIN' },
      { id: 'mandorle', base_grams: 15, scaling_role: 'PRIMARY_FAT' },
      { id: 'mirtilli', base_grams: 60, scaling_role: 'SECONDARY_SCALABLE' }
    ],
    template_steps: [
      'Versa {yogurt_greco} di yogurt greco cremoso in una ciotola.',
      'Sbriciola sopra {fette_biscottate} di fette biscottate.',
      'Aggiungi {mandorle} di mandorle e {mirtilli} di mirtilli.'
    ]
  },

  // --- PRANZO (LUNCH) ---
  {
    id: 'rec_pasta_pomodoro_parmigiano',
    title: 'Pasta al pomodoro fresco, basilico e parmigiano',
    slots: ['lunch'],
    mediterranean_category: 'whole_grains',
    prep_time_min: 15,
    ingredients: [
      { id: 'pasta_grano', base_grams: 80, scaling_role: 'PRIMARY_CARB' },
      { id: 'ricotta_vaccina', base_grams: 80, scaling_role: 'PRIMARY_PROTEIN' },
      { id: 'olio_evo', base_grams: 10, scaling_role: 'PRIMARY_FAT' },
      { id: 'pomodorini', base_grams: 150, scaling_role: 'SECONDARY_SCALABLE' },
      { id: 'basilico', base_grams: 5, scaling_role: 'FIXED' }
    ],
    template_steps: [
      'Cuoci {pasta_grano} di pasta in abbondante acqua salata al dente.',
      'In padella fai appassire {pomodorini} di pomodorini con {olio_evo} di olio EVO e {basilico}.',
      'Mantecare la pasta con il sugo e aggiungere {ricotta_vaccina} per renderla vellutata e proteica.'
    ]
  },
  {
    id: 'rec_riso_salmone_zucchine',
    title: 'Riso Carnaroli con filetto di salmone e zucchine all\'EVO',
    slots: ['lunch', 'dinner'],
    mediterranean_category: 'fish',
    prep_time_min: 20,
    ingredients: [
      { id: 'riso_carnaroli', base_grams: 80, scaling_role: 'PRIMARY_CARB' },
      { id: 'filetto_salmone', base_grams: 120, scaling_role: 'PRIMARY_PROTEIN' },
      { id: 'olio_evo', base_grams: 10, scaling_role: 'PRIMARY_FAT' },
      { id: 'zucchine', base_grams: 150, scaling_role: 'SECONDARY_SCALABLE' }
    ],
    template_steps: [
      'Lessa {riso_carnaroli} di riso al dente.',
      'In padella scotta {filetto_salmone} di salmone con {zucchine} di zucchine a rondelle.',
      'Condisci con {olio_evo} di olio extravergine d\'oliva a crudo.'
    ]
  },
  {
    id: 'rec_pasta_ceci_rosmarino',
    title: 'Pasta e ceci alla toscana con rosmarino e filo d\'EVO',
    slots: ['lunch'],
    mediterranean_category: 'legumes',
    prep_time_min: 15,
    ingredients: [
      { id: 'pasta_grano', base_grams: 70, scaling_role: 'PRIMARY_CARB' },
      { id: 'ceci_cotti', base_grams: 160, scaling_role: 'PRIMARY_PROTEIN' },
      { id: 'olio_evo', base_grams: 12, scaling_role: 'PRIMARY_FAT' },
      { id: 'pomodorini', base_grams: 80, scaling_role: 'SECONDARY_SCALABLE' },
      { id: 'rosmarino', base_grams: 3, scaling_role: 'FIXED' },
      { id: 'aglio', base_grams: 3, scaling_role: 'FIXED' }
    ],
    template_steps: [
      'Soffriggi un profumo d\'aglio e rosmarino con parte di {olio_evo}.',
      'Aggiungi {ceci_cotti} di ceci lessati e {pomodorini} di pomodorini.',
      'Unire {pasta_grano} di pasta corta cotta al dente e finire con il restante olio EVO a crudo.'
    ]
  },
  {
    id: 'rec_farro_tonno_pomodorini',
    title: 'Insalata di farro perlato con tonno, pomodorini e rucola',
    slots: ['lunch'],
    mediterranean_category: 'fish',
    prep_time_min: 20,
    ingredients: [
      { id: 'farro', base_grams: 80, scaling_role: 'PRIMARY_CARB' },
      { id: 'tonno_naturale', base_grams: 120, scaling_role: 'PRIMARY_PROTEIN' },
      { id: 'olio_evo', base_grams: 12, scaling_role: 'PRIMARY_FAT' },
      { id: 'pomodorini', base_grams: 120, scaling_role: 'SECONDARY_SCALABLE' },
      { id: 'insalata_mista', base_grams: 40, scaling_role: 'SECONDARY_SCALABLE' }
    ],
    template_steps: [
      'Lessa {farro} di farro e lascialo intiepidire.',
      'Aggiungi {tonno_naturale} di tonno ben sgocciolato e {pomodorini} tagliati a spicchi.',
      'Condisci con {olio_evo} di olio EVO e completa con rucola fresca.'
    ]
  },

  // --- SPUNTINO (SNACK) ---
  {
    id: 'rec_snack_mela_noci',
    title: 'Mela fresca con gherigli di noci',
    slots: ['snack'],
    mediterranean_category: 'vegetables',
    prep_time_min: 3,
    ingredients: [
      { id: 'mela', base_grams: 150, scaling_role: 'PRIMARY_CARB' },
      { id: 'noci', base_grams: 15, scaling_role: 'PRIMARY_FAT' }
    ],
    template_steps: [
      'Taglia {mela} di mela a fettine sottili.',
      'Accompagna con {noci} di gherigli di noci croccanti.'
    ]
  },
  {
    id: 'rec_bruschetta_pomodoro_olio',
    title: 'Bruschetta rustica con pomodoro e olio EVO',
    slots: ['snack'],
    mediterranean_category: 'whole_grains',
    prep_time_min: 5,
    ingredients: [
      { id: 'pane_casereccio', base_grams: 50, scaling_role: 'PRIMARY_CARB' },
      { id: 'olio_evo', base_grams: 8, scaling_role: 'PRIMARY_FAT' },
      { id: 'pomodorini', base_grams: 80, scaling_role: 'SECONDARY_SCALABLE' },
      { id: 'basilico', base_grams: 3, scaling_role: 'FIXED' }
    ],
    template_steps: [
      'Tosta {pane_casereccio} di pane casereccio.',
      'Strofina leggermente con pomodoro e adagia {pomodorini} a dadini.',
      'Condisci con {olio_evo} di olio EVO e foglie di basilico.'
    ]
  },

  // --- CENA (DINNER) ---
  {
    id: 'rec_pollo_patate_insalata',
    title: 'Tagliata di pollo al rosmarino con patate al forno e insalata',
    slots: ['dinner', 'lunch'],
    mediterranean_category: 'white_meat',
    prep_time_min: 25,
    ingredients: [
      { id: 'patate', base_grams: 220, scaling_role: 'PRIMARY_CARB' },
      { id: 'petto_pollo', base_grams: 140, scaling_role: 'PRIMARY_PROTEIN' },
      { id: 'olio_evo', base_grams: 10, scaling_role: 'PRIMARY_FAT' },
      { id: 'insalata_mista', base_grams: 80, scaling_role: 'SECONDARY_SCALABLE' },
      { id: 'rosmarino', base_grams: 3, scaling_role: 'FIXED' }
    ],
    template_steps: [
      'Taglia {patate} di patate a tocchetti e infornale con rosmarino e metà di {olio_evo}.',
      'Griglia {petto_pollo} di petto di pollo aromatizzato alle erbe.',
      'Servi con {insalata_mista} fresca e condisci con il restante olio EVO.'
    ]
  },
  {
    id: 'rec_orata_cartoccio_zucchine_pane',
    title: 'Filetto di orata al cartoccio con zucchine e pane casereccio',
    slots: ['dinner'],
    mediterranean_category: 'fish',
    prep_time_min: 20,
    ingredients: [
      { id: 'pane_casereccio', base_grams: 60, scaling_role: 'PRIMARY_CARB' },
      { id: 'filetto_orata', base_grams: 150, scaling_role: 'PRIMARY_PROTEIN' },
      { id: 'olio_evo', base_grams: 10, scaling_role: 'PRIMARY_FAT' },
      { id: 'zucchine', base_grams: 150, scaling_role: 'SECONDARY_SCALABLE' },
      { id: 'rosmarino', base_grams: 3, scaling_role: 'FIXED' }
    ],
    template_steps: [
      'Disponi {filetto_orata} di orata e {zucchine} a rondelle su carta forno con {olio_evo} ed erbe.',
      'Chiudi il cartoccio e inforna a 180°C per 15-18 minuti.',
      'Accompagna con {pane_casereccio} di pane casereccio tostato.'
    ]
  },
  {
    id: 'rec_frittata_zucchine_pane',
    title: 'Frittata soffice alle zucchine con pane integrale e insalata',
    slots: ['dinner'],
    mediterranean_category: 'eggs',
    prep_time_min: 15,
    ingredients: [
      { id: 'pane_casereccio', base_grams: 60, scaling_role: 'PRIMARY_CARB' },
      { id: 'uova_intere', base_grams: 120, scaling_role: 'PRIMARY_PROTEIN' }, // circa 2 uova
      { id: 'olio_evo', base_grams: 8, scaling_role: 'PRIMARY_FAT' },
      { id: 'zucchine', base_grams: 150, scaling_role: 'SECONDARY_SCALABLE' },
      { id: 'insalata_mista', base_grams: 60, scaling_role: 'SECONDARY_SCALABLE' }
    ],
    template_steps: [
      'Stufa {zucchine} di zucchine in padella con qualche goccia d\'acqua.',
      'Sbatti {uova_intere} di uova con un pizzico di sale e pepe e versa sulle zucchine.',
      'Cuoci la frittata con {olio_evo} di olio e accompagna con {pane_casereccio} e insalata.'
    ]
  },
  {
    id: 'rec_zuppa_lenticchie_crostini',
    title: 'Zuppa rustica di lenticchie con crostini dorati ed EVO',
    slots: ['dinner'],
    mediterranean_category: 'legumes',
    prep_time_min: 20,
    ingredients: [
      { id: 'pane_casereccio', base_grams: 60, scaling_role: 'PRIMARY_CARB' },
      { id: 'lenticchie_cotte', base_grams: 180, scaling_role: 'PRIMARY_PROTEIN' },
      { id: 'olio_evo', base_grams: 12, scaling_role: 'PRIMARY_FAT' },
      { id: 'spinaci', base_grams: 100, scaling_role: 'SECONDARY_SCALABLE' },
      { id: 'rosmarino', base_grams: 3, scaling_role: 'FIXED' }
    ],
    template_steps: [
      'Scalda {lenticchie_cotte} di lenticchie con {spinaci} e un rametto di rosmarino.',
      'Tosta {pane_casereccio} di pane ridotto a cubetti croccanti.',
      'Impiatta la zuppa fumante con i crostini e irrora con {olio_evo} di olio EVO.'
    ]
  },
  {
    id: 'rec_tagliata_manzo_rucola',
    title: 'Tagliata di manzo magro con rucola, pomodorini e patate',
    slots: ['dinner'],
    mediterranean_category: 'red_meat',
    prep_time_min: 15,
    ingredients: [
      { id: 'patate', base_grams: 200, scaling_role: 'PRIMARY_CARB' },
      { id: 'manzo_magro', base_grams: 140, scaling_role: 'PRIMARY_PROTEIN' },
      { id: 'olio_evo', base_grams: 10, scaling_role: 'PRIMARY_FAT' },
      { id: 'pomodorini', base_grams: 100, scaling_role: 'SECONDARY_SCALABLE' },
      { id: 'insalata_mista', base_grams: 40, scaling_role: 'SECONDARY_SCALABLE' }
    ],
    template_steps: [
      'Lessa o arrostisci {patate} di patate a tocchetti.',
      'Scotta {manzo_magro} di manzo su piastra rovente per 2 minuti per lato.',
      'Taglia a fette spesse, adagia su un letto di rucola e pomodorini e finisci con {olio_evo} di olio EVO.'
    ]
  },
  {
    id: 'rec_tofu_verdure_riso',
    title: 'Tofu dorato alle erbe mediterranee con riso e spinaci',
    slots: ['dinner', 'lunch'],
    mediterranean_category: 'legumes',
    prep_time_min: 15,
    ingredients: [
      { id: 'riso_carnaroli', base_grams: 70, scaling_role: 'PRIMARY_CARB' },
      { id: 'tofu', base_grams: 160, scaling_role: 'PRIMARY_PROTEIN' },
      { id: 'olio_evo', base_grams: 12, scaling_role: 'PRIMARY_FAT' },
      { id: 'spinaci', base_grams: 150, scaling_role: 'SECONDARY_SCALABLE' }
    ],
    template_steps: [
      'Cuoci {riso_carnaroli} di riso al dente.',
      'Taglia {tofu} di tofu a dadini e falli dorare in padella antiaderente con erbe.',
      'Salta {spinaci} di spinaci e unisci tutto condendo con {olio_evo} di olio EVO.'
    ]
  }
];
