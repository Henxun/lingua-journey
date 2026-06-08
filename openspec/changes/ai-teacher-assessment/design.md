## Context

Current platform has solid foundations with courses, conversations, and vocabulary flashcards. Now we need AI-powered teaching and assessment to provide a complete learning experience. The AI teacher should feel like having a private tutor available 24/7.

## Goals / Non-Goals

**Goals:**
- Create an AI teacher that provides personalized, contextual explanations
- Build a comprehensive assessment system aligned with international standards
- Generate actionable insights from assessment data
- Support multiple learning modalities (reading, listening, speaking, writing)

**Non-Goals:**
- Replace human teachers entirely
- Real-time voice interaction (future enhancement)
- Certificate issuance (future enhancement)
- Peer-to-peer tutoring

## Architecture Decisions

### 1. AI Teacher Implementation

**Choice**: OpenAI GPT-4 with structured prompts
**Rationale**: 
- GPT-4 excels at language instruction and explanation
- Structured prompts ensure consistent quality
- Cost-effective for text-based interactions
- Easy to iterate and improve

**Alternative**: Fine-tuned smaller model
**Trade-off**: Less capable but potentially cheaper for high volume

### 2. Assessment Framework

**Choice**: CEFR-aligned skill-based assessment
**Rationale**:
- Internationally recognized standard
- Clear progression framework
- Easy to communicate progress to learners
- Maps to popular language tests (IELTS, TOEFL, HSK)

**Structure**:
```
CEFR Level
├── Receptive Skills
│   ├── Listening
│   └── Reading
└── Productive Skills
    ├── Speaking
    └── Writing
```

### 3. Assessment Question Types

**Choice**: Mix of multiple-choice, fill-in-blank, and open-ended
**Rationale**:
- Multiple-choice: Quick, auto-gradable
- Fill-in-blank: Tests specific skills, auto-gradable
- Open-ended: Authentic assessment, requires AI grading

### 4. Skill Scoring Algorithm

**Choice**: Weighted multi-factor scoring
**Factors**:
- Accuracy (50%): Is the answer correct?
- Complexity (25%): Appropriate level of language used?
- Fluency (25%): Natural, flowing expression?

## Data Model

### Entities

```typescript
// Assessment Template
Assessment {
  id: uuid
  name: string
  level: CEFR_LEVEL
  skills: Skill[]
  time_limit: minutes
  passing_score: number
}

// Individual Assessment Record
AssessmentResult {
  id: uuid
  user_id: uuid
  assessment_id: uuid
  score: number
  skill_scores: Record<Skill, number>
  answers: Answer[]
  completed_at: datetime
}

// AI Teacher Session
AITeacherSession {
  id: uuid
  user_id: uuid
  topic: string
  context: string
  messages: Message[]
  created_at: datetime
}

// User Skill Profile
UserSkillProfile {
  user_id: uuid
  skill: Skill
  level: CEFR_LEVEL
  score: number
  last_assessed: datetime
  trend: 'improving' | 'stable' | 'declining'
}
```

## API Design

### Assessment Endpoints

```
POST /api/assessments
  - Create new assessment for user
  - Returns: assessment ID and questions

GET /api/assessments/:id
  - Get assessment details

POST /api/assessments/:id/submit
  - Submit answers
  - Returns: score, feedback, recommendations

GET /api/assessments/results
  - Get user's assessment history

GET /api/assessments/skills
  - Get user's current skill profile
```

### AI Teacher Endpoints

```
POST /api/ai-teacher/sessions
  - Start new AI teacher session

GET /api/ai-teacher/sessions/:id
  - Get session history

POST /api/ai-teacher/sessions/:id/messages
  - Send message to AI teacher
  - Returns: AI response

POST /api/ai-teacher/explain
  - Request explanation of specific concept
  - Params: topic, context, level
```

## AI Teacher Prompt Strategy

### System Prompt Template

```markdown
You are an expert language teacher specializing in {target_language}.
Your student is at {cefr_level} level in {native_language}.

Teaching Principles:
1. Explain concepts clearly in {native_language}
2. Provide examples in {target_language}
3. Be encouraging and supportive
4. Adapt explanations to student level
5. Ask follow-up questions to check understanding

Current Context:
- Topic: {topic}
- Recent lesson: {recent_lesson}
- Student goals: {learning_goals}

Remember: You are teaching, not testing. Focus on understanding, not just correct answers.
```

## Assessment Question Generation

### Difficulty Calibration

Each question tagged with:
- **Level**: A1-C2
- **Skill**: listening/reading/writing/speaking
- **Topic**: vocabulary/theme
- **Time**: expected completion time

### Sample Question Types

**Listening**:
- Multiple choice (audio → text)
- Fill in the blank
- Sequence ordering

**Reading**:
- Comprehension questions
- Vocabulary in context
- Sentence completion

**Writing**:
- Short response (auto-graded)
- Essay with AI evaluation
- Translation (controlled)

**Speaking**:
- Read aloud (text → audio)
- Describe image
- Answer questions (requires voice recording)

## Open Questions

1. Should AI Teacher sessions be saved for later review?
2. How often should assessments be recommended?
3. What pass threshold for each CEFR level?
4. How to handle assessment anxiety?
5. Voice input/output for speaking practice?

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| AI gives wrong explanations | Validate with educational experts; allow feedback |
| Assessment feels like a test | Gamify; celebrate progress, not just scores |
| Too much AI dependency | Balance AI teacher with human connection features |
| Cost of AI interactions | Optimize prompts; cache responses; set usage limits |
| Assessment accuracy | Use multiple question types; human spot-check AI grades |
