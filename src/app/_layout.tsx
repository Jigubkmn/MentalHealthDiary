import React from "react";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="auth/login" options={{ headerShown: false }} />
      <Stack.Screen name="auth/signUp" options={{ headerShown: false }} />
      <Stack.Screen name="auth/passwordRest" options={{ headerShown: false }} />
      <Stack.Screen name="searchFriend/searchFriend" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="diary/edit/diaryEdit" options={{ headerShown: false }} />
      <Stack.Screen name="diary/show/diaryShow" options={{ headerShown: false }} />
      <Stack.Screen name="mentalHealthCheck/creation/mentalHealthCheckCreate" options={{ headerShown: false }} />
      <Stack.Screen name="mentalHealthCheck/show/mentalHealthCheckShow" options={{ headerShown: false }} />
    </Stack>
  );
}