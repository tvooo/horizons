import Ionicons from '@expo/vector-icons/Ionicons'
import { Tabs } from 'expo-router'
import { Button } from 'react-native'
import { signOut } from '../../src/lib/auth-client'

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerRight: () => <Button title="Sign Out" onPress={() => signOut()} />,
      }}
    >
      <Tabs.Screen
        name="inbox"
        options={{
          title: 'Inbox',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="file-tray-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="now"
        options={{
          title: 'Now',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="today-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="lists"
        options={{
          title: 'Lists',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  )
}
