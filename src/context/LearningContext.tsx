import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import type {
  LearningPath,
  Subject,
  Topic,
  ResourceItem,
  NoteItem,
  QuestionItem,
  QuestionAttempt,
  ProjectItem,
  StudySessionLog,
  UserProfile,
  Difficulty,
  PracticeMode,
} from '../types';
import {
  INITIAL_LEARNING_PATHS,
  INITIAL_RESOURCES,
  INITIAL_NOTES,
  INITIAL_QUESTIONS,
  INITIAL_PROJECTS,
} from '../data/initialData';
import {
  auth,
  db,
  signInWithGoogle,
  logOut,
  testConnection,
  handleFirestoreError,
  OperationType,
} from '../services/firebase';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, onSnapshot, query } from 'firebase/firestore';

interface LearningContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  isAuthLoading: boolean;
  learningPaths: LearningPath[];
  activePath: LearningPath | null;
  activeTopic: Topic | null;
  resources: ResourceItem[];
  notes: NoteItem[];
  questions: QuestionItem[];
  attempts: QuestionAttempt[];
  projects: ProjectItem[];
  studySessions: StudySessionLog[];
  stats: {
    totalStudyMinutes: number;
    overallMastery: number;
    masteredTopicsCount: number;
    streakDays: number;
    weakTopics: Topic[];
    dueRevisionTopics: Topic[];
    strongTopics: Topic[];
  };
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  setActivePathId: (pathId: string) => void;
  setActiveTopicId: (topicId: string | null) => void;
  createLearningPath: (newPath: LearningPath) => Promise<void>;
  updateTopicMastery: (topicId: string, scoreDelta: number) => void;
  recordQuestionAttempt: (attempt: Omit<QuestionAttempt, 'id' | 'createdAt'>) => void;
  addResource: (resource: Omit<ResourceItem, 'id' | 'createdAt'>) => void;
  addNote: (note: Omit<NoteItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, updates: Partial<NoteItem>) => void;
  addQuestion: (question: Omit<QuestionItem, 'id' | 'createdAt'>) => void;
  addProject: (project: Omit<ProjectItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProjectTask: (projectId: string, taskId: string, completed: boolean) => void;
  logStudySession: (session: Omit<StudySessionLog, 'id' | 'createdAt'>) => void;
}

const LearningContext = createContext<LearningContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PATHS: 'nexus_learning_paths_v2',
  ACTIVE_PATH_ID: 'nexus_active_path_id_v2',
  RESOURCES: 'nexus_resources_v2',
  NOTES: 'nexus_notes_v2',
  QUESTIONS: 'nexus_questions_v2',
  ATTEMPTS: 'nexus_attempts_v2',
  PROJECTS: 'nexus_projects_v2',
  SESSIONS: 'nexus_sessions_v2',
};

export const LearningProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Core State with Local Storage fallback for PWA instant offline capability
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PATHS);
      return saved ? JSON.parse(saved) : INITIAL_LEARNING_PATHS;
    } catch {
      return INITIAL_LEARNING_PATHS;
    }
  });

  const [activePathId, setActivePathIdState] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.ACTIVE_PATH_ID) || 'path-fullstack';
    } catch {
      return 'path-fullstack';
    }
  });

  const [activeTopicId, setActiveTopicId] = useState<string | null>('top-eventloop-1');

  const [resources, setResources] = useState<ResourceItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RESOURCES);
      return saved ? JSON.parse(saved) : INITIAL_RESOURCES;
    } catch {
      return INITIAL_RESOURCES;
    }
  });

  const [notes, setNotes] = useState<NoteItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTES);
      return saved ? JSON.parse(saved) : INITIAL_NOTES;
    } catch {
      return INITIAL_NOTES;
    }
  });

  const [questions, setQuestions] = useState<QuestionItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
      return saved ? JSON.parse(saved) : INITIAL_QUESTIONS;
    } catch {
      return INITIAL_QUESTIONS;
    }
  });

  const [attempts, setAttempts] = useState<QuestionAttempt[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ATTEMPTS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [projects, setProjects] = useState<ProjectItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
    } catch {
      return INITIAL_PROJECTS;
    }
  });

  const [studySessions, setStudySessions] = useState<StudySessionLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Test Firebase on load
  useEffect(() => {
    testConnection();
  }, []);

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);

      if (currentUser) {
        // Fetch or create user profile
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            setUserProfile(snap.data() as UserProfile);
          } else {
            const newProfile: UserProfile = {
              userId: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || 'Learner',
              photoURL: currentUser.photoURL || undefined,
              selectedGoals: ['Software Engineering', 'AI & Robotics'],
              level: 'intermediate',
              dailyGoalMinutes: 45,
              streakDays: 3,
              lastActiveDate: new Date().toISOString(),
              createdAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, newProfile);
            setUserProfile(newProfile);
          }
        } catch (err) {
          console.error('Failed to sync user profile:', err);
        }
      } else {
        setUserProfile(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync state to LocalStorage for offline PWA
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PATHS, JSON.stringify(learningPaths));
  }, [learningPaths]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PATH_ID, activePathId);
  }, [activePathId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RESOURCES, JSON.stringify(resources));
  }, [resources]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(attempts));
  }, [attempts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(studySessions));
  }, [studySessions]);

  // Active path and active topic resolution
  const activePath = useMemo(() => {
    return learningPaths.find((p) => p.id === activePathId) || learningPaths[0] || null;
  }, [learningPaths, activePathId]);

  const activeTopic = useMemo(() => {
    if (!activePath?.subjects) return null;
    for (const sub of activePath.subjects) {
      if (sub.topics) {
        const found = sub.topics.find((t) => t.id === activeTopicId);
        if (found) return found;
      }
    }
    return activePath.subjects[0]?.topics?.[0] || null;
  }, [activePath, activeTopicId]);

  // Derived Analytics & Mastery Statistics
  const stats = useMemo(() => {
    let totalMinutes = studySessions.reduce((acc, s) => acc + s.durationMinutes, 0) + 145; // baseline seed
    const allTopics: Topic[] = [];

    if (activePath?.subjects) {
      for (const sub of activePath.subjects) {
        if (sub.topics) {
          allTopics.push(...sub.topics);
        }
      }
    }

    const totalTopics = allTopics.length || 1;
    const totalMasteryScore = allTopics.reduce((acc, t) => acc + (t.masteryScore || 0), 0);
    const overallMastery = Math.round(totalMasteryScore / totalTopics);
    const masteredTopicsCount = allTopics.filter((t) => t.masteryScore >= 80).length;

    const weakTopics = allTopics.filter((t) => t.masteryScore < 60);
    const dueRevisionTopics = allTopics.filter(
      (t) => t.status === 'revision_due' || (t.masteryScore > 40 && t.masteryScore < 75)
    );
    const strongTopics = allTopics.filter((t) => t.masteryScore >= 75);

    return {
      totalStudyMinutes: totalMinutes,
      overallMastery,
      masteredTopicsCount,
      streakDays: 4,
      weakTopics,
      dueRevisionTopics,
      strongTopics,
    };
  }, [activePath, studySessions]);

  const loginWithGoogle = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  const logout = async () => {
    try {
      await logOut();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const setActivePathId = (pathId: string) => {
    setActivePathIdState(pathId);
    const foundPath = learningPaths.find((p) => p.id === pathId);
    if (foundPath?.subjects?.[0]?.topics?.[0]) {
      setActiveTopicId(foundPath.subjects[0].topics[0].id);
    }
  };

  const createLearningPath = async (newPath: LearningPath) => {
    setLearningPaths((prev) => [newPath, ...prev]);
    setActivePathIdState(newPath.id);
    if (newPath.subjects?.[0]?.topics?.[0]) {
      setActiveTopicId(newPath.subjects[0].topics[0].id);
    }

    // If authenticated, persist to Firestore
    if (user) {
      try {
        const pathRef = doc(db, 'users', user.uid, 'learningPaths', newPath.id);
        await setDoc(pathRef, {
          id: newPath.id,
          userId: user.uid,
          title: newPath.title,
          domain: newPath.domain,
          goal: newPath.goal,
          totalHoursEstimate: newPath.totalHoursEstimate,
          level: newPath.level,
          status: newPath.status,
          createdAt: newPath.createdAt,
          updatedAt: newPath.updatedAt,
        });
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}/learningPaths/${newPath.id}`);
      }
    }
  };

  const updateTopicMastery = (topicId: string, delta: number) => {
    setLearningPaths((prevPaths) =>
      prevPaths.map((path) => {
        if (!path.subjects) return path;
        return {
          ...path,
          subjects: path.subjects.map((sub) => {
            if (!sub.topics) return sub;
            return {
              ...sub,
              topics: sub.topics.map((t) => {
                if (t.id !== topicId) return t;
                const newScore = Math.min(100, Math.max(0, (t.masteryScore || 0) + delta));
                const newStatus =
                  newScore >= 80 ? 'mastered' : newScore >= 40 ? 'in_progress' : 'not_started';
                return {
                  ...t,
                  masteryScore: newScore,
                  status: newStatus,
                  lastPracticedAt: new Date().toISOString(),
                };
              }),
            };
          }),
        };
      })
    );
  };

  const recordQuestionAttempt = (attempt: Omit<QuestionAttempt, 'id' | 'createdAt'>) => {
    const newAttempt: QuestionAttempt = {
      ...attempt,
      id: `att-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setAttempts((prev) => [newAttempt, ...prev]);

    // Adapt mastery score based on correctness
    if (attempt.topicId) {
      updateTopicMastery(attempt.topicId, attempt.isCorrect ? +8 : -5);
    }
  };

  const addResource = (resData: Omit<ResourceItem, 'id' | 'createdAt'>) => {
    const newRes: ResourceItem = {
      ...resData,
      id: `res-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setResources((prev) => [newRes, ...prev]);
  };

  const addNote = (noteData: Omit<NoteItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNote: NoteItem = {
      ...noteData,
      id: `note-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes((prev) => [newNote, ...prev]);
  };

  const updateNote = (id: string, updates: Partial<NoteItem>) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n))
    );
  };

  const addQuestion = (qData: Omit<QuestionItem, 'id' | 'createdAt'>) => {
    const newQ: QuestionItem = {
      ...qData,
      id: `q-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setQuestions((prev) => [newQ, ...prev]);
  };

  const addProject = (projData: Omit<ProjectItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newP: ProjectItem = {
      ...projData,
      id: `proj-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProjects((prev) => [newP, ...prev]);
  };

  const updateProjectTask = (projectId: string, taskId: string, completed: boolean) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const updatedTasks = p.tasks.map((t) => (t.id === taskId ? { ...t, completed } : t));
        const completedCount = updatedTasks.filter((t) => t.completed).length;
        const progress = Math.round((completedCount / (updatedTasks.length || 1)) * 100);
        return {
          ...p,
          tasks: updatedTasks,
          progress,
          status: progress === 100 ? 'completed' : 'in_progress',
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const logStudySession = (sessionData: Omit<StudySessionLog, 'id' | 'createdAt'>) => {
    const newSession: StudySessionLog = {
      ...sessionData,
      id: `sess-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setStudySessions((prev) => [newSession, ...prev]);
  };

  return (
    <LearningContext.Provider
      value={{
        user,
        userProfile,
        isAuthLoading,
        learningPaths,
        activePath,
        activeTopic,
        resources,
        notes,
        questions,
        attempts,
        projects,
        studySessions,
        stats,
        loginWithGoogle,
        logout,
        setActivePathId,
        setActiveTopicId,
        createLearningPath,
        updateTopicMastery,
        recordQuestionAttempt,
        addResource,
        addNote,
        updateNote,
        addQuestion,
        addProject,
        updateProjectTask,
        logStudySession,
      }}
    >
      {children}
    </LearningContext.Provider>
  );
};

export const useLearning = () => {
  const context = useContext(LearningContext);
  if (!context) {
    throw new Error('useLearning must be used within a LearningProvider');
  }
  return context;
};
