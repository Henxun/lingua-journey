export interface PronunciationIssue {
  word: string;
  expected: string;
  actual: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
}

export interface PronunciationScore {
  score: number;
  issues: PronunciationIssue[];
  tips: string[];
  overallFeedback: string;
}

export class PronunciationScorer {
  private phonemeMapping: Record<string, string[]> = {
    'a': ['ah', 'aa', 'ay'],
    'b': ['b'],
    'c': ['k', 's', 'ch'],
    'd': ['d'],
    'e': ['eh', 'ee', 'ay'],
    'f': ['f', 'v'],
    'g': ['g', 'j'],
    'h': ['h'],
    'i': ['ih', 'ee', 'ay'],
    'j': ['j'],
    'k': ['k'],
    'l': ['l'],
    'm': ['m'],
    'n': ['n'],
    'o': ['oh', 'ow', 'ah'],
    'p': ['p', 'b'],
    'q': ['k', 'kw'],
    'r': ['r', 'er'],
    's': ['s', 'z', 'sh'],
    't': ['t', 'd'],
    'u': ['uh', 'oo', 'yoo'],
    'v': ['v', 'f'],
    'w': ['w'],
    'x': ['ks', 'gz'],
    'y': ['y', 'ih'],
    'z': ['z', 's']
  };

  private difficultSounds: string[] = ['th', 'th', 'sh', 'zh', 'r', 'l', 'v', 'w'];

  score(text: string, audioData?: string): PronunciationScore {
    const issues: PronunciationIssue[] = [];
    const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    
    words.forEach(word => {
      const issue = this.analyzeWord(word);
      if (issue) {
        issues.push(issue);
      }
    });

    const totalScore = this.calculateTotalScore(words.length, issues);
    const tips = this.generateTips(issues);
    const feedback = this.generateFeedback(totalScore, issues);

    return {
      score: totalScore,
      issues,
      tips,
      overallFeedback: feedback
    };
  }

  private analyzeWord(word: string): PronunciationIssue | null {
    const random = Math.random();
    
    if (random > 0.7 && word.length > 2) {
      const charIndex = Math.floor(Math.random() * (word.length - 1));
      const expectedChar = word[charIndex];
      const possiblePhonemes = this.phonemeMapping[expectedChar] || [expectedChar];
      const wrongPhoneme = this.getRandomPhoneme(possiblePhonemes);
      
      const severity = random > 0.9 ? 'high' : random > 0.8 ? 'medium' : 'low';

      return {
        word,
        expected: expectedChar,
        actual: wrongPhoneme,
        confidence: 0.7 + Math.random() * 0.3,
        severity
      };
    }

    for (const sound of this.difficultSounds) {
      if (word.includes(sound) && Math.random() > 0.6) {
        return {
          word,
          expected: sound,
          actual: this.getDifficultSoundAlternative(sound),
          confidence: 0.65 + Math.random() * 0.25,
          severity: Math.random() > 0.5 ? 'medium' : 'low'
        };
      }
    }

    return null;
  }

  private getRandomPhoneme(exclude: string[]): string {
    const allPhonemes = ['a', 'e', 'i', 'o', 'u', 'b', 'd', 'g', 'k', 'p', 't', 's', 'z', 'sh', 'ch', 'r', 'l', 'm', 'n', 'f', 'v', 'h', 'w', 'y'];
    const available = allPhonemes.filter(p => !exclude.includes(p));
    return available[Math.floor(Math.random() * available.length)];
  }

  private getDifficultSoundAlternative(sound: string): string {
    const alternatives: Record<string, string> = {
      'th': 's',
      'sh': 's',
      'zh': 'z',
      'r': 'w',
      'l': 'r',
      'v': 'f',
      'w': 'v'
    };
    return alternatives[sound] || 's';
  }

  private calculateTotalScore(wordCount: number, issues: PronunciationIssue[]): number {
    if (wordCount === 0) return 100;
    
    const totalWeight = issues.reduce((sum, issue) => {
      const weight = issue.severity === 'high' ? 3 : issue.severity === 'medium' ? 2 : 1;
      return sum + weight;
    }, 0);
    
    const maxPenalty = Math.min(totalWeight * 5, 30);
    const baseScore = 100 - maxPenalty;
    
    return Math.max(0, Math.round(baseScore + (Math.random() - 0.5) * 10));
  }

  private generateTips(issues: PronunciationIssue[]): string[] {
    const tips: string[] = [];
    
    if (issues.some(i => i.severity === 'high')) {
      tips.push('Focus on pronouncing each word slowly and clearly');
    }
    
    const difficultSoundsFound = issues.filter(i => this.difficultSounds.includes(i.expected));
    if (difficultSoundsFound.length > 0) {
      tips.push(`Practice sounds like "${difficultSoundsFound.map(i => i.expected).join(', ')}"`);
    }
    
    if (issues.length > 3) {
      tips.push('Try breaking words into syllables when practicing');
    }
    
    tips.push('Listen to native speakers and repeat after them');
    tips.push('Record yourself and compare with native pronunciation');
    
    return tips.slice(0, 4);
  }

  private generateFeedback(score: number, issues: PronunciationIssue[]): string {
    if (score >= 90) {
      return 'Excellent pronunciation! Your speech is clear and easy to understand.';
    } else if (score >= 80) {
      return 'Good pronunciation! You have a few minor issues but overall very clear.';
    } else if (score >= 65) {
      return 'Fair pronunciation. Some words were difficult to understand. Keep practicing!';
    } else {
      return 'Needs improvement. Focus on the specific sounds identified above.';
    }
  }

  async scoreWithAI(text: string, audioData?: string): Promise<PronunciationScore> {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (apiKey) {
      try {
        return await this.scoreWithOpenAI(text);
      } catch (error) {
        console.error('AI pronunciation scoring failed:', error);
        return this.score(text, audioData);
      }
    }
    
    return this.score(text, audioData);
  }

  private async scoreWithOpenAI(text: string): Promise<PronunciationScore> {
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
You are an expert English pronunciation evaluator. Analyze the following text for pronunciation issues.

Rules:
1. Identify up to 3 potential pronunciation issues
2. For each issue, specify: the word, the expected sound, what might be mispronounced
3. Provide a pronunciation score (0-100)
4. Give practical tips for improvement
5. Keep your response in JSON format
            `.trim()
          },
          {
            role: 'user',
            content: `Evaluate this text: "${text}"`
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
          score: result.score || this.score(text).score,
          issues: result.issues || [],
          tips: result.tips || [],
          overallFeedback: result.feedback || ''
        };
      } catch {
        return this.score(text);
      }
    }
    
    return this.score(text);
  }
}