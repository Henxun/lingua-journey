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
