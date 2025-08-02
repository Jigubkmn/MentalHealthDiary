import { DiaryType } from '../../../../type/diary';
import formatTimestampToTime from '../formatData';

describe('formatTimestampToTime関数', () => {

  it('Firestoreのタイムスタンプオブジェクトを「月日(曜日) 時:分」の形式に正しくフォーマットすること', () => {
    // テストデータの準備
    const date = new Date('2024-08-03T15:30:00');
    const seconds = Math.floor(date.getTime() / 1000);
    const nanoseconds = (date.getTime() % 1000) * 1000000;

    const mockDiaryList = {
      diaryDate: { seconds, nanoseconds },
    } as unknown as DiaryType;

    // 関数を実行
    const result = formatTimestampToTime({ diaryList: mockDiaryList });

    // 期待される結果を検証
    const expected = '8月3日(土) 15:30';
    expect(result).toBe(expected);
  });

  it('異なる日付でも正しくフォーマットされること', () => {
    // テストデータの準備
    const date = new Date('2024-12-25T09:15:00');
    const seconds = Math.floor(date.getTime() / 1000);
    const nanoseconds = (date.getTime() % 1000) * 1000000;

    const mockDiaryList = {
      diaryDate: { seconds, nanoseconds },
    } as unknown as DiaryType;

    // 関数を実行
    const result = formatTimestampToTime({ diaryList: mockDiaryList });

    // 期待される結果を検証
    const expected = '12月25日(水) 09:15';
    expect(result).toBe(expected);
  });

  it('diaryList.diaryDateが存在しない場合、空文字列を返すこと', () => {
    // テストデータの準備 (diaryDateプロパティがない)
    const mockDiaryList = {
      // diaryDateがない状態をシミュレート
    } as unknown as DiaryType;

    // 関数を実行
    const result = formatTimestampToTime({ diaryList: mockDiaryList });

    // 実行結果が空文字列であることを検証
    expect(result).toBe('');
  });

  it('diaryList.diaryDateがnullの場合、空文字列を返すこと', () => {
    // テストデータの準備 (diaryDateがnull)
    const mockDiaryList = {
      diaryDate: null,
    } as unknown as DiaryType;

    // 関数を実行
    const result = formatTimestampToTime({ diaryList: mockDiaryList });

    // 実行結果が空文字列であることを検証
    expect(result).toBe('');
  });

  it('diaryList.diaryDateがundefinedの場合、空文字列を返すこと', () => {
    // テストデータの準備 (diaryDateがundefined)
    const mockDiaryList = {
      diaryDate: undefined,
    } as unknown as DiaryType;

    // 関数を実行
    const result = formatTimestampToTime({ diaryList: mockDiaryList });

    // 実行結果が空文字列であることを検証
    expect(result).toBe('');
  });

  it('diaryList.diaryDateがタイムスタンプオブジェクトではない場合、空文字列を返すこと', () => {
    // テストデータの準備 (diaryDateがただの文字列)
    const mockDiaryList = {
      diaryDate: '2024-08-03',
    } as unknown as DiaryType;

    // 関数を実行
    const result = formatTimestampToTime({ diaryList: mockDiaryList });

    // 実行結果が空文字列であることを検証
    expect(result).toBe('');
  });

  it('diaryList.diaryDateがsecondsプロパティを持たないオブジェクトの場合、空文字列を返すこと', () => {
    // テストデータの準備 (diaryDateが不正なオブジェクト)
    const mockDiaryList = {
      diaryDate: { someOtherProperty: 'value' },
    } as unknown as DiaryType;

    // 関数を実行
    const result = formatTimestampToTime({ diaryList: mockDiaryList });

    // 実行結果が空文字列であることを検証
    expect(result).toBe('');
  });

  it('深夜の時間も正しくフォーマットされること', () => {
    // テストデータの準備 (深夜0時30分)
    const date = new Date('2024-08-03T00:30:00');
    const seconds = Math.floor(date.getTime() / 1000);
    const nanoseconds = (date.getTime() % 1000) * 1000000;

    const mockDiaryList = {
      diaryDate: { seconds, nanoseconds },
    } as unknown as DiaryType;

    // 関数を実行
    const result = formatTimestampToTime({ diaryList: mockDiaryList });

    // 期待される結果を検証
    const expected = '8月3日(土) 00:30';
    expect(result).toBe(expected);
  });

  it('23時59分の時間も正しくフォーマットされること', () => {
    // テストデータの準備 (23時59分)
    const date = new Date('2024-08-03T23:59:00');
    const seconds = Math.floor(date.getTime() / 1000);
    const nanoseconds = (date.getTime() % 1000) * 1000000;

    const mockDiaryList = {
      diaryDate: { seconds, nanoseconds },
    } as unknown as DiaryType;

    // 関数を実行
    const result = formatTimestampToTime({ diaryList: mockDiaryList });

    // 期待される結果を検証
    const expected = '8月3日(土) 23:59';
    expect(result).toBe(expected);
  });
});