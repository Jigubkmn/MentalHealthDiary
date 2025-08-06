import { Alert } from "react-native";
import { db } from "../../../../config";
import { doc, updateDoc, collection, query, where, getDocs, writeBatch } from "firebase/firestore";
import { validateUserName } from "../../../../../utils/validation";

export default async function updateUserName(
  userName: string,
  errors: { accountId: string; userName: string },
  setErrors: (errors: { accountId: string; userName: string }) => void,
  setIsUserNameEdit: (isUserNameEdit: boolean) => void,
  userId?: string,
) {
  if (!userName || !userId) return;
  const errorMessage = await validateUserName(userName)
  setErrors({ ...errors, userName: errorMessage })
  if (errorMessage) return;
  try {
    const userRef = doc(db, `users/${userId}/userInfo/${userId}`);
    await updateDoc(userRef, {
      userName: userName,
    });

    const diariesRef = collection(db, "diaries");
    const diariesQuery = query(diariesRef, where("userId", "==", userId));
    const diariesSnapshot = await getDocs(diariesQuery);

    if (!diariesSnapshot.empty) {
      const batch = writeBatch(db);
      diariesSnapshot.docs.forEach((diaryDoc) => {
        const diaryRef = doc(db, "diaries", diaryDoc.id);
        batch.update(diaryRef, { userName: userName });
      });
      await batch.commit();
    }

    setIsUserNameEdit(false)
    Alert.alert("ユーザー名の更新に成功しました");
  } catch (error) {
    console.log("error", error);
    Alert.alert("ユーザー名の更新に失敗しました");
  }
}