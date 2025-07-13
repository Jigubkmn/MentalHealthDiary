import React, { useState, useEffect } from 'react'
import { SafeAreaView, View, Text, TextInput, StyleSheet, TouchableWithoutFeedback, Keyboard } from 'react-native'
import { noUserImage } from '../constants/userImage';
import { Image } from 'expo-image'
import Header from './components/Header';
import { db, auth } from '../../config';
import { collectionGroup, query, where, getDocs } from 'firebase/firestore';
import { UserInfoType } from '../../../type/userInfo';
import HandleButton from '../components/button/HandleButton';

export default function searchFriend() {
  const [userImage, setUserImage] = useState<string | null>(noUserImage);
  const [accountId, setAccountId] = useState('')
  const [searchResult, setSearchResult] = useState<UserInfoType | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    setUserImage(noUserImage)
  }, []);

  // 必須項目が全て入力されているかチェック
  const isFormValid = (): boolean => {
    return !!(accountId);
  };

  const searchButton = async () => {
    if (!accountId.trim()) return;

    setIsSearching(true);
    try {
      // ログインユーザーのIDを取得
      const currentUserId = auth.currentUser?.uid;
      if (!currentUserId) {
        console.log('ログインユーザーが見つかりません');
        return;
      }

      // userInfoコレクションから指定されたaccountIdで完全一致検索
      const usersRef = collectionGroup(db, 'userInfo');
      const q = query(usersRef, where('accountId', '==', accountId.trim()));
      const querySnapshot = await getDocs(q);

      // ユーザーが見つかった場合
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const userData = doc.data() as UserInfoType;

        // ログインユーザー以外のデータのみ取得
        if (doc.ref.parent.parent?.id !== currentUserId) {
          setSearchResult(userData);
          setUserImage(userData.userImage ? userData.userImage : noUserImage);
        } else {
          setSearchResult(null);
          setUserImage(noUserImage);
          console.log('自分自身のアカウントIDです');
        }
      } else {
        // ユーザーが見つからない場合
        setSearchResult(null);
        setUserImage(noUserImage);
        console.log('ユーザーが見つかりません');
      }
    } catch (error) {
      console.log('検索エラー:', error);
      setSearchResult(null);
      setUserImage(noUserImage);
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <Header />
        <View style={styles.wrapper}>
          {/* ユーザーID検索 */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>ユーザーID</Text>
            <TextInput
              style={styles.input}
              placeholder="友人のユーザーIDを入力してください"
              value={accountId}
              onChangeText={(text) => setAccountId(text)}
              autoCapitalize="none"
            />
          </View>

          {/* 検索ボタン */}
          <HandleButton
            buttonText="検索"
            handleButton={searchButton}
            isFormValid={isFormValid}
          />

          {/* 区切り線 */}
          <View style={styles.divider} />

          {/* 検索結果 */}
          <View style={styles.searchResultContainer}>
            {isSearching &&
              <Text style={styles.searchResultTitle}>検索結果</Text>
            }
            {searchResult ? (
              <>
                <Image
                  source={userImage}
                  style={styles.userImage}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                />
                <Text style={styles.userName}>{searchResult.userName}</Text>
              </>
            ) : (
              <Text style={styles.noResultText}>
                {isSearching && 'ユーザーが見つかりません'}
              </Text>
            )}
          </View>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  wrapper: {
    paddingHorizontal: 24,
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
  searchButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#27CBFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    marginTop: 24,
    marginBottom: 16,
  },
  disabledButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#27CBFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    marginTop: 24,
    marginBottom: 16,
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    lineHeight: 30,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    marginVertical: 8,
    width: '100%',
  },
  searchResultContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  searchResultTitle: {
    fontSize: 16,
    lineHeight: 30,
    color: '#000000',
    marginBottom: 16,
  },
  userImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 16,

  },
  userName: {
    fontSize: 14,
    lineHeight: 24,
    color: '#000000',
  },
  accountId: {
    fontSize: 12,
    lineHeight: 20,
    color: '#666666',
  },
  noResultText: {
    fontSize: 14,
    lineHeight: 24,
    color: '#666666',
    textAlign: 'center',
  }
});
