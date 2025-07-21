import React from "react";
import { Stack } from "expo-router";
import { FriendProvider } from "../contexts/FriendContext";

export default function RootLayout() {
  return (
    <FriendProvider>
      <Stack />
      {/* <Stack>
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="auth/signUp" options={{ headerShown: false }} />
        <Stack.Screen name="auth/passwordRest" options={{ headerShown: false }} />
        <Stack.Screen name="searchFriend/searchFriend" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack> */}
    </FriendProvider>
  );
}
