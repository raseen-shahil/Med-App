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
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.welcomeContainer}>
        <ThemedText style={styles.welcomeText}>
          Welcome back,
        </ThemedText>
        <ThemedText style={styles.userName}>
          {getFirstName(user?.email)}
        </ThemedText>
      </View>

      <ThemedView>
        {/* Categories List */}
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesList}
        />

        {/* Medicines Grid */}
        {loading ? (
          <ActivityIndicator size="large" color="#6366F1" />
        ) : (
          <FlatList
            data={medicines}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.medicineCard}
                onPress={() => router.push(`/product/${item.id}`)}
              >
                <Image
                  source={item.imageUrl ? { uri: item.imageUrl } : require('@/assets/images/medicine-placeholder.png')}
                  style={styles.medicineImage}
                />
                <ThemedText style={styles.medicineName}>{item.name}</ThemedText>
                <ThemedText style={styles.medicinePrice}>₹{item.price}</ThemedText>
              </TouchableOpacity>
            )}
            keyExtractor={item => item.id}
            numColumns={2}
            contentContainerStyle={styles.medicinesGrid}
          />
        )}
      </ThemedView>
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
    backgroundColor: '#FFFFFF',
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
  categoriesList: {
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 8,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
  },
  selectedCategory: {
    backgroundColor: '#EEF2FF',
  },
  categoryText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#64748B',
  },
  selectedCategoryText: {
    color: '#6366F1',
    fontWeight: '600',
  },
  medicinesGrid: {
    padding: 8,
  },
  medicineCard: {
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
  medicineImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
  },
  medicineName: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    color: '#1F2937',
  },
  medicinePrice: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
    color: '#6366F1',
  }
});
