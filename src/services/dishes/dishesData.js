/**
 * Catalogo Piatti Predefinito (Ricettario)
 * Piatti organizzati per pasto (Pranzo, Cena, Entrambi) e categoria,
 * con lista ingredienti per permettere l'aggiunta immediata alla lista della spesa.
 */

export const DISH_CATEGORIES = [
  { id: 'primi', name: 'Primi & Pasta', icon: '🍝', color: '#f59e0b' },
  { id: 'carne', name: 'Carne & Pollame', icon: '🍗', color: '#ef4444' },
  { id: 'pesce', name: 'Pesce & Mare', icon: '🐟', color: '#3b82f6' },
  { id: 'legumi', name: 'Legumi & Zuppe', icon: '🍲', color: '#10b981' },
  { id: 'uova_formaggi', name: 'Uova & Formaggi', icon: '🧀', color: '#eab308' },
  { id: 'piatto_unico', name: 'Piatti Unici & Pizza', icon: '🍕', color: '#8b5cf6' },
  { id: 'insalate', name: 'Insalatone & Leggeri', icon: '🥗', color: '#14b8a6' },
  { id: 'colazione', name: 'Colazione & Dolci', icon: '☕', color: '#ec4899' },
];

export const INITIAL_DISHES = [
  // --- PRIMI (Ideali per Pranzo) ---
  {
    id: 'dish-1',
    name: 'Pasta al pomodoro fresco e basilico',
    mealType: 'lunch', // 'lunch' | 'dinner' | 'both'
    category: 'primi',
    ingredients: ['Pasta', 'Pomodori pelati o freschi', 'Basilico', 'Olio extravergine d\'oliva', 'Parmigiano']
  },
  {
    id: 'dish-2',
    name: 'Pasta al pesto genovese con patate e fagiolini',
    mealType: 'lunch',
    category: 'primi',
    ingredients: ['Trofie o Pasta', 'Pesto alla genovese', 'Patate', 'Fagiolini']
  },
  {
    id: 'dish-3',
    name: 'Risotto ai funghi porcini',
    mealType: 'both',
    category: 'primi',
    ingredients: ['Riso Carnaroli', 'Funghi porcini', 'Brodo vegetale', 'Cipolla', 'Burro o Olio', 'Parmigiano']
  },
  {
    id: 'dish-4',
    name: 'Spaghetti al tonno, pomodorini e olive',
    mealType: 'lunch',
    category: 'primi',
    ingredients: ['Spaghetti', 'Tonno in scatola', 'Pomodorini', 'Olive nere', 'Aglio', 'Olio EVO']
  },
  {
    id: 'dish-5',
    name: 'Pasta e ceci alla toscana con rosmarino',
    mealType: 'both',
    category: 'legumi',
    ingredients: ['Pasta corta', 'Ceci precotti o secchi', 'Rosmarino', 'Aglio', 'Concentrato di pomodoro', 'Olio EVO']
  },
  {
    id: 'dish-6',
    name: 'Insalata di riso classica con verdure e tonno',
    mealType: 'lunch',
    category: 'primi',
    ingredients: ['Riso per insalate', 'Tonno', 'Uova sode', 'Mais', 'Pomodorini', 'Formaggio a cubetti', 'Olive']
  },
  {
    id: 'dish-7',
    name: 'Gnocchi alla sorrentina con mozzarella filante',
    mealType: 'both',
    category: 'primi',
    ingredients: ['Gnocchi di patate', 'Passata di pomodoro', 'Mozzarella fresca', 'Basilico', 'Parmigiano']
  },
  {
    id: 'dish-8',
    name: 'Insalata di farro con pomodorini, rucola e feta',
    mealType: 'lunch',
    category: 'primi',
    ingredients: ['Farro perlato', 'Pomodorini', 'Feta o Mozzarella', 'Rucola', 'Olio EVO']
  },

  // --- SECONDI DI CARNE ---
  {
    id: 'dish-9',
    name: 'Petto di pollo alla piastra con limone e patate al forno',
    mealType: 'both',
    category: 'carne',
    ingredients: ['Petto di pollo', 'Patate', 'Rosmarino', 'Limone', 'Olio EVO']
  },
  {
    id: 'dish-10',
    name: 'Tagliata di manzo con rucola e scaglie di grana',
    mealType: 'dinner',
    category: 'carne',
    ingredients: ['Tagliata di manzo', 'Rucola', 'Grana padano o Parmigiano', 'Aceto balsamico', 'Olio EVO']
  },
  {
    id: 'dish-11',
    name: 'Bocconcini di tacchino al curry con verdure',
    mealType: 'both',
    category: 'carne',
    ingredients: ['Fesa di tacchino', 'Zucchine', 'Carote', 'Curry', 'Olio EVO']
  },

  // --- SECONDI DI PESCE ---
  {
    id: 'dish-12',
    name: 'Filetto di salmone al forno con zucchine',
    mealType: 'dinner',
    category: 'pesce',
    ingredients: ['Filetto di salmone fresco', 'Zucchine', 'Olio EVO', 'Limone', 'Prezzemolo']
  },
  {
    id: 'dish-13',
    name: 'Orata al cartoccio con pomodorini e olive',
    mealType: 'dinner',
    category: 'pesce',
    ingredients: ['Orata o Spigola', 'Pomodorini', 'Olive taggiasche', 'Vino bianco', 'Aglio', 'Olio EVO']
  },
  {
    id: 'dish-14',
    name: 'Merluzzo in padella alla livornese con capperi e pomodoro',
    mealType: 'dinner',
    category: 'pesce',
    ingredients: ['Filetti di merluzzo', 'Pomodori pelati', 'Capperi dissalati', 'Olive nere', 'Origano', 'Olio EVO']
  },

  // --- UOVA & FORMAGGI ---
  {
    id: 'dish-15',
    name: 'Frittata soffice alle zucchine e cipolla con insalata',
    mealType: 'dinner',
    category: 'uova_formaggi',
    ingredients: ['Uova', 'Zucchine', 'Cipolla', 'Parmigiano', 'Insalata mista', 'Olio EVO']
  },
  {
    id: 'dish-16',
    name: 'Caprese con mozzarella di bufala, pomodoro cuore di bue e basilico',
    mealType: 'both',
    category: 'uova_formaggi',
    ingredients: ['Mozzarella di bufala o fior di latte', 'Pomodori cuore di bue', 'Basilico fresco', 'Origano', 'Olio EVO', 'Pane casereccio']
  },

  // --- LEGUMI & ZUPPE ---
  {
    id: 'dish-17',
    name: 'Zuppa di lenticchie con carote, sedano e crostini',
    mealType: 'dinner',
    category: 'legumi',
    ingredients: ['Lenticchie', 'Carote', 'Sedano', 'Cipolla', 'Pane per crostini', 'Rosmarino', 'Olio EVO']
  },
  {
    id: 'dish-18',
    name: 'Burger vegetali di ceci e carote con spinaci saltati',
    mealType: 'both',
    category: 'legumi',
    ingredients: ['Ceci lessati', 'Carote', 'Pangrattato', 'Spinaci freschi', 'Aglio', 'Olio EVO']
  },

  // --- PIATTI UNICI & PIZZA ---
  {
    id: 'dish-19',
    name: 'Pizza fatta in casa o pizzeria (Margherita)',
    mealType: 'dinner',
    category: 'piatto_unico',
    ingredients: ['Impasto per pizza o farina', 'Passata di pomodoro', 'Mozzarella per pizza', 'Basilico', 'Olio EVO']
  },
  {
    id: 'dish-20',
    name: 'Piadina romagnola con prosciutto crudo, squacquerone e rucola',
    mealType: 'both',
    category: 'piatto_unico',
    ingredients: ['Piadine', 'Prosciutto crudo', 'Squacquerone o Stracchino', 'Rucola']
  },

  // --- COLAZIONE / SPUNTINO ---
  {
    id: 'dish-21',
    name: 'Pancake all\'avena con banana e miele',
    mealType: 'lunch',
    category: 'colazione',
    ingredients: ['Farina d\'avena', 'Uova', 'Latte', 'Banana', 'Miele']
  },
  {
    id: 'dish-22',
    name: 'Yogurt greco con noci, mirtilli e fiocchi d\'avena',
    mealType: 'lunch',
    category: 'colazione',
    ingredients: ['Yogurt greco', 'Noci sgusciate', 'Mirtilli freschi', 'Fiocchi d\'avena']
  }
];
