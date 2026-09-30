/**
 * AI Parser Open-Source per Riconoscimento Vocale Multi-Articolo
 * Modello NLP client-side a zero consumo di risorse e zero token server.
 * Suddivide frasi complesse in singoli prodotti ed estrae per ciascuno tutti gli attributi.
 */

const WORD_NUMBERS = {
  'un': 1, 'uno': 1, 'una': 1, 'due': 2, 'duo': 2, 'tre': 3, 'quattro': 4,
  'cinque': 5, 'sei': 6, 'sette': 7, 'otto': 8, 'nove': 9, 'dieci': 10,
  'dodici': 12, 'mezzo': 0.5, 'mezza': 0.5, 'mezzi': 0.5, 'mezzo chilo': 0.5
};

const CATEGORY_KEYWORDS = {
  frutta: [
    'mela', 'mele', 'banana', 'banane', 'arancia', 'arance', 'limone', 'limoni',
    'fragola', 'fragole', 'pomodoro', 'pomodori', 'insalata', 'carota', 'carote',
    'zucchina', 'zucchine', 'cipolla', 'cipolle', 'patata', 'patate', 'uva',
    'pesca', 'pesche', 'verdura', 'frutta', 'avocado', 'finocchio', 'spinaci', 'broccoli', 'pere', 'pera'
  ],
  latticini: [
    'latte', 'uova', 'uovo', 'formaggio', 'mozzarella', 'parmigiano', 'grana',
    'burro', 'yogurt', 'ricotta', 'stracchino', 'panna', 'gorgonzola', 'pecorino',
    'fontina', 'crescenza', 'mascarpone', 'scamorza'
  ],
  dispensa: [
    'pasta', 'riso', 'pane', 'farina', 'zucchero', 'caffè', 'sale', 'olio',
    'biscotti', 'fette biscottate', 'cereali', 'cracker', 'tonno', 'pelati',
    'passata', 'legumi', 'lenticchie', 'fagioli', 'maionese', 'ketchup', 'cioccolato',
    'marmellata', 'nutella', 'lievito', 'dado', 'aceto', 'fette'
  ],
  bevande: [
    'acqua', 'vino', 'birra', 'succo', 'spumante', 'aranciata', 'coca',
    'fanta', 'cola', 'tè', 'estathè', 'tonica', 'aperitivo', 'liquore', 'chinotto'
  ],
  carne: [
    'carne', 'pollo', 'bistecca', 'macinato', 'salsiccia', 'fesa', 'tacchino',
    'manzo', 'maiale', 'hamburger', 'prosciutto', 'salame', 'speck', 'bresaola',
    'pesce', 'salmone', 'orata', 'spigola', 'merluzzo', 'gamberi', 'calamari'
  ],
  surgelati: [
    'gelato', 'gelati', 'piselli surgelati', 'bastoncini', 'pizza surgelata',
    'spinaci surgelati', 'ghiaccioli', 'ghiaccio', 'pesce spada surgelato'
  ],
  casa: [
    'detersivo', 'candeggina', 'ammorbidente', 'sapone', 'spugne', 'scottex',
    'carta igienica', 'dentifricio', 'spazzolino', 'shampoo', 'bagnoschiuma',
    'sacchetti', 'alluminio', 'pellicola', 'sgrassatore', 'guanti', 'lavastoviglie'
  ]
};

const BRAND_NOTES = [
  'barilla', 'de cecco', 'mulino bianco', 'granarolo', 'parmalat', 'valfrutta',
  'rio mare', 'mutti', 'lavazza', 'illy', 'dash', 'chanteclair', 'scottex',
  'senza glutine', 'senza lattosio', 'bio', 'biologico', 'integrale', 'scremato',
  'parzialmente scremato', 'intero', 'vegetale', 'fresco', 'dop', 'igp'
];

const SUPERMARKETS = ['esselunga', 'coop', 'conad', 'lidl', 'carrefour', 'eurospin', 'pam', 'aldi', 'iper'];

// Eccezioni composte da NON spezzare con la "e"
const COMPOUND_EXCEPTIONS = [
  'pasta e fagioli', 'pasta e ceci', 'sale e pepe', 'olio e aceto',
  'frutta e verdura', 'carne e pesce'
];

/**
 * Divide la trascrizione vocale in segmenti distinti di prodotti
 */
function splitSpeechIntoItemSegments(rawText) {
  let text = rawText.trim();

  // Rimuovi filler iniziali
  text = text.replace(/^(mi manca|mi mancano|ci manca|ci mancano|aggiungi|metti|prendi|prendere|compra|comprare|dobbiamo prendere|mi serve|mi servono|serve|servono|ricordati di prendere)\s+/i, '');
  text = text.replace(/\b(per favore|grazie)\b/gi, '');

  // Proteggi eccezioni composte temporaneamente
  const placeholders = [];
  COMPOUND_EXCEPTIONS.forEach((comp, idx) => {
    const regex = new RegExp(`\\b${comp}\\b`, 'gi');
    if (regex.test(text)) {
      const ph = `__COMP_${idx}__`;
      text = text.replace(regex, ph);
      placeholders.push({ placeholder: ph, original: comp });
    }
  });

  // Sostituisci i connettori di lista con un delimitatore unico pipe |
  text = text.replace(/,\s*(?:e\s+poi|e\s+anche|e\s+pure|ed\s+anche|e|ed|poi)\s+/gi, '|');
  text = text.replace(/\b(?:e\s+poi|e\s+anche|e\s+pure|ed\s+anche|poi|inoltre|oltre\s+a)\b/gi, '|');
  text = text.replace(/[,;\n]+/g, '|');
  text = text.replace(/\s+\b(?:e|ed)\s+/gi, '|');

  // Ripristina eccezioni
  placeholders.forEach(({ placeholder, original }) => {
    text = text.replace(new RegExp(placeholder, 'g'), original);
  });

  // Dividi e filtra i segmenti vuoti
  const segments = text
    .split('|')
    .map(s => s.trim())
    .filter(s => s.length > 1);

  return segments.length > 0 ? segments : [rawText.trim()];
}

/**
 * Estrae gli attributi di un singolo segmento di testo
 */
function parseSingleItem(segment, globalContext = {}) {
  let text = segment.toLowerCase();

  // 1. Rileva Urgenza / Priorità
  let priority = globalContext.priority || 'media';
  if (/\b(urgente|urgentissimo|subito|stasera|emergenza|finito tutto|finito del tutto|assolutamente|importante)\b/i.test(text)) {
    priority = 'alta';
    text = text.replace(/\b(urgente|urgentissimo|subito|stasera|emergenza|finito tutto|finito del tutto|assolutamente|importante)\b/gi, '');
  } else if (/\b(con calma|quando capita|se puoi|non urgente|prossima settimana)\b/i.test(text)) {
    priority = 'bassa';
    text = text.replace(/\b(con calma|quando capita|se puoi|non urgente|prossima settimana)\b/gi, '');
  }

  // 2. Rileva Supermercato
  let supermarket = globalContext.supermarket || 'Tutti';
  for (const store of SUPERMARKETS) {
    if (new RegExp(`\\b(all'|alla|da|nel|in)?\\s*${store}\\b`, 'i').test(text)) {
      supermarket = store.charAt(0).toUpperCase() + store.slice(1);
      text = text.replace(new RegExp(`\\b(all'|alla|da|nel|in)?\\s*${store}\\b`, 'gi'), '');
      break;
    }
  }

  // 3. Estrai Marche o Note
  const detectedNotes = [];
  for (const note of BRAND_NOTES) {
    if (text.includes(note)) {
      detectedNotes.push(note.charAt(0).toUpperCase() + note.slice(1));
    }
  }

  // 4. Rileva Quantità e Unità
  let quantity = '1';
  let unit = 'pz';

  const qtyMatch = text.match(/(\d+(?:[.,]\d+)?|\bun\b|\buno\b|\buna\b|\bdue\b|\bduo\b|\btre\b|\bquattro\b|\bcinque\b|\bsei\b|\bsette\b|\botto\b|\bnove\b|\bdieci\b|\bmezzo\b|\bmezza\b)\s*(kg|chili|chilo|etti|etto|grammi|g|litri|litro|l|pacchi|pacco|confezioni|confezione|conf|bottiglie|bottiglia|scatole|scatola|barattoli|barattolo|lattine|lattina|bustine|bustina|fette|fetta|vaschette|casse|cassa)?/i);

  if (qtyMatch) {
    const rawNum = qtyMatch[1].toLowerCase();
    const rawUnit = qtyMatch[2] ? qtyMatch[2].toLowerCase() : '';

    if (WORD_NUMBERS[rawNum] !== undefined) {
      quantity = String(WORD_NUMBERS[rawNum]);
    } else {
      quantity = rawNum.replace(',', '.');
    }

    if (rawUnit) {
      if (['kg', 'chili', 'chilo'].includes(rawUnit)) unit = 'kg';
      else if (['litri', 'litro', 'l'].includes(rawUnit)) unit = 'litri';
      else if (['pacchi', 'pacco'].includes(rawUnit)) unit = 'pacchi';
      else if (['confezioni', 'confezione', 'conf'].includes(rawUnit)) unit = 'conf.';
      else if (['bottiglie', 'bottiglia'].includes(rawUnit)) unit = 'bottiglie';
      else if (['scatole', 'scatola'].includes(rawUnit)) unit = 'scatole';
      else if (['barattoli', 'barattolo'].includes(rawUnit)) unit = 'barattoli';
      else if (['etti', 'etto'].includes(rawUnit)) unit = 'etti';
      else if (['grammi', 'g'].includes(rawUnit)) unit = 'g';
      else unit = rawUnit;
    }

    text = text.replace(qtyMatch[0], '');
  }

  // Pulisci preposizioni
  let cleanName = text.replace(/^(di|del|della|delle|dei|degli|da|un po' di|un po di|il|lo|la|i|gli|le)\s+/i, '').trim();

  if (cleanName.length > 0) {
    cleanName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
  } else {
    cleanName = segment;
  }

  // 5. Rileva Reparto / Categoria
  let category = 'altro';
  const nameLower = cleanName.toLowerCase();

  for (const [catKey, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => nameLower.includes(kw))) {
      category = catKey;
      break;
    }
  }

  return {
    id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    name: cleanName,
    quantity: `${quantity} ${unit !== 'pz' ? unit : ''}`.trim(),
    category,
    priority,
    supermarket,
    notes: detectedNotes.join(', ')
  };
}

/**
 * Funzione Principale: Analizza l'input vocale ed estrae molteplici articoli
 */
export function parseVoiceInputWithAI(rawTranscript) {
  if (!rawTranscript || typeof rawTranscript !== 'string') return [];

  const rawLower = rawTranscript.toLowerCase();

  // Controlla se c'è un'urgenza o un supermercato specificato globalmente nella frase
  let globalPriority = 'media';
  if (/\b(urgente|urgentissimo|subito|stasera|emergenza|finito tutto|assolutamente)\b/i.test(rawLower)) {
    globalPriority = 'alta';
  }

  let globalSupermarket = 'Tutti';
  for (const store of SUPERMARKETS) {
    if (new RegExp(`\\b(all'|alla|da|nel|in)?\\s*${store}\\b`, 'i').test(rawLower)) {
      globalSupermarket = store.charAt(0).toUpperCase() + store.slice(1);
      break;
    }
  }

  const segments = splitSpeechIntoItemSegments(rawTranscript);

  const items = segments.map(seg => parseSingleItem(seg, {
    priority: globalPriority,
    supermarket: globalSupermarket
  }));

  return items;
}
