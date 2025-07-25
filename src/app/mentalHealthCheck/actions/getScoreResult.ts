export default function getScoreResult(pageQuestionCount: number, answers: (number | null)[]) {
  const page1QuestionsCount = pageQuestionCount;
  const page1Answers = answers.slice(0, page1QuestionsCount);
  const page2And3Answers = answers.slice(page1QuestionsCount);

  const scoreA = page1Answers.reduce<number>((sum, val) => sum + (val ?? 0), 0);
  const scoreB = page2And3Answers.reduce<number>((sum, val) => sum + (val ?? 0), 0);
  let evaluation = '';
  if (scoreA >= 31 && scoreB <= 38 || scoreA >= 23 && scoreB >= 39) {
    evaluation = '要治療';
  } else if (scoreA <= 15 && scoreB <= 38) {
    evaluation = '異常なし';
  } else {
    evaluation = '要経過観察';
  }
  return { scoreA, scoreB, evaluation };
}