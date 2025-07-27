import React, { useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import { ResponseType } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { getAuth, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';

// Google OAuth設定
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
// const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

WebBrowser.maybeCompleteAuthSession();

export default function GoogleSignInButton() {
  const auth = getAuth();

  const [, response, promptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_WEB_CLIENT_ID,
    responseType: ResponseType.IdToken,
    // HTTPSリダイレクトURIを設定
    redirectUri: 'https://auth.expo.io/@masashishiomi/diaryApp',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then(() => {
          console.log('Firebase login success!');
          Alert.alert('ログイン成功', 'Googleアカウントでログインしました');
        })
        .catch(error => {
          console.error('Googleログインエラー:', error);
          Alert.alert('ログインエラー', 'Googleログインに失敗しました');
        });
    } else if (response?.type === 'error') {
      console.error('Google認証エラー:', response.error);
      Alert.alert('認証エラー', 'Google認証に失敗しました');
    }
  }, [response]);

  const handlePress = async () => {
    try {
      await promptAsync();
    } catch (error) {
      console.error('Google認証エラー:', error);
      Alert.alert('エラー', 'Google認証を開始できませんでした');
    }
  };

  return (
    <TouchableOpacity style={styles.googleButton} onPress={handlePress}>
      <Text style={styles.googleButtonText}>Googleでログイン</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  googleButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginVertical: 8,
    alignItems: 'center',
  },
  googleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});