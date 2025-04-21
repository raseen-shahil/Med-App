import { Tabs } from 'expo-router';
import { IconSymbol } from '@/components/Icons';

export default function TabLayout() {
  return (
    <Tabs>
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
          headerShown: false // Hide the tab header since we'll use stack header
        }}
      />
    </Tabs>
  );
}
