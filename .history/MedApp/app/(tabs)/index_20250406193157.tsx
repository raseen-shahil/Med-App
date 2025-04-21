import { useState, useEffect } from 'react';
import { StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, Dimensions, View } from 'react-native';
import { router } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { db } from '@/services/firebase';
import { useAuth } from '@/contexts/AuthContext';

type Category = {
  id: string;
  name: string;
  image: string;
};

type Medicine = {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
};

const dummyMedicines: Medicine[] = [
  {
    id: '1',
    name: 'Paracetamol',
    price: 5.99,
    image: 'https://example.com/paracetamol.jpg',
    description: 'Pain reliever and fever reducer'
  },
  {
    id: '2',
    name: 'Amoxicillin',
    price: 12.99,
    image: 'https://example.com/amoxicillin.jpg',
    description: 'Antibiotic medication'
  },
  // Add more dummy medicines as needed
];

export default function HomeScreen() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'categories'));
        const categoryData: Category[] = [];
        
        querySnapshot.forEach((doc) => {
          categoryData.push({
            id: doc.id,
            ...doc.data() as Omit<Category, 'id'>
          });
        });
        
        setCategories(categoryData);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </ThemedView>
    );
  }

  const renderHeader = () => (
    <View style={styles.headerContent}>
      <ThemedText style={styles.appTitle}>MedApp</ThemedText>
      <ThemedText style={styles.welcomeText}>
        Welcome back, {user?.name || 'User'} 👋
      </ThemedText>
      <ThemedText style={styles.tagline}>
        Your Health, Our Priority
      </ThemedText>
    </View>
  );

  const renderMedicineItem = ({ item }: { item: Medicine }) => (
    <TouchableOpacity style={styles.medicineCard}>
      <View style={styles.medicineImageContainer}>
        <Image 
          source={{ uri: item.image }} 
          style={styles.medicineImage}
          defaultSource={require('@/assets/images/medicine-placeholder.png')}
        />
      </View>
      <View style={styles.medicineInfo}>
        <ThemedText style={styles.medicineName}>{item.name}</ThemedText>
        <ThemedText style={styles.medicinePrice}>${item.price.toFixed(2)}</ThemedText>
      </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader()}
        ListFooterComponent={
          <>
            <ThemedText style={styles.sectionTitle}>Popular Medicines</ThemedText>
            <FlatList
              data={dummyMedicines}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={renderMedicineItem}
              contentContainerStyle={styles.medicineList}
            />
          </>
        }
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.categoryCard}
            onPress={() => router.push(`/category/${item.id}`)}
          >
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: item.image }} 
                style={styles.categoryImage} 
              />
            </View>
            <View style={styles.categoryContent}>
              <ThemedText style={styles.categoryName}>{item.name}</ThemedText>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.categoryList}
      />
    </ThemedView>
  );
}

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;
const medicineCardWidth = width * 0.4;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  headerContent: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#4A90E2',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 18,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 4,
  },
  tagline: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  categoryList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  categoryCard: {
    width: cardWidth,
    height: 180,
    margin: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  imageContainer: {
    height: '70%',
    width: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  categoryContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 10,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
    marginTop: 24,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  medicineList: {
    paddingHorizontal: 16,
  },
  medicineCard: {
    width: medicineCardWidth,
    marginRight: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  medicineImageContainer: {
    height: medicineCardWidth,
    width: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F5F6F8',
  },
  medicineImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  medicineInfo: {
    padding: 12,
  },
  medicineName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  medicinePrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4A90E2',
  },
});
