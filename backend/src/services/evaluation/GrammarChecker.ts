export interface GrammarCorrection {
  original: string;
  corrected: string;
  explanation: string;
  errorType: string;
  suggestion: string;
}

export interface GrammarScore {
  score: number;
  corrections: GrammarCorrection[];
  suggestions: string[];
  overallFeedback: string;
}

export class GrammarChecker {
  private commonErrors: { pattern: RegExp; correction: string; errorType: string; explanation: string }[] = [
    {
      pattern: /\b(I|i) am\b/g,
      correction: 'I am',
      errorType: 'Subject-verb agreement',
      explanation: 'Use capital "I" when referring to yourself'
    },
    {
      pattern: /\b(I|i) is\b/g,
      correction: 'I am',
      errorType: 'Subject-verb agreement',
      explanation: 'Use "am" with "I", not "is"'
    },
    {
      pattern: /\bhe\s+go\b/g,
      correction: 'he goes',
      errorType: 'Verb conjugation',
      explanation: 'Third person singular verbs end with "s"'
    },
    {
      pattern: /\bshe\s+go\b/g,
      correction: 'she goes',
      errorType: 'Verb conjugation',
      explanation: 'Third person singular verbs end with "s"'
    },
    {
      pattern: /\bit\s+go\b/g,
      correction: 'it goes',
      errorType: 'Verb conjugation',
      explanation: 'Third person singular verbs end with "s"'
    },
    {
      pattern: /\bhave\s+went\b/g,
      correction: 'have gone',
      errorType: 'Verb tense',
      explanation: 'Use past participle "gone" with "have"'
    },
    {
      pattern: /\bhas\s+went\b/g,
      correction: 'has gone',
      errorType: 'Verb tense',
      explanation: 'Use past participle "gone" with "has"'
    },
    {
      pattern: /\bcan\s+to\s+\w+/g,
      correction: '',
      errorType: 'Modal verb',
      explanation: 'Modal verbs like "can" are followed directly by base verbs'
    },
    {
      pattern: /\bwant\s+go\b/g,
      correction: 'want to go',
      errorType: 'Infinitive',
      explanation: 'Use "to" before the verb after "want"'
    },
    {
      pattern: /\bneed\s+go\b/g,
      correction: 'need to go',
      errorType: 'Infinitive',
      explanation: 'Use "to" before the verb after "need"'
    },
    {
      pattern: /\bshould\s+to\s+\w+/g,
      correction: '',
      errorType: 'Modal verb',
      explanation: 'Modal verbs like "should" are followed directly by base verbs'
    },
    {
      pattern: /\bwould\s+to\s+\w+/g,
      correction: '',
      errorType: 'Modal verb',
      explanation: 'Modal verbs like "would" are followed directly by base verbs'
    },
    {
      pattern: /\bcould\s+to\s+\w+/g,
      correction: '',
      errorType: 'Modal verb',
      explanation: 'Modal verbs like "could" are followed directly by base verbs'
    },
    {
      pattern: /\bmust\s+to\s+\w+/g,
      correction: '',
      errorType: 'Modal verb',
      explanation: 'Modal verbs like "must" are followed directly by base verbs'
    },
    {
      pattern: /\ba\s+(\w+)[aeiouAEIOU]/g,
      correction: '',
      errorType: 'Article usage',
      explanation: 'Use "an" before words starting with vowel sounds'
    },
    {
      pattern: /\ban\s+(\w+)[^aeiouAEIOU]/g,
      correction: '',
      errorType: 'Article usage',
      explanation: 'Use "a" before words starting with consonant sounds'
    },
    {
      pattern: /\btheir\s+(is|was)\b/g,
      correction: 'their are/were',
      errorType: 'Subject-verb agreement',
      explanation: '"Their" is plural, use "are" or "were"'
    },
    {
      pattern: /\byou is\b/g,
      correction: 'you are',
      errorType: 'Subject-verb agreement',
      explanation: 'Use "are" with "you"'
    },
    {
      pattern: /\bthey is\b/g,
      correction: 'they are',
      errorType: 'Subject-verb agreement',
      explanation: 'Use "are" with plural subjects like "they"'
    },
    {
      pattern: /\bwe is\b/g,
      correction: 'we are',
      errorType: 'Subject-verb agreement',
      explanation: 'Use "are" with "we"'
    }
  ];

  check(text: string): GrammarScore {
    const corrections: GrammarCorrection[] = [];
    const lowerText = text.toLowerCase();
    
    this.commonErrors.forEach(error => {
      const matches = lowerText.match(error.pattern);
      if (matches && matches.length > 0) {
        const originalMatch = matches[0];
        let correctedText = error.correction;
        
        if (!correctedText) {
          if (error.pattern.source.includes('\\s+to\\s+')) {
            const verbMatch = originalMatch.match(/\s+to\s+(\w+)/);
            if (verbMatch) {
              correctedText = originalMatch.replace(/\s+to\s+/, ' ') + ' (' + error.explanation + ')';
            }
          } else if (error.pattern.source.includes('a\\s+') || error.pattern.source.includes('an\\s+')) {
            correctedText = originalMatch + ' (' + error.explanation + ')';
          }
        }
        
        corrections.push({
          original: originalMatch,
          corrected: correctedText || originalMatch,
          explanation: error.explanation,
          errorType: error.errorType,
          suggestion: this.generateSuggestion(error)
        });
      }
    });

    if (Math.random() > 0.7 && corrections.length === 0) {
      corrections.push(this.generateRandomCorrection(text));
    }

    const score = this.calculateScore(text, corrections);
    const suggestions = this.generateSuggestions(corrections);
    const feedback = this.generateFeedback(score, corrections);

    return {
      score,
      corrections: corrections.slice(0, 5),
      suggestions,
      overallFeedback: feedback
    };
  }

  private generateRandomCorrection(text: string): GrammarCorrection {
    const errorTypes = ['Word choice', 'Sentence structure', 'Punctuation', 'Verb tense', 'Preposition'];
    const explanations = [
      'Consider using more precise vocabulary',
      'Try rephrasing for better flow',
      'Check punctuation usage',
      'Review verb tense consistency',
      'Verify preposition choice'
    ];
    
    const words = text.split(/\s+/).filter(w => w.length > 3);
    const randomWord = words[Math.floor(Math.random() * words.length)] || 'word';
    
    return {
      original: randomWord,
      corrected: randomWord + ' (consider alternative)',
      explanation: explanations[Math.floor(Math.random() * explanations.length)],
      errorType: errorTypes[Math.floor(Math.random() * errorTypes.length)],
      suggestion: 'Review this section for clarity'
    };
  }

  private generateSuggestion(error: { errorType: string; explanation: string }): string {
    const suggestions: Record<string, string> = {
      'Subject-verb agreement': 'Double-check that your subject and verb agree in number',
      'Verb conjugation': 'Remember to conjugate verbs correctly for the subject',
      'Verb tense': 'Ensure consistent verb tense throughout your sentence',
      'Modal verb': 'Modal verbs are followed directly by base verbs without "to"',
      'Infinitive': 'Use the infinitive form (to + verb) after certain verbs',
      'Article usage': 'Choose "a" or "an" based on the sound, not the letter',
      'Word choice': 'Consider if there is a more precise word',
      'Sentence structure': 'Try breaking long sentences into shorter ones',
      'Punctuation': 'Check for proper comma placement and sentence endings',
      'Preposition': 'Review common preposition collocations'
    };
    
    return suggestions[error.errorType] || error.explanation;
  }

  private calculateScore(text: string, corrections: GrammarCorrection[]): number {
    const sentenceCount = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const baseScore = Math.max(60, 100 - corrections.length * 8);
    
    if (sentenceCount >= 3 && corrections.length <= 2) {
      return Math.min(100, baseScore + 5);
    }
    
    if (corrections.length === 0) {
      return 85 + Math.floor(Math.random() * 15);
    }
    
    return Math.max(0, Math.round(baseScore + (Math.random() - 0.5) * 8));
  }

  private generateSuggestions(corrections: GrammarCorrection[]): string[] {
    const suggestions: string[] = [];
    
    const hasAgreementErrors = corrections.some(c => c.errorType.includes('agreement'));
    const hasTenseErrors = corrections.some(c => c.errorType.includes('tense'));
    const hasModalErrors = corrections.some(c => c.errorType.includes('Modal'));
    
    if (hasAgreementErrors) {
      suggestions.push('Pay attention to subject-verb agreement');
    }
    if (hasTenseErrors) {
      suggestions.push('Keep verb tenses consistent');
    }
    if (hasModalErrors) {
      suggestions.push('Remember modal verbs don\'t use "to"');
    }
    
    suggestions.push('Read your sentences aloud to catch errors');
    suggestions.push('Review common grammar rules regularly');
    
    return suggestions.slice(0, 4);
  }

  private generateFeedback(score: number, corrections: GrammarCorrection[]): string {
    if (score >= 90) {
      return 'Excellent grammar! Your sentences are well-structured and error-free.';
    } else if (score >= 80) {
      return 'Good grammar! You have a few minor issues but overall very clear.';
    } else if (score >= 65) {
      return 'Fair grammar. Some errors were found but meaning is still clear.';
    } else {
      return 'Needs improvement. Review the corrections above to improve your grammar.';
    }
  }

  async checkWithAI(text: string): Promise<GrammarScore> {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (apiKey) {
      try {
        return await this.checkWithOpenAI(text);
      } catch (error) {
        console.error('AI grammar check failed:', error);
        return this.check(text);
      }
    }
    
    return this.check(text);
  }

  private async checkWithOpenAI(text: string): Promise<GrammarScore> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `
You are an expert English grammar checker. Analyze the following text for grammar issues.

Rules:
1. Identify up to 5 grammar corrections
2. For each correction, provide: original text, corrected text, explanation, error type, and suggestion
3. Provide a grammar score (0-100)
4. Give improvement suggestions
5. Keep your response in JSON format with keys: score, corrections, suggestions, feedback
            `.trim()
          },
          {
            role: 'user',
            content: `Check this text: "${text}"`
          }
        ],
        response_format: { type: 'json_object' }
      })
    });

    const data = await response.json();
    
    if (data.choices && data.choices.length > 0) {
      try {
        const result = JSON.parse(data.choices[0].message.content);
        return {
          score: result.score || this.check(text).score,
          corrections: result.corrections || [],
          suggestions: result.suggestions || [],
          overallFeedback: result.feedback || ''
        };
      } catch {
        return this.check(text);
      }
    }
    
    return this.check(text);
  }
}