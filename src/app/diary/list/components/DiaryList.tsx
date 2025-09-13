import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { DiaryType } from '../../../../../type/diary';
import { noUserImage } from '../../../constants/userImage';
import { feelings } from '../../../constants/feelings';
import formatDateMonthDay from '../../../actions/formatDateMonthDay';
import DiaryContentTop from './DiaryContentTop';

type Props = {
  diaryList: DiaryType
}

export default function DiaryList({ diaryList } :Props) {
  const router = useRouter();

  // 体調の画像を取得
  const feelingImage = feelings.find((feeling) => feeling.name === diaryList.feeling)?.image;
  // ◯月◯日(◯)
  const formattedTime = formatDateMonthDay(diaryList.diaryDate);

  // 日記詳細画面に遷移
  const handleDiaryPress = () => {
    router.push({
      pathname: `/diary/show/diaryShow`,
      params: {
        diaryId: diaryList.id,
        isTouchFeelingButton: 'false',
        selectedUserId: diaryList.userId
      }
    });
  };

  return (
    <TouchableOpacity style={styles.diaryList} onPress={handleDiaryPress} activeOpacity={0.7}>
      {/* 日記作成者のアイコン画像 */}
      <View style={styles.diaryUserIconContainer}>
        <Image
          source={diaryList.userImage || noUserImage}
          style={styles.diaryUserIcon}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
      </View >
      {/* 縦並びの日記内容 */}
      <View style={styles.diaryContentContainer}>
        <DiaryContentTop userName={diaryList.userName} feelingImage={feelingImage} formattedTime={formattedTime} />
          {/* 日記テキスト内容 */}
          <View style={styles.diaryContent}>
            <Text style={styles.diaryContentText}>
              {diaryList.diaryText}
            </Text>
          </View>
        {/* 日記投稿画像 */}
        {diaryList.diaryImage &&
          <View style={styles.diaryImageContainer}>
            <Image
              source={{ uri: diaryList.diaryImage }}
              style={styles.diaryImage}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
          </View>
        }
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  diaryList: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    width: '100%',
  },
  diaryUserIconContainer: {
    marginRight: 16,
    justifyContent: 'center',
  },
  diaryUserIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  diaryContentContainer: {
    flexDirection: 'column',
    flex: 1,
  },
  diaryContent: {
    flex: 1,
    width: '100%',
  },
  diaryContentText: {
    fontSize: 14,
    lineHeight: 20,
    width: '100%',
    flexWrap: 'wrap'
  },
  diaryImageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  diaryImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
  },
})