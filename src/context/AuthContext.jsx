import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../firebase/config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('manca_user_session');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);
  const [isSSOModalOpen, setIsSSOModalOpen] = useState(false);
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);

  // Ascolto stato autenticazione reale Firebase
  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          const userData = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
            email: firebaseUser.email,
            avatar: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`,
            provider: firebaseUser.providerData?.[0]?.providerId === 'google.com' ? 'Google' : 'Email/Password'
          };
          setUser(userData);
          localStorage.setItem('manca_user_session', JSON.stringify(userData));
        } else {
          setUser(null);
          localStorage.removeItem('manca_user_session');
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  // Login con Google SSO reale
  const loginWithGoogle = async () => {
    if (isFirebaseConfigured && auth && googleProvider) {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        setIsSSOModalOpen(false);
        return result.user;
      } catch (err) {
        console.error('Errore Google SSO:', err);
        throw err;
      }
    } else {
      const demoUser = {
        id: 'user-google-local',
        name: 'Utente Riservato',
        email: 'proprietario@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        provider: 'Google SSO'
      };
      setUser(demoUser);
      localStorage.setItem('manca_user_session', JSON.stringify(demoUser));
      setIsSSOModalOpen(false);
      return demoUser;
    }
  };

  const loginWithEmail = async (email, password, isRegistering = false) => {
    if (isFirebaseConfigured && auth) {
      try {
        let result;
        if (isRegistering) {
          result = await createUserWithEmailAndPassword(auth, email, password);
        } else {
          result = await signInWithEmailAndPassword(auth, email, password);
        }
        setIsSSOModalOpen(false);
        return result.user;
      } catch (err) {
        console.error('Errore Email Auth:', err);
        throw err;
      }
    } else {
      const localUser = {
        id: `user-${Date.now()}`,
        name: email.split('@')[0],
        email: email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        provider: 'Email'
      };
      setUser(localUser);
      localStorage.setItem('manca_user_session', JSON.stringify(localUser));
      setIsSSOModalOpen(false);
    }
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      await signOut(auth);
    }
    setUser(null);
    localStorage.removeItem('manca_user_session');
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      loginWithGoogle,
      loginWithEmail,
      logout,
      isSSOModalOpen,
      setIsSSOModalOpen,
      isFirebaseModalOpen,
      setIsFirebaseModalOpen
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve essere usato in AuthProvider');
  return context;
};
