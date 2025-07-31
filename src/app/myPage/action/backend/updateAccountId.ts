import { Alert } from "react-native";
import { db } from "../../../../config";
import { doc, updateDoc } from "firebase/firestore";

export default async function updateAccountId(
  accountId: string,
  errorAccountId: string,
  setIsAccountIdEdit: (isAccountIdEdit: boolean) => void,
  userId?: string,
) {
  if (!accountId || !userId) return;
  if (errorAccountId) return;
  try {
    const userRef = doc(db, `users/${userId}/userInfo/${userId}`);
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