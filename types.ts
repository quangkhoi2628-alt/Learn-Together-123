import type { ReactElement } from 'react';

export type Subject = "Toán" | "Ngữ Văn" | "Tiếng Việt" | "Tiếng Anh" | "Khoa học tự nhiên" | "Khoa học" | "Bài tập PDF" | "Bài tập Ảnh";

export type Grade = 9;

// FIX: Moved BookSeries type definition here to break a circular dependency between types.ts and constants.ts.
export type BookSeries = "Chân trời sáng tạo" | "Kết nối tri thức" | "Cánh diều" | "Family and Friends";

export interface NavItem {
  name: string;
  icon: ReactElement<{ className?: string }>;
  view: string;
}

export interface Flashcard {
  question: string;
  answer: string;
}

export interface AITutorMessage {
  role: 'user' | 'model';
  text: string;
  imageUrl?: string;
}

export interface AITutorSession {
  id: string;
  timestamp: number;
  title: string;
  messages: AITutorMessage[];
}

export interface PracticeQuestion {
  subject: Subject;
  question: string;
  options: string[];
  correctAnswer: string;
  topic: string;
  grade: Grade;
}

export interface OpenEndedQuestion {
  question: string;
  suggestedAnswer: string;
  topic: string;
}

export interface OpenEndedFeedback {
  score: number;
  feedback: string;
  strengths: string;
  weaknesses: string[];
  suggestedImprovements: string;
}

export interface User {
  name: string;
  email: string;
  school: string;
  grade: Grade;
  dob?: string;
  // FIX: Add optional communityDisplayName to the User type.
  communityDisplayName?: string;
}

export interface PracticeAttempt {
  title: string;
  subject: Subject;
  questions: PracticeQuestion[];
  answers: { [key: number]: string };
  score: number;
  total: number;
  timestamp: number;
  explanations: { [key: number]: string };
}

// History Item Types
export interface SolutionHistoryItem {
  type: 'solution-pdf' | 'solution-image';
  fileName: string;
  timestamp: number;
}

export interface AIToolHistoryItem {
  type: 'flashcards' | 'summary';
  sourceTextSnippet: string;
  timestamp: number;
}

export type ExamPeriod = 'midterm1' | 'final1' | 'midterm2' | 'final2';

export interface MockExam {
    id: string;
    title: string;
    source: string;
    type?: 'mcq';
    questions: PracticeQuestion[];
}

export interface MockExamOpenEnded {
    id: string;
    title: string;
    source: string;
    type: 'open-ended';
    questions: OpenEndedQuestion[];
}

export type AnyMockExam = MockExam | MockExamOpenEnded;


// FIX: Add Community related types required by CommunityView.tsx.
export interface CommunityAttachment {
  name: string;
  type: 'image' | 'file';
  dataUrl?: string;
}

export interface CommunityAnswer {
  id: string;
  questionId: string;
  authorId: string;
  authorDisplayName: string;
  content: string;
  timestamp: number;
  likes: string[];
}

export interface CommunityQuestion {
  id: string;
  authorId: string;
  authorDisplayName: string;
  timestamp: number;
  title: string;
  content: string;
  subject: Subject;
  isAnonymous: boolean;
  attachments: CommunityAttachment[];
  likes: string[];
  answers: CommunityAnswer[];
}

export interface StudyPlanSession {
  subject: Subject | string;
  topic: string;
  activity: string;
}

export interface StudyDay {
  day: number;
  morning: StudyPlanSession;
  evening: StudyPlanSession;
}

export interface PlanPracticeRequest {
    subject: Subject;
    topic: string;
    numMcq: number;
    numOpenEnded: number;
}

export interface StudyDayItem {
  dayOfWeek: string;
  morning: StudyPlanSession | null;
  evening: StudyPlanSession | null;
}

export type WeeklyPlan = StudyDayItem[];