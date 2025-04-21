import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
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
  approved: boolean;
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
        // Fetch seller data from Firestore
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

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Check if user is a registered seller
      const sellerDoc = await getDoc(doc(db, 'sellers', userCredential.user.uid));
      if (!sellerDoc.exists()) {
        await logout();
        throw new Error('No seller account found');
      }

      // Check if seller is approved
      const sellerData = sellerDoc.data() as SellerData;
      if (!sellerData.approved) {
        await logout();
        throw new Error('Your seller account is pending approval');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to login');
    }
  };

  const register = async (userData: UserData) => {
    try {
      // Create auth account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );

      // Create seller document
      const sellerData: SellerData = {
        name: userData.name,
        email: userData.email,
        pharmacyName: userData.pharmacyName,
        address: userData.address,
        licenseNumber: userData.licenseNumber,
        approved: false,
        createdAt: new Date()
      };

      // Save to Firestore
      await setDoc(doc(db, 'sellers', userCredential.user.uid), sellerData);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to register');
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
    isAuthenticated: !!user && !!sellerData?.approved,
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
