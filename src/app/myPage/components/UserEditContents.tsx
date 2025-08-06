import React from 'react'
import EditIcon from '../../components/Icon/EditIcon';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from 'react-native'

type UserEditContentsProps = {
  userTitle: string
  userContent?: string;
  isUserContentEdit: boolean;
  setIsContentEdit: (isUserIdEdit: boolean) => void;
  userUpdateContent?: string;
  setUserUpdateContent: (accountId: string) => void;
  handleUserInfoUpdate: (accountId: string | undefined) => void;
  errorText?: string;
  handleValidateUserContent: (text: string) => void;
}

export default function UserEditContents({
  userTitle,
  userContent,
  isUserContentEdit,
  setIsContentEdit,
  userUpdateContent,
  setUserUpdateContent,
  handleUserInfoUpdate,
  errorText,
  handleValidateUserContent
}: UserEditContentsProps) {

  // 必須項目が全て入力されているかチェック
  const isFormValid = (): boolean => {
    return !!(userUpdateContent && userUpdateContent.length > 0 && !errorText);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.userContentsContainer}>
        <View style={styles.userContentsTitle}>
          <Text style={styles.userTitle}>{userTitle}</Text>
          {!isUserContentEdit && (
            <TouchableOpacity onPress={() => {setIsContentEdit(true)}}>
              <EditIcon size={24} color="#FFA500" />
            </TouchableOpacity>
          )}
        </View>
        {isUserContentEdit ? (
          <View>
            <TextInput
              style={styles.userInputContent}
              value={userUpdateContent}
              onChangeText={(text) => {
                setUserUpdateContent(text);
                handleValidateUserContent(text);
              }}
              autoCapitalize="none"
            />
            {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}
            <View style={styles.editButtonContainer}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => {setIsContentEdit(false)}}>
                <Text style={styles.editButtonText}>キャンセル</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[isFormValid() ? styles.editButton : styles.disabledButton]}
                onPress={() => {handleUserInfoUpdate(userUpdateContent)}}
                disabled={!isFormValid()}
              >
                <Text style={styles.editButtonText}>更新</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <Text style={styles.userText}>{userContent}</Text>
        )}
      </View>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  userContentsContainer: {
    alignSelf: 'flex-start',
    width: '100%',
  },
  userContentsTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userTitle: {
    fontSize: 14,
    lineHeight: 24,
    fontWeight: 'bold',
    marginRight: 8,
  },
  userInputContent: {
    height: 30,
    width: '100%',
    borderWidth: 1,
    borderColor: '#FFA500',
    borderRadius: 10,
    paddingHorizontal: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
  editButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  cancelButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: '#8D8D8D',
  },
  editButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: '#FFA500',
  },
  disabledButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: '#FFA500',
    opacity: 0.5,
  },
  editButtonText: {
    color: '#ffffff',
  },
  userText: {
    fontSize: 14,
    lineHeight: 24,
  },
})