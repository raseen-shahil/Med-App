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
          try {
            const sellerDoc = await getDoc(doc(db, 'sellers', medicineData.sellerId));
            if (sellerDoc.exists()) {
              setSellerName(sellerDoc.data().pharmacyName || 'Unknown Seller');
            }
          } catch (sellerError) {
            console.log('Error fetching seller details:', sellerError);
            setSellerName('Unknown Seller');
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
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 1,
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 350,
    resizeMode: 'contain',
    backgroundColor: '#F8FAFC',
  },
  details: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  name: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 8,
    color: '#1F2937',
  },
  brand: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 16,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6366F1',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4B5563',
    marginBottom: 24,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
  },
  sellerName: {
    marginLeft: 12,
    fontSize: 16,
    color: '#1F2937',
    flex: 1,
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  stockStatus: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 32,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 5,
  },
  wishlistButton: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    marginRight: 16,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cartButton: {
    flex: 1,
    height: 56,
    backgroundColor: '#6366F1',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  cartButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#E2E8F0',
    shadowOpacity: 0,
  }
});