import { useState, useEffect } from 'react';
import { StyleSheet, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { collection, query, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { db } from '@/services/firebase';
import { useAuth } from '@/contexts/AuthContext';

interface WishlistItem {
  id: string;
  medicineId: string;
  name: string;
  brand: string;
  price: number;
  imageUrl?: string;
}

export default function WishlistScreen() {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    if (!user) return;

    try {
      const wishlistRef = collection(db, 'users', user.uid, 'wishlist');
      const querySnapshot = await getDocs(wishlistRef);
      const items = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WishlistItem[];
      setWishlistItems(items);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (itemId: string) => {
    if (!user) return;

    try {
      await deleteDoc(doc(db, 'users', user.uid, 'wishlist', itemId));
      setWishlistItems(prev => prev.filter(item => item.id !== itemId));
      Alert.alert('Success', 'Item removed from wishlist');
    } catch (error) {
      Alert.alert('Error', 'Failed to remove item');
    }
  };

  return (
    <ThemedView style={styles.container}>
      {wishlistItems.length === 0 ? (
        <ThemedView style={styles.emptyState}>
          <Ionicons name="heart-outline" size={48} color="#CBD5E1" />
          <ThemedText style={styles.emptyText}>Your wishlist is empty</ThemedText>
        </ThemedView>
      ) : (
        <FlatList
          data={wishlistItems}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.itemCard}
              onPress={() => router.push(`/product/${item.medicineId}`)}
            >
              <Image
                source={
                  item.imageUrl 
                    ? { uri: item.imageUrl }
                    : require('@/assets/images/medicine-placeholder.png')
                }
                style={styles.itemImage}
              />
              <ThemedView style={styles.itemDetails}>
                <ThemedText style={styles.itemName}>{item.name}</ThemedText>
                <ThemedText style={styles.itemBrand}>{item.brand}</ThemedText>
                <ThemedText style={styles.itemPrice}>₹{item.price}</ThemedText>
              </ThemedView>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeFromWishlist(item.id)}
              >
                <Ionicons name="close-circle" size={24} color="#EF4444" />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
  },
  itemCard: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 16,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  itemBrand: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6366F1',
  },
  removeButton: {
    padding: 8,
  }
});