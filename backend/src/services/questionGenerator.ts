import { CEFRLevel, Question, QuestionType } from '../entities/Assessment';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface QuestionTemplate {
  skill: string;
  type: QuestionType;
  level: CEFRLevel;
  topic?: string;
}

export async function generateQuestion(template: QuestionTemplate): Promise<Question> {
  const id = Date.now().toString();
  const topic = template.topic || 'general language';

  if (template.type === 'multiple_choice') {
    return generateMultipleChoice(template, id);
  } else if (template.type === 'fill_in_blank') {
    return generateFillBlank(template, id);
  } else {
    return generateShortAnswer(template, id);
  }
}

async function generateMultipleChoice(template: QuestionTemplate, id: string): Promise<Question> {
  try {
    const prompt = `Generate a ${template.level} level ${template.skill} multiple-choice question about ${template.topic || 'general language use'}.

Return ONLY a JSON object with:
- "question": The question text
- "options": Array of 4 options
- "correctAnswer": The correct option string
- "explanation": Brief explanation of why it's correct

Keep it simple and appropriate for ${template.level} level.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error('No response');

    const data = JSON.parse(content);
    return {
      id,
      type: 'multiple_choice',
      question: data.question,
      options: data.options,
      correctAnswer: data.correctAnswer,
      explanation: data.explanation || 'Correct answer.',
      skill: template.skill,
      difficulty: 1
    };
  } catch {
    return fallbackMultipleChoice(template, id);
  }
}

function fallbackMultipleChoice(template: QuestionTemplate, id: string): Question {
  const vocabWords = ['apple', 'book', 'house', 'computer'];
  return {
    id,
    type: 'multiple_choice',
    question: `Choose the correct word: "I have a red ___"`,
    options: vocabWords,
    correctAnswer: vocabWords[0],
    explanation: 'Apple is the correct word to complete the sentence.',
    skill: template.skill,
    difficulty: 1
  };
}

async function generateFillBlank(template: QuestionTemplate, id: string): Promise<Question> {
  return {
    id,
    type: 'fill_in_blank',
    question: `Complete the sentence: "I ___ to school every day"`,
    correctAnswer: 'go',
    explanation: 'The correct verb is "go" to complete this present simple sentence.',
    skill: template.skill,
    difficulty: 1
  };
}

async function generateShortAnswer(template: QuestionTemplate, id: string): Promise<Question> {
  return {
    id,
    type: 'short_answer',
    question: `Write a short sentence using the word "${template.topic || 'happy'}".`,
    correctAnswer: '',
    explanation: 'Answers may vary. Look for correct grammar and usage.',
    skill: template.skill,
    difficulty: 2
  };
}

export async function generateAssessmentQuestions(
  level: CEFRLevel,
  skills: string[],
  questionsPerSkill: number = 3
): Promise<Question[]> {
  const questions: Question[] = [];

  for (const skill of skills) {
    for (let i = 0; i < questionsPerSkill; i++) {
      const type: QuestionType = i % 2 === 0 ? 'multiple_choice' : (i % 3 === 0 ? 'fill_in_blank' : 'short_answer');
      const question = await generateQuestion({
        skill,
        type,
        level,
        topic: 'general vocabulary and grammar'
      });
      questions.push(question);
    }
  }

  return questions;
}