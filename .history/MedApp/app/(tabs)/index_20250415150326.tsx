import { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, Image, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface Medicine {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
  imageUrl?: string;
}

export default function HomeScreen() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'medicines'));
        const medicineList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Medicine[];
        setMedicines(medicineList);
      } catch (error) {
        console.error('Error fetching medicines:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicines();
  }, []);

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.heading}>Available Medicines</ThemedText>
      <ScrollView>
        <View style={styles.medicineGrid}>
          {medicines.map((medicine) => (
            <TouchableOpacity 
              key={medicine.id}
              style={styles.medicineCard}
              onPress={() => router.push(`/product/${medicine.id}`)}
            >
              <View style={styles.imageContainer}>
                {medicine.imageUrl ? (
                  <Image 
                    source={{ uri: medicine.imageUrl }} 
                    style={styles.image}
                    defaultSource={require('@/assets/images/medicine-placeholder.png')}
                  />
                ) : (
                  <View style={styles.placeholderContainer}>
                    <Ionicons name="medical" size={40} color="#CBD5E1" />
                  </View>
                )}
              </View>
              <View style={styles.contentContainer}>
                <ThemedText style={styles.medicineName}>{medicine.name}</ThemedText>
                <ThemedText style={styles.medicineBrand}>{medicine.brand}</ThemedText>
                <ThemedText style={styles.medicinePrice}>₹{medicine.price}</ThemedText>
                {medicine.stock > 0 ? (
                  <TouchableOpacity style={styles.addButton}>
                    <Ionicons name="add" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                ) : (
                  <ThemedText style={styles.outOfStock}>Out of Stock</ThemedText>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  medicineGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  medicineCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 140,
    backgroundColor: '#F1F5F9',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    padding: 12,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  medicineBrand: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  medicinePrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6366F1',
  },
  addButton: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    backgroundColor: '#6366F1',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStock: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
});
