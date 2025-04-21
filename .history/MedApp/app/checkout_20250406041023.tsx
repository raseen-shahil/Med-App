import { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { db } from '@/services/firebase';
import { useAuth } from '@/contexts/AuthContext';

type CartItem = {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

type Address = {
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
};

export default function CheckoutScreen() {
  const { user } = useAuth();
  const [address, setAddress] = useState<Address>({
    fullName: '',
    phoneNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
  });
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingOrder, setProcessingOrder] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod'); // cash on delivery by default

  useState(() => {
    const fetchCart = async () => {
      if (!user) return;

      try {
        const cartRef = collection(db, 'users', user.uid, 'cart');
        const querySnapshot = await getDocs(cartRef);
        
        const items: CartItem[] = [];
        querySnapshot.forEach((doc) => {
          items.push({
            id: doc.id,
            ...doc.data() as Omit<CartItem, 'id'>
          });
        });
        
        setCartItems(items);
      } catch (error) {
        console.error('Error fetching cart:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [user]);

  const handleInputChange = (field: keyof Address, value: string) => {
    setAddress({ ...address, [field]: value });
  };

  const validateForm = () => {
    const required = [
      'fullName', 'phoneNumber', 'addressLine1', 'city', 
      'state', 'postalCode'
    ];
    
    for (const field of required) {
      if (!address[field as keyof Address]) {
        Alert.alert('Error', `Please enter your ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }
    
    return true;
  };

  const placeOrder = async () => {
    if (!user) {
      router.replace('/(auth)/login');
      return;
    }
    
    if (cartItems.length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }
    
    if (!validateForm()) return;
    
    try {
      setProcessingOrder(true);
      
      // Create order in Firestore
      const orderData = {
        userId: user.uid,
        items: cartItems.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        totalAmount: getTotalPrice(),
        shippingAddress: address,
        paymentMethod,
        status: 'pending',
        createdAt: new Date(),
      };
      
      // Add order to Firestore
      const orderRef = await addDoc(collection(db, 'orders'), orderData);
      
      // Add order to user's orders subcollection
      await addDoc(collection(db, 'users', user.uid, 'orders'), {
        orderId: orderRef.id,
        totalAmount: getTotalPrice(),
        status: 'pending',
        createdAt: new Date(),
      });
      
      // Clear cart
      const cartRef = collection(db, 'users', user.uid, 'cart');
      const querySnapshot = await getDocs(cartRef);
      
      const deletePromises = querySnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      
      await Promise.all(deletePromises);
      
      Alert.alert(
        'Order Placed',
        'Your order has been placed successfully!',
        [{ text: 'OK', onPress: () => router.replace('/orders') }]
      );
    } catch (error) {
      console.error('Error placing order:', error);
      Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      setProcessingOrder(false);
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ThemedText>← Back</ThemedText>
        </TouchableOpacity>
        <ThemedText type="title">Checkout</ThemedText>
      </ThemedView>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Shipping Address
        </ThemedText>
        
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={address.fullName}
          onChangeText={(value) => handleInputChange('fullName', value)}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={address.phoneNumber}
          onChangeText={(value) => handleInputChange('phoneNumber', value)}
          keyboardType="phone-pad"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Address Line 1"
          value={address.addressLine1}
          onChangeText={(value) => handleInputChange('addressLine1', value)}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Address Line 2 (Optional)"
          value={address.addressLine2}
          onChangeText={(value) => handleInputChange('addressLine2', value)}
        />
        
        <TextInput
          style={styles.input}
          placeholder="City"
          value={address.city}
          onChangeText={(value) => handleInputChange('city', value)}
        />
        
        <TextInput
          style={styles.input}
          placeholder="State"
          value={address.state}
          onChangeText={(value) => handleInputChange('state', value)}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Postal Code"
          value={address.postalCode}
          onChangeText={(value) => handleInputChange('postalCode', value)}
          keyboardType="number-pad"
        />
        
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Payment Method
        </ThemedText>
        
        <ThemedView style={styles.paymentOptions}>
          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === 'cod' && styles.selectedPaymentOption
            ]}
            onPress={() => setPaymentMethod('cod')}
          >
            <ThemedText 
              style={paymentMethod === 'cod' ? styles.selectedPaymentText : {}}
            >
              Cash on Delivery
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === 'card' && styles.selectedPaymentOption
            ]}
            onPress={() => setPaymentMethod('card')}
          >
            <ThemedText 
              style={paymentMethod === 'card' ? styles.selectedPaymentText : {}}
            >
              Credit/Debit Card
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === 'upi' && styles.selectedPaymentOption
            ]}
            onPress={() => setPaymentMethod('upi')}
          >
            <ThemedText 
              style={paymentMethod === 'upi' ? styles.selectedPaymentText : {}}
            >
              UPI
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
        
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Order Summary
        </ThemedText>
        
        <ThemedView style={styles.orderSummary}>
          <ThemedView style={styles.summaryRow}>
            <ThemedText>Items Total:</ThemedText>
            <ThemedText>₹{getTotalPrice()}</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.summaryRow}>
            <ThemedText>Shipping:</ThemedText>
            <ThemedText>₹40</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.summaryRow}>
            <ThemedText type="defaultSemiBold">Total:</ThemedText>
            <ThemedText type="defaultSemiBold">₹{getTotalPrice() + 40}</ThemedText>
          </ThemedView>
        </ThemedView>
      </ScrollView>
      
      <ThemedView style={styles.footer}>
        <TouchableOpacity 
          style={styles.placeOrderButton}
          onPress={placeOrder}
          disabled={processingOrder}
        >
          <ThemedText style={styles.placeOrderText}>
            {processingOrder ? 'Processing...' : 'Place Order'}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 40,
  },
  backButton: {
    marginBottom: 10,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  sectionTitle: {
    marginTop: 20,
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 15,
    marginBottom: 12,
  },
  paymentOptions: {
    marginBottom: 20,
  },
  paymentOption: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 10,
  },
  selectedPaymentOption: {
    borderColor: '#0a7ea4',
    backgroundColor: 'rgba(10, 126, 164, 0.1)',
  },
  selectedPaymentText: {
    color: '#0a7ea4',
    fontWeight: '600',
  },
  orderSummary: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  placeOrderButton: {
    backgroundColor: '#0a7ea4',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  placeOrderText: {
    color: 'white',
    fontWeight: 'bold',
  },
});