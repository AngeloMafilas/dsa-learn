import { initializeApp } from 'firebase/app';
import { 
  getAuth, GoogleAuthProvider, signInWithPopup, signOut, User as FirebaseUser,
  signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile as updateAuthProfile 
} from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, getDocs, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile, Submission, Difficulty } from '../types';

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth();

// Test Connection on Startup
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

// OperationType mapping for strict error specifications
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

// Global Firebase Error boundary handler
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Default initial profile for Alex Rivera to make the dashboard look stunning immediately
const DEFAULT_USER_UID = 'alex-rivera-default-uid';

const initialHeatmap = (): Record<string, number> => {
  const data: Record<string, number> = {};
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const rand = Math.random();
    if (rand > 0.85) {
      data[dateStr] = Math.floor(Math.random() * 5) + 1;
    } else if (rand > 0.7) {
      data[dateStr] = 1;
    }
  }
  return data;
};

const DEFAULT_PROFILE: UserProfile = {
  uid: DEFAULT_USER_UID,
  email: 'alex.rivera@algocode.io',
  displayName: 'Alex Rivera',
  photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
  rank: 24102,
  solvedCount: {
    Easy: 50,
    Medium: 60,
    Hard: 14,
  },
  totalSolved: 124,
  streak: 42,
  topicMastery: {
    'Array': 85,
    'String': 74,
    'Hash Table': 90,
    'Dynamic Programming': 60,
    'Math': 68,
    'Sorting': 80,
    'Stack': 45,
    'Two Pointers': 72
  },
  heatmapData: initialHeatmap()
};

const INITIAL_SUBMISSIONS: Submission[] = [
  {
    id: 'sub-1',
    userId: DEFAULT_USER_UID,
    problemId: 'two-sum',
    problemTitle: 'Two Sum',
    difficulty: 'Easy',
    language: 'python',
    code: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        hash_map = {}
        for i, num in enumerate(nums):
            complement = target - num
            if complement in hash_map:
                return [hash_map[complement], i]
            hash_map[num] = i
        return []`,
    status: 'Accepted',
    runtime: '32 ms',
    memory: '15.2 MB',
    beatsRuntimePercent: 94.2,
    beatsMemoryPercent: 88.6,
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'sub-2',
    userId: DEFAULT_USER_UID,
    problemId: 'two-sum',
    problemTitle: 'Two Sum',
    difficulty: 'Easy',
    language: 'javascript',
    code: `var twoSum = function(nums, target) {
    for (let i = 0; i < nums.length; i++) {
        for (let j = i + 1; j < nums.length; j++) {
            if (nums[i] + nums[j] === target) {
                return [i, j];
            }
        }
    }
};`,
    status: 'Wrong Answer',
    runtime: '84 ms',
    memory: '42.1 MB',
    beatsRuntimePercent: 12.4,
    beatsMemoryPercent: 15.2,
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    failedTestCase: {
      input: '[3,3]\n6',
      expected: '[0,1]',
      actual: 'undefined'
    }
  },
  {
    id: 'sub-3',
    userId: DEFAULT_USER_UID,
    problemId: 'valid-parentheses',
    problemTitle: 'Valid Parentheses',
    difficulty: 'Easy',
    language: 'python',
    code: `class Solution:
    def isValid(self, s: str) -> bool:
        stack = []
        mapping = {")": "(", "}": "{", "]": "["}
        for char in s:
            if char in mapping:
                top_element = stack.pop() if stack else '#'
                if mapping[char] != top_element:
                    return False
            else:
                stack.append(char)
        return not stack`,
    status: 'Accepted',
    runtime: '28 ms',
    memory: '14.8 MB',
    beatsRuntimePercent: 96.8,
    beatsMemoryPercent: 91.2,
    timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
  }
];

class DatabaseService {
  private currentProfile: UserProfile;
  private submissions: Submission[];
  private solvedProblemIds: Set<string>;
  private listeners: Array<() => void> = [];

  constructor() {
    // 1. Load initial memory states
    this.currentProfile = { ...DEFAULT_PROFILE };
    this.submissions = [...INITIAL_SUBMISSIONS];
    this.solvedProblemIds = new Set(['two-sum', 'valid-parentheses']);

    // Try loading guest local profiles if already saved before authentication
    const storedProfile = localStorage.getItem('algocode_user_profile');
    const storedSubmissions = localStorage.getItem('algocode_submissions');
    const storedSolved = localStorage.getItem('algocode_solved_ids');

    if (storedProfile) {
      try { this.currentProfile = JSON.parse(storedProfile); } catch (e) {}
    }
    if (storedSubmissions) {
      try { this.submissions = JSON.parse(storedSubmissions); } catch (e) {}
    }
    if (storedSolved) {
      try { this.solvedProblemIds = new Set(JSON.parse(storedSolved)); } catch (e) {}
    }

    // Bind Auth status dynamically
    auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        await this.syncAuthUser(firebaseUser);
      } else {
        this.revertToGuest();
      }
      this.notify();
    });
  }

  // Handle subscriber notifications
  public subscribe(cb: () => void) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  private notify() {
    this.listeners.forEach(cb => cb());
  }

  // Sync a newly authenticated user with firestore or create missing db references
  private async syncAuthUser(firebaseUser: FirebaseUser) {
    const profilePath = `profiles/${firebaseUser.uid}`;
    try {
      const docSnap = await getDoc(doc(db, 'profiles', firebaseUser.uid));
      if (docSnap.exists()) {
        this.currentProfile = docSnap.data() as UserProfile;
      } else {
        // Construct new developer stats profile
        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'AlgoCoder',
          photoURL: firebaseUser.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(firebaseUser.displayName || 'AlgoCoder')}`,
          rank: 98412,
          solvedCount: { Easy: 0, Medium: 0, Hard: 0 },
          totalSolved: 0,
          streak: 1,
          topicMastery: {
            'Array': 0, 'String': 0, 'Hash Table': 0, 'Dynamic Programming': 0, 
            'Math': 0, 'Sorting': 0, 'Stack': 0, 'Two Pointers': 0
          },
          heatmapData: {}
        };
        await setDoc(doc(db, 'profiles', firebaseUser.uid), newProfile);
        this.currentProfile = newProfile;
      }

      // Read historic submissions for this user from Submissions subcollection
      const subColPath = `profiles/${firebaseUser.uid}/submissions`;
      const querySnap = await getDocs(collection(db, 'profiles', firebaseUser.uid, 'submissions'));
      const activeSubs: Submission[] = [];
      const solvedIds = new Set<string>();

      querySnap.forEach((docSnap) => {
        const sub = docSnap.data() as Submission;
        activeSubs.push(sub);
        if (sub.status === 'Accepted') {
          solvedIds.add(sub.problemId);
        }
      });

      // Sort with latest on top
      activeSubs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      this.submissions = activeSubs;
      this.solvedProblemIds = solvedIds;

      // Sync local storage so synchronous operations remain fast
      localStorage.setItem('algocode_user_profile', JSON.stringify(this.currentProfile));
      localStorage.setItem('algocode_submissions', JSON.stringify(this.submissions));
      localStorage.setItem('algocode_solved_ids', JSON.stringify(Array.from(this.solvedProblemIds)));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, profilePath);
    }
  }

  private revertToGuest() {
    this.currentProfile = { ...DEFAULT_PROFILE };
    this.submissions = [...INITIAL_SUBMISSIONS];
    this.solvedProblemIds = new Set(['two-sum', 'valid-parentheses']);

    localStorage.setItem('algocode_user_profile', JSON.stringify(this.currentProfile));
    localStorage.setItem('algocode_submissions', JSON.stringify(this.submissions));
    localStorage.setItem('algocode_solved_ids', JSON.stringify(Array.from(this.solvedProblemIds)));
  }

  // Public methods mapping
  public getProfile(): UserProfile {
    return this.currentProfile;
  }

  public async updateProfile(updated: Partial<UserProfile>): Promise<UserProfile> {
    this.currentProfile = { ...this.currentProfile, ...updated };
    localStorage.setItem('algocode_user_profile', JSON.stringify(this.currentProfile));

    if (auth.currentUser && this.currentProfile.uid !== DEFAULT_USER_UID) {
      const profilePath = `profiles/${auth.currentUser.uid}`;
      try {
        await updateDoc(doc(db, 'profiles', auth.currentUser.uid), updated);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, profilePath);
      }
    }
    this.notify();
    return this.currentProfile;
  }

  // Actual Google Sign-In Trigger
  public async loginWithGoogle(): Promise<UserProfile> {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      const result = await signInWithPopup(auth, provider);
      await this.syncAuthUser(result.user);
      this.notify();
      return this.currentProfile;
    } catch (e) {
      console.error("Google Authentication popped-up failed: ", e);
      throw e;
    }
  }

  // Actual Secure Email/Password SignUp
  public async registerWithEmailAndPassword(email: string, password: string, displayName: string): Promise<UserProfile> {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      // Wait for auth presentation update
      await updateAuthProfile(result.user, { displayName });
      // Sync auth user document to Firestore
      await this.syncAuthUser(result.user);
      this.notify();
      return this.currentProfile;
    } catch (e) {
      console.error("Firebase Email SignUp failed: ", e);
      throw e;
    }
  }

  // Actual Secure Email/Password Login
  public async loginWithEmailAndPassword(email: string, password: string): Promise<UserProfile> {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      // Sync auth user document to Firestore
      await this.syncAuthUser(result.user);
      this.notify();
      return this.currentProfile;
    } catch (e) {
      console.error("Firebase Email Login failed: ", e);
      throw e;
    }
  }

  // Fallback for custom text-based login simulators so older elements don't fail
  public loginUser(email: string, displayName: string, photoURL?: string): UserProfile {
    // We update current profile directly for prompt fallback
    this.currentProfile = {
      ...this.currentProfile,
      uid: auth.currentUser?.uid || `user_${Date.now()}`,
      email: email.trim(),
      displayName: displayName || email.split('@')[0],
      photoURL: photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(displayName)}`,
    };
    localStorage.setItem('algocode_user_profile', JSON.stringify(this.currentProfile));
    this.notify();
    return this.currentProfile;
  }

  public async logoutUser(): Promise<void> {
    if (auth.currentUser) {
      await signOut(auth);
    } else {
      this.revertToGuest();
      this.notify();
    }
  }

  // Submissions and validation checks
  public getSubmissions(problemId?: string): Submission[] {
    if (problemId) {
      return this.submissions.filter(s => s.problemId === problemId);
    }
    return this.submissions;
  }

  public isProblemSolved(problemId: string): boolean {
    return this.solvedProblemIds.has(problemId);
  }

  public async saveSubmission(
    problemId: string,
    problemTitle: string,
    difficulty: Difficulty,
    language: string,
    code: string,
    status: Submission['status'],
    runtime: string,
    memory: string,
    stdout?: string,
    errorDetails?: string,
    failedTestCase?: Submission['failedTestCase']
  ): Promise<Submission> {
    const beatsRuntimePercent = Math.round((70 + Math.random() * 28) * 10) / 10;
    const beatsMemoryPercent = Math.round((60 + Math.random() * 38) * 10) / 10;

    const targetUid = auth.currentUser ? auth.currentUser.uid : DEFAULT_USER_UID;
    const submissionId = `sub_${Date.now()}`;

    const newSub: Submission = {
      id: submissionId,
      userId: targetUid,
      problemId,
      problemTitle,
      difficulty,
      language,
      code,
      status,
      runtime,
      memory,
      stdout,
      errorDetails,
      beatsRuntimePercent: status === 'Accepted' ? beatsRuntimePercent : undefined,
      beatsMemoryPercent: status === 'Accepted' ? beatsMemoryPercent : undefined,
      timestamp: new Date().toISOString(),
      failedTestCase
    };

    // Prepend to memory
    this.submissions.unshift(newSub);

    // Update local Profile stats mapping
    const todayStr = new Date().toISOString().split('T')[0];
    const currentDayCount = this.currentProfile.heatmapData[todayStr] || 0;
    this.currentProfile.heatmapData[todayStr] = currentDayCount + 1;

    if (status === 'Accepted' && !this.solvedProblemIds.has(problemId)) {
      this.solvedProblemIds.add(problemId);
      this.currentProfile.solvedCount[difficulty] += 1;
      this.currentProfile.totalSolved += 1;

      const categories: Record<string, string> = {
        'two-sum': 'Array',
        'reverse-string': 'String',
        'palindrome-number': 'Math',
        'valid-parentheses': 'Stack',
        'longest-substring': 'String',
        'container-water': 'Two Pointers',
        'merge-intervals': 'Sorting',
        'edit-distance': 'Dynamic Programming'
      };

      const category = categories[problemId] || 'Array';
      const currentMastery = this.currentProfile.topicMastery[category] || 0;
      this.currentProfile.topicMastery[category] = Math.min(100, currentMastery + 12);
      this.currentProfile.rank = Math.max(1, this.currentProfile.rank - Math.floor(Math.random() * 150) - 50);
    }

    // Sync localStorage
    localStorage.setItem('algocode_user_profile', JSON.stringify(this.currentProfile));
    localStorage.setItem('algocode_submissions', JSON.stringify(this.submissions));
    localStorage.setItem('algocode_solved_ids', JSON.stringify(Array.from(this.solvedProblemIds)));

    // Cloud persistence if authenticated
    if (auth.currentUser && targetUid !== DEFAULT_USER_UID) {
      const submissionPath = `profiles/${auth.currentUser.uid}/submissions/${submissionId}`;
      const profilePath = `profiles/${auth.currentUser.uid}`;
      try {
        await setDoc(doc(db, 'profiles', auth.currentUser.uid, 'submissions', submissionId), newSub);
        await setDoc(doc(db, 'profiles', auth.currentUser.uid), this.currentProfile);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, submissionPath);
      }
    }

    this.notify();
    return newSub;
  }

  // Load dynamic leaderboard profiles from Firestore collection
  public async getLeaderboardUsers(): Promise<UserProfile[]> {
    try {
      const querySnap = await getDocs(collection(db, 'profiles'));
      const activeList: UserProfile[] = [];
      querySnap.forEach((docSnap) => {
        const u = docSnap.data() as UserProfile;
        if (u && u.uid) {
          activeList.push(u);
        }
      });
      return activeList;
    } catch (e) {
      console.warn("Using offline user index for leadership ranking grids:", e);
      return [];
    }
  }
}

export const dbService = new DatabaseService();
