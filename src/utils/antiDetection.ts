// Utilitários para evitar detecção de bot

const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/120.0.0.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15'
];

const referers = [
  'https://www.youtube.com/',
  'https://www.google.com/',
  'https://www.bing.com/',
  'https://www.youtube.com/results?search_query=',
  'https://www.youtube.com/feed/trending',
  'https://www.youtube.com/channel/',
  'https://m.youtube.com/',
  'https://www.youtube.com/watch?v='
];

const acceptLanguages = [
  'en-US,en;q=0.9',
  'en-US,en;q=0.8,pt;q=0.7',
  'en-GB,en;q=0.9',
  'en-CA,en;q=0.9',
  'en-AU,en;q=0.9',
  'pt-BR,pt;q=0.9,en;q=0.8',
  'pt-PT,pt;q=0.9,en;q=0.8',
  'es-ES,es;q=0.9,en;q=0.8'
];

export function getRandomUserAgent(): string {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

export function getRandomReferer(): string {
  return referers[Math.floor(Math.random() * referers.length)];
}

export function getRandomAcceptLanguage(): string {
  return acceptLanguages[Math.floor(Math.random() * acceptLanguages.length)];
}

export function getRandomDelay(): number {
  // Delay aleatório entre 1-5 segundos
  return Math.floor(Math.random() * 4000) + 1000;
}

export function getAntiDetectionHeaders(): string[] {
  const userAgent = getRandomUserAgent();
  const referer = getRandomReferer();
  const acceptLanguage = getRandomAcceptLanguage();
  
  return [
    `referer:${referer}`,
    `user-agent:${userAgent}`,
    'accept:text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'accept-language:' + acceptLanguage,
    'accept-encoding:gzip, deflate, br',
    'dnt:1',
    'connection:keep-alive',
    'upgrade-insecure-requests:1',
    'sec-fetch-dest:document',
    'sec-fetch-mode:navigate',
    'sec-fetch-site:same-origin',
    'sec-fetch-user:?1',
    'cache-control:max-age=0'
  ];
}

export function getYoutubeDlOptions() {
  const headers = getAntiDetectionHeaders();
  
  return {
    format: 'bestaudio/best',
    noCheckCertificates: true,
    noWarnings: true,
    preferFreeFormats: true,
    addHeader: headers,
    sleepInterval: Math.floor(Math.random() * 3) + 1, // 1-3 segundos
    maxSleepInterval: Math.floor(Math.random() * 5) + 3, // 3-7 segundos
    retries: 3,
    fragmentRetries: 3,
    skipUnavailableFragments: true,
    ignoreErrors: true,
    noCallHome: true,
    noCheckCertificate: true,
    geoBypass: true,
    geoBypassCountry: 'US',
    geoBypassIPBlock: '',
    extractorRetries: 3,
    maxDownloads: 1,
    rateLimit: '100K', // Limitar taxa de download
    maxSleepInterval: 5,
    sleepInterval: 1
  };
}

// Função para adicionar delay aleatório
export function addRandomDelay(): Promise<void> {
  return new Promise(resolve => {
    const delay = getRandomDelay();
    setTimeout(resolve, delay);
  });
}

// Função para simular comportamento humano
export async function simulateHumanBehavior(): Promise<void> {
  // Adicionar delay aleatório
  await addRandomDelay();
  
  // Simular pequenas pausas
  const microDelay = Math.random() * 1000;
  await new Promise(resolve => setTimeout(resolve, microDelay));
} 