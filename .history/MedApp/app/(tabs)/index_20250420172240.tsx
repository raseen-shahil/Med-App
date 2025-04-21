import { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, FlatList, Image, ActivityIndicator, ScrollView, Text } from 'react-native';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { db } from '@/services/firebase';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

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
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMedicines();
  }, [selectedCategory]);

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const medicinesRef = collection(db, 'medicines');
      let medicinesQuery = medicinesRef;

      if (selectedCategory !== 'all') {
        medicinesQuery = query(medicinesRef, where('category', '==', selectedCategory));
      }

      const snapshot = await getDocs(medicinesQuery);
      const medicinesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Medicine[];

      setMedicines(medicinesList);
    } catch (error) {
      console.error('Error fetching medicines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item.id && styles.selectedCategory
      ]}
      onPress={() => handleCategoryPress(item.id)}
    >
      <Ionicons 
        name={item.icon} 
        size={24} 
        color={selectedCategory === item.id ? '#6366F1' : '#64748B'} 
      />
      <ThemedText style={[
        styles.categoryText,
        selectedCategory === item.id && styles.selectedCategoryText
      ]}>
        {item.name}
      </ThemedText>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      {/* Categories List */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.categoriesContainer}
      >
        <TouchableOpacity
          style={[
            styles.categoryButton,
            selectedCategory === 'all' && styles.selectedCategory
          ]}
          onPress={() => handleCategoryPress('all')}
        >
          <Text style={styles.categoryText}>All</Text>
        </TouchableOpacity>

        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.selectedCategory
            ]}
            onPress={() => handleCategoryPress(category.id)}
          >
            <Text style={styles.categoryText}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  categoriesContainer: {
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
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
    borderColor: '#6366F1',
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
