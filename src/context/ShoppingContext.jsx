import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';
import { useAuth } from './AuthContext';
import { getProductImage } from '../services/imageService';

const ShoppingContext = createContext();

export const CATEGORIES = {
  frutta: { id: 'frutta', name: 'Frutta & Verdura', icon: '🍎', class: 'cat-frutta' },
  latticini: { id: 'latticini', name: 'Latticini & Uova', icon: '🥛', class: 'cat-latticini' },
  dispensa: { id: 'dispensa', name: 'Dispensa & Secco', icon: '🍞', class: 'cat-dispensa' },
  carne: { id: 'carne', name: 'Carne & Pesce', icon: '🥩', class: 'cat-carne' },
  bevande: { id: 'bevande', name: 'Bevande', icon: '🥤', class: 'cat-bevande' },
  casa: { id: 'casa', name: 'Casa & Igiene', icon: '🧼', class: 'cat-casa' },
  surgelati: { id: 'surgelati', name: 'Surgelati', icon: '❄️', class: 'cat-surgelati' },
  altro: { id: 'altro', name: 'Altro Reparto', icon: '🛒', class: 'cat-altro' }
};

export const autoDetectCategory = (name) => {
  if (!name || typeof name !== 'string') return 'altro';
  const text = name.toLowerCase();
  if (/\b(mela|mele|banana|banane|arancia|arance|limone|insalata|pomodoro|pomodori|zucchine|carote|verdura|frutta|fragole|uva)\b/.test(text)) return 'frutta';
  if (/\b(latte|uova|formaggio|mozzarella|yogurt|burro|parmigiano|ricotta|panna|stracchino)\b/.test(text)) return 'latticini';
  if (/\b(pane|pasta|riso|caffè|zucchero|farina|biscotti|olio|sale|scatolame|tonno|pomodori pelati|cereali|cracker)\b/.test(text)) return 'dispensa';
  if (/\b(acqua|vino|birra|succo|bibita|coca|aranciata|tè|estathè|spumante)\b/.test(text)) return 'bevande';
  if (/\b(detersivo|sapone|carta igienica|scottex|dentifricio|shampoo|spugna|candeggina|sacchetti|sgrassatore)\b/.test(text)) return 'casa';
  if (/\b(gelato|piselli|pizza surgelata|bastoncini|surgelati|ghiaccio)\b/.test(text)) return 'surgelati';
  if (/\b(carne|pollo|bistecca|macinato|salsiccia|pesce|salmone|orata|prosciutto|salame)\b/.test(text)) return 'carne';
  return 'altro';
};

const INITIAL_ITEMS = [
  { id: '1', name: 'Latte parzialmente scremato', category: 'latticini', quantity: '2 litri', priority: 'alta', supermarket: 'Esselunga', notes: '', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=160&auto=format&fit=crop&q=80', completed: false, createdAt: Date.now() },
  { id: '2', name: 'Caffè macinato per moka', category: 'dispensa', quantity: '2 conf.', priority: 'alta', supermarket: 'Tutti', notes: 'Qualità Oro', image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=160&auto=format&fit=crop&q=80', completed: false, createdAt: Date.now() },
  { id: '3', name: 'Mele Stark & Banane', category: 'frutta', quantity: '1.5 kg', priority: 'media', supermarket: 'Coop', notes: 'Bio', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=160&auto=format&fit=crop&q=80', completed: false, createdAt: Date.now() },
  { id: '4', name: 'Carta Igienica & Scottex', category: 'casa', quantity: '1 pack', priority: 'media', supermarket: 'Tutti', notes: '', image: 'https://images.unsplash.com/photo-1584556812952-905ffd0c611a?w=160&auto=format&fit=crop&q=80', completed: true, createdAt: Date.now() }
];

export const ShoppingProvider = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('manca_shopping_items');
    return saved ? JSON.parse(saved) : INITIAL_ITEMS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isSyncing, setIsSyncing] = useState(false);

  // Sincronizzazione Real-Time con Cloud Firestore se connesso a Firebase
  useEffect(() => {
    if (isFirebaseConfigured && db && user?.id) {
      setIsSyncing(true);
      const itemsCollectionRef = collection(db, 'users', user.id, 'items');
      const q = query(itemsCollectionRef, orderBy('createdAt', 'desc'));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const firestoreItems = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        }));
        setItems(firestoreItems);
        localStorage.setItem('manca_shopping_items', JSON.stringify(firestoreItems));
        setIsSyncing(false);
      }, (err) => {
        console.warn('Errore Firestore snapshot (uso fallback locale):', err);
        setIsSyncing(false);
      });

      return () => unsubscribe();
    } else {
      // Fallback salvataggio locale
      localStorage.setItem('manca_shopping_items', JSON.stringify(items));
    }
  }, [user?.id]);

  // Funzione per confrontare nomi prodotto in italiano (gestisce singolari e plurali come mela/mele)
  const isSameProduct = (name1, name2) => {
    if (!name1 || !name2) return false;
    const n1 = name1.trim().toLowerCase();
    const n2 = name2.trim().toLowerCase();
    if (n1 === n2) return true;
    const stem1 = n1.replace(/[aeoi]$/i, '');
    const stem2 = n2.replace(/[aeoi]$/i, '');
    if (stem1.length > 2 && stem1 === stem2) return true;
    return false;
  };

  // Calcolo e somma intelligente delle quantità (es. "2 litri" + "1 litro" = "3 litri")
  const mergeQuantities = (existingQtyStr, incomingQtyStr) => {
    const parseQty = (str) => {
      if (!str) return { num: 1, unit: '' };
      const match = String(str).trim().match(/^(\d+(?:[.,]\d+)?)\s*(.*)$/);
      if (match) {
        return { num: parseFloat(match[1].replace(',', '.')), unit: match[2].trim() };
      }
      return { num: 1, unit: String(str).trim() };
    };

    const existing = parseQty(existingQtyStr);
    const incoming = parseQty(incomingQtyStr || '1');

    if (!existing.unit || !incoming.unit || existing.unit.toLowerCase() === incoming.unit.toLowerCase()) {
      const total = existing.num + incoming.num;
      const finalUnit = existing.unit || incoming.unit;
      const rounded = Number.isInteger(total) ? total : Math.round(total * 10) / 10;
      return `${rounded} ${finalUnit}`.trim();
    }

    return `${existingQtyStr} + ${incomingQtyStr}`;
  };

  // Aggiungi un articolo con incremento automatico (+n) se già presente e gestione articoli già comprati
  const addItem = async (itemData) => {
    if (!itemData.name || !itemData.name.trim()) return;

    const trimmedName = itemData.name.trim();

    // 1. Cerca se l'articolo è già presente tra le COSE DA COMPRARE (attivo)
    const existingActive = items.find(i => !i.completed && isSameProduct(i.name, trimmedName));

    if (existingActive) {
      // È già nella lista attiva: aggiungi +1 o +n alla quantità esistente!
      const newQty = mergeQuantities(existingActive.quantity, itemData.quantity);
      const updatedFields = {
        quantity: newQty,
        priority: itemData.priority === 'alta' ? 'alta' : existingActive.priority
      };

      if (isFirebaseConfigured && db && user?.id && !existingActive.id.startsWith('local-')) {
        try {
          const docRef = doc(db, 'users', user.id, 'items', existingActive.id);
          await updateDoc(docRef, updatedFields);
          return;
        } catch (e) {
          console.error('Errore aggiornamento quantità Firestore:', e);
        }
      }

      setItems(prev => prev.map(i => i.id === existingActive.id ? { ...i, ...updatedFields } : i));
      return;
    }

    // 2. Se NON è tra le cose da comprare, controlla se era tra le COSE GIÀ PRESE (comprate in passato)
    const existingCompleted = items.find(i => i.completed && isSameProduct(i.name, trimmedName));

    if (existingCompleted) {
      // Era già stato comprato: riattivalo nella lista della spesa con la nuova quantità richiesta!
      const reactivatedFields = {
        completed: false,
        quantity: itemData.quantity || '1',
        createdAt: Date.now()
      };

      if (isFirebaseConfigured && db && user?.id && !existingCompleted.id.startsWith('local-')) {
        try {
          const docRef = doc(db, 'users', user.id, 'items', existingCompleted.id);
          await updateDoc(docRef, { ...reactivatedFields, createdAt: serverTimestamp() });
          return;
        } catch (e) {
          console.error('Errore riattivazione articolo Firestore:', e);
        }
      }

      setItems(prev => prev.map(i => i.id === existingCompleted.id ? { ...i, ...reactivatedFields } : i));
      return;
    }

    // 3. Nuovo articolo mai inserito prima
    let imageUrl = itemData.image || '';
    if (!imageUrl) {
      try {
        imageUrl = await getProductImage(trimmedName);
      } catch (e) {
        imageUrl = '';
      }
    }

    const newItem = {
      name: trimmedName,
      category: itemData.category || 'altro',
      quantity: itemData.quantity || '1',
      priority: itemData.priority || 'media',
      supermarket: itemData.supermarket || 'Tutti',
      notes: itemData.notes || '',
      price: itemData.price || '',
      image: imageUrl,
      completed: false,
      createdAt: Date.now()
    };

    if (isFirebaseConfigured && db && user?.id) {
      try {
        await addDoc(collection(db, 'users', user.id, 'items'), {
          ...newItem,
          createdAt: serverTimestamp()
        });
        return;
      } catch (e) {
        console.error('Errore inserimento Firestore:', e);
      }
    }

    // Locale
    const localItem = { ...newItem, id: `local-${Date.now()}` };
    setItems(prev => [localItem, ...prev]);
  };

  // Aggiungi più articoli contemporaneamente (es. da dettatura vocale multi-prodotto)
  const addMultipleItems = async (itemsArray) => {
    if (!Array.isArray(itemsArray) || itemsArray.length === 0) return;
    for (const it of itemsArray) {
      await addItem(it);
    }
  };

  // Toggle completato
  const toggleItem = async (id) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    const nextCompleted = !item.completed;

    if (nextCompleted) {
      confetti({ particleCount: 35, spread: 55, origin: { y: 0.8 } });
    }

    if (isFirebaseConfigured && db && user?.id && !id.startsWith('local-')) {
      try {
        const itemRef = doc(db, 'users', user.id, 'items', id);
        await updateDoc(itemRef, { completed: nextCompleted });
        return;
      } catch (e) {
        console.error('Errore update Firestore:', e);
      }
    }

    setItems(prev => prev.map(i => i.id === id ? { ...i, completed: nextCompleted } : i));
  };

  // Rimuovi elemento
  const removeItem = async (id) => {
    if (isFirebaseConfigured && db && user?.id && !id.startsWith('local-')) {
      try {
        await deleteDoc(doc(db, 'users', user.id, 'items', id));
        return;
      } catch (e) {
        console.error('Errore delete Firestore:', e);
      }
    }

    setItems(prev => prev.filter(i => i.id !== id));
  };

  // Svuota completati
  const clearCompleted = async () => {
    const completedList = items.filter(i => i.completed);
    if (isFirebaseConfigured && db && user?.id) {
      completedList.forEach(async (it) => {
        if (!it.id.startsWith('local-')) {
          try {
            await deleteDoc(doc(db, 'users', user.id, 'items', it.id));
          } catch (e) {}
        }
      });
    }
    setItems(prev => prev.filter(i => !i.completed));
  };

  // Condivisione formattata
  const getFormattedShareText = () => {
    const pendingItems = items.filter(i => !i.completed);
    if (pendingItems.length === 0) return '🛒 La mia lista della spesa è vuota! Tutto già preso ✨';

    let text = `🛒 *LISTA DELLA SPESA (Manca!)*\n\n`;
    const grouped = {};
    
    pendingItems.forEach(item => {
      const catName = CATEGORIES[item.category]?.name || 'Altro';
      if (!grouped[catName]) grouped[catName] = [];
      grouped[catName].push(item);
    });

    Object.keys(grouped).forEach(cat => {
      text += `*${cat}*:\n`;
      grouped[cat].forEach(i => {
        const storeInfo = i.supermarket && i.supermarket !== 'Tutti' ? ` [da ${i.supermarket}]` : '';
        const notesInfo = i.notes ? ` (${i.notes})` : '';
        text += `  • ${i.name} - ${i.quantity}${storeInfo}${notesInfo}\n`;
      });
      text += `\n`;
    });

    text += `Inviato dall'app Manca! PWA 🚀`;
    return text;
  };

  return (
    <ShoppingContext.Provider value={{
      items,
      addItem,
      addMultipleItems,
      toggleItem,
      removeItem,
      clearCompleted,
      searchQuery,
      setSearchQuery,
      selectedCategory,
      setSelectedCategory,
      getFormattedShareText,
      isSyncing
    }}>
      {children}
    </ShoppingContext.Provider>
  );
};

export const useShopping = () => {
  const context = useContext(ShoppingContext);
  if (!context) throw new Error('useShopping deve essere usato in ShoppingProvider');
  return context;
};
