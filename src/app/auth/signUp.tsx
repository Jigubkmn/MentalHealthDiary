import React, { useState } from 'react'
import { SafeAreaView, View, ScrollView, Text, StyleSheet, TextInput, TouchableWithoutFeedback } from 'react-native'
import {
  validateUserName,
  validateEmail,
  validatePassword,
  validateConfirmPassword
} from '../../../utils/validation'
import AuthNavigationLink from './components/Link'
import HandleButton from '../components/button/HandleButton'
import signUp from './actions/backend/signUp'

export default function SignUp() {
  const [userName, setUserName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  // 各フォームのエラーメッセージを保持するstate
  const [errors, setErrors] = useState({ userName: '', email: '', password: '', confirmPassword: '' })

  // 必須項目が全て入力されているかチェック
  const isFormValid = (): boolean => {
    return !!(email && password && userName && confirmPassword);
  };

  // ユーザー名のバリデーション
  const handleValidateUserName = async () => {
    const errorMessage = await validateUserName(userName)
    setErrors({ ...errors, userName: errorMessage })
  }

  // メールアドレスのバリデーション
  const handleValidateEmail = async () => {
    const errorMessage = validateEmail(email)
    setErrors({ ...errors, email: errorMessage })
  }

  // パスワードのバリデーション
  const handleValidatePassword = async () => {
    const errorMessage = validatePassword(password)
    const newErrors = { ...errors, password: errorMessage }

    // パスワード確認欄もチェック
    if (confirmPassword) {
      newErrors.confirmPassword = validateConfirmPassword(password, confirmPassword)
    }

    setErrors(newErrors)
  }

  // パスワード確認のバリデーション
  const handleValidateConfirmPassword = async () => {
    const errorMessage = validateConfirmPassword(password, confirmPassword)
    setErrors({ ...errors, confirmPassword: errorMessage })
  }

  // ユーザー新規登録、ユーザー情報登録
  const handleSignUp  = () => {
    signUp(email, password, userName, setErrors)
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback>
        <View style={styles.wrapper}>
          <Text style={styles.title}>ユーザー新規登録</Text>
          <ScrollView style={styles.bodyContainer}>
            {/* ユーザー名 */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                <Text>ユーザー名</Text>
                <Text style={styles.required}> ＊</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="ユーザー名を入力してください"
                value={userName}
                onChangeText={(text) => setUserName(text)}
                autoCapitalize="none"
                onBlur={() => handleValidateUserName()}
              />
              {errors.userName ? <Text style={styles.errorText}>{errors.userName}</Text> : null}
            </View>
            {/* メールアドレス */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                <Text>メールアドレス</Text>
                <Text style={styles.required}> ＊</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="メールアドレスを入力してください"
                value={email}
                onChangeText={(text) => setEmail(text)}
                autoCapitalize="none"
                keyboardType="email-address"
                onBlur={() => handleValidateEmail()}
              />
              {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
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
                value={password}
                onChangeText={(text) => setPassword(text)}
                autoCapitalize="none"
                secureTextEntry={true}
                textContentType="newPassword"
                onBlur={() => handleValidatePassword()}
              />
              {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
              {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
            </View>
            {/* パスワード確認 */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                <Text>パスワード確認</Text>
                <Text style={styles.required}> ＊</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                autoCapitalize="none"
                secureTextEntry={true} // パスワードを非表示にする。
                textContentType="newPassword"
                onBlur={() => handleValidateConfirmPassword()}
              />
              {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
            </View>
            {/* 登録ボタン */}
            <HandleButton
              buttonText="登録する"
              handleButton={handleSignUp}
              isFormValid={isFormValid}
            />
            {/* リンク */}
            <AuthNavigationLink
              text="パスワードを忘れた方はこちら"
              href="/auth/passwordRest"
              color="#000000"
            />
            <AuthNavigationLink
              text="ログインはこちら"
              href="/auth/login"
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