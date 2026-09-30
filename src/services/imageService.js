/**
 * Servizio Ricerca Immagini Prodotti Spesa (Metodo 1: Automatico & Gratuito)
 * 1. Mappatura istantanea ad alta definizione per tutti i prodotti comuni da supermercato
 * 2. Ricerca su Open Food Facts API (database prodotti alimentari italiani reali)
 */

const CURATED_GROCERY_IMAGES = {
  // Latticini & Uova
  'latte': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=160&auto=format&fit=crop&q=80',
  'uova': 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=160&auto=format&fit=crop&q=80',
  'uovo': 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=160&auto=format&fit=crop&q=80',
  'formaggio': 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=160&auto=format&fit=crop&q=80',
  'mozzarella': 'https://images.unsplash.com/photo-1589881133595-a3c085cb731d?w=160&auto=format&fit=crop&q=80',
  'parmigiano': 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=160&auto=format&fit=crop&q=80',
  'burro': 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=160&auto=format&fit=crop&q=80',
  'yogurt': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=160&auto=format&fit=crop&q=80',

  // Dispensa
  'pane': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=160&auto=format&fit=crop&q=80',
  'pasta': 'https://images.unsplash.com/photo-1621996346565-e3d5d6281699?w=160&auto=format&fit=crop&q=80',
  'riso': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=160&auto=format&fit=crop&q=80',
  'caffè': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=160&auto=format&fit=crop&q=80',
  'caffe': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=160&auto=format&fit=crop&q=80',
  'olio': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=160&auto=format&fit=crop&q=80',
  'biscotti': 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=160&auto=format&fit=crop&q=80',
  'farina': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=160&auto=format&fit=crop&q=80',
  'zucchero': 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=160&auto=format&fit=crop&q=80',
  'tonno': 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=160&auto=format&fit=crop&q=80',
  'cioccolato': 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=160&auto=format&fit=crop&q=80',
  'nutella': 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=160&auto=format&fit=crop&q=80',

  // Frutta & Verdura
  'mela': 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=160&auto=format&fit=crop&q=80',
  'mele': 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=160&auto=format&fit=crop&q=80',
  'banana': 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=160&auto=format&fit=crop&q=80',
  'banane': 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=160&auto=format&fit=crop&q=80',
  'arancia': 'https://images.unsplash.com/photo-1547514701-42782101795e?w=160&auto=format&fit=crop&q=80',
  'arance': 'https://images.unsplash.com/photo-1547514701-42782101795e?w=160&auto=format&fit=crop&q=80',
  'limone': 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=160&auto=format&fit=crop&q=80',
  'limoni': 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=160&auto=format&fit=crop&q=80',
  'fragole': 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=160&auto=format&fit=crop&q=80',
  'pomodoro': 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=160&auto=format&fit=crop&q=80',
  'pomodori': 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=160&auto=format&fit=crop&q=80',
  'insalata': 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=160&auto=format&fit=crop&q=80',
  'patate': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=160&auto=format&fit=crop&q=80',
  'cipolla': 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=160&auto=format&fit=crop&q=80',
  'cipolle': 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=160&auto=format&fit=crop&q=80',
  'zucchine': 'https://images.unsplash.com/photo-1590165482129-1b8b27698780?w=160&auto=format&fit=crop&q=80',
  'carote': 'https://images.unsplash.com/photo-1598170845058-32b9d6a5c317?w=160&auto=format&fit=crop&q=80',

  // Bevande
  'acqua': 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=160&auto=format&fit=crop&q=80',
  'vino': 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=160&auto=format&fit=crop&q=80',
  'birra': 'https://images.unsplash.com/photo-1608270119238-d9d3753a4794?w=160&auto=format&fit=crop&q=80',
  'succo': 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=160&auto=format&fit=crop&q=80',
  'coca': 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=160&auto=format&fit=crop&q=80',

  // Carne & Pesce
  'carne': 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=160&auto=format&fit=crop&q=80',
  'pollo': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=160&auto=format&fit=crop&q=80',
  'bistecca': 'https://images.unsplash.com/photo-1558030006-450675393462?w=160&auto=format&fit=crop&q=80',
  'pesce': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=160&auto=format&fit=crop&q=80',
  'salmone': 'https://images.unsplash.com/photo-1485921325833-c519f76c4927?w=160&auto=format&fit=crop&q=80',
  'prosciutto': 'https://images.unsplash.com/photo-1528607929212-2636ec44253e?w=160&auto=format&fit=crop&q=80',

  // Surgelati
  'gelato': 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=160&auto=format&fit=crop&q=80',
  'pizza': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=160&auto=format&fit=crop&q=80',

  // Casa & Igiene
  'detersivo': 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=160&auto=format&fit=crop&q=80',
  'sapone': 'https://images.unsplash.com/photo-1607006314144-486121f15309?w=160&auto=format&fit=crop&q=80',
  'carta igienica': 'https://images.unsplash.com/photo-1584556812952-905ffd0c611a?w=160&auto=format&fit=crop&q=80',
  'scottex': 'https://images.unsplash.com/photo-1584556812952-905ffd0c611a?w=160&auto=format&fit=crop&q=80',
  'shampoo': 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=160&auto=format&fit=crop&q=80'
};

const memoryCache = new Map();

/**
 * Ottiene l'immagine reale del prodotto in modo automatico e asincrono
 */
export async function getProductImage(productName) {
  if (!productName || typeof productName !== 'string') return '';
  const term = productName.trim().toLowerCase();

  // 1. Controlla in memoria cache
  if (memoryCache.has(term)) {
    return memoryCache.get(term);
  }

  // 2. Controlla nella libreria di prodotti comuni (risposta istantanea 0ms)
  for (const [key, imgUrl] of Object.entries(CURATED_GROCERY_IMAGES)) {
    if (term.includes(key)) {
      memoryCache.set(term, imgUrl);
      return imgUrl;
    }
  }

  // 3. Fallback dinamico su Open Food Facts API (gratuita e senza autenticazione)
  try {
    const cleanQuery = term.replace(/^(il|lo|la|i|gli|le|un|uno|una)\s+/i, '').split(' ')[0];
    const res = await fetch(`https://it.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(cleanQuery)}&search_simple=1&action=process&json=1&page_size=1`, {
      headers: { 'Accept': 'application/json' }
    });
    
    if (res.ok) {
      const data = await res.json();
      if (data && data.products && data.products.length > 0) {
        const prod = data.products[0];
        const imageUrl = prod.image_front_small_url || prod.image_url || prod.image_small_url;
        if (imageUrl) {
          memoryCache.set(term, imageUrl);
          return imageUrl;
        }
      }
    }
  } catch (err) {
    // Silenzioso su errori di rete
  }

  // Se nessun risultato, restituisce stringa vuota (l'UI userà l'icona emoji del reparto)
  memoryCache.set(term, '');
  return '';
}
