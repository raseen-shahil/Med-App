import { useState, useEffect } from 'react';
import { StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { doc, getDoc, collection, addDoc } from 'firebase/firestore';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { db } from '@/services/firebase';
import { useAuth } from '@/contexts/AuthContext';

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  details: string;
  inStock: boolean;
  categoryId: string;
};

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, 'products', id as string);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProduct({
            id: docSnap.id,
            ...docSnap.data() as Omit<Product, 'id'>
          });
        } else {
          Alert.alert('Error', 'Product not found');
          router.back();
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        Alert.alert('Error', 'Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const addToCart = async () => {
    if (!user) {
      router.push('/(auth)/login');
      return;
    }

    if (!product) return;

    try {
      setAddingToCart(true);
      
      // Check if item already exists in cart
      const cartRef = collection(db, 'users', user.uid, 'cart');
      
      await addDoc(cartRef, {
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
        addedAt: new Date()
      });
      
      Alert.alert('Success', 'Product added to cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add product to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0a7ea4" />
      </ThemedView>
    );
  }

  if (!product) {
    return (
      <ThemedView style={styles.errorContainer}>
        <ThemedText>Product not found</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ThemedText>← Back</ThemedText>
        </TouchableOpacity>
        
        <Image source={{ uri: product.image }} style={styles.productImage} />
        
        <ThemedView style={styles.productInfo}>
          <ThemedText type="title">{product.name}</ThemedText>
          <ThemedText type="subtitle" style={styles.price}>₹{product.price}</ThemedText>
          
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Description
          </ThemedText>
          <ThemedText style={styles.description}>{product.description}</ThemedText>
          
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Details
          </ThemedText>
          <ThemedText style={styles.description}>{product.details}</ThemedText>
          
          <ThemedView style={styles.stockInfo}>
            <ThemedText style={product.inStock ? styles.inStock : styles.outOfStock}>
              {product.inStock ? 'In Stock' : 'Out of Stock'}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ScrollView>
      
      <ThemedView style={styles.footer}>
        <TouchableOpacity 
          style={[styles.addToCartButton, !product.inStock && styles.disabledButton]}
          onPress={addToCart}
          disabled={!product.inStock || addingToCart}
        >
          <ThemedText style={styles.addToCartText}>
            {addingToCart ? 'Adding...' : 'Add to Cart'}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80, // Make room for footer
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    marginTop: 40,
    marginBottom: 16,
  },
  productImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    marginBottom: 20,
  },
  productInfo: {
    gap: 8,
  },
  price: {
    color: '#0a7ea4',
    marginTop: 8,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  description: {
    lineHeight: 22,
  },
  stockInfo: {
    marginTop: 16,
  },
  inStock: {
    color: 'green',
    fontWeight: '600',
  },
  outOfStock: {
    color: 'red',
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  addToCartButton: {
    backgroundColor: '#0a7ea4',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  addToCartText: {
    color: 'white',
    fontWeight: 'bold',
  },
});