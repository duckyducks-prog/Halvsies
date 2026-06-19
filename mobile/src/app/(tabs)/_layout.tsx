import { Tabs } from 'expo-router'
import { TabBar } from '@/components/TabBar'

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={() => <TabBar />}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="tasks" />
      <Tabs.Screen name="grocery" />
      <Tabs.Screen name="meals" />
    </Tabs>
  )
}
