import checkAccountId from '../src/app/actions/checkAccountId'
import checkUserName from '../src/app/actions/checkUserName'

// ユーザー名のバリデーション
export const validateUserName = async (userName: string): Promise<string> => {
  // まず長さチェック
  if (userName.length < 2 || userName.length > 10) {
    return 'ユーザー名は2文字以上10文字以内で入力してください'
  }

  // 次に重複チェック
  const isDuplicate = await checkUserName(userName)
  if (isDuplicate) {
    return 'このユーザー名は既に使用されています'
  }

  return ''
}

// メールアドレスのバリデーション
export const validateEmail = (email: string): string => {
  if (!email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
    return 'メールアドレスの形式が正しくありません'
  }
  return ''
}

// パスワードのバリデーション
export const validatePassword = (password: string): string => {
  if (password.length < 6 || password.length > 20) {
    return 'パスワードは6文字以上20文字以内で入力してください。'
  }
  return ''
}

// パスワード確認のバリデーション
export const validateConfirmPassword = (password: string, confirmPassword: string): string => {
  if (password !== confirmPassword) {
    return 'パスワードが一致しません'
  }
  return ''
}

// ユーザーIDのバリデーション
export const validateAccountId = async (accountId: string): Promise<string> => {
  // まず長さチェック
  if (accountId.length < 8 || accountId.length > 15) {
    return 'ユーザーIDは8文字以上15文字以内で入力してください'
  }

  // 次に重複チェック
  const isDuplicate = await checkAccountId(accountId)
  if (isDuplicate) {
    return 'このユーザーIDは既に使用されています'
  }

  return ''
}