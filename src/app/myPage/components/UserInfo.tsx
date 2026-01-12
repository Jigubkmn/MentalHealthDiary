import React, { useState, useEffect } from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import EditIcon from '../../components/Icon/EditIcon';
import { UserInfoType } from '../../../../type/userInfo';
import UserEditContents from './UserEditContents';
import updateUserImage from '../action/backend/updateUserImage';
import updateAccountId from '../action/backend/updateAccountId';
import updateUserName from '../action/backend/updateUserName';
import { validateAccountId, validateUserName } from '../../../../utils/validation';
import UserIconImage from '../../components/UserIconImage';

type UserInfoProps = {
  userInfo: UserInfoType | null
  userId?: string
}

export default function UserInfo({ userInfo, userId }: UserInfoProps) {
  const [isAccountIdEdit, setIsAccountIdEdit] = useState(false);
  const [accountId, setAccountId] = useState('');
  const [isUserNameEdit, setIsUserNameEdit] = useState(false);
  const [userName, setUserName] = useState('');
  const [userImage, setUserImage] = useState<string | null>(userInfo?.userImage || '');
  const [errors, setErrors] = useState({ accountId: '', userName: '' })

  useEffect(() => {
    setAccountId(userInfo?.accountId || '')
  }, [userInfo?.accountId]);

  useEffect(() => {
    setUserName(userInfo?.userName || '')
  }, [userInfo?.userName]);

  useEffect(() => {
    if (userInfo?.userImage) {
      setUserImage(userInfo.userImage)
    }
  }, [userInfo?.userImage]);

  useEffect(() => {
    setIsAccountIdEdit(false)
    setIsUserNameEdit(false)
  }, []);

  // アカウントID更新
  const handleUpdateAccountId = async () => {
    updateAccountId(accountId, errors, setErrors, setIsAccountIdEdit, userId);
  }

  // ユーザーIDのバリデーション
  const handleValidateAccountId = async (text: string) => {
    const errorMessage = await validateAccountId(text)
    setErrors({ ...errors, accountId: errorMessage })
  }

  // ユーザー名更新
  const handleUpdateUserName = async () => {
    updateUserName(userName, errors, setErrors, setIsUserNameEdit, userId);
  }

  // ユーザー名のバリデーション
  const handleValidateUserName = async (text: string) => {
    const errorMessage = await validateUserName(text)
    setErrors({ ...errors, userName: errorMessage })
  }

  return (
    <View style={styles.userInfoContainer}>
      <View style={styles.userInfoWrapper}>
        {/* ユーザー画像 */}
        <View style={styles.userImageContainer}>
          <UserIconImage userImage={userImage} size={100} />
          <TouchableOpacity
            style={styles.editIconOverlay}
            onPress={() => updateUserImage(userId || '', setUserImage)}>
            <EditIcon size={24} color="#FFA500" />
          </TouchableOpacity>
        </View>
        {/* ユーザーID */}
        <UserEditContents
          userTitle="ユーザーID"
          userContent={userInfo?.accountId}
          isUserContentEdit={isAccountIdEdit}
          setIsContentEdit={setIsAccountIdEdit}
          userUpdateContent={accountId}
          setUserUpdateContent={setAccountId}
          handleUserInfoUpdate={handleUpdateAccountId}
          errorText={errors.accountId}
          handleValidateUserContent={handleValidateAccountId}
        />
        {/* ユーザー名 */}
        <UserEditContents
          userTitle="ユーザー名"
          userContent={userInfo?.userName}
          isUserContentEdit={isUserNameEdit}
          setIsContentEdit={setIsUserNameEdit}
          userUpdateContent={userName}
          setUserUpdateContent={setUserName}
          handleUserInfoUpdate={handleUpdateUserName}
          errorText={errors.userName}
          handleValidateUserContent={handleValidateUserName}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  userInfoContainer: {
    marginVertical: 16,
    marginHorizontal: 'auto',
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    flexDirection: 'column',
    alignItems: 'center',
    width: 250,
  },
  userInfoWrapper: {
    width: '100%',
    paddingHorizontal: 16,
  },
  userImageContainer: {
    width: 100,
    height: 100,
    position: 'relative',
    marginBottom: 16,
    alignSelf: 'center',
  },
  editIconOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFA500',
    backgroundColor: '#ffffff',
    padding: 3,
  },
})