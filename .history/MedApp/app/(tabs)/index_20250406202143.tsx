import { useState, useEffect } from 'react';
import { StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, View, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { db } from '@/services/firebase';
import { useAuth } from '@/contexts/AuthContext';

type Category = {
  id: string;
  name: string;
  image: string;
};

const healthConditions = [
  { id: '1', name: 'Diabetes', icon: 'fitness-outline' },
  { id: '2', name: 'Hypertension', icon: 'heart-outline' },
  { id: '3', name: 'Cholesterol', icon: 'water-outline' },
  { id: '4', name: 'Obesity', icon: 'body-outline' },
  { id: '5', name: 'Heart Disease', icon: 'pulse-outline' },
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

  const renderConditionsGrid = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.conditionsGrid}
    >
      {healthConditions.map((condition) => (
        <TouchableOpacity 
          key={condition.id}
          style={styles.conditionCard}
          onPress={() => router.push(`/condition/${condition.id}`)}
        >
          <View style={styles.conditionIconContainer}>
            <Ionicons name={condition.icon} size={24} color="#6366F1" />
          </View>
          <ThemedText style={styles.conditionName}>{condition.name}</ThemedText>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <View>
          <ThemedText style={styles.welcomeText}>Welcome back,</ThemedText>
          <ThemedText style={styles.userName}>{user?.name || 'User'}</ThemedText>
        </View>
        <TouchableOpacity style={styles.cartButton}>
          <Ionicons name="cart-outline" size={24} color="#6366F1" />
        </TouchableOpacity>
      </ThemedView>

      <View style={styles.searchContainer}>
        <TouchableOpacity 
          style={styles.searchBar}
          onPress={() => router.push('/search')}
        >
          <Ionicons name="search-outline" size={20} color="#64748B" />
          <ThemedText style={styles.searchText}>Search medicines...</ThemedText>
        </TouchableOpacity>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <ThemedText style={[styles.sectionTitle, styles.categoryHeader]}>Categories</ThemedText>
            {renderConditionsGrid()}
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
                defaultSource={require('@/assets/images/placeholder.png')}
              />
            </View>
            <View style={styles.categoryContent}>
              <ThemedText style={styles.categoryName}>{item.name}</ThemedText>
              <Ionicons name="chevron-forward" size={18} color="#6366F1" />
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.categoryList}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  welcomeText: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  cartButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#64748B',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  categoryHeader: {
    marginTop: 16,
  },
  categoryList: {
    padding: 20,
    paddingTop: 0,
  },
  categoryCard: {
    flex: 1,
    margin: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  imageContainer: {
    height: 120,
    backgroundColor: '#F1F5F9',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    flex: 1,
  },
  conditionsContainer: {
    marginBottom: 24,
  },
  conditionsGrid: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  conditionCard: {
    alignItems: 'center',
    marginRight: 20,
    width: 85,
  },
  conditionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  conditionName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1F2937',
    textAlign: 'center',
    lineHeight: 16,
  },
});
