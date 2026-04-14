interface TranslationResult {
  success: boolean;
  translatedText?: string;
  sourceLanguage?: string;
  targetLanguage?: string;
  error?: string;
}

export class TranslationService {
  private email: string | undefined;
  private baseUrl: string = 'https://api.mymemory.translated.net/get';

  constructor() {
    this.email = process.env.MYMEMORY_EMAIL;
  }

  // Traduzir texto
  async translate(text: string, targetLang: string, sourceLang?: string): Promise<TranslationResult> {
    try {
      const source = sourceLang || 'auto';
      const emailParam = this.email ? `&de=${encodeURIComponent(this.email)}` : '';
      const url = `${this.baseUrl}?q=${encodeURIComponent(text)}&langpair=${source}|${targetLang}${emailParam}`;
      
      console.log(`🌐 Traduzindo: "${text}" de ${source} para ${targetLang}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.responseStatus === 200) {
        console.log(`✅ Tradução bem-sucedida: "${data.responseData.translatedText}"`);
        
        return {
          success: true,
          translatedText: data.responseData.translatedText,
          sourceLanguage: data.responseData.detectedLanguage?.language || sourceLang,
          targetLanguage: targetLang,
        };
      } else {
        throw new Error(data.responseDetails || 'Erro na tradução');
      }
    } catch (error) {
      console.error('❌ Erro na tradução:', error);
      return { 
        success: false, 
        error: `Erro na tradução: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
      };
    }
  }

  // Detectar idioma
  async detectLanguage(text: string): Promise<TranslationResult> {
    try {
      // Usar tradução para inglês para detectar o idioma
      const result = await this.translate(text, 'en', 'auto');
      
      if (result.success) {
        return {
          success: true,
          sourceLanguage: result.sourceLanguage,
        };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: 'Erro na detecção de idioma' };
    }
  }

  // Listar idiomas suportados
  getSupportedLanguages(): TranslationResult {
    const languages = [
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'pt', name: 'Português', flag: '🇧🇷' },
      { code: 'es', name: 'Español', flag: '🇪🇸' },
      { code: 'fr', name: 'Français', flag: '🇫🇷' },
      { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
      { code: 'it', name: 'Italiano', flag: '🇮🇹' },
      { code: 'ru', name: 'Русский', flag: '🇷🇺' },
      { code: 'ja', name: '日本語', flag: '🇯🇵' },
      { code: 'ko', name: '한국어', flag: '🇰🇷' },
      { code: 'zh', name: '中文', flag: '🇨🇳' },
      { code: 'ar', name: 'العربية', flag: '🇸🇦' },
      { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
    ];

    return {
      success: true,
      translatedText: JSON.stringify(languages, null, 2),
    };
  }

  // Validar código de idioma
  isValidLanguageCode(code: string): boolean {
    const validCodes = ['en', 'pt', 'es', 'fr', 'de', 'it', 'ru', 'ja', 'ko', 'zh', 'ar', 'hi'];
    return validCodes.includes(code.toLowerCase());
  }

  // Obter nome do idioma
  getLanguageName(code: string): string {
    const languages: { [key: string]: string } = {
      'en': 'English',
      'pt': 'Português',
      'es': 'Español',
      'fr': 'Français',
      'de': 'Deutsch',
      'it': 'Italiano',
      'ru': 'Русский',
      'ja': '日本語',
      'ko': '한국어',
      'zh': '中文',
      'ar': 'العربية',
      'hi': 'हिन्दी',
    };
    
    return languages[code.toLowerCase()] || code;
  }
} 