import { useState, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView, ScrollView, TouchableOpacity, Image, Text } from 'react-native';
import { router } from 'expo-router';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { SearchBar } from '@/components/SearchBar';

export default function HomeScreen() {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const getFirstName = (email: string | null) => {
    if (!email) return '';
    return email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1);
  };

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
      }));

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
        <View style={styles.welcomeContainer}>
          <ThemedText style={styles.welcomeText}>Welcome back,</ThemedText>
          <ThemedText style={styles.userName}>{getFirstName(user?.email)}</ThemedText>
        </View>

        <SearchBar />

        <View style={styles.categoryContainer}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity 
              style={[styles.categoryCard, selectedCategory === 'all' && styles.selectedCategory]}
              onPress={() => setSelectedCategory('all')}
            >
              <Image source={require('@/assets/images/all.png')} style={styles.categoryIcon} />
              <Text style={styles.categoryText}>All</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.categoryCard, selectedCategory === 'diabetes' && styles.selectedCategory]}
              onPress={() => setSelectedCategory('diabetes')}
            >
              <Image source={require('@/assets/images/diabetes.png')} style={styles.categoryIcon} />
              <Text style={styles.categoryText}>Diabetes</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.categoryCard, selectedCategory === 'cholesterol' && styles.selectedCategory]}
              onPress={() => setSelectedCategory('cholesterol')}
            >
              <Image source={require('@/assets/images/cholesterol.png')} style={styles.categoryIcon} />
              <Text style={styles.categoryText}>Cholesterol</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.categoryCard, selectedCategory === 'blood-pressure' && styles.selectedCategory]}
              onPress={() => setSelectedCategory('blood-pressure')}
            >
              <Image source={require('@/assets/images/blood-pressure.png')} style={styles.categoryIcon} />
              <Text style={styles.categoryText}>Blood Pressure</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View style={styles.productsSection}>
          <Text style={styles.sectionTitle}>Popular Products</Text>
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
  welcomeContainer: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  welcomeText: {
    fontSize: 16,
    color: '#64748B',
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 4,
  },
  categoryContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  categoryCard: {
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    width: 100,
  },
  selectedCategory: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#6366F1',
  },
  categoryIcon: {
    width: 40,
    height: 40,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  productsSection: {
    padding: 20,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
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
    color: '#1F2937',
    marginTop: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6366F1',
    marginTop: 4,
  },
});
