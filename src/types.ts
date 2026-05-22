export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Example {
  id: number;
  input: string;
  output: string;
  explanation?: string;
}

export interface TestCase {
  id: number;
  input: string;
  expectedOutput: string;
}

export interface Problem {
  id: string;
  title: string;
  difficulty: Difficulty;
  category: string;
  description: string;
  constraints: string[];
  examples: Example[];
  testCases: TestCase[];
  acceptanceRate: string;
  frequencyProgress: number; // 0 to 100 for visual bars
  solvedByUser?: boolean;
}

export interface Submission {
  id: string;
  userId: string;
  problemId: string;
  problemTitle: string;
  difficulty: Difficulty;
  language: string;
  code: string;
  status: 'Accepted' | 'Wrong Answer' | 'Compile Error' | 'Time Limit Exceeded' | 'Runtime Error';
  runtime: string; // e.g. "45 ms"
  memory: string;  // e.g. "16.4 MB"
  timestamp: string; // ISO String
  stdout?: string;
  errorDetails?: string;
  beatsRuntimePercent?: number; // e.g. 91.2
  beatsMemoryPercent?: number;  // e.g. 84.5
  failedTestCase?: {
    input: string;
    expected: string;
    actual: string;
  };
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  rank: number;
  solvedCount: {
    Easy: number;
    Medium: number;
    Hard: number;
  };
  totalSolved: number;
  streak: number;
  lastActiveDate?: string;
  topicMastery: {
    [topic: string]: number; // 0 - 100 representing percentage mastery
  };
  heatmapData: {
    [dateStr: string]: number; // e.g. '2026-05-22': 5 (number of submissions on that day)
  };
}
