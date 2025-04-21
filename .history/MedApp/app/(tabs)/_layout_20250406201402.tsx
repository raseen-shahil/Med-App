import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#6366F1', // Indigo - matching our theme
        tabBarInactiveTintColor: '#94A3B8', // Subtle gray for inactive
        headerShown: false,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          ...Platform.select({
            ios: {
              position: 'absolute',
            },
            default: {},
          }),
          height: 65,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 8,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          marginHorizontal: 20,
          marginBottom: 20,
          borderRadius: 20,
          position: 'absolute',
          bottom: 0,
        },
        tabBarItemStyle: {
          paddingVertical: 8,
          borderRadius: 12,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <IconSymbol 
              size={26} 
              name="house.fill" 
              color={color}
              style={{ marginBottom: -4 }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => (
            <IconSymbol 
              size={26} 
              name="magnifyingglass" 
              color={color}
              style={{ marginBottom: -4 }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color }) => (
            <IconSymbol 
              size={26} 
              name="cart.fill" 
              color={color}
              style={{ marginBottom: -4 }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <IconSymbol 
              size={26} 
              name="person.fill" 
              color={color}
              style={{ marginBottom: -4 }}
            />
          ),
        }}
      />
    </Tabs>
  );
}
