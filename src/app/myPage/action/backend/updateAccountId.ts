import { Alert } from "react-native";
import { db } from "../../../../config";
import { doc, updateDoc } from "firebase/firestore";

export default async function updateAccountId(
  accountId: string,
  errorAccountId: string,
  setIsAccountIdEdit: (isAccountIdEdit: boolean) => void,
  userId?: string,
  userInfoId?: string
) {
  if (!accountId || !userId || !userInfoId) return;
  if (errorAccountId) return;
  try {
    const userRef = doc(db, `users/${userId}/userInfo/${userInfoId}`);
    await updateDoc(userRef, {
      accountId: accountId,
    });
    setIsAccountIdEdit(false)
    Alert.alert("ユーザーIDの更新に成功しました");
  } catch (error) {
    console.log("error", error);
    Alert.alert("ユーザーIDの更新に失敗しました");
  }
}