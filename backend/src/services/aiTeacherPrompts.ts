export interface AIContext {
  targetLanguage: string;
  nativeLanguage: string;
  cefrLevel: string;
  topic?: string;
  recentLesson?: string;
  learningGoals?: string;
}

export function createSystemPrompt(context: AIContext): string {
  return `You are an expert language teacher specializing in ${context.targetLanguage}.
Your student is at ${context.cefrLevel} level, with ${context.nativeLanguage} as their native language.

Teaching Principles:
1. Explain concepts clearly in ${context.nativeLanguage}
2. Provide examples in ${context.targetLanguage}
3. Be encouraging and supportive
4. Adapt explanations to student level
5. Ask follow-up questions to check understanding

${context.topic ? `Current topic: ${context.topic}` : ''}
${context.recentLesson ? `Recent lesson: ${context.recentLesson}` : ''}
${context.learningGoals ? `Student goals: ${context.learningGoals}` : ''}

Remember: You are teaching, not testing. Focus on understanding, not just correct answers.
Keep responses conversational and engaging.`;
}

export function createGrammarExplanationPrompt(topic: string, context: AIContext): string {
  return `Explain the ${topic} grammar concept clearly to a ${context.cefrLevel} level learner.

Please provide:
1. A clear explanation in ${context.nativeLanguage}
2. 3-5 examples in ${context.targetLanguage}
3. Common mistakes to avoid
4. A simple practice question to check understanding

Format your response in a friendly, conversational tone.`;
}

export function createVocabularyExplanationPrompt(word: string, context: AIContext): string {
  return `Explain the word "${word}" to a ${context.cefrLevel} level learner.

Please provide:
1. Clear definition in ${context.nativeLanguage}
2. 2-3 example sentences in ${context.targetLanguage}
3. Synonyms and related words
4. Pronunciation tips (if applicable)

Make it practical and easy to remember!`;
}

export function createErrorCorrectionPrompt(userMessage: string, context: AIContext): string {
  return `A ${context.cefrLevel} level student wrote: "${userMessage}"

Please:
1. Identify any grammar or vocabulary mistakes
2. Provide the corrected version
3. Explain the mistakes gently in ${context.nativeLanguage}
4. Keep encouragement positive and supportive

Focus on helping them improve without discouraging them!`;
}

export function createPracticeQuestionPrompt(topic: string, context: AIContext): string {
  return `Create a practice question for a ${context.cefrLevel} level learner about "${topic}".

Please provide:
1. The question in ${context.targetLanguage}
2. Clear instructions in ${context.nativeLanguage}
3. The correct answer
4. Why that answer is correct

Make it engaging and appropriate for their level!`;
}

export interface LearningData {
  completedCourses: string[];
  assessmentScores: { skill: string; score: number }[];
  timeSpent: number;
  preferredTopics: string[];
  weakAreas: string[];
  learningGoals: string;
}

export function createLearningPathPrompt(
  context: AIContext,
  learningData: LearningData
): string {
  return `You are an expert language learning advisor. Create a personalized learning path for a ${context.cefrLevel} level learner.

Student Information:
- Target Language: ${context.targetLanguage}
- Native Language: ${context.nativeLanguage}
- CEFR Level: ${context.cefrLevel}
- Learning Goals: ${learningData.learningGoals}

Current Progress:
- Completed Courses: ${learningData.completedCourses.join(', ') || 'None'}
- Assessment Scores: ${JSON.stringify(learningData.assessmentScores)}
- Weekly Time Spent: ${learningData.timeSpent} hours
- Preferred Topics: ${learningData.preferredTopics.join(', ') || 'Not specified'}
- Weak Areas: ${learningData.weakAreas.join(', ') || 'None identified'}

Please create a detailed learning path with:
1. Recommended next 3 courses/topics to study (prioritized)
2. Weekly study schedule recommendation
3. Focus areas for improvement
4. Practice activities suggestion
5. Estimated timeline for reaching next level

Format your response in a clear, structured way that's easy to follow. Use ${context.nativeLanguage} for explanations.`;
}

export function createAdaptivePracticePrompt(
  topic: string,
  context: AIContext,
  performanceHistory: { correct: number; total: number; mistakes: string[] }
): string {
  return `Create an adaptive practice exercise for a ${context.cefrLevel} level learner focusing on "${topic}".

Student Performance History:
- Correct Answers: ${performanceHistory.correct}/${performanceHistory.total}
- Common Mistakes: ${performanceHistory.mistakes.join(', ') || 'None recorded'}

Please create:
1. 5 practice questions of appropriate difficulty based on their performance
2. Include multiple choice, fill-in-the-blank, and short answer questions
3. Provide clear explanations for each answer in ${context.nativeLanguage}
4. Adjust difficulty based on their past performance (if they struggle, make it easier; if they excel, make it harder)

Format the questions clearly with answers and explanations.`;
}

export interface LearningStyleResult {
  primaryStyle: string;
  secondaryStyle: string;
  description: string;
  recommendations: string[];
  optimalActivities: string[];
}

export function createLearningStyleAnalysisPrompt(
  context: AIContext,
  learningPatterns: {
    preferredActivities: string[];
    timeDistribution: { morning: number; afternoon: number; evening: number };
    interactionStyle: string;
    feedbackPreferences: string[];
    topicEngagement: { topic: string; engagement: number }[];
  }
): string {
  return `Analyze the learning style of a ${context.cefrLevel} level ${context.targetLanguage} learner.

Learning Patterns Data:
- Preferred Activities: ${learningPatterns.preferredActivities.join(', ')}
- Time Distribution (hours/day): 
  - Morning: ${learningPatterns.timeDistribution.morning}
  - Afternoon: ${learningPatterns.timeDistribution.afternoon}
  - Evening: ${learningPatterns.timeDistribution.evening}
- Interaction Style: ${learningPatterns.interactionStyle}
- Feedback Preferences: ${learningPatterns.feedbackPreferences.join(', ')}
- Topic Engagement: ${JSON.stringify(learningPatterns.topicEngagement)}

Please provide:
1. Primary learning style (e.g., visual, auditory, kinesthetic, reading/writing)
2. Secondary learning style
3. Description of their learning preferences
4. Personalized recommendations for optimal learning
5. Best activities for their style

Use ${context.nativeLanguage} for the response. Keep it friendly and actionable!`;
}

export function createContentGenerationPrompt(
  topic: string,
  context: AIContext,
  contentType: 'lesson' | 'exercise' | 'story'
): string {
  const typeDescription = {
    lesson: 'a comprehensive lesson',
    exercise: 'interactive exercises',
    story: 'an engaging story'
  };

  return `Create ${typeDescription[contentType]} for a ${context.cefrLevel} level ${context.targetLanguage} learner about "${topic}".

Requirements:
- Language: ${context.targetLanguage}
- Level: ${context.cefrLevel}
- Type: ${contentType}

For a lesson:
- Clear explanation of the topic
- 5-10 key points
- Examples and practice opportunities

For exercises:
- 10 varied questions
- Include answer key and explanations
- Mix of question types

For a story:
- Engaging narrative
- Vocabulary appropriate for level
- Cultural context if relevant
- Questions to check comprehension

Make it engaging and appropriate for their level. Provide explanations in ${context.nativeLanguage} where helpful.`;
}
