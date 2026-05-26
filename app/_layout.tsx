import { Stack } from "expo-router";

export default function RootLayout() {
  return <Stack 
  initialRouteName="(tabs)/index"
  screenOptions={{headerShown: false}} />;
}
