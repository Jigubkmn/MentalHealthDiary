import React, { useState } from 'react'
import { SafeAreaView, View, ScrollView, Text, StyleSheet, TextInput, TouchableWithoutFeedback } from 'react-native'
import AuthNavigationLink from './components/Link'
import HandleButton from '../components/button/HandleButton'
import passwordReset from './actions/backend/passwordReset'

export default function PasswordRest() {
  const [email, setEmail] = useState('')


  // 必須項目が全て入力されているかチェック
  const isFormValid = (): boolean => {
    return !!(email);
  };

  // パスワードリセット
  const handlePasswordReset = () => {
    passwordReset(email, setEmail)
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback>
        <View style={styles.wrapper}>
          <Text style={styles.title}>パスワード再度設定</Text>
          <ScrollView style={styles.bodyContainer}>
            {/* メールアドレス */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                <Text>メールアドレス</Text>
                <Text style={styles.required}> ＊</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="使用しているメールアドレスを入力してください"
                value={email}
                onChangeText={(text) => setEmail(text)}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
            {/* 登録ボタン */}
            <HandleButton
              buttonText="送信する"
              handleButton={handlePasswordReset}
              isFormValid={isFormValid}
            />
            {/* リンク */}
            <AuthNavigationLink
              text="ログインはこちら"
              href="/auth/login"
            />
            <AuthNavigationLink
              text="ユーザー新規登録はこちら"
              href="/auth/signUp"
            />
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  wrapper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    marginTop: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bodyContainer: {
    padding: 0,
    margin: 0,
    width: '100%',
  },
  title: {
    fontSize: 18,
    lineHeight: 34,
    marginBottom: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
  inputContainer: {
    width: '100%',
    marginTop: 16,
  },
  inputLabel: {
    fontSize: 14,
    lineHeight: 24,
    color: '#000000',
  },
  input: {
    width: '100%',
    height: 30,
    borderWidth: 1,
    borderColor: '#FFA500',
    borderRadius: 10,
    paddingHorizontal: 16,
  },
  required: {
    color: 'red',
  },
})