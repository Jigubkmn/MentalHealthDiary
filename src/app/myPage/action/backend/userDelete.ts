import { Alert } from 'react-native'
import { auth, db, storage } from '../../../../config';
import { deleteUser } from 'firebase/auth';
import { deleteDoc, collection, getDocs, doc, query, where } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { router } from 'expo-router';
import { UserInfoType } from '../../../../../type/userInfo';

export default async function userDelete(userInfo: UserInfoType | null) {
  const user = auth.currentUser;
  const currentUserId = user?.uid;

  if (!user || !currentUserId) {
    Alert.alert("エラー", "ユーザーが見つかりません");
    return;
  }

  try {
    // ユーザーの日記データを削除
    // ユーザーの日記画像をStorageから削除
    const diariesQuery = query(collection(db, 'diaries'), where('userId', '==', currentUserId));
    const diariesSnapshot = await getDocs(diariesQuery);
    const diaryDeletePromises = diariesSnapshot.docs.map(async (diaryDoc) => {
      const diaryData = diaryDoc.data();
      const diaryId = diaryDoc.id;

      // 日記の画像がある場合はStorageから削除
      if (diaryData.diaryImage) {
        try {
          const { default: deleteImageFromFirebase } = await import('../../../diary/show/actions/backend/deleteImageFromFirebase');
          const deleteSuccess = await deleteImageFromFirebase(diaryData.diaryImage);
          if (deleteSuccess) {
            console.log('日記画像削除完了:', diaryData.diaryImage);
          } else {
            console.warn('日記画像削除に失敗:', diaryData.diaryImage);
          }
        } catch (imageDeleteError) {
          console.error('日記画像削除エラー:', imageDeleteError);
          // 画像削除に失敗しても日記データの削除は継続する
        }
      }

      // Firestoreから日記ドキュメントを削除
      await deleteDoc(doc(db, 'diaries', diaryId));
    });
    // 日記削除完了するまで待機
    await Promise.all(diaryDeletePromises);
    console.log('日記削除完了');

    // 注意: 他のユーザーのfriendsコレクションは権限制限により削除できません
    // 各ユーザーは自分のfriendsコレクションのみ管理可能です

    // 'friends' サブコレクション内の全ドキュメントを削除
    const friendsCollectionRef = collection(db, 'users', currentUserId, 'friends');
    const friendsSnapshot = await getDocs(friendsCollectionRef);
    if (!friendsSnapshot.empty) {
        const friendDeletePromises = friendsSnapshot.docs.map(friendDoc => deleteDoc(friendDoc.ref));
        await Promise.all(friendDeletePromises);
    }

    // 'feelingScores' サブコレクション内の全ドキュメントを削除
    const feelingScoresCollectionRef = collection(db, 'users', currentUserId, 'feelingScores');
    const feelingScoresSnapshot = await getDocs(feelingScoresCollectionRef);
    if (!feelingScoresSnapshot.empty) {
        const feelingScoreDeletePromises = feelingScoresSnapshot.docs.map(feelingScoresDoc => deleteDoc(feelingScoresDoc.ref));
        await Promise.all(feelingScoreDeletePromises);
    }

    // ログインユーザーのアイコン画像を削除
    if (userInfo && userInfo.userImage) {
      try {
        // Firebase StorageのURLからパスを抽出して削除
        const imageRef = ref(storage, userInfo.userImage);
        await deleteObject(imageRef);
        console.log('ユーザーアイコン画像削除完了');
      } catch (imageDeleteError) {
        console.error('ユーザーアイコン画像削除エラー:', imageDeleteError);
        // 画像削除に失敗してもアカウント削除は継続する
      }
    }

    // 'userInfo' サブコレクション内の全ドキュメントを削除
    const userInfoCollectionRef = collection(db, 'users', currentUserId, 'userInfo');
    const userInfoSnapshot = await getDocs(userInfoCollectionRef);
    if (!userInfoSnapshot.empty) {
        const userInfoDeletePromises = userInfoSnapshot.docs.map(userInfoDoc => deleteDoc(userInfoDoc.ref));
        await Promise.all(userInfoDeletePromises);
    }

    // 'mentalHealthChecks' サブコレクション内の全ドキュメントを削除
    const mentalHealthChecksCollectionRef = collection(db, 'users', currentUserId, 'mentalHealthChecks');
    const mentalHealthChecksSnapshot = await getDocs(mentalHealthChecksCollectionRef);
    if (!mentalHealthChecksSnapshot.empty) {
        const mentalHealthChecksDeletePromises = mentalHealthChecksSnapshot.docs.map(mentalHealthChecksDoc => deleteDoc(mentalHealthChecksDoc.ref));
        await Promise.all(mentalHealthChecksDeletePromises);
    }

    // 注意: /users/{userId} 親ドキュメントはFirestoreルールで権限が制限されています
    // サブコレクション削除のみ実行し、親ドキュメント削除はスキップします
    console.log('ユーザー親ドキュメント削除はスキップします（権限制限のため）');

    // 最後にFirebaseのユーザーアカウントを削除
    try {
      console.log('Firebase Authアカウントを削除中...');
      await deleteUser(user);
      console.log('Firebase Authアカウント削除成功');
    } catch (authError) {
      console.error('Firebase Authアカウント削除でエラー:', authError);

      // Auth削除失敗の場合、データは削除済みなので特別な処理が必要
      if (authError && typeof authError === 'object' && 'code' in authError) {
        const firebaseError = authError as { code: string; message: string };

        if (firebaseError.code === 'auth/requires-recent-login') {
          Alert.alert(
            "データ削除完了、認証削除失敗",
            "ユーザーデータの削除は完了しましたが、アカウント認証の削除に失敗しました。\n\n再ログイン後、もう一度アカウント削除を実行してください。",
            [
              {
                text: "ログアウト",
                onPress: () => {
                  import('./userLogout').then(module => {
                    module.default();
                  });
                }
              }
            ]
          );
          return; // エラーを再投げしない
        }
      }

      // その他のAuth削除エラーは再投げ
      throw authError;
    }

    // 成功時の処理を修正
    Alert.alert(
      "アカウント削除完了",
      "アカウントとすべてのデータが正常に削除されました",
      [
        {
          text: "OK",
          onPress: () => router.replace("/auth/login"),
        },
      ]
    );

  } catch (error) {
    console.error("userDelete error:", error);

    if (error instanceof Error && 'code' in error) {
      const firebaseError = error as { code: string; message: string };

      switch (firebaseError.code) {
        case 'auth/requires-recent-login':
          Alert.alert(
            "再認証が必要です",
            "セキュリティのため、アカウント削除には再ログインが必要です。\n\n手順:\n1. 一度ログアウトしてください\n2. 再度ログインしてください\n3. ログイン後すぐにアカウント削除を実行してください",
            [
              {
                text: "OK",
                onPress: () => {
                  // ログアウトして再ログインを促す
                  import('./userLogout').then(module => {
                    module.default();
                  });
                }
              }
            ]
          );
          break;
        case 'auth/network-request-failed':
          Alert.alert(
            "ネットワークエラー",
            "インターネット接続を確認して、もう一度お試しください。"
          );
          break;
        case 'auth/too-many-requests':
          Alert.alert(
            "リクエスト制限",
            "しばらく時間をおいてから再度お試しください。"
          );
          break;
        default:
          Alert.alert(
            "エラー",
            `アカウント削除処理に失敗しました。\nエラーコード: ${firebaseError.code}\nメッセージ: ${firebaseError.message}`
          );
      }
    } else {
      Alert.alert("エラー", "アカウント削除処理に失敗しました");
    }
  }
}