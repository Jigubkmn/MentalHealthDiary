import { Alert } from 'react-native'
import { auth, db } from '../../../../config';
import { deleteUser } from 'firebase/auth';
import { doc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { router } from 'expo-router';

export default async function userDelete() {
  const user = auth.currentUser;
  const currentUserId = user?.uid;

  if (!user || !currentUserId) {
    Alert.alert("エラー", "ユーザーが見つかりません");
    return;
  }

  try {
    // ユーザーの日記データを削除
    const diariesQuery = query(collection(db, 'diaries'), where('userId', '==', currentUserId));
    const diariesSnapshot = await getDocs(diariesQuery);
    const diaryDeletePromises = diariesSnapshot.docs.map(async (diaryDoc) => {
    const diaryId = diaryDoc.id;
    await deleteDoc(doc(db, 'diaries', diaryId));
    });
    // 日記削除完了するまで待機
    await Promise.all(diaryDeletePromises);

    // 友人の友人(ログインユーザー)を削除
    // const friendsQuery = query(collection(db, `users/${currentUserId}/friends`), where('friendId', '==', currentUserId));
    // const friendsSnapshot = await getDocs(friendsQuery);
    // const friendDeletePromises = friendsSnapshot.docs.map(async (friendDoc) => {
    //   const friendId = friendDoc.id;
    //   // 友人を削除
    //   await deleteDoc(doc(db, 'friends', friendId));
    // });
    // // 友人削除完了するまで待機
    // await Promise.all(friendDeletePromises);

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

    // すべてのサブコレクションを削除した後、親ドキュメントを削除
    await deleteDoc(doc(db, 'users', currentUserId));

    // 成功時の処理（Firebase認証削除前に実行）
    router.replace("/auth/login");

    // 最後にFirebaseのユーザーアカウントを削除
    await deleteUser(user);

    Alert.alert("アカウント削除完了", "アカウントとすべてのデータが正常に削除されました");

  } catch (error) {
    console.log("error", error);
    if (error instanceof Error && 'code' in error) {
      switch (error.code) {
        case 'auth/requires-recent-login':
          Alert.alert(
            "再認証が必要です",
            "セキュリティのため、アカウント削除には再ログインが必要です。一度ログアウトして再度ログインしてください。"
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
          Alert.alert("エラー", `アカウント削除処理に失敗しました。\nエラー: ${error.message}`);
      }
    } else {
      Alert.alert("エラー", "アカウント削除処理に失敗しました");
    }
  }
}