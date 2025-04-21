import { useState, useEffect } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
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
  address: string;
  city: string;
  state: string;
  pincode: string;
};

interface OrderData {
  userId: string;
  items: {
    medicineId: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl?: string;
  }[];
  shippingAddress: {
    fullName: string;
    phoneNumber: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  totalAmount: number;
  status: 'pending';
  createdAt: string;
  paymentMethod: string;
}

export default function CheckoutScreen() {
  const { user } = useAuth();
  const [address, setAddress] = useState({
    fullName: '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cod');
  const [processingOrder, setProcessingOrder] = useState(false);

  useEffect(() => {
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
    // Validate fullName
    if (!address.fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return false;
    }

    // Validate phone number (10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(address.phoneNumber.trim())) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return false;
    }

    // Validate address
    if (!address.address.trim()) {
      Alert.alert('Error', 'Please enter your delivery address');
      return false;
    }

    // Validate city
    if (!address.city.trim()) {
      Alert.alert('Error', 'Please enter your city');
      return false;
    }

    // Validate state
    if (!address.state.trim()) {
      Alert.alert('Error', 'Please enter your state');
      return false;
    }

    // Validate pincode (6 digits)
    const pincodeRegex = /^[0-9]{6}$/;
    if (!pincodeRegex.test(address.pincode.trim())) {
      Alert.alert('Error', 'Please enter a valid 6-digit pincode');
      return false;
    }

    return true;
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      Alert.alert('Error', 'Please login to place order');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setProcessingOrder(true);

    try {
      // Create order document
      const orderRef = await addDoc(collection(db, 'orders'), {
        userId: user.uid,
        items: cartItems.map(item => ({
          medicineId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.image || null
        })),
        shippingAddress: {
          fullName: address.fullName.trim(),
          phoneNumber: address.phoneNumber.trim(),
          address: address.address.trim(),
          city: address.city.trim(),
          state: address.state.trim(),
          pincode: address.pincode.trim()
        },
        totalAmount: calculateTotal(),
        status: 'pending',
        createdAt: new Date().toISOString(),
        paymentMethod: selectedPaymentMethod,
        orderNumber: `ORD${Date.now()}`
      });

      // Clear cart after successful order
      const clearCartPromises = cartItems.map(item => 
        deleteDoc(doc(db, 'users', user.uid, 'cart', item.id))
      );
      await Promise.all(clearCartPromises);

      Alert.alert(
        'Success',
        `Order placed successfully! Your order number is: ${orderRef.id}`,
        [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
      );
    } catch (error) {
      console.error('Error placing order:', error);
      Alert.alert('Error', 'Failed to save order. Please try again.');
    } finally {
      setProcessingOrder(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color="#6366F1" />
      </ThemedView>
    );
  }

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
          onChangeText={(text) => setAddress(prev => ({ ...prev, fullName: text }))}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={address.phoneNumber}
          onChangeText={(text) => setAddress(prev => ({ ...prev, phoneNumber: text }))}
          keyboardType="phone-pad"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Address"
          value={address.address}
          onChangeText={(text) => setAddress(prev => ({ ...prev, address: text }))}
        />
        
        <TextInput
          style={styles.input}
          placeholder="City"
          value={address.city}
          onChangeText={(text) => setAddress(prev => ({ ...prev, city: text }))}
        />
        
        <TextInput
          style={styles.input}
          placeholder="State"
          value={address.state}
          onChangeText={(text) => setAddress(prev => ({ ...prev, state: text }))}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Postal Code"
          value={address.pincode}
          onChangeText={(text) => setAddress(prev => ({ ...prev, pincode: text }))}
          keyboardType="number-pad"
        />
        
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Payment Method
        </ThemedText>
        
        <ThemedView style={styles.paymentOptions}>
          <TouchableOpacity
            style={[
              styles.paymentOption,
              selectedPaymentMethod === 'cod' && styles.selectedPaymentOption
            ]}
            onPress={() => setSelectedPaymentMethod('cod')}
          >
            <ThemedText 
              style={selectedPaymentMethod === 'cod' ? styles.selectedPaymentText : {}}
            >
              Cash on Delivery
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.paymentOption,
              selectedPaymentMethod === 'card' && styles.selectedPaymentOption
            ]}
            onPress={() => setSelectedPaymentMethod('card')}
          >
            <ThemedText 
              style={selectedPaymentMethod === 'card' ? styles.selectedPaymentText : {}}
            >
              Credit/Debit Card
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.paymentOption,
              selectedPaymentMethod === 'upi' && styles.selectedPaymentOption
            ]}
            onPress={() => setSelectedPaymentMethod('upi')}
          >
            <ThemedText 
              style={selectedPaymentMethod === 'upi' ? styles.selectedPaymentText : {}}
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
            <ThemedText>₹{calculateTotal()}</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.summaryRow}>
            <ThemedText>Shipping:</ThemedText>
            <ThemedText>₹40</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.summaryRow}>
            <ThemedText type="defaultSemiBold">Total:</ThemedText>
            <ThemedText type="defaultSemiBold">₹{calculateTotal() + 40}</ThemedText>
          </ThemedView>
        </ThemedView>
      </ScrollView>
      
      <ThemedView style={styles.footer}>
        <TouchableOpacity 
          style={styles.placeOrderButton}
          onPress={handlePlaceOrder}
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
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    fontSize: 16,
    color: '#1F2937',
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
    borderColor: '#6366F1',
    backgroundColor: '#EEF2FF',
  },
  selectedPaymentText: {
    color: '#6366F1',
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
    backgroundColor: '#6366F1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  placeOrderText: {
    color: 'white',
    fontWeight: 'bold',
  },
});