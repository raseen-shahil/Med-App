import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../services/firebase'
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Paper,
} from '@mui/material';

interface Order {
  id: string;
  customerName: string;
  product: string;
  status: string;
}

export default function PendingOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPendingOrders = async () => {
      try {
        const q = query(collection(db, 'orders'), where('status', '==', 'pending'));
        const querySnapshot = await getDocs(q);

        const fetchedOrders: Order[] = [];
        querySnapshot.forEach((doc) => {
          fetchedOrders.push({ id: doc.id, ...doc.data() } as Order);
        });

        setOrders(fetchedOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingOrders();
  }, []);

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Pending Orders
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <Paper elevation={3}>
          <List>
            {orders.map((order) => (
              <ListItem key={order.id} divider>
                <ListItemText
                  primary={`Customer: ${order.customerName}`}
                  secondary={`Product: ${order.product}`}
                />
              </ListItem>
            ))}
            {orders.length === 0 && (
              <ListItem>
                <ListItemText primary=" orders found." />
              </ListItem>
            )}
          </List>
        </Paper>
      )}
    </Container>
  );
}