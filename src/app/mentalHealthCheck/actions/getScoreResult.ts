export default function getScoreResult(pageQuestionCount: number, answers: (number | null)[]) {
  const page1QuestionsCount = pageQuestionCount;
  const page1Answers = answers.slice(0, page1QuestionsCount);
  const page2And3Answers = answers.slice(page1QuestionsCount);

  const ScoreA = page1Answers.reduce<number>((sum, val) => sum + (val ?? 0), 0);
  const ScoreB = page2And3Answers.reduce<number>((sum, val) => sum + (val ?? 0), 0);
  return { ScoreA, ScoreB };
}