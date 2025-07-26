import { db } from '../../../../../config';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import dayjs from 'dayjs';
import { MentalHealthCheckType } from '../../../../../../type/mentalHealthCheck';

export default function fetchMentalHealthChecks(
  setMentalHealthCheckLists: (mentalHealthCheckLists: MentalHealthCheckType[]) => void,
  startOfMonth: dayjs.Dayjs,
  endOfMonth: dayjs.Dayjs,
  userId?: string,
) {
  const ref = collection(db, `users/${userId}/mentalHealthChecks`)
  const q = query(ref, orderBy('createdAt', 'desc'), where('createdAt', '>=', startOfMonth.toDate()), where('createdAt', '<', endOfMonth.toDate()))
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const remoteMentalHealthCheckList: MentalHealthCheckType[] = []
    snapshot.docs.forEach((doc) => {
      const { answers, evaluation, scoreA, scoreB, createdAt } = doc.data();
      // Timestampをdayjsオブジェクトに変換
      const createdAtDayjs = createdAt ? dayjs(createdAt.toDate()) : dayjs();
      remoteMentalHealthCheckList.push({
        id: doc.id,
        answers,
        evaluation,
        scoreA,
        scoreB,
        createdAt: createdAtDayjs
      })
    })
    setMentalHealthCheckLists(remoteMentalHealthCheckList)
  })
  return unsubscribe;
}