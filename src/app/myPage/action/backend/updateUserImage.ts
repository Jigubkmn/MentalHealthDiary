import { Alert } from "react-native";
import handleImageSelect from "../../../actions/handleImageSelect";
import { db } from "../../../../config";
import { doc, updateDoc, collection, query, where, getDocs, writeBatch } from "firebase/firestore";

export default async function updateUserImage(
  userId: string,
  setUserImage: (image: string) => void
) {
  const newUserImage = await handleImageSelect(userId, 'userImages');
  if (!newUserImage) return;
  try {
    const userRef = doc(db, `users/${userId}/userInfo/${userId}`);
    await updateDoc(userRef, {
      userImage: newUserImage,
    });

    const diariesRef = collection(db, "diaries");
    const diariesQuery = query(diariesRef, where("userId", "==", userId));
    const diariesSnapshot = await getDocs(diariesQuery);

    if (!diariesSnapshot.empty) {
      const batch = writeBatch(db);
      diariesSnapshot.docs.forEach((diaryDoc) => {
        const diaryRef = doc(db, "diaries", diaryDoc.id);
        batch.update(diaryRef, { userImage: newUserImage });
      });
      await batch.commit();
    }

    Alert.alert("ユーザー画像を更新しました");
    setUserImage(newUserImage);
  } catch (error) {
    console.log("error", error);
    Alert.alert("ユーザー画像の更新に失敗しました");
  }
}