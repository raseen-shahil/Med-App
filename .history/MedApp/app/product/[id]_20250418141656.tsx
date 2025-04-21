import { useState, useEffect } from 'react';
import { StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { db } from '@/services/firebase';
import { useAuth } from '@/contexts/AuthContext';

interface Medicine {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  imageUrl?: string;
  sellerId: string;
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [loading, setLoading] = useState(true);
  const [sellerName, setSellerName] = useState('');

  useEffect(() => {
    const fetchMedicineDetails = async () => {
      try {
        const medicineDoc = await getDoc(doc(db, 'medicines', id as string));
        if (medicineDoc.exists()) {
          const medicineData = {
            id: medicineDoc.id,
            ...medicineDoc.data()
          } as Medicine;
          setMedicine(medicineData);

          // Fetch seller details
          const sellerDoc = await getDoc(doc(db, 'sellers', medicineData.sellerId));
          if (sellerDoc.exists()) {
            setSellerName(sellerDoc.data().pharmacyName || 'Unknown Seller');
          }
        }
      } catch (error) {
        console.error('Error fetching medicine:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMedicineDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </ThemedView>
    );
  }

  if (!medicine) return null;

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>

        <Image 
          source={
            medicine.imageUrl 
              ? { uri: medicine.imageUrl }
              : require('@/assets/images/medicine-placeholder.png')
          }
          style={styles.image}
        />

        <ThemedView style={styles.details}>
          <ThemedText style={styles.name}>{medicine.name}</ThemedText>
          <ThemedText style={styles.brand}>{medicine.brand}</ThemedText>
          <ThemedText style={styles.price}>₹{medicine.price}</ThemedText>
          
          <ThemedText style={styles.description}>{medicine.description}</ThemedText>
          
          <ThemedView style={styles.sellerInfo}>
            <Ionicons name="business-outline" size={20} color="#64748B" />
            <ThemedText style={styles.sellerName}>Sold by: {sellerName}</ThemedText>
          </ThemedView>

          <ThemedView style={styles.stockContainer}>
            <ThemedText style={[
              styles.stockStatus,
              { color: medicine.stock > 0 ? '#059669' : '#DC2626' }
            ]}>
              {medicine.stock > 0 ? 'In Stock' : 'Out of Stock'}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ScrollView>

      <ThemedView style={styles.footer}>
        <TouchableOpacity 
          style={styles.wishlistButton}
          onPress={() => {/* Add wishlist logic */}}
        >
          <Ionicons name="heart-outline" size={24} color="#6366F1" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.cartButton,
            medicine.stock === 0 && styles.disabledButton
          ]}
          onPress={() => {/* Add to cart logic */}}
          disabled={medicine.stock === 0}
        >
          <ThemedText style={styles.cartButtonText}>Add to Cart</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    paddingBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 1,
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  details: {
    padding: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  brand: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 12,
  },
  price: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6366F1',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4B5563',
    marginBottom: 20,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sellerName: {
    marginLeft: 8,
    fontSize: 16,
    color: '#64748B',
  },
  stockContainer: {
    marginTop: 8,
  },
  stockStatus: {
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  wishlistButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    marginRight: 12,
  },
  cartButton: {
    flex: 1,
    height: 50,
    backgroundColor: '#6366F1',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#CBD5E1',
  }
});