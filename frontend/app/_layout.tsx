import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { useColorScheme } from "react-native";

// Prevent splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync().catch(() => {
  /* ignore */
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [loaded] = useFonts({
    // System font fallback
  });

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {
      /* ignore */
    });
  }, []);

  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: isDark ? "#0F172A" : "#4F46E5",
          },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: {
            fontWeight: "bold",
          },
          contentStyle: {
            backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
          },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="login"
          options={{
            title: "Campus7 Authentication",
            presentation: "modal",
          }}
        />
        <Stack.Screen
          name="(auth)"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="(student)"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="(warden)"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="(faculty)"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="(parent)"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="(admin)"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="+not-found"
          options={{ title: "Oops! Page Not Found" }}
        />
      </Stack>
      <StatusBar style={isDark ? "light" : "dark"} />
    </>
  );
}
