export const pageConfig = [
  {
    questionGroupHeader: '<設問A>',
    header: '最近1ヶ月のあなたの状態についてうかがいます。\n最もあてはまるものを解答してください。',
    questionCount: 11,
    answerOptions: [
      { text: 'ほとんどなかった', value: 1 },
      { text: 'ときどきあった', value: 2 },
      { text: 'しばしばあった', value: 3 },
      { text: 'ほとんどいつもあった', value: 4 },
    ],
  },
  {
    questionGroupHeader: '<設問B-1>',
    header: 'あなたの仕事について伺います。\n最もあてはまるものを解答してください。',
    questionCount: 6,
    answerOptions: [
      { text: 'ちがう', value: 1 },
      { text: 'ややちがう', value: 2 },
      { text: 'まあそうだ', value: 3 },
      { text: 'そうだ', value: 4 },
    ],
  },
  {
    questionGroupHeader: '<設問B-2>',
    header: 'あなたの上司と同僚について伺います。\n最もあてはまるものを解答してください。',
    questionCount: 6,
    answerOptions: [
      { text: '全くない', value: 1 },
      { text: '多少', value: 2 },
      { text: 'かなり', value: 3 },
      { text: '非常に', value: 4 },
    ],
  },
];

export default pageConfig;