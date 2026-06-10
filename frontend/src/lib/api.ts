const API_BASE_URL = 'http://localhost:3001/api';

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  const headers = new Headers(options.headers);
  
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

export const authAPI = {
  login: (email: string, password: string) => 
    fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  
  register: (data: { email: string; username: string; password: string; native_language: string; target_language: string }) => 
    fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  sendEmailCode: (email: string, type: 'register' | 'login' | 'reset_password') => 
    fetchAPI('/auth/email/send-code', {
      method: 'POST',
      body: JSON.stringify({ email, type }),
    }),
  
  verifyEmailCode: (data: {
    email: string;
    code: string;
    type: 'register' | 'login' | 'reset_password';
    username?: string;
    native_language?: string;
    target_language?: string;
  }) => 
    fetchAPI('/auth/email/verify-code', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  getOAuthRedirect: (provider: 'google' | 'github') => 
    fetchAPI(`/auth/oauth/${provider}/redirect`, {
      method: 'POST',
    }),
  
  handleOAuthCallback: (provider: 'google' | 'github', code: string, state: string) => 
    fetchAPI(`/auth/oauth/${provider}/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`),
  
  getProfile: () => fetchAPI('/auth/profile'),
  
  updateProfile: (data: {
    username?: string;
    native_language?: string;
    target_language?: string;
    avatar_url?: string;
  }) => 
    fetchAPI('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  changePassword: (old_password: string, new_password: string) => 
    fetchAPI('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ old_password, new_password }),
    }),
  
  setPassword: (new_password: string) =>
    fetchAPI('/auth/set-password', {
      method: 'POST',
      body: JSON.stringify({ new_password }),
    }),
  
  getAccountInfo: () => fetchAPI('/auth/account'),
  
  unlinkOAuth: (provider: string) => 
    fetchAPI(`/auth/unlink-oauth/${provider}`, {
      method: 'DELETE',
    }),
  
  resetPassword: (email: string, code: string, newPassword: string) =>
    fetchAPI('/auth/password-reset/reset', {
      method: 'POST',
      body: JSON.stringify({ email, code, new_password: newPassword }),
    }),

  getLearningStats: () => fetchAPI('/stats/learning'),
};

export const courseAPI = {
  getAllCourses: (language?: string, difficulty?: string) => {
    const params = new URLSearchParams();
    if (language) params.set('language', language);
    if (difficulty) params.set('difficulty', difficulty);
    return fetchAPI(`/courses?${params.toString()}`);
  },
  
  getCourse: (id: string) => fetchAPI(`/courses/${id}`),
  
  getMyCourses: () => fetchAPI('/courses/my'),
  
  getCourseProgress: (id: string) => fetchAPI(`/courses/${id}/progress`),
  
  enrollCourse: (id: string) => 
    fetchAPI(`/courses/${id}/enroll`, { method: 'POST' }),
  
  completeLesson: (id: string, lessonId: string) => 
    fetchAPI(`/courses/${id}/lessons/${lessonId}/complete`, { method: 'PUT' }),
};

export interface ConversationMessage {
  id: string;
  session_id: string;
  role: 'user' | 'ai';
  content: string;
  created_at: string;
}

export interface ConversationSession {
  id: string;
  lesson_id: string;
  user_id: string;
  score?: number;
  status: 'active' | 'completed' | 'abandoned';
  started_at: string;
  completed_at?: string;
}

export const conversationAPI = {
  createConversation: (lessonId: string) =>
    fetchAPI('/conversations', {
      method: 'POST',
      body: JSON.stringify({ lesson_id: lessonId }),
    }),

  getConversation: (id: string) =>
    fetchAPI(`/conversations/${id}`),

  getConversationHistory: (limit?: number) =>
    fetchAPI(`/conversations/history/me${limit ? `?limit=${limit}` : ''}`),

  sendMessage: (id: string, content: string) =>
    fetchAPI(`/conversations/${id}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  getMessages: (id: string) =>
    fetchAPI(`/conversations/${id}/messages`),

  completeConversation: (id: string, score?: number) =>
    fetchAPI(`/conversations/${id}/complete`, {
      method: 'PUT',
      body: JSON.stringify({ score }),
    }),

  abandonConversation: (id: string) =>
    fetchAPI(`/conversations/${id}`, { method: 'DELETE' }),
};

export interface GamificationProfile {
  xp: number;
  level: number;
  title: string;
  streak_days: number;
  weekly_xp: number;
  monthly_xp: number;
  last_check_in: string | null;
  achievements_unlocked: number;
  total_achievements: number;
}

export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: AchievementRarity;
  xp_reward: number;
  unlocked: boolean;
  unlocked_at: string | null;
  progress: number;
  current_value: number;
  target_value: number;
}

export interface AchievementsSummary {
  total: number;
  unlocked: number;
  by_rarity: Record<AchievementRarity, number>;
}

export interface AchievementsResponse {
  achievements: Achievement[];
  summary: AchievementsSummary;
}

export interface ShareContent {
  title: string;
  message: string;
  icon: string;
  rarity: AchievementRarity;
  user_stats: {
    level: number;
    xp: number;
    achievements_unlocked: number;
  };
}

export interface DailyQuest {
  id: string;
  name: string;
  description: string;
  type: string;
  target_value: number;
  xp_reward: number;
  progress: number;
  completed: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  avatar_url: string | null;
  xp: number;
}

export interface CheckInResult {
  success: boolean;
  xp_earned: number;
  streak_days: number;
  message: string;
}

export const gamificationAPI = {
  checkIn: (): Promise<CheckInResult> =>
    fetchAPI('/gamification/check-in', { method: 'POST' }),

  getProfile: (): Promise<GamificationProfile> =>
    fetchAPI('/gamification/profile'),

  getAchievements: (): Promise<AchievementsResponse> =>
    fetchAPI('/gamification/achievements'),

  getShareContent: (id: string): Promise<ShareContent> =>
    fetchAPI(`/gamification/achievements/${id}/share`),

  getDailyQuests: (): Promise<DailyQuest[]> =>
    fetchAPI('/gamification/daily-quests'),

  getWeeklyLeaderboard: (): Promise<LeaderboardEntry[]> =>
    fetchAPI('/gamification/leaderboard/weekly'),

  getMonthlyLeaderboard: (): Promise<LeaderboardEntry[]> =>
    fetchAPI('/gamification/leaderboard/monthly'),
};

export interface LearningGoal {
  id: string;
  user_id: string;
  title: string;
  description: string;
  goal_type: 'short_term' | 'medium_term' | 'long_term';
  target_date: string | null;
  status: 'active' | 'completed' | 'abandoned';
  progress: number;
  created_at: string;
  updated_at: string;
}

export interface LearningPath {
  id: string;
  user_id: string;
  goal_id: string | null;
  course_order: string[];
  current_position: number;
  status: 'active' | 'completed' | 'abandoned';
  courses?: any[];
  completed_count?: number;
  total_count?: number;
  progress_percentage?: number;
}

export interface CourseRecommendation {
  course: any;
  score: number;
  reason: string;
}

export const learningAPI = {
  createGoal: (data: { title: string; description?: string; goal_type: string; target_date?: string }) =>
    fetchAPI('/learning/goals', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getGoals: (): Promise<LearningGoal[]> =>
    fetchAPI('/learning/goals'),

  updateGoal: (id: string, data: Partial<{ title: string; description: string; goal_type: string; target_date: string; progress: number }>) =>
    fetchAPI(`/learning/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteGoal: (id: string) =>
    fetchAPI(`/learning/goals/${id}`, { method: 'DELETE' }),

  getLearningPath: (): Promise<LearningPath> =>
    fetchAPI('/learning/path'),

  generatePath: (goalId?: string) =>
    fetchAPI('/learning/path/generate', {
      method: 'POST',
      body: JSON.stringify({ goal_id: goalId }),
    }),

  updatePathProgress: (position: number) =>
    fetchAPI('/learning/path/progress', {
      method: 'PUT',
      body: JSON.stringify({ position }),
    }),

  skipCourse: (courseId: string) =>
    fetchAPI('/learning/path/skip', {
      method: 'POST',
      body: JSON.stringify({ course_id: courseId }),
    }),

  getRecommendations: (limit?: number): Promise<CourseRecommendation[]> =>
    fetchAPI(`/learning/recommendations${limit ? `?limit=${limit}` : ''}`),

  getNextCourse: (): Promise<any> =>
    fetchAPI('/learning/recommendations/next'),

  recordSkipped: (courseId: string) =>
    fetchAPI('/learning/recommendations/skip', {
      method: 'POST',
      body: JSON.stringify({ course_id: courseId }),
    }),

  recordCompleted: (courseId: string) =>
    fetchAPI('/learning/recommendations/complete', {
      method: 'POST',
      body: JSON.stringify({ course_id: courseId }),
    }),
};

export interface VocabularyCard {
  id: string;
  user_id: string;
  front: string;
  back: string;
  example?: string;
  mastery_level: 'new' | 'learning' | 'familiar' | 'known' | 'mastered';
  ease_factor: number;
  interval: number;
  repetitions: number;
  next_review: string;
  review_count: number;
  correct_count: number;
  created_at: string;
  updated_at: string;
}

export interface VocabularyDeck {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  is_auto: boolean;
  course_id?: string;
  card_count: number;
  created_at: string;
  updated_at: string;
}

export interface ReviewLog {
  id: string;
  user_id: string;
  card_id: string;
  quality: number;
  ease_factor_before: number;
  ease_factor_after: number;
  interval_before: number;
  interval_after: number;
  next_review_after: string;
  reviewed_at: string;
  card?: VocabularyCard;
}

export interface ReviewStats {
  totalReviews: number;
  correctCount: number;
  streakDays: number;
}

export type MasteryStats = Record<'new' | 'learning' | 'familiar' | 'known' | 'mastered', number>;

export const vocabularyAPI = {
  getCards: (): Promise<VocabularyCard[]> =>
    fetchAPI('/vocabulary/cards'),

  getDueCards: (limit?: number): Promise<VocabularyCard[]> =>
    fetchAPI(`/vocabulary/cards/due${limit ? `?limit=${limit}` : ''}`),

  getCard: (id: string): Promise<VocabularyCard> =>
    fetchAPI(`/vocabulary/cards/${id}`),

  createCard: (data: { front: string; back: string; example?: string; deckId?: string }): Promise<VocabularyCard> =>
    fetchAPI('/vocabulary/cards', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateCard: (id: string, data: Partial<{ front: string; back: string; example?: string }>): Promise<VocabularyCard> =>
    fetchAPI(`/vocabulary/cards/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteCard: (id: string): Promise<void> =>
    fetchAPI(`/vocabulary/cards/${id}`, { method: 'DELETE' }),

  reviewCard: (id: string, quality: number): Promise<VocabularyCard> =>
    fetchAPI(`/vocabulary/cards/${id}/review`, {
      method: 'POST',
      body: JSON.stringify({ quality }),
    }),

  getCardReviews: (cardId: string): Promise<ReviewLog[]> =>
    fetchAPI(`/vocabulary/cards/${cardId}/reviews`),

  getMasteryStats: (): Promise<MasteryStats> =>
    fetchAPI('/vocabulary/cards/stats/mastery'),

  getDecks: (): Promise<VocabularyDeck[]> =>
    fetchAPI('/vocabulary/decks'),

  getDeck: (id: string): Promise<VocabularyDeck> =>
    fetchAPI(`/vocabulary/decks/${id}`),

  createDeck: (data: { name: string; description?: string; isAuto?: boolean; courseId?: string }): Promise<VocabularyDeck> =>
    fetchAPI('/vocabulary/decks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateDeck: (id: string, data: Partial<{ name: string; description?: string }>): Promise<VocabularyDeck> =>
    fetchAPI(`/vocabulary/decks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteDeck: (id: string): Promise<void> =>
    fetchAPI(`/vocabulary/decks/${id}`, { method: 'DELETE' }),

  getDeckCards: (deckId: string): Promise<VocabularyCard[]> =>
    fetchAPI(`/vocabulary/decks/${deckId}/cards`),

  addCardToDeck: (deckId: string, cardId: string): Promise<{ success: boolean }> =>
    fetchAPI(`/vocabulary/decks/${deckId}/cards/${cardId}`, { method: 'POST' }),

  removeCardFromDeck: (deckId: string, cardId: string): Promise<void> =>
    fetchAPI(`/vocabulary/decks/${deckId}/cards/${cardId}`, { method: 'DELETE' }),

  getReviewHistory: (limit?: number): Promise<ReviewLog[]> =>
    fetchAPI(`/vocabulary/reviews/history${limit ? `?limit=${limit}` : ''}`),

  getReviewStats: (days?: number): Promise<ReviewStats> =>
    fetchAPI(`/vocabulary/reviews/stats${days ? `?days=${days}` : ''}`),
};

// AI Teacher Types
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AITeacherSession {
  id: string;
  userId: string;
  topic: string;
  context?: string;
  messages: Message[];
  isActive: boolean;
  createdAt: string;
}

export interface AIContext {
  targetLanguage: string;
  nativeLanguage: string;
  cefrLevel: string;
  topic?: string;
  recentLesson?: string;
  learningGoals?: string;
}

export interface LearningData {
  completedCourses: string[];
  assessmentScores: { skill: string; score: number }[];
  timeSpent: number;
  preferredTopics: string[];
  weakAreas: string[];
  learningGoals: string;
}

export interface LearningStyleResult {
  primaryStyle: string;
  secondaryStyle: string;
  description: string;
  recommendations: string[];
  optimalActivities: string[];
}

export const aiTeacherAPI = {
  createSession: (topic: string, context?: string): Promise<AITeacherSession> =>
    fetchAPI('/ai-teacher/sessions', {
      method: 'POST',
      body: JSON.stringify({ topic, context }),
    }),

  getSessions: (): Promise<AITeacherSession[]> =>
    fetchAPI('/ai-teacher/sessions'),

  getSession: (id: string): Promise<AITeacherSession> =>
    fetchAPI(`/ai-teacher/sessions/${id}`),

  sendMessage: (id: string, message: string, aiContext: AIContext): Promise<{ userMessage: Message; assistantMessage: Message }> =>
    fetchAPI(`/ai-teacher/sessions/${id}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message, aiContext }),
    }),

  getExplanation: (topic: string, type: 'grammar' | 'vocabulary', aiContext: AIContext): Promise<{ explanation: string }> =>
    fetchAPI('/ai-teacher/explain', {
      method: 'POST',
      body: JSON.stringify({ topic, type, aiContext }),
    }),

  getCorrection: (text: string, aiContext: AIContext): Promise<{ correction: string }> =>
    fetchAPI('/ai-teacher/correct', {
      method: 'POST',
      body: JSON.stringify({ text, aiContext }),
    }),

  getPracticeQuestion: (topic: string, aiContext: AIContext): Promise<{ question: string }> =>
    fetchAPI('/ai-teacher/practice', {
      method: 'POST',
      body: JSON.stringify({ topic, aiContext }),
    }),

  generateLearningPath: (aiContext: AIContext, learningData: LearningData): Promise<{ path: string }> =>
    fetchAPI('/ai-teacher/learning-path', {
      method: 'POST',
      body: JSON.stringify({ aiContext, learningData }),
    }),

  generateAdaptivePractice: (
    topic: string,
    aiContext: AIContext,
    performanceHistory: { correct: number; total: number; mistakes: string[] }
  ): Promise<{ practice: string }> =>
    fetchAPI('/ai-teacher/adaptive-practice', {
      method: 'POST',
      body: JSON.stringify({ topic, aiContext, performanceHistory }),
    }),

  analyzeLearningStyle: (
    aiContext: AIContext,
    learningPatterns: {
      preferredActivities: string[];
      timeDistribution: { morning: number; afternoon: number; evening: number };
      interactionStyle: string;
      feedbackPreferences: string[];
      topicEngagement: { topic: string; engagement: number }[];
    }
  ): Promise<LearningStyleResult> =>
    fetchAPI('/ai-teacher/learning-style', {
      method: 'POST',
      body: JSON.stringify({ aiContext, learningPatterns }),
    }),

  generateContent: (
    topic: string,
    aiContext: AIContext,
    contentType: 'lesson' | 'exercise' | 'story'
  ): Promise<{ content: string }> =>
    fetchAPI('/ai-teacher/generate-content', {
      method: 'POST',
      body: JSON.stringify({ topic, aiContext, contentType }),
    }),
};

// Assessment Types
export interface Question {
  id: string;
  type: 'multiple-choice' | 'fill-blank' | 'open-ended';
  skill: string;
  prompt: string;
  options?: string[];
  correctAnswer?: string;
  points: number;
  level: string;
}

export interface Assessment {
  id: string;
  name: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  skills: string[];
  timeLimit: number;
  passingScore: number;
  questions: Question[];
  isActive: boolean;
  createdAt: string;
}

export interface Answer {
  questionId: string;
  answer: string;
  isCorrect?: boolean;
  score?: number;
  feedback?: string;
}

export interface AssessmentResult {
  id: string;
  userId: string;
  assessmentId: string;
  score: number;
  skillScores: { [key: string]: number };
  answers: Answer[];
  feedback?: string;
  recommendations?: string[];
  completedAt?: string;
  createdAt: string;
}

export interface UserSkillProfile {
  id: string;
  userId: string;
  skill: string;
  level: string;
  score: number;
  lastAssessed?: string;
  trend: 'improving' | 'stable' | 'declining';
  historicalScores: { date: string; score: number }[];
  createdAt: string;
  updatedAt: string;
}

export const assessmentAPI = {
  getAssessments: (): Promise<Assessment[]> =>
    fetchAPI('/assessments'),

  getAssessment: (id: string): Promise<Assessment> =>
    fetchAPI(`/assessments/${id}`),

  submitAssessment: (id: string, answers: Answer[]): Promise<AssessmentResult> =>
    fetchAPI(`/assessments/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    }),

  getResults: (): Promise<AssessmentResult[]> =>
    fetchAPI('/assessments/results'),

  getSkills: (): Promise<UserSkillProfile[]> =>
    fetchAPI('/assessments/skills'),
};

// Progress Types
export interface LearningInsights {
  averageScore: number;
  totalAssessments: number;
  bestSkill: string;
  needsImprovement: string;
  weeklyProgress: { date: string; score: number }[];
  recommendations: string[];
}

export const progressAPI = {
  getInsights: (): Promise<LearningInsights> =>
    fetchAPI('/progress/insights'),

  getTrend: (skill?: string): Promise<{ date: string; score: number }[]> => {
    const url = skill
      ? `/progress/trend?skill=${encodeURIComponent(skill)}`
      : '/progress/trend';
    return fetchAPI(url);
  },
};

// Scene Types
export interface SceneObject {
  id: string;
  scene_id: string;
  name: string;
  position_x: number;
  position_y: number;
  position_z: number;
  interactive: boolean;
  trigger_action: string;
}

export interface Scene {
  id: string;
  name: string;
  type: string;
  description: string;
  model_url: string;
  thumbnail_url?: string;
  is_active: boolean;
  objects: SceneObject[];
  created_at: string;
}

export interface SceneInteractionResult {
  message: string;
  action: string;
  object: SceneObject;
  learningContent?: {
    vocabulary?: string[];
    grammar?: string[];
    dialogue?: string;
  };
}

export interface LearningContentForObject {
  vocabulary: string[];
  grammar: string[];
  dialogue: string;
  culturalTip?: string;
}

export const sceneAPI = {
  getScenes: (): Promise<Scene[]> =>
    fetchAPI('/scenes/list'),

  getScene: (id: string): Promise<Scene> =>
    fetchAPI(`/scenes/${id}`),

  getSceneObjects: (id: string): Promise<SceneObject[]> =>
    fetchAPI(`/scenes/${id}/objects`),

  interactWithScene: (sceneId: string, objectId: string): Promise<SceneInteractionResult> =>
    fetchAPI(`/scenes/${sceneId}/interact`, {
      method: 'POST',
      body: JSON.stringify({ object_id: objectId }),
    }),

  getLearningContent: (sceneId: string, objectId: string): Promise<LearningContentForObject> =>
    fetchAPI(`/scenes/${sceneId}/objects/${objectId}/learning-content`),

  generateSceneDescription: (sceneId: string): Promise<{ description: string }> =>
    fetchAPI(`/scenes/${sceneId}/describe`, {
      method: 'POST',
    }),

  generateObjectDialogue: (sceneId: string, objectId: string, context: string): Promise<{ dialogue: string }> =>
    fetchAPI(`/scenes/${sceneId}/objects/${objectId}/dialogue`, {
      method: 'POST',
      body: JSON.stringify({ context }),
    }),
};
