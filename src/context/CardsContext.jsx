import React, { createContext, useContext, useState, useEffect } from 'react';
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
import { triggerHaptic } from '../services/haptics';

const CardsContext = createContext();

export const SUPERMARKET_PRESETS = [
  { name: 'Esselunga', color: '#dc2626', bg: 'linear-gradient(135deg, #ef4444 0%, #991b1b 100%)', icon: '🛒' },
  { name: 'Coop', color: '#e11d48', bg: 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)', icon: '🔴' },
  { name: 'Conad', color: '#16a34a', bg: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)', icon: '🌼' },
  { name: 'Lidl', color: '#2563eb', bg: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', icon: '🟡' },
  { name: 'Carrefour', color: '#0284c7', bg: 'linear-gradient(135deg, #38bdf8 0%, #0369a1 100%)', icon: '🔷' },
  { name: 'Eurospin', color: '#0369a1', bg: 'linear-gradient(135deg, #0284c7 0%, #075985 100%)', icon: '⭐' },
  { name: 'Aldi', color: '#ea580c', bg: 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)', icon: '🔶' },
  { name: 'Pam', color: '#15803d', bg: 'linear-gradient(135deg, #16a34a 0%, #14532d 100%)', icon: '🟢' },
  { name: 'Decò', color: '#9333ea', bg: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)', icon: '🟣' },
  { name: 'Tigros', color: '#b91c1c', bg: 'linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%)', icon: '🐯' },
  { name: 'Altro Supermercato', color: '#475569', bg: 'linear-gradient(135deg, #64748b 0%, #334155 100%)', icon: '💳' },
];

export const THEME_COLORS = [
  { label: 'Rosso Smeraldo', hex: '#dc2626', bg: 'linear-gradient(135deg, #ef4444 0%, #991b1b 100%)' },
  { label: 'Verde Smeraldo', hex: '#059669', bg: 'linear-gradient(135deg, #10b981 0%, #065f46 100%)' },
  { label: 'Blu Cobalto', hex: '#2563eb', bg: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)' },
  { label: 'Giallo Oro', hex: '#d97706', bg: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)' },
  { label: 'Viola Notte', hex: '#7c3aed', bg: 'linear-gradient(135deg, #8b5cf6 0%, #5b21b6 100%)' },
  { label: 'Arancio Vivo', hex: '#ea580c', bg: 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)' },
  { label: 'Azzurro Mare', hex: '#0284c7', bg: 'linear-gradient(135deg, #38bdf8 0%, #0369a1 100%)' },
  { label: 'Magenta Glam', hex: '#db2777', bg: 'linear-gradient(135deg, #ec4899 0%, #9d174d 100%)' },
  { label: 'Grigio Titanio', hex: '#334155', bg: 'linear-gradient(135deg, #475569 0%, #1e293b 100%)' },
];

const INITIAL_CARDS = [
  {
    id: 'demo-card-1',
    supermarket: 'Esselunga',
    value: '0400012345678', // Numero tessera / codice
    barcode: '0400012345678',
    barcodeImage: '',
    color: '#dc2626',
    bg: 'linear-gradient(135deg, #ef4444 0%, #991b1b 100%)',
    createdAt: Date.now()
  },
  {
    id: 'demo-card-2',
    supermarket: 'Coop',
    value: '2900087654321',
    barcode: '2900087654321',
    barcodeImage: '',
    color: '#e11d48',
    bg: 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)',
    createdAt: Date.now()
  }
];

const INITIAL_COUPONS = [
  {
    id: 'demo-cp-1',
    supermarket: 'Esselunga',
    value: '10 €',
    minSpend: '50 €',
    expiryDate: '2026-11-15',
    notes: 'Sconto spesa weekend',
    code: '0400098765432',
    codeType: 'barcode',
    codeImage: '',
    used: false,
    createdAt: Date.now()
  },
  {
    id: 'demo-cp-2',
    supermarket: 'Esselunga',
    value: '20%',
    minSpend: 'Nessuno',
    expiryDate: '2026-10-31',
    notes: 'Su reparto ortofrutta',
    code: 'ESSE-ORTO-20',
    codeType: 'qrcode',
    codeImage: '',
    used: false,
    createdAt: Date.now()
  },
  {
    id: 'demo-cp-3',
    supermarket: 'Coop',
    value: '5 €',
    minSpend: '30 €',
    expiryDate: '2026-11-30',
    notes: 'Buono socio Coop',
    code: '2900011223344',
    codeType: 'barcode',
    codeImage: '',
    used: false,
    createdAt: Date.now()
  }
];

export const CardsProvider = ({ children }) => {
  const { user } = useAuth();
  
  const [cards, setCards] = useState(() => {
    const saved = localStorage.getItem('manca_cards_list');
    return saved ? JSON.parse(saved) : INITIAL_CARDS;
  });

  const [coupons, setCoupons] = useState(() => {
    const saved = localStorage.getItem('manca_coupons_list');
    return saved ? JSON.parse(saved) : INITIAL_COUPONS;
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  // 1. Sincronizzazione Firestore per le Cards
  useEffect(() => {
    if (isFirebaseConfigured && db && user?.id) {
      const cardsColRef = collection(db, 'users', user.id, 'cards');
      const q = query(cardsColRef, orderBy('createdAt', 'desc'));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const firestoreCards = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        }));
        setCards(firestoreCards);
        localStorage.setItem('manca_cards_list', JSON.stringify(firestoreCards));
      }, (err) => {
        console.warn('Errore snapshot Firestore Cards:', err);
      });

      return () => unsubscribe();
    } else {
      localStorage.setItem('manca_cards_list', JSON.stringify(cards));
    }
  }, [user?.id]);

  // 2. Sincronizzazione Firestore per i Buoni
  useEffect(() => {
    if (isFirebaseConfigured && db && user?.id) {
      const couponsColRef = collection(db, 'users', user.id, 'coupons');
      const q = query(couponsColRef, orderBy('createdAt', 'desc'));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const firestoreCoupons = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        }));
        setCoupons(firestoreCoupons);
        localStorage.setItem('manca_coupons_list', JSON.stringify(firestoreCoupons));
      }, (err) => {
        console.warn('Errore snapshot Firestore Coupons:', err);
      });

      return () => unsubscribe();
    } else {
      localStorage.setItem('manca_coupons_list', JSON.stringify(coupons));
    }
  }, [user?.id]);

  // Metodi Carte
  const addCard = async (cardData) => {
    triggerHaptic('success');
    const newCard = {
      supermarket: cardData.supermarket.trim(),
      value: (cardData.value || '').trim(),
      barcode: (cardData.barcode || cardData.value || '').trim(),
      barcodeImage: cardData.barcodeImage || '',
      color: cardData.color || '#dc2626',
      bg: cardData.bg || 'linear-gradient(135deg, #ef4444 0%, #991b1b 100%)',
      createdAt: Date.now()
    };

    if (isFirebaseConfigured && db && user?.id) {
      try {
        await addDoc(collection(db, 'users', user.id, 'cards'), {
          ...newCard,
          createdAt: serverTimestamp()
        });
        return;
      } catch (e) {
        console.error('Errore inserimento Card Firestore:', e);
      }
    }

    const localCard = { ...newCard, id: `local-card-${Date.now()}` };
    setCards(prev => [localCard, ...prev]);
  };

  const updateCard = async (cardId, updatedData) => {
    triggerHaptic('light');
    if (isFirebaseConfigured && db && user?.id && !cardId.startsWith('local-') && !cardId.startsWith('demo-')) {
      try {
        const docRef = doc(db, 'users', user.id, 'cards', cardId);
        await updateDoc(docRef, updatedData);
        return;
      } catch (e) {
        console.error('Errore update Card Firestore:', e);
      }
    }

    setCards(prev => prev.map(c => c.id === cardId ? { ...c, ...updatedData } : c));
  };

  const deleteCard = async (cardId) => {
    triggerHaptic('warning');
    if (isFirebaseConfigured && db && user?.id && !cardId.startsWith('local-') && !cardId.startsWith('demo-')) {
      try {
        await deleteDoc(doc(db, 'users', user.id, 'cards', cardId));
        return;
      } catch (e) {
        console.error('Errore delete Card Firestore:', e);
      }
    }

    setCards(prev => prev.filter(c => c.id !== cardId));
    if (selectedCard?.id === cardId) {
      setSelectedCard(null);
    }
  };

  // Metodi Buoni
  const addCoupon = async (couponData) => {
    triggerHaptic('success');
    const newCoupon = {
      supermarket: couponData.supermarket.trim(),
      value: (couponData.value || '').trim(),
      minSpend: (couponData.minSpend || '').trim() || 'Nessuno',
      expiryDate: couponData.expiryDate || '',
      notes: (couponData.notes || '').trim(),
      code: (couponData.code || '').trim(),
      codeType: couponData.codeType || 'barcode',
      codeImage: couponData.codeImage || '',
      used: false,
      createdAt: Date.now()
    };

    if (isFirebaseConfigured && db && user?.id) {
      try {
        await addDoc(collection(db, 'users', user.id, 'coupons'), {
          ...newCoupon,
          createdAt: serverTimestamp()
        });
        return;
      } catch (e) {
        console.error('Errore inserimento Coupon Firestore:', e);
      }
    }

    const localCoupon = { ...newCoupon, id: `local-cp-${Date.now()}` };
    setCoupons(prev => [localCoupon, ...prev]);
  };

  const toggleCouponUsed = async (couponId) => {
    triggerHaptic('light');
    const coupon = coupons.find(c => c.id === couponId);
    if (!coupon) return;
    const nextUsed = !coupon.used;

    if (isFirebaseConfigured && db && user?.id && !couponId.startsWith('local-') && !couponId.startsWith('demo-')) {
      try {
        const docRef = doc(db, 'users', user.id, 'coupons', couponId);
        await updateDoc(docRef, { used: nextUsed });
        return;
      } catch (e) {
        console.error('Errore toggle Coupon Firestore:', e);
      }
    }

    setCoupons(prev => prev.map(c => c.id === couponId ? { ...c, used: nextUsed } : c));
  };

  const deleteCoupon = async (couponId) => {
    triggerHaptic('warning');
    if (isFirebaseConfigured && db && user?.id && !couponId.startsWith('local-') && !couponId.startsWith('demo-')) {
      try {
        await deleteDoc(doc(db, 'users', user.id, 'coupons', couponId));
        return;
      } catch (e) {
        console.error('Errore delete Coupon Firestore:', e);
      }
    }

    setCoupons(prev => prev.filter(c => c.id !== couponId));
  };

  // Ottieni i coupon associati a un determinato supermercato
  const getCouponsForSupermarket = (supermarketName) => {
    if (!supermarketName) return [];
    return coupons.filter(c => c.supermarket.toLowerCase() === supermarketName.toLowerCase());
  };

  return (
    <CardsContext.Provider value={{
      cards,
      coupons,
      addCard,
      updateCard,
      deleteCard,
      addCoupon,
      toggleCouponUsed,
      deleteCoupon,
      getCouponsForSupermarket,
      isDrawerOpen,
      setIsDrawerOpen,
      selectedCard,
      setSelectedCard
    }}>
      {children}
    </CardsContext.Provider>
  );
};

export const useCards = () => {
  const context = useContext(CardsContext);
  if (!context) throw new Error('useCards deve essere usato dentro CardsProvider');
  return context;
};
