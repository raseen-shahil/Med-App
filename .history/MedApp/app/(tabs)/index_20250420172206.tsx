import { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, FlatList, Image, ActivityIndicator, ScrollView, Text, SafeAreaView, View } from 'react-native';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { db } from '@/services/firebase';
import { useAuth } from '@/hooks/useAuth';

interface Category {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface Medicine {
  id: string;
  name: string;
  price: number;
  category: string;
  imageUrl?: string;
}

const categories: Category[] = [
  { id: 'all', name: 'All', icon: 'grid-outline' },
  { id: 'diabetes', name: 'Diabetes', icon: 'fitness-outline' },
  { id: 'cholesterol', name: 'Cholesterol', icon: 'heart-outline' },
  { id: 'blood-pressure', name: 'Blood Pressure', icon: 'pulse-outline' },
  // Add more categories as needed
];

export default function HomeScreen() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [medicines, setMedicines] = useState<Medicine[]>([]);

  const fetchMedicines = async (categoryId: string) => {
    try {
      const medicinesRef = collection(db, 'medicines');
      let medicinesQuery = medicinesRef;

      if (categoryId !== 'all') {
        medicinesQuery = query(medicinesRef, where('category', '==', categoryId));
      }

      const snapshot = await getDocs(medicinesQuery);
      const medicinesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Medicine[];

      setMedicines(medicinesList);
    } catch (error) {
      console.error('Error fetching medicines:', error);
    }
  };

  useEffect(() => {
    fetchMedicines(selectedCategory);
  }, [selectedCategory]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.categoryContainer}>
          <TouchableOpacity 
            style={[
              styles.categoryTab,
              selectedCategory === 'all' && styles.selectedTab
            ]}
            onPress={() => setSelectedCategory('all')}
          >
            <Text style={styles.categoryText}>All</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.categoryTab,
              selectedCategory === 'diabetes' && styles.selectedTab
            ]}
            onPress={() => setSelectedCategory('diabetes')}
          >
            <Image source={require('@/assets/images/diabetes.png')} style={styles.categoryIcon} />
            <Text style={styles.categoryText}>Diabetes</Text>
          </TouchableOpacity>

          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryTab,
                selectedCategory === category.id && styles.selectedTab
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text style={styles.categoryText}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.productsGrid}>
          {medicines.map((medicine) => (
            <TouchableOpacity 
              key={medicine.id}
              style={styles.productCard}
              onPress={() => router.push(`/product/${medicine.id}`)}
            >
              <Image
                source={medicine.imageUrl ? { uri: medicine.imageUrl } : require('@/assets/images/medicine-placeholder.png')}
                style={styles.productImage}
              />
              <Text style={styles.productName}>{medicine.name}</Text>
              <Text style={styles.productPrice}>₹{medicine.price}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  categoryContainer: {
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 8,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
  },
  selectedTab: {
    backgroundColor: '#EEF2FF',
    borderColor: '#6366F1',
  },
  categoryText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#64748B',
  },
  productsGrid: {
    padding: 8,
  },
  productCard: {
    flex: 1,
    margin: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    color: '#1F2937',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
    color: '#6366F1',
  },
  categoryIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  }
});
