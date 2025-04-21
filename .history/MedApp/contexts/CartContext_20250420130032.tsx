import { createContext, useContext, useState, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useAuth } from './AuthContext';

interface CartItem {
  id: string;
  medicineId: string;
  name: string;
  brand: string;
  price: number;
  imageUrl?: string;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  refreshCart: () => void;
}

export const CartContext = createContext<CartContextType>({
  cartItems: [],
  cartCount: 0,
  refreshCart: () => {},
});

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState(0);

  const fetchCartItems = async () => {
    if (!user) {
      setCartItems([]);
      setCartCount(0);
      return;
    }

    const cartRef = collection(db, 'users', user.uid, 'cart');
    const q = query(cartRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CartItem[];

      setCartItems(items);
      setCartCount(items.length);
    });

    return unsubscribe;
  };

  useEffect(() => {
    const unsubscribe = fetchCartItems();
    return () => unsubscribe && unsubscribe();
  }, [user]);

  const refreshCart = () => {
    fetchCartItems();
  };

  return (
    <CartContext.Provider value={{ cartItems, cartCount, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);