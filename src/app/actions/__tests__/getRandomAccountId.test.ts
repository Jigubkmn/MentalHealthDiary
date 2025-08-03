import getRandomAccountId from '../getRandomAccountId';
import { getDocs, collectionGroup, query, where } from 'firebase/firestore';

const mockGetDocs = getDocs as jest.Mock;
const mockCollectionGroup = collectionGroup as jest.Mock;
const mockQuery = query as jest.Mock;
const mockWhere = where as jest.Mock;

describe('getRandomAccountId', () => {
  // 元の Math.random を保存しておく
  const originalMathRandom = Math.random;

  // 各テストの後にモックをクリーンアップする
  afterEach(() => {
    mockGetDocs.mockClear();
    mockCollectionGroup.mockClear();
    mockQuery.mockClear();
    mockWhere.mockClear();
    Math.random = originalMathRandom;
  });

  test('最初に生成したIDがユニークな場合、そのIDを返すこと', async () => {
    Math.random = jest.fn().mockReturnValue(0.5);

    const expectedId = 'fffffffffffffff';

    // モックの設定
    mockCollectionGroup.mockReturnValue('mock-collection-ref');
    mockWhere.mockReturnValue('mock-where-clause');
    mockQuery.mockReturnValue('mock-query');
    mockGetDocs.mockResolvedValue({ empty: true });

    // 実行 (Act)
    const result = await getRandomAccountId();

    // 検証 (Assert)
    expect(result).toBe(expectedId);
    expect(mockGetDocs).toHaveBeenCalledTimes(1);
    expect(mockCollectionGroup).toHaveBeenCalledWith(expect.anything(), 'userInfo');
    expect(mockWhere).toHaveBeenCalledWith('accountId', '==', expectedId);
  });

  test('IDが1回重複し、2回目にユニークなIDが生成された場合、2回目のIDを返すこと', async () => {
    const mockRandomValues = [];
    for (let i = 0; i < 15; i++) {
      mockRandomValues.push(0.1);
    }
    for (let i = 0; i < 15; i++) {
      mockRandomValues.push(0.2);
    }

    const mockRandom = jest.fn();
    mockRandomValues.forEach(value => {
      mockRandom.mockReturnValueOnce(value);
    });
    Math.random = mockRandom;

    const duplicateId = 'GGGGGGGGGGGGGGG';
    const uniqueId = 'MMMMMMMMMMMMMMM';

    // モックの設定
    mockCollectionGroup.mockReturnValue('mock-collection-ref');
    mockWhere.mockReturnValue('mock-where-clause');
    mockQuery.mockReturnValue('mock-query');

    mockGetDocs
      .mockResolvedValueOnce({ empty: false })
      .mockResolvedValueOnce({ empty: true });

    // 実行 (Act)
    const result = await getRandomAccountId();

    // 検証 (Assert)
    expect(result).toBe(uniqueId);
    expect(mockGetDocs).toHaveBeenCalledTimes(2);
    expect(mockWhere).toHaveBeenCalledWith('accountId', '==', duplicateId);
    expect(mockWhere).toHaveBeenCalledWith('accountId', '==', uniqueId);
  });
});