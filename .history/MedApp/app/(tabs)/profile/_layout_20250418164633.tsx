import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index"
        options={{ 
          title: "Profile",
          headerShown: true 
        }} 
      />
      <Stack.Screen 
        name="wishlist"
        options={{ 
          title: "My Wishlist",
          headerShown: true,
          presentation: 'push'
        }} 
      />
    </Stack>
  );
}