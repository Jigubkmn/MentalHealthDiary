import { Alert } from "react-native";
import handleImageSelect from "../../../actions/handleImageSelect";
import { db } from "../../../../config";
import { doc, updateDoc } from "firebase/firestore";

export default async function updateUserImage(
  userId: string,
  setUserImage: (image: string) => void
) {
  const newUserImage = await handleImageSelect();
  if (!newUserImage) return;
  try {
    const userRef = doc(db, `users/${userId}/userInfo/${userId}`);
    await updateDoc(userRef, {
      userImage: newUserImage,
    });
    Alert.alert("ユーザー画像を更新しました");
    setUserImage(newUserImage);
  } catch (error) {
    console.log("error", error);
    Alert.alert("ユーザー画像の更新に失敗しました");
  }
}