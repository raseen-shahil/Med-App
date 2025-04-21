import { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  User
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

interface AuthContextType {
  user: User | null;
  seller: Seller | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

interface Seller {
  id: string;
  name: string;
  pharmacyName: string;
  approved: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Check if the user is a seller
        const sellerDoc = await getDoc(doc(db, 'sellers', user.uid));
        if (sellerDoc.exists()) {
          setSeller(sellerDoc.data() as Seller);
        } else {
          // Not a seller, sign out
          await signOut(auth);
          setUser(null);
          setSeller(null);
        }
      } else {
        setSeller(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const sellerDoc = await getDoc(doc(db, 'sellers', userCredential.user.uid));
      
      if (!sellerDoc.exists()) {
        throw new Error('Not a registered seller');
      }
      
      if (!sellerDoc.data().approved) {
        throw new Error('Seller account pending approval');
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, seller, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};