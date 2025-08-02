import { DiaryType } from '../../../../type/diary';
import formatTimestampToTime from '../formatData';

// describe: テストのグループを定義します。「何に関するテストか」を記述します。
describe('formatTimestampToTime関数', () => {

  // it: 個別のテストケースを定義します。「何をテストするか」を具体的に記述します。
  it('Firestoreのタイムスタンプオブジェクトを「月日(曜日) 時:分」の形式に正しくフォーマットすること', () => {
    // 1. テストデータ（入力値）の準備
    // 例：2024年8月3日(土) 15:30:00 を表すタイムスタンプ
    const date = new Date('2024-08-03T15:30:00');
    const seconds = Math.floor(date.getTime() / 1000);
    const nanoseconds = (date.getTime() % 1000) * 1000000;

    const mockDiaryList = {
      // diaryIdやcontentなど、他のプロパティはテストに不要なため省略可能
      diaryDate: { seconds, nanoseconds },
    } as DiaryType;

    // 2. テスト対象の関数を実行
    const result = formatTimestampToTime({ diaryList: mockDiaryList });

    // 3. 期待される結果（出力値）を定義
    const expected = '8月3日(土) 15:30';

    // 4. 実行結果が期待通りか検証
    expect(result).toBe(expected);
  });

  it('diaryList.diaryDateが存在しない場合、空文字列を返すこと', () => {
    // 1. テストデータの準備 (diaryDateプロパティがない)
    const mockDiaryList: Partial<DiaryType> = {
      // diaryDateがない状態をシミュレート
    };

    // 2. 関数を実行
    const result = formatTimestampToTime({ diaryList: mockDiaryList as DiaryType });

    // 3. 実行結果が空文字列であることを検証
    expect(result).toBe('');
  });

  it('diaryList.diaryDateがnullの場合、空文字列を返すこと', () => {
    // 1. テストデータの準備 (diaryDateがnull)
    const mockDiaryList = {
      diaryDate: null,
    } as DiaryType;

    // 2. 関数を実行
    const result = formatTimestampToTime({ diaryList: mockDiaryList });

    // 3. 実行結果が空文字列であることを検証
    expect(result).toBe('');
  });

  it('diaryList.diaryDateがタイムスタンプオブジェクトではない場合、空文字列を返すこと', () => {
    // 1. テストデータの準備 (diaryDateがただの文字列)
    const mockDiaryList = {
      diaryDate: '2024-08-03',
    } as DiaryType;

    // 2. 関数を実行
    const result = formatTimestampToTime({ diaryList: mockDiaryList });

    // 3. 実行結果が空文字列であることを検証
    expect(result).toBe('');
  });
});