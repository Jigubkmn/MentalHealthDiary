/* eslint-env jest */

// Firebaseモジュールのモック
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({})),
}));

jest.mock('firebase/auth', () => ({
  initializeAuth: jest.fn(() => ({})),
  getReactNativePersistence: jest.fn(() => ({})),
  getAuth: jest.fn(() => ({})),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  onAuthStateChanged: jest.fn(),
  AuthError: class AuthError extends Error {},
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  getDocs: jest.fn(),
  getDoc: jest.fn(),
  collection: jest.fn(),
  collectionGroup: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  doc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  addDoc: jest.fn(),
  onSnapshot: jest.fn(),
  writeBatch: jest.fn(),
  Timestamp: {
    now: jest.fn(() => ({})),
    fromDate: jest.fn(() => ({})),
    fromMillis: jest.fn(() => ({})),
  },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

// 環境変数のモック
process.env.EXPO_PUBLIC_FB_API_KEY = 'test-api-key';
process.env.EXPO_PUBLIC_FB_AUTH_DOMAIN = 'test-auth-domain';
process.env.EXPO_PUBLIC_FB_PROJECT_ID = 'test-project-id';
process.env.EXPO_PUBLIC_FB_STORAGE_BUCKET = 'test-storage-bucket';
process.env.EXPO_PUBLIC_FB_MESSAGING_SENDER_ID = 'test-messaging-sender-id';
process.env.EXPO_PUBLIC_FB_APP_ID = 'test-app-id';