import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Image } from 'expo-image'
import { noUserImage } from '../../constants/userImage';
import EditIcon from '../../components/Icon/EditIcon';
import { UserInfoType } from '../../../../type/userInfo';
import UserLogout from '../../actions/handleLogout';
import UserEditContents from './UserEditContents';
import { validateAccountId, validateUserName } from '../../../../utils/validation';
import Divider from '../../components/Divider';
import updateUserImage from '../action/backend/updateUserImage';
import updateAccountId from '../action/backend/updateAccountId';
import updateUserName from '../action/backend/updateUserName';

type UserInfoProps = {
  userInfos: UserInfoType | null
  userId?: string
  userInfoId?: string
}

export default function UserInfo({ userInfos, userId, userInfoId }: UserInfoProps) {
  const [isAccountIdEdit, setIsAccountIdEdit] = useState(false);
  const [accountId, setAccountId] = useState('');
  const [isUserNameEdit, setIsUserNameEdit] = useState(false);
  const [userName, setUserName] = useState('');
  const [userImage, setUserImage] = useState<string | null>(userInfos?.userImage || noUserImage);
  const [errors, setErrors] = useState({ accountId: '', userName: '' })

  useEffect(() => {
    setAccountId(userInfos?.accountId || '')
  }, [userInfos?.accountId]);

  useEffect(() => {
    setUserName(userInfos?.userName || '')
  }, [userInfos?.userName]);

  useEffect(() => {
    if (userInfos?.userImage) {
      setUserImage(userInfos.userImage)
    }
  }, [userInfos?.userImage]);

  useEffect(() => {
    setIsAccountIdEdit(false)
    setIsUserNameEdit(false)
  }, []);

  // ログアウト
  const handleLogout = () => {
    UserLogout();
  }

  // アカウントID更新
  const handleUpdateAccountId = async () => {
    updateAccountId(accountId, errors.accountId, setIsAccountIdEdit, userId, userInfoId);
  }

  // ユーザーIDのバリデーション
  const handleValidateAccountId = async () => {
    const errorMessage = await validateAccountId(accountId)
    setErrors({ ...errors, accountId: errorMessage })
  }

  // ユーザー名更新
  const handleUpdateUserName = async () => {
    updateUserName(userName, errors.userName, setIsUserNameEdit, userId, userInfoId);
  }

  // ユーザー名のバリデーション
  const handleValidateUserName = async () => {
    if (!userName) return;
    const errorMessage = await validateUserName(userName)
    setErrors({ ...errors, userName: errorMessage })
  }

  return (
    <View style={styles.userInfoContainer}>
      <View style={styles.userInfoWrapper}>
        {/* ユーザー画像 */}
        <View style={styles.userImageContainer}>
          <Image
            source={userImage}
            style={styles.userImage}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
          <TouchableOpacity
            style={styles.editIconOverlay}
            onPress={() => updateUserImage(userId || '', userInfoId || '', setUserImage)}>
            <EditIcon size={24} color="#FFA500" />
          </TouchableOpacity>
        </View>
        {/* ユーザーID */}
        <UserEditContents
          userTitle="ユーザーID"
          userContent={userInfos?.accountId}
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
          userContent={userInfos?.userName}
          isUserContentEdit={isUserNameEdit}
          setIsContentEdit={setIsUserNameEdit}
          userUpdateContent={userName}
          setUserUpdateContent={setUserName}
          handleUserInfoUpdate={handleUpdateUserName}
          errorText={errors.userName}
          handleValidateUserContent={handleValidateUserName}
        />
      </View>
      {/* 区切り線 */}
      <Divider />
      {/* ログアウトボタン */}
      <TouchableOpacity style={styles.logoutButton} onPress={() => {handleLogout()}}>
        <Text style={styles.logoutButtonText}>ログアウト</Text>
      </TouchableOpacity>
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
  userImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
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
  logoutButton: {
    height: 24,
    width: 90,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.6)',
    alignSelf: 'center',
  },
  logoutButtonText: {
    fontSize: 14,
    lineHeight: 24,
    color: '#ffffff',
  },
})