// Sistema de fallback para quando youtube-dl falhar

import play from 'play-dl';

export interface FallbackOptions {
  usePlayDl: boolean;
  useSearchInstead: boolean;
  maxRetries: number;
}

export async function tryPlayDlFallback(query: string): Promise<any> {
  try {
    console.log('🔄 Tentando fallback com play-dl...');
    
         // Tentar buscar por nome se for URL
     let searchQuery = query;
     if (query.includes('youtube.com/watch?v=')) {
       // Extrair título do vídeo usando play-dl
       const videoInfo = await play.video_info(query);
       searchQuery = videoInfo.video_details.title || query;
     }
    
    const searchResults = await play.search(searchQuery, { limit: 1 });
    if (searchResults.length === 0) {
      throw new Error('Nenhum resultado encontrado');
    }
    
    return searchResults[0];
  } catch (error) {
    console.error('❌ Fallback play-dl falhou:', error);
    throw error;
  }
}

export async function trySearchFallback(query: string): Promise<any> {
  try {
    console.log('🔍 Tentando busca por nome...');
    
    // Remover URL e usar apenas o nome
    let searchQuery = query;
    if (query.includes('youtube.com/watch?v=')) {
      // Extrair ID do vídeo e buscar por nome
      const videoId = query.split('v=')[1]?.split('&')[0];
      if (videoId) {
        searchQuery = `video ${videoId}`;
      }
    }
    
    const searchResults = await play.search(searchQuery, { limit: 1 });
    if (searchResults.length === 0) {
      throw new Error('Nenhum resultado encontrado');
    }
    
    return searchResults[0];
  } catch (error) {
    console.error('❌ Busca por nome falhou:', error);
    throw error;
  }
}

export function shouldUseFallback(error: any): boolean {
  const errorMessage = error.message || error.toString();
  
  const fallbackTriggers = [
    'Sign in to confirm you\'re not a bot',
    'HTTP Error 429',
    'HTTP Error 503',
    'HTTP Error 502',
    'Connection timeout',
    'Network error',
    'Temporary failure',
    'Rate limit exceeded',
    'no such option',
    'exit code 2',
    'exit code 1'
  ];
  
  return fallbackTriggers.some(pattern => 
    errorMessage.toLowerCase().includes(pattern.toLowerCase())
  );
}

export async function executeFallbackStrategy(query: string, error: any): Promise<any> {
  console.log('🔄 Executando estratégia de fallback...');
  
  // Estratégia 1: Usar play-dl
  try {
    return await tryPlayDlFallback(query);
  } catch (fallbackError) {
    console.log('❌ Fallback 1 falhou, tentando estratégia 2...');
  }
  
  // Estratégia 2: Buscar por nome
  try {
    return await trySearchFallback(query);
  } catch (fallbackError) {
    console.log('❌ Fallback 2 falhou, tentando estratégia 3...');
  }
  
  // Estratégia 3: Buscar termo genérico
  try {
    const genericSearch = await play.search('music', { limit: 1 });
    if (genericSearch.length > 0) {
      console.log('⚠️ Usando resultado genérico como último recurso');
      return genericSearch[0];
    }
  } catch (fallbackError) {
    console.error('❌ Todas as estratégias de fallback falharam');
  }
  
  throw new Error('Todas as estratégias de fallback falharam');
} 