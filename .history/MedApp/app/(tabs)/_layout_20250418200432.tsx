import { Tabs } from 'expo-router';
import { IconSymbol } from '@/components/Icons';

export default function TabLayout() {
  return (
    <Tabs 
      screenOptions={{
        headerShown: false, // This removes the header from all tab screens
        tabBarActiveTintColor: '#6366F1',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          borderTopColor: '#E2E8F0',
          backgroundColor: '#FFFFFF',
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <IconSymbol name="home" color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <IconSymbol name="person" color={color} size={24} />
          ),
        }}
      />
    </Tabs>
  );
}
