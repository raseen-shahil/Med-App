import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useAuth } from './AuthContext';

export const CartContext = createContext({
  cartCount: 0,
  updateCartCount: () => {},
});

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setCartCount(0);
      return;
    }

    const cartRef = collection(db, 'users', user.uid, 'cart');
    const unsubscribe = onSnapshot(cartRef, (snapshot) => {
      const count = snapshot.docs.reduce((total, doc) => total + doc.data().quantity, 0);
      setCartCount(count);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <CartContext.Provider value={{ cartCount, updateCartCount: () => {} }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);