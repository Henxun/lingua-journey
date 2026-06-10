export interface TTSOptions {
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export interface TTSResult {
  success: boolean;
  audioData?: string;
  audioFormat?: string;
  error?: string;
}

export class TTSService {
  private availableVoices: Map<string, string> = new Map();

  constructor() {
    this.initializeVoices();
  }

  private initializeVoices(): void {
    this.availableVoices.set('en-US-female', 'Google US English');
    this.availableVoices.set('en-US-male', 'Google US English Male');
    this.availableVoices.set('zh-CN-female', 'Google Chinese');
    this.availableVoices.set('zh-CN-male', 'Google Chinese Male');
    this.availableVoices.set('ja-JP-female', 'Google Japanese');
    this.availableVoices.set('ja-JP-male', 'Google Japanese Male');
    this.availableVoices.set('ko-KR-female', 'Google Korean');
    this.availableVoices.set('es-ES-female', 'Google Spanish');
    this.availableVoices.set('fr-FR-female', 'Google French');
    this.availableVoices.set('de-DE-female', 'Google German');
  }

  getAvailableVoices(): { id: string; name: string }[] {
    return Array.from(this.availableVoices.entries()).map(([id, name]) => ({ id, name }));
  }

  async synthesize(text: string, options: TTSOptions = {}): Promise<TTSResult> {
    const { voice = 'en-US-female', rate = 1, pitch = 1, volume = 1 } = options;

    const apiKey = process.env.OPENAI_API_KEY;
    
    if (apiKey) {
      try {
        return await this.synthesizeWithOpenAI(text, voice, rate);
      } catch (error) {
        console.error('OpenAI TTS failed, falling back to text mode:', error);
        return this.fallbackToText(text);
      }
    }

    return this.fallbackToText(text);
  }

  private async synthesizeWithOpenAI(text: string, voice: string, rate: number): Promise<TTSResult> {
    const openAIVoice = this.mapToOpenAIVoice(voice);
    
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'tts-1',
        voice: openAIVoice,
        input: text,
        speed: rate
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI TTS API error: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString('base64');

    return {
      success: true,
      audioData: base64Audio,
      audioFormat: 'mp3'
    };
  }

  private mapToOpenAIVoice(voice: string): string {
    const voiceMap: Record<string, string> = {
      'en-US-female': 'alloy',
      'en-US-male': 'echo',
      'zh-CN-female': 'fable',
      'zh-CN-male': 'onyx',
      'ja-JP-female': 'nova',
      'ja-JP-male': 'shimmer',
      'ko-KR-female': 'nova',
      'es-ES-female': 'nova',
      'fr-FR-female': 'nova',
      'de-DE-female': 'nova'
    };
    return voiceMap[voice] || 'alloy';
  }

  private fallbackToText(text: string): TTSResult {
    return {
      success: true,
      audioData: null,
      audioFormat: 'text',
      error: null
    };
  }

  async streamSynthesize(text: string, options: TTSOptions = {}, callback: (chunk: string) => void): Promise<void> {
    const result = await this.synthesize(text, options);
    if (result.audioData) {
      callback(result.audioData);
    }
  }
}