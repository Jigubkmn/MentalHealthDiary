import React, { useState } from 'react'
import { SafeAreaView, View, Text, StyleSheet, TextInput, TouchableWithoutFeedback, ScrollView } from 'react-native'
import AuthNavigationLink from './components/Link'
import HandleButton from '../components/button/HandleButton'
import login from './actions/backend/login'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // 必須項目が全て入力されているかチェック
  const isFormValid = (): boolean => {
    return !!(email && password);
  };

  const handleLogin = () => {
    login(email, password)
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback>
        <View style={styles.wrapper}>
          <Text style={styles.title}>ログイン</Text>
          <ScrollView style={styles.bodyContainer}>
          {/* メールアドレス */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              <Text>メールアドレス</Text>
              <Text style={styles.required}> ＊</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="メールアドレスを入力してください"
              onChangeText={(text) => setEmail(text)}
              value={email}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
          {/* パスワード */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              <Text>パスワード</Text>
              <Text style={styles.required}> ＊</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="半角英数字6文字以上で入力してください"
              onChangeText={(text) => setPassword(text)}
              value={password}
              secureTextEntry={true}
            />
          </View>
          {/* ログインボタン */}
          <HandleButton
            buttonText="ログインする"
            handleButton={handleLogin}
            isFormValid={isFormValid}
          />
          {/* リンク */}
          <AuthNavigationLink
            text="パスワードを忘れた方はこちら"
            href="/auth/passwordRest"
            color="#000000"
          />
          {/* リンク */}
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
  title: {
    fontSize: 18,
    lineHeight: 34,
    marginBottom: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  bodyContainer: {
    padding: 0,
    margin: 0,
    width: '100%',
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