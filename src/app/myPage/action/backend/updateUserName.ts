import { Alert } from "react-native";
import { db } from "../../../../config";
import { doc, updateDoc } from "firebase/firestore";

export default async function updateUserName(
  userName: string,
  errorUserName: string,
  setIsUserNameEdit: (isUserNameEdit: boolean) => void,
  userId?: string,
) {
  if (!userName || !userId) return;
  if (errorUserName) return;
  try {
    const userRef = doc(db, `users/${userId}/userInfo/${userId}`);
    await updateDoc(userRef, {
      userName: userName,
    });
    setIsUserNameEdit(false)
    Alert.alert("ユーザー名の更新に成功しました");
  } catch (error) {
    console.log("error", error);
    Alert.alert("ユーザー名の更新に失敗しました");
  }
}