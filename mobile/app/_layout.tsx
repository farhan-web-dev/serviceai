import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '../constants/config';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.surface },
          headerTintColor: COLORS.text,
          headerTitleStyle: { fontWeight: '700', fontSize: 18 },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: COLORS.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="orchestration"
          options={{
            title: 'AI Analysis',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen
          name="providers"
          options={{
            title: 'Providers',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen
          name="logs"
          options={{
            title: 'Workflow Logs',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen
          name="tracking"
          options={{
            title: 'Live Tracking',
            headerBackTitle: 'Back',
            headerStyle: { backgroundColor: COLORS.background },
          }}
        />
      </Stack>
    </>
  );
}
