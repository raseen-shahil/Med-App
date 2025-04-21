import { StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface AddToCartSheetProps {
  medicine: {
    name: string;
    brand: string;
    price: number;
    imageUrl?: string;
  };
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onContinue: () => void;
  onClose: () => void;
}

export function AddToCartSheet({ 
  medicine, 
  quantity, 
  onQuantityChange, 
  onContinue,
  onClose 
}: AddToCartSheetProps) {
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText style={styles.title}>Add to Cart</ThemedText>
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={onClose}
        >
          <Ionicons name="close" size={24} color="#64748B" />
        </TouchableOpacity>
      </ThemedView>

      <ThemedView style={styles.content}>
        <ThemedText style={styles.medicineName}>{medicine.name}</ThemedText>
        <ThemedText style={styles.price}>₹{medicine.price}</ThemedText>

        <ThemedView style={styles.quantityWrapper}>
          <ThemedText style={styles.quantityLabel}>Quantity:</ThemedText>
          <ThemedView style={styles.quantityContainer}>
            <TouchableOpacity 
              style={styles.quantityButton}
              onPress={() => quantity > 1 && onQuantityChange(quantity - 1)}
            >
              <Ionicons name="remove" size={24} color="#6366F1" />
            </TouchableOpacity>
            
            <ThemedText style={styles.quantity}>{quantity}</ThemedText>
            
            <TouchableOpacity 
              style={styles.quantityButton}
              onPress={() => onQuantityChange(quantity + 1)}
            >
              <Ionicons name="add" size={24} color="#6366F1" />
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>

        <TouchableOpacity 
          style={styles.continueButton}
          onPress={onContinue}
        >
          <ThemedText style={styles.continueText}>
            Add to Cart • ₹{medicine.price * quantity}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  medicineName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6366F1',
    marginBottom: 24,
  },
  quantityWrapper: {
    marginBottom: 24,
  },
  quantityLabel: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 4,
  },
  quantityButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  quantity: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    width: 64,
    textAlign: 'center',
  },
  continueButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  continueText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});