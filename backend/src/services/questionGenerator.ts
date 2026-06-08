import { CEFRLevel, SkillType, Question } from '../entities/Assessment';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface QuestionTemplate {
  skill: SkillType;
  type: 'multiple-choice' | 'fill-blank' | 'open-ended';
  level: CEFRLevel;
  topic?: string;
}

export async function generateQuestion(template: QuestionTemplate): Promise<Question> {
  const id = Date.now().toString();
  const topic = template.topic || 'general language';

  const baseQuestion: Question = {
    id,
    type: template.type,
    skill: template.skill,
    prompt: '',
    points: 10,
    level: template.level
  };

  if (template.type === 'multiple-choice') {
    return generateMultipleChoice(template, baseQuestion);
  } else if (template.type === 'fill-blank') {
    return generateFillBlank(template, baseQuestion);
  } else {
    return generateOpenEnded(template, baseQuestion);
  }
}

async function generateMultipleChoice(template: QuestionTemplate, base: Question): Promise<Question> {
  try {
    const prompt = `Generate a ${template.level} level ${template.skill} multiple-choice question about ${template.topic || 'general language use'}.

Return ONLY a JSON object with:
- "prompt": The question text
- "options": Array of 4 options
- "correctAnswer": The correct option string

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
      ...base,
      prompt: data.prompt,
      options: data.options,
      correctAnswer: data.correctAnswer
    };
  } catch {
    return fallbackMultipleChoice(template, base);
  }
}

function fallbackMultipleChoice(template: QuestionTemplate, base: Question): Question {
  const vocabWords = ['apple', 'book', 'house', 'computer'];
  return {
    ...base,
    prompt: `Choose the correct word: "I have a red ___"`,
    options: vocabWords,
    correctAnswer: vocabWords[0]
  };
}

async function generateFillBlank(template: QuestionTemplate, base: Question): Promise<Question> {
  return {
    ...base,
    prompt: `Complete the sentence: "I ___ to school every day"`,
    correctAnswer: 'go'
  };
}

async function generateOpenEnded(template: QuestionTemplate, base: Question): Promise<Question> {
  return {
    ...base,
    prompt: `Write a short paragraph about your day.`,
    points: 20
  };
}

export async function generateAssessmentQuestions(
  level: CEFRLevel,
  skills: SkillType[],
  questionsPerSkill: number = 5
): Promise<Question[]> {
  const questions: Question[] = [];

  for (const skill of skills) {
    for (let i = 0; i < questionsPerSkill; i++) {
      const type = i % 2 === 0 ? 'multiple-choice' : (i % 3 === 0 ? 'fill-blank' : 'open-ended');
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
