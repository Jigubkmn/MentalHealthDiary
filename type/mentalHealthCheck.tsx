import dayjs from 'dayjs';

export type MentalHealthCheckType = {
  id: string;
  answers: number[];
  evaluation: string;
  scoreA: number;
  scoreB: number;
  createdAt: dayjs.Dayjs;
}