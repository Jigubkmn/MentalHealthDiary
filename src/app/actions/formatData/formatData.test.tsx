import dayjs from 'dayjs';
import formatDate from '../formatData/formatData';

describe('formatDate', () => {
  it('should format date correctly with Japanese day of week', () => {
    // 2024年1月15日（月曜日）10:30をテスト
    const testDate = dayjs('2024-01-15T10:30:00');
    const result = formatDate(testDate);
    expect(result).toBe('1月15日(月) 10:30');
  });

  it('should format date correctly for Sunday', () => {
    // 2024年1月14日（日曜日）15:45をテスト
    const testDate = dayjs('2024-01-14T15:45:00');
    const result = formatDate(testDate);
    expect(result).toBe('1月14日(日) 15:45');
  });

  it('should format date correctly for Saturday', () => {
    // 2024年1月13日（土曜日）23:59をテスト
    const testDate = dayjs('2024-01-13T23:59:00');
    const result = formatDate(testDate);
    expect(result).toBe('1月13日(土) 23:59');
  });

  it('should format date correctly for December', () => {
    // 2024年12月25日（水曜日）09:15をテスト
    const testDate = dayjs('2024-12-25T09:15:00');
    const result = formatDate(testDate);
    expect(result).toBe('12月25日(水) 09:15');
  });

  it('should format date correctly with single digit day', () => {
    // 2024年3月5日（火曜日）08:05をテスト
    const testDate = dayjs('2024-03-05T08:05:00');
    const result = formatDate(testDate);
    expect(result).toBe('3月5日(火) 08:05');
  });

  it('should format date correctly with single digit month', () => {
    // 2024年3月15日（金曜日）12:00をテスト
    const testDate = dayjs('2024-03-15T12:00:00');
    const result = formatDate(testDate);
    expect(result).toBe('3月15日(金) 12:00');
  });
}); 