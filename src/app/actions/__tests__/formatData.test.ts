import dayjs from 'dayjs';
import formatData from '../formatData';
import { DiaryType } from '../../../../type/diary';

type MockDiaryType = Omit<DiaryType, 'diaryDate'> & {
  diaryDate?: { seconds: number; nanoseconds: number } | dayjs.Dayjs | null | undefined;
};

describe('formatData', () => {
  describe('diaryDateがFirestore Timestampオブジェクトの場合', () => {
    test('フォーマット"M月D日(曜日) HH:mm"になる', () => {
      // テスト用の日付: 2023年10月27日 15:30:00 (金曜日)
      const mockDiary: MockDiaryType = {
        id: '1',
        diaryDate: { seconds: 1698388200, nanoseconds: 0 },
        diaryText: 'Test',
        diaryImage: null,
        feeling: 'happy',
        updatedAt: new Date(),
        userId: 'user1',
        userName: 'Test User',
        userImage: 'image_url',
      };

      const formattedDate = formatData({ diaryList: mockDiary as DiaryType });
      expect(formattedDate).toBe('10月27日(金) 15:30');
    });

    test('1桁の月と日の日付を正しくフォーマットする', () => {
      const mockDiary: MockDiaryType = {
        id: '2',
        diaryDate: { seconds: 1704413100, nanoseconds: 500000 },
        diaryText: 'Another Test',
        diaryImage: null,
        feeling: 'calm',
        updatedAt: new Date(),
        userId: 'user1',
        userName: 'Test User',
        userImage: 'image_url',
      };

      const formattedDate = formatData({ diaryList: mockDiary as DiaryType });
      expect(formattedDate).toBe('1月5日(金) 09:05');
    });
  });

  describe('他の入力タイプやエッジケースの場合', () => {
    test('diaryDateがdayjsオブジェクトの場合は空文字列を返す', () => {
      const mockDiary: MockDiaryType = {
        id: '3',
        diaryDate: dayjs('2023-10-27T15:30:00'),
        diaryText: 'Dayjs object test',
        diaryImage: null,
        feeling: 'sad',
        updatedAt: new Date(),
        userId: 'user1',
        userName: 'Test User',
        userImage: 'image_url',
      };

      const formattedDate = formatData({ diaryList: mockDiary as DiaryType });
      expect(formattedDate).toBe('');
    });

    test('diaryDateが存在しない場合は空文字列を返す', () => {
      const mockDiary: Partial<DiaryType> = { id: '4' };
      expect(formatData({ diaryList: mockDiary as DiaryType })).toBe('');
    });

    test('diaryDateがnullの場合は空文字列を返す', () => {
      const mockDiary: MockDiaryType = {
        id: '5',
        diaryDate: null,
        diaryText: 'Null date test',
        diaryImage: null,
        feeling: 'neutral',
        updatedAt: new Date(),
        userId: 'user1',
        userName: 'Test User',
        userImage: 'image_url',
      };
      expect(formatData({ diaryList: mockDiary as DiaryType })).toBe('');
    });

    test('diaryListが空の場合は空文字列を返す', () => {
      const mockDiary = {};
      expect(formatData({ diaryList: mockDiary as DiaryType })).toBe('');
    });
  });
});