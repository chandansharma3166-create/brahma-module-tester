export interface Question {
  id: number;
  question: string;
  options: string[];
  correctOption?: number; // 1, 2, 3, or 4
}

export type QuestionStatus = 'not_visited' | 'not_answered' | 'answered' | 'marked_for_review';

export interface TestSettings {
  title: string;
  durationMinutes: number;
  correctMarks: number;
  negativeMarks: number;
  unattemptedMarks: number;
  totalQuestionLimit?: number;
}

export interface TestResult {
  id: string;
  testTitle: string;
  date: string;
  timestamp: number;
  score: number;
  maxScore: number;
  accuracy: number;
  totalQuestions: number;
  correct: number;
  incorrect: number;
  unattempted: number;
  timeTakenSeconds: number;
  // Stored for reattempting and deep analytics
  questionsSnapshot?: Question[];
  settingsSnapshot?: TestSettings;
}

export interface BookmarkedQuestion {
  id: string; // unique bookmark id
  testTitle: string;
  question: Question;
  bookmarkedDate: string;
}