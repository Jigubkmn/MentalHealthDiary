import dayjs from 'dayjs';
import formatTimestampToTime from '../formatData';
import { DiaryType } from '../../../type/diary';

describe('formatTimestampToTime', () => {
  // ヘルパー関数: 日付からFirestoreタイムスタンプを作成
  const createFirestoreTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    return {
      seconds: Math.floor(date.getTime() / 1000),
      nanoseconds: (date.getTime() % 1000) * 1000000
    };
  };

  // ヘルパー関数: テスト用のDiaryTypeオブジェクトを作成
  const createTestDiary = (dateString: string): DiaryType => ({
    id: 'test-id',
    diaryDate: createFirestoreTimestamp(dateString) as any, // Firestoreタイムスタンプ形式
    diaryImage: null,
    diaryText: 'test text',
    feeling: 'happy',
    updatedAt: new Date(),
    userId: 'test-user',
    userName: 'Test User',
    userImage: 'test-image-url'
  });

  it('日本語の曜日を正しくフォーマットする', () => {
    // 2024年1月15日（月曜日）10:30をテスト
    const testDiary = createTestDiary('2024-01-15T10:30:00');
    const result = formatTimestampToTime({ diaryList: testDiary });
    expect(result).toBe('1月15日(月) 10:30');
  });

  it('日曜日の日付を正しくフォーマットする', () => {
    // 2024年1月14日（日曜日）15:45をテスト
    const testDiary = createTestDiary('2024-01-14T15:45:00');
    const result = formatTimestampToTime({ diaryList: testDiary });
    expect(result).toBe('1月14日(日) 15:45');
  });

  it('土曜日の日付を正しくフォーマットする', () => {
    // 2024年1月13日（土曜日）23:59をテスト
    const testDiary = createTestDiary('2024-01-13T23:59:00');
    const result = formatTimestampToTime({ diaryList: testDiary });
    expect(result).toBe('1月13日(土) 23:59');
  });

  it('12月の日付を正しくフォーマットする', () => {
    // 2024年12月25日（水曜日）09:15をテスト
    const testDiary = createTestDiary('2024-12-25T09:15:00');
    const result = formatTimestampToTime({ diaryList: testDiary });
    expect(result).toBe('12月25日(水) 09:15');
  });

  it('should format date correctly with single digit day', () => {
    // 2024年3月5日（火曜日）08:05をテスト
    const testDiary = createTestDiary('2024-03-05T08:05:00');
    const result = formatTimestampToTime({ diaryList: testDiary });
    expect(result).toBe('3月5日(火) 08:05');
  });

  it('1桁の月の日付を正しくフォーマットする', () => {
    // 2024年3月15日（金曜日）12:00をテスト
    const testDiary = createTestDiary('2024-03-15T12:00:00');
    const result = formatTimestampToTime({ diaryList: testDiary });
    expect(result).toBe('3月15日(金) 12:00');
  });

  it('diaryDateが存在しない場合は空文字を返す', () => {
    const testDiary: DiaryType = {
      id: 'test-id',
      diaryDate: null as any,
      diaryImage: null,
      diaryText: 'test text',
      feeling: 'happy',
      updatedAt: new Date(),
      userId: 'test-user',
      userName: 'Test User',
      userImage: 'test-image-url'
    };
    const result = formatTimestampToTime({ diaryList: testDiary });
    expect(result).toBe('');
  });
});