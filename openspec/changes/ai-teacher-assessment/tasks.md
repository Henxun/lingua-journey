# AI Teacher & Assessment System - Implementation Tasks

## Phase 1: Data Models & Database

### Backend Entities

- [ ] **Task 1.1**: Create Assessment entity
  - File: `backend/src/entities/Assessment.ts`
  - Fields: name, level, skills, time_limit, passing_score
  - Relationships: User, Questions, Results

- [ ] **Task 1.2**: Create AssessmentResult entity
  - File: `backend/src/entities/AssessmentResult.ts`
  - Fields: user_id, assessment_id, score, skill_scores, answers, completed_at
  - Relationships: User, Assessment

- [ ] **Task 1.3**: Create AITeacherSession entity
  - File: `backend/src/entities/AITeacherSession.ts`
  - Fields: user_id, topic, context, messages, created_at
  - Relationships: User, Messages

- [ ] **Task 1.4**: Create UserSkillProfile entity
  - File: `backend/src/entities/UserSkillProfile.ts`
  - Fields: user_id, skill, level, score, last_assessed, trend
  - Relationships: User

- [ ] **Task 1.5**: Update database.ts to register entities
  - File: `backend/src/config/database.ts`
  - Add: Assessment, AssessmentResult, AITeacherSession, UserSkillProfile

## Phase 2: AI Teacher Service

### Backend Services

- [ ] **Task 2.1**: Create AI Teacher service
  - File: `backend/src/services/aiTeacherService.ts`
  - Functions:
    - `createSession(userId, topic, context)` - Start new session
    - `sendMessage(sessionId, message)` - Get AI response
    - `generateExplanation(topic, context, level)` - Explain grammar/vocabulary
    - `generateExample(topic, level)` - Create example sentences

- [ ] **Task 2.2**: Create prompt templates
  - File: `backend/src/services/aiTeacherPrompts.ts`
  - Templates for:
    - Grammar explanation
    - Vocabulary in context
    - Cultural insights
    - Correction with explanation

- [ ] **Task 2.3**: Create AI Teacher controller
  - File: `backend/src/controllers/aiTeacherController.ts`
  - Endpoints:
    - POST `/api/ai-teacher/sessions` - Create session
    - GET `/api/ai-teacher/sessions/:id` - Get session
    - POST `/api/ai-teacher/sessions/:id/messages` - Send message
    - POST `/api/ai-teacher/explain` - Get explanation

- [ ] **Task 2.4**: Create AI Teacher routes
  - File: `backend/src/routes/aiTeacherRoutes.ts`
  - Register routes with authentication middleware

## Phase 3: Assessment Service

### Backend Services

- [ ] **Task 3.1**: Create Assessment service
  - File: `backend/src/services/assessmentService.ts`
  - Functions:
    - `generateAssessment(userId, level, skills)` - Create new assessment
    - `submitAssessment(resultId, answers)` - Grade answers
    - `getAssessmentHistory(userId)` - Get past results
    - `getUserSkillProfile(userId)` - Get current skills

- [ ] **Task 3.2**: Create Question generation
  - File: `backend/src/services/questionGenerator.ts`
  - Question types:
    - Multiple choice
    - Fill in the blank
    - Short answer
  - Difficulty calibration by CEFR level

- [ ] **Task 3.3**: Create Grading algorithm
  - File: `backend/src/services/gradingService.ts`
  - Scoring:
    - Accuracy check
    - Complexity analysis
    - Fluency evaluation

- [ ] **Task 3.4**: Create Assessment controller
  - File: `backend/src/controllers/assessmentController.ts`
  - Endpoints:
    - POST `/api/assessments` - Create assessment
    - GET `/api/assessments/:id` - Get assessment
    - POST `/api/assessments/:id/submit` - Submit answers
    - GET `/api/assessments/results` - Get history
    - GET `/api/assessments/skills` - Get skill profile

- [ ] **Task 3.5**: Create Assessment routes
  - File: `backend/src/routes/assessmentRoutes.ts`
  - Register routes with authentication middleware

## Phase 4: Progress Analytics

### Backend Services

- [ ] **Task 4.1**: Create Analytics service
  - File: `backend/src/services/analyticsService.ts`
  - Functions:
    - `calculateSkillProgress(userId)` - Calculate improvement
    - `generateRecommendations(userId)` - Personalize suggestions
    - `getLearningInsights(userId)` - Generate insights

- [ ] **Task 4.2**: Create Progress controller
  - File: `backend/src/controllers/progressController.ts`
  - Endpoints:
    - GET `/api/progress/skills` - Get skill breakdown
    - GET `/api/progress/trends` - Get improvement trends
    - GET `/api/progress/recommendations` - Get personalized suggestions

- [ ] **Task 4.3**: Create Progress routes
  - File: `backend/src/routes/progressRoutes.ts`

## Phase 5: Frontend Integration

### Frontend API

- [ ] **Task 5.1**: Add AI Teacher API
  - File: `frontend/src/lib/api.ts`
  - Functions: createSession, getSession, sendMessage, getExplanation

- [ ] **Task 5.2**: Add Assessment API
  - File: `frontend/src/lib/api.ts`
  - Functions: createAssessment, getAssessment, submitAssessment, getHistory

### Frontend Pages

- [ ] **Task 5.3**: Create AI Teacher page
  - File: `frontend/src/pages/ai-teacher/index.tsx`
  - Features:
    - Session list
    - Chat interface
    - Topic selector
    - Message history

- [ ] **Task 5.4**: Create Assessment page
  - File: `frontend/src/pages/assessment/index.tsx`
  - Features:
    - Assessment selection
    - Test-taking interface
    - Timer
    - Progress indicator

- [ ] **Task 5.5**: Create Progress Dashboard
  - File: `frontend/src/pages/progress/index.tsx`
  - Features:
    - Skill breakdown chart
    - Progress trends
    - CEFR level indicator
    - Recommendations

- [ ] **Task 5.6**: Update navigation
  - File: `frontend/src/pages/index.tsx` (add AI Teacher link)
  - File: `frontend/src/pages/profile.tsx` (add navigation)

## Phase 6: Integration & Polish

### Backend Integration

- [ ] **Task 6.1**: Update server.ts
  - File: `backend/src/server.ts`
  - Add routes:
    - `/api/ai-teacher`
    - `/api/assessments`
    - `/api/progress`

### Testing

- [ ] **Task 6.2**: Test AI Teacher service
  - Test session creation
  - Test message flow
  - Test explanation generation

- [ ] **Task 6.3**: Test Assessment service
  - Test assessment generation
  - Test grading accuracy
  - Test skill profile updates

## Completion Checklist

- [ ] All entities created and registered
- [ ] AI Teacher service fully functional
- [ ] Assessment service with working questions
- [ ] Progress analytics generating insights
- [ ] Frontend pages implemented and integrated
- [ ] Navigation updated with new features
- [ ] Basic testing completed
- [ ] Ready for user feedback
