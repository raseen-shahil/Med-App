import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

interface UserData {
  name: string;
  email: string;
  password: string;
  pharmacyName: string;
  address: string;
  licenseNumber: string;
}

interface SellerData extends Omit<UserData, 'password'> {
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  sellerData: SellerData | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: UserData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [sellerData, setSellerData] = useState<SellerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        const sellerDoc = await getDoc(doc(db, 'sellers', currentUser.uid));
        if (sellerDoc.exists()) {
          setSellerData(sellerDoc.data() as SellerData);
        }
      } else {
        setSellerData(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const register = async (userData: UserData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );

      const sellerData: SellerData = {
        name: userData.name,
        email: userData.email,
        pharmacyName: userData.pharmacyName,
        address: userData.address,
        licenseNumber: userData.licenseNumber,
        createdAt: new Date()
      };

      await setDoc(doc(db, 'sellers', userCredential.user.uid), sellerData);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to register');
    }
  };

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to login');
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to logout');
    }
  };

  const value: AuthContextType = {
    user,
    sellerData,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    register
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
