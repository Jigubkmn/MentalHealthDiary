export const feelings = [
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  { name: '絶好調', image: require('../../../assets/images/excellent_icon.png'), score: 10 },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  { name: '好調', image: require('../../../assets/images/good_icon.png'), score: 5 },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  { name: '普通', image: require('../../../assets/images/normal_icon.png'), score: 0 },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  { name: '不調', image: require('../../../assets/images/bad_icon.png'), score: -5 },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  { name: '絶不調', image: require('../../../assets/images/terrible_icon.png'), score: -10 },
];
export default feelings;