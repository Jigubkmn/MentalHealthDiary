import { Alert } from "react-native";
import { db } from "../../../../config";
import { doc, updateDoc, collection, query, where, getDocs, writeBatch } from "firebase/firestore";

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

    // Update diaries collection - update userName for all diaries belonging to this user
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