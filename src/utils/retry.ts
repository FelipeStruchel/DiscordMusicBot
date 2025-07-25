// Sistema de retry com backoff exponencial

export interface RetryOptions {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

const defaultOptions: RetryOptions = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 segundo
  maxDelay: 10000, // 10 segundos
  backoffMultiplier: 2
};

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const config = { ...defaultOptions, ...options };
  let lastError: Error;
  
  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === config.maxAttempts) {
        throw lastError;
      }
      
      // Calcular delay com backoff exponencial
      const delay = Math.min(
        config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1),
        config.maxDelay
      );
      
      console.log(`Tentativa ${attempt} falhou, tentando novamente em ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

// Função específica para youtube-dl com retry
export async function retryYoutubeDl<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3
): Promise<T> {
  return retryWithBackoff(fn, {
    maxAttempts,
    baseDelay: 2000, // 2 segundos
    maxDelay: 15000, // 15 segundos
    backoffMultiplier: 2.5
  });
}

// Função para verificar se o erro é recuperável
export function isRecoverableError(error: any): boolean {
  const errorMessage = error.message || error.toString();
  
  // Erros que podem ser recuperados com retry
  const recoverableErrors = [
    'Sign in to confirm you\'re not a bot',
    'HTTP Error 429',
    'HTTP Error 503',
    'HTTP Error 502',
    'Connection timeout',
    'Network error',
    'Temporary failure',
    'Rate limit exceeded'
  ];
  
  return recoverableErrors.some(pattern => 
    errorMessage.toLowerCase().includes(pattern.toLowerCase())
  );
} 