import { createContext, useContext, useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useAuth } from './AuthContext';

interface CartItem {
  id: string;
  quantity: number;
  // Add other necessary properties based on your cart item structure
}

interface CartContextType {
  cartCount: number;
  cartItems: CartItem[];
}

export const CartContext = createContext<CartContextType>({
  cartCount: 0,
  cartItems: [],
});

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setCartCount(0);
      setCartItems([]);
      return;
    }

    const cartRef = collection(db, 'users', user.uid, 'cart');
    const unsubscribe = onSnapshot(cartRef, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCartItems(items);
      // Set count based on unique products, not quantities
      setCartCount(snapshot.docs.length);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <CartContext.Provider value={{ cartCount, cartItems }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);