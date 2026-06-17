import { initializeApp } from 'firebase/app';
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signOut, User as FirebaseUser,
  signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile as updateAuthProfile
} from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { UserProfile, Submission, Difficulty } from '../types';

// ✅ Hardcoded config — no firestoreDatabaseId (was causing undefined db ID)
const firebaseConfig = {
  projectId: "dsa-learn-47",
  appId: "1:513888527879:web:73eccbabf3938211536ca2",
  apiKey: "AIzaSyDoMXwMwc03Bh9o8YZ0k5c_iXSN6X9WTjU",
  authDomain: "dsa-learn-47.firebaseapp.com",
  storageBucket: "dsa-learn-47.firebasestorage.app",
  messagingSenderId: "513888527879",
  measurementId: "G-BGVR471G65",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);          // ✅ pass app
export const db = getFirestore(app);       // ✅ no extra undefined arg

export enum OperationType {
  CREATE = 'create', UPDATE = 'update', DELETE = 'delete',
  LIST = 'list', GET = 'get', WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(p => ({ providerId: p.providerId, email: p.email })) || []
    },
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const DEFAULT_USER_UID = 'alex-rivera-default-uid';

const initialHeatmap = (): Record<string, number> => {
  const data: Record<string, number> = {};
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const rand = Math.random();
    if (rand > 0.85) data[dateStr] = Math.floor(Math.random() * 5) + 1;
    else if (rand > 0.7) data[dateStr] = 1;
  }
  return data;
};

const DEFAULT_PROFILE: UserProfile = {
  uid: DEFAULT_USER_UID,
  email: 'alex.rivera@algocode.io',
  displayName: 'Alex Rivera',
  photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
  rank: 24102,
  solvedCount: { Easy: 50, Medium: 60, Hard: 14 },
  totalSolved: 124,
  streak: 42,
  topicMastery: {
    'Array': 85, 'String': 74, 'Hash Table': 90, 'Dynamic Programming': 60,
    'Math': 68, 'Sorting': 80, 'Stack': 45, 'Two Pointers': 72
  },
  heatmapData: initialHeatmap()
};

const INITIAL_SUBMISSIONS: Submission[] = [
  {
    id: 'sub-1', userId: DEFAULT_USER_UID, problemId: 'two-sum', problemTitle: 'Two Sum',
    difficulty: 'Easy', language: 'python',
    code: `class Solution:\n    def twoSum(self, nums, target):\n        h = {}\n        for i, n in enumerate(nums):\n            if target - n in h: return [h[target-n], i]\n            h[n] = i`,
    status: 'Accepted', runtime: '32 ms', memory: '15.2 MB',
    beatsRuntimePercent: 94.2, beatsMemoryPercent: 88.6,
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'sub-3', userId: DEFAULT_USER_UID, problemId: 'valid-parentheses', problemTitle: 'Valid Parentheses',
    difficulty: 'Easy', language: 'python',
    code: `class Solution:\n    def isValid(self, s):\n        stack, m = [], {')':'(', '}':'{', ']':'['}\n        for c in s:\n            if c in m:\n                if not stack or stack[-1] != m[c]: return False\n                stack.pop()\n            else: stack.append(c)\n        return not stack`,
    status: 'Accepted', runtime: '28 ms', memory: '14.8 MB',
    beatsRuntimePercent: 96.8, beatsMemoryPercent: 91.2,
    timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
  }
];

class DatabaseService {
  private currentProfile: UserProfile;
  private submissions: Submission[];
  private solvedProblemIds: Set<string>;
  private listeners: Array<() => void> = [];

  constructor() {
    this.currentProfile = { ...DEFAULT_PROFILE };
    this.submissions = [...INITIAL_SUBMISSIONS];
    this.solvedProblemIds = new Set(['two-sum', 'valid-parentheses']);

    const sp = localStorage.getItem('algocode_user_profile');
    const ss = localStorage.getItem('algocode_submissions');
    const sk = localStorage.getItem('algocode_solved_ids');
    if (sp) try { this.currentProfile = JSON.parse(sp); } catch { }
    if (ss) try { this.submissions = JSON.parse(ss); } catch { }
    if (sk) try { this.solvedProblemIds = new Set(JSON.parse(sk)); } catch { }

    auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        await this.syncAuthUser(firebaseUser);
      } else {
        this.revertToGuest();
      }
      this.notify();
    });
  }

  public subscribe(cb: () => void) {
    this.listeners.push(cb);
    return () => { this.listeners = this.listeners.filter(l => l !== cb); };
  }

  private notify() { this.listeners.forEach(cb => cb()); }

  private async syncAuthUser(firebaseUser: FirebaseUser) {
    const profilePath = `profiles/${firebaseUser.uid}`;
    try {
      // Retry until Firestore is online (max 5 attempts)
      let docSnap;
      for (let attempt = 1; attempt <= 5; attempt++) {
        try {
          docSnap = await getDoc(doc(db, 'profiles', firebaseUser.uid));
          break;
        } catch (err: any) {
          if (attempt === 5) throw err;
          await new Promise(r => setTimeout(r, attempt * 800));
        }
      }
      if (docSnap && docSnap.exists()) {
        this.currentProfile = docSnap.data() as UserProfile;
      } else {
        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'AlgoCoder',
          photoURL: firebaseUser.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(firebaseUser.displayName || 'AlgoCoder')}`,
          rank: 98412,
          solvedCount: { Easy: 0, Medium: 0, Hard: 0 },
          totalSolved: 0, streak: 1,
          topicMastery: {
            'Array': 0, 'String': 0, 'Hash Table': 0, 'Dynamic Programming': 0,
            'Math': 0, 'Sorting': 0, 'Stack': 0, 'Two Pointers': 0
          },
          heatmapData: {}
        };
        await setDoc(doc(db, 'profiles', firebaseUser.uid), newProfile);
        this.currentProfile = newProfile;
      }

      const querySnap = await getDocs(collection(db, 'profiles', firebaseUser.uid, 'submissions'));
      const activeSubs: Submission[] = [];
      const solvedIds = new Set<string>();
      querySnap.forEach(d => {
        const sub = d.data() as Submission;
        activeSubs.push(sub);
        if (sub.status === 'Accepted') solvedIds.add(sub.problemId);
      });
      activeSubs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      this.submissions = activeSubs;
      this.solvedProblemIds = solvedIds;

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

  public getProfile(): UserProfile { return this.currentProfile; }

  public async updateProfile(updated: Partial<UserProfile>): Promise<UserProfile> {
    this.currentProfile = { ...this.currentProfile, ...updated };
    localStorage.setItem('algocode_user_profile', JSON.stringify(this.currentProfile));
    if (auth.currentUser && this.currentProfile.uid !== DEFAULT_USER_UID) {
      try {
        await updateDoc(doc(db, 'profiles', auth.currentUser.uid), updated);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `profiles/${auth.currentUser.uid}`);
      }
    }
    this.notify();
    return this.currentProfile;
  }

  public async loginWithGoogle(): Promise<UserProfile> {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      const result = await signInWithPopup(auth, provider);
      await this.syncAuthUser(result.user);
      this.notify();
      return this.currentProfile;
    } catch (e) {
      console.error("Google sign-in failed:", e);
      throw e;
    }
  }

  public async registerWithEmailAndPassword(email: string, password: string, displayName: string): Promise<UserProfile> {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateAuthProfile(result.user, { displayName });
      await this.syncAuthUser(result.user);
      this.notify();
      return this.currentProfile;
    } catch (e) {
      console.error("Email signup failed:", e);
      throw e;
    }
  }

  public async loginWithEmailAndPassword(email: string, password: string): Promise<UserProfile> {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await this.syncAuthUser(result.user);
      this.notify();
      return this.currentProfile;
    } catch (e) {
      console.error("Email login failed:", e);
      throw e;
    }
  }

  public loginUser(email: string, displayName: string, photoURL?: string): UserProfile {
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

  public getSubmissions(problemId?: string): Submission[] {
    return problemId ? this.submissions.filter(s => s.problemId === problemId) : this.submissions;
  }

  public isProblemSolved(problemId: string): boolean {
    return this.solvedProblemIds.has(problemId);
  }

  public async saveSubmission(
    problemId: string, problemTitle: string, difficulty: Difficulty,
    language: string, code: string, status: Submission['status'],
    runtime: string, memory: string, stdout?: string,
    errorDetails?: string, failedTestCase?: Submission['failedTestCase']
  ): Promise<Submission> {
    const targetUid = auth.currentUser?.uid || DEFAULT_USER_UID;
    const submissionId = `sub_${Date.now()}`;
    const newSub: Submission = {
      id: submissionId, userId: targetUid, problemId, problemTitle, difficulty,
      language, code, status, runtime, memory, stdout, errorDetails,
      beatsRuntimePercent: status === 'Accepted' ? Math.round((70 + Math.random() * 28) * 10) / 10 : undefined,
      beatsMemoryPercent: status === 'Accepted' ? Math.round((60 + Math.random() * 38) * 10) / 10 : undefined,
      timestamp: new Date().toISOString(),
      failedTestCase
    };

    this.submissions.unshift(newSub);
    const todayStr = new Date().toISOString().split('T')[0];
    this.currentProfile.heatmapData[todayStr] = (this.currentProfile.heatmapData[todayStr] || 0) + 1;

    if (status === 'Accepted' && !this.solvedProblemIds.has(problemId)) {
      this.solvedProblemIds.add(problemId);
      this.currentProfile.solvedCount[difficulty] += 1;
      this.currentProfile.totalSolved += 1;
      const categories: Record<string, string> = {
        'two-sum': 'Array', 'reverse-string': 'String', 'palindrome-number': 'Math',
        'valid-parentheses': 'Stack', 'longest-substring': 'String',
        'container-water': 'Two Pointers', 'merge-intervals': 'Sorting', 'edit-distance': 'Dynamic Programming'
      };
      const cat = categories[problemId] || 'Array';
      this.currentProfile.topicMastery[cat] = Math.min(100, (this.currentProfile.topicMastery[cat] || 0) + 12);
      this.currentProfile.rank = Math.max(1, this.currentProfile.rank - Math.floor(Math.random() * 150) - 50);
    }

    localStorage.setItem('algocode_user_profile', JSON.stringify(this.currentProfile));
    localStorage.setItem('algocode_submissions', JSON.stringify(this.submissions));
    localStorage.setItem('algocode_solved_ids', JSON.stringify(Array.from(this.solvedProblemIds)));

    if (auth.currentUser && targetUid !== DEFAULT_USER_UID) {
      try {
        await setDoc(doc(db, 'profiles', auth.currentUser.uid, 'submissions', submissionId), newSub);
        await setDoc(doc(db, 'profiles', auth.currentUser.uid), this.currentProfile);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `profiles/${auth.currentUser.uid}/submissions/${submissionId}`);
      }
    }

    this.notify();
    return newSub;
  }

  public async getLeaderboardUsers(): Promise<UserProfile[]> {
    try {
      const querySnap = await getDocs(collection(db, 'profiles'));
      const list: UserProfile[] = [];
      querySnap.forEach(d => { const u = d.data() as UserProfile; if (u?.uid) list.push(u); });
      return list;
    } catch {
      return [];
    }
  }
}

export const dbService = new DatabaseService();