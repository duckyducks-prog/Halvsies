import { Tabs } from 'expo-router'

export default function TabsLayout() {
  // The tab bar is rendered globally in the root layout (persistent on every
  // page), so the navigator itself draws none.
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={() => null}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="tasks" />
      <Tabs.Screen name="grocery" />
      <Tabs.Screen name="meals" />
    </Tabs>
  )
}
