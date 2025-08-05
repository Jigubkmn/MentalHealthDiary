import { Alert } from "react-native";
import { db } from "../../../../config";
import { doc, updateDoc } from "firebase/firestore";
import { validateAccountId } from "../../../../../utils/validation";

export default async function updateAccountId(
  accountId: string,
  errors: { accountId: string; userName: string },
  setErrors: (errors: { accountId: string; userName: string }) => void,
  setIsAccountIdEdit: (isAccountIdEdit: boolean) => void,
  userId?: string,
) {
  if (!accountId || !userId) return;
  const errorMessage = await validateAccountId(accountId)
  setErrors({ ...errors, accountId: errorMessage })
  if (errorMessage) return;
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