import { createContext, useContext, useState, ReactNode } from 'react';
import { User, signOut } from 'firebase/auth';
import { auth } from '../services/firebase';

interface UserData {
  name: string;
  email: string;
  password: string;
  pharmacyName: string;
  address: string;
  licenseNumber: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: UserData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string) => {
    // ... existing login logic ...
  };

  const logout = async () => {
    return signOut(auth);
  };

  const register = async (userData: UserData) => {
    try {
      // Add your registration logic here
      console.log('Registering user:', userData);
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
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
