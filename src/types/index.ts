export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export type DomainType =
  | 'Software Engineering'
  | 'Cybersecurity'
  | 'AI / Machine Learning'
  | 'Robotics & Autonomous Systems'
  | 'Competitive Exams & JEE'
  | 'Mathematics & Physics'
  | 'Research & Custom';

export type QuestionType =
  | 'mcq'
  | 'multi_select'
  | 'true_false'
  | 'coding'
  | 'debugging'
  | 'short_answer'
  | 'numerical'
  | 'scenario'
  | 'viva';

export type PracticeMode =
  | 'practice'
  | 'exam'
  | 'timed'
  | 'revision'
  | 'challenge'
  | 'interview'
  | 'viva'
  | 'coding';

export type TopicStatus = 'not_started' | 'in_progress' | 'mastered' | 'revision_due';

export interface UserProfile {
  userId: string;
  email: string;
  displayName: string;
  photoURL?: string;
  selectedGoals: string[];
  activePathId?: string;
  level: Difficulty;
  dailyGoalMinutes: number;
  streakDays: number;
  lastActiveDate: string;
  createdAt: string;
}

export interface ResourceStack {
  primary: string;
  secondary: string;
  practice: string;
  project: string;
  advanced: string;
}

export interface Topic {
  id: string;
  subjectId: string;
  pathId: string;
  userId: string;
  title: string;
  description: string;
  order: number;
  difficulty: Difficulty;
  estimatedMinutes: number;
  prerequisites: string[];
  masteryScore: number; // 0 to 100
  status: TopicStatus;
  practicalRelevance?: string;
  examRelevance?: string;
  recommendedStack?: ResourceStack;
  lastPracticedAt?: string;
  revisionDueAt?: string;
}

export interface Subject {
  id: string;
  pathId: string;
  userId: string;
  title: string;
  description: string;
  order: number;
  color: string;
  masteryScore: number;
  topics?: Topic[];
}

export interface LearningPath {
  id: string;
  userId: string;
  title: string;
  domain: string;
  goal: string;
  targetDate?: string;
  totalHoursEstimate: number;
  level: Difficulty;
  syllabusRaw?: string;
  status: 'active' | 'completed' | 'paused' | 'archived';
  createdAt: string;
  updatedAt: string;
  subjects?: Subject[];
}

export interface ResourceItem {
  id: string;
  userId: string;
  pathId?: string;
  topicId?: string;
  title: string;
  type: 'pdf' | 'url' | 'video' | 'doc' | 'repo' | 'paper' | 'exercise' | 'article';
  sourceUrl?: string;
  contentSnippet?: string;
  tags: string[];
  isRequired: boolean;
  aiRecommended: boolean;
  tier?: 'primary' | 'secondary' | 'practice' | 'project' | 'advanced';
  userRating?: number;
  createdAt: string;
}

export interface NoteItem {
  id: string;
  userId: string;
  pathId?: string;
  topicId?: string;
  title: string;
  content: string;
  type: 'manual' | 'summary' | 'study_guide' | 'flashcards' | 'faq' | 'concept_map';
  sourceIds?: string[];
  isGrounded?: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface QuestionItem {
  id: string;
  userId: string;
  pathId?: string;
  topicId?: string;
  prompt: string;
  type: QuestionType;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: Difficulty;
  hint?: string;
  codeSnippet?: string;
  domain?: string;
  sourceRef?: string;
  createdAt: string;
}

export interface QuestionAttempt {
  id: string;
  userId: string;
  questionId: string;
  topicId?: string;
  pathId?: string;
  userAnswer: string;
  isCorrect: boolean;
  timeSpentSec: number;
  feedback?: string;
  createdAt: string;
}

export interface ProjectTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface ProjectItem {
  id: string;
  userId: string;
  pathId?: string;
  title: string;
  domain: string;
  description: string;
  objectives: string[];
  requirements: string[];
  neededKnowledge: string[];
  tasks: ProjectTask[];
  progress: number;
  githubUrl?: string;
  status: 'planning' | 'in_progress' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface StudySessionLog {
  id: string;
  userId: string;
  pathId?: string;
  topicId?: string;
  durationMinutes: number;
  mode: PracticeMode;
  questionsAttempted: number;
  accuracy: number;
  createdAt: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  topic: string;
  intervalDays: number;
  repetition: number;
  easeFactor: number;
  dueDate: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sourcesGrounded?: string[];
  codeBlock?: string;
  quickActions?: string[];
}
