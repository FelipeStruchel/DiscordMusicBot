// Gerador de POTokens para evitar detecção de bot

import * as puppeteer from 'puppeteer';

export interface TokenInfo {
  potoken: string;
  cookies: string[];
  userAgent: string;
  timestamp: number;
}

class TokenGenerator {
  private browser: puppeteer.Browser | null = null;
  private tokens: TokenInfo[] = [];
  private isGenerating = false;

  async initialize(): Promise<void> {
    if (this.browser) return;
    
    console.log('🚀 Inicializando gerador de tokens...');
    
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding'
      ]
    });
  }

  async generateToken(): Promise<TokenInfo> {
    if (!this.browser) {
      await this.initialize();
    }

    console.log('🔄 Gerando novo POToken...');
    
    const page = await this.browser!.newPage();
    
    try {
      // Configurar viewport aleatório
      const viewports = [
        { width: 1920, height: 1080 },
        { width: 1366, height: 768 },
        { width: 1440, height: 900 },
        { width: 1536, height: 864 }
      ];
      const viewport = viewports[Math.floor(Math.random() * viewports.length)];
      await page.setViewport(viewport);

      // User-Agent aleatório
      const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      ];
      const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
      await page.setUserAgent(userAgent);

      // Simular comportamento humano
      await this.simulateHumanBehavior(page);

      // Navegar para o YouTube
      await page.goto('https://www.youtube.com', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Aguardar carregamento completo
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

      // Simular interações humanas
      await this.simulateInteractions(page);

      // Extrair cookies
      const cookies = await page.cookies();
      const cookieStrings = cookies.map((cookie: any) => `${cookie.name}=${cookie.value}`);

      // Extrair POToken (se disponível)
      const potoken = await this.extractPOToken(page);

      const tokenInfo: TokenInfo = {
        potoken,
        cookies: cookieStrings,
        userAgent,
        timestamp: Date.now()
      };

      this.tokens.push(tokenInfo);
      console.log('✅ Token gerado com sucesso!');
      
      return tokenInfo;

    } catch (error) {
      console.error('❌ Erro ao gerar token:', error);
      throw error;
    } finally {
      await page.close();
    }
  }

  private async simulateHumanBehavior(page: puppeteer.Page): Promise<void> {
    // Simular movimentos do mouse
    await page.mouse.move(
      Math.random() * 800 + 100,
      Math.random() * 600 + 100
    );

    // Simular scroll
    await page.evaluate(() => {
      window.scrollTo(0, Math.random() * 100);
    });

    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
  }

  private async simulateInteractions(page: puppeteer.Page): Promise<void> {
    try {
      // Tentar clicar em elementos aleatórios (se existirem)
      const clickableSelectors = [
        'button[aria-label*="Search"]',
        'a[href*="/feed/trending"]',
        'a[href*="/channel/"]',
        'div[role="button"]'
      ];

              for (const selector of clickableSelectors) {
          try {
            const element = await page.$(selector);
            if (element) {
              await element.hover();
              await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
            }
          } catch (error) {
            // Ignorar erros de elementos não encontrados
          }
        }

        // Simular digitação em campo de busca
        const searchBox = await page.$('input[name="search_query"]');
        if (searchBox) {
          await searchBox.click();
          await new Promise(resolve => setTimeout(resolve, 500));
          await searchBox.type('music', { delay: 100 + Math.random() * 200 });
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

    } catch (error) {
      console.log('⚠️ Algumas interações falharam, continuando...');
    }
  }

  private async extractPOToken(page: puppeteer.Page): Promise<string> {
    try {
      // Tentar extrair POToken de várias formas
      const potoken = await page.evaluate(() => {
        // Método 1: Procurar em meta tags
        const metaTag = document.querySelector('meta[name="potoken"]');
        if (metaTag) return metaTag.getAttribute('content');

        // Método 2: Procurar em scripts
        const scripts = document.querySelectorAll('script');
        for (let i = 0; i < scripts.length; i++) {
          const script = scripts[i];
          const content = script.textContent || '';
          const match = content.match(/potoken["']?\s*:\s*["']([^"']+)["']/);
          if (match) return match[1];
        }

        // Método 3: Procurar em localStorage
        const stored = localStorage.getItem('potoken');
        if (stored) return stored;

        return '';
      });

      return potoken || this.generateFakePOToken();
    } catch (error) {
      console.log('⚠️ Não foi possível extrair POToken, gerando fake...');
      return this.generateFakePOToken();
    }
  }

  private generateFakePOToken(): string {
    // Gerar um token fake que parece real
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `POToken_${timestamp}_${random}`;
  }

  async getValidToken(): Promise<TokenInfo> {
    // Verificar se temos tokens válidos
    const validTokens = this.tokens.filter(token => 
      Date.now() - token.timestamp < 3600000 // 1 hora
    );

    if (validTokens.length > 0) {
      return validTokens[Math.floor(Math.random() * validTokens.length)];
    }

    // Gerar novo token se não temos válidos
    return await this.generateToken();
  }

  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  // Método para renovar tokens periodicamente
  async startTokenRenewal(): Promise<void> {
    if (this.isGenerating) return;
    
    this.isGenerating = true;
    
    setInterval(async () => {
      try {
        await this.generateToken();
      } catch (error) {
        console.error('❌ Erro ao renovar token:', error);
      }
    }, 1800000); // Renovar a cada 30 minutos
  }
}

// Instância singleton
const tokenGenerator = new TokenGenerator();

export async function getPOToken(): Promise<string> {
  const tokenInfo = await tokenGenerator.getValidToken();
  return tokenInfo.potoken;
}

export async function getTokenInfo(): Promise<TokenInfo> {
  return await tokenGenerator.getValidToken();
}

export async function initializeTokenGenerator(): Promise<void> {
  await tokenGenerator.initialize();
  await tokenGenerator.startTokenRenewal();
}

export async function cleanupTokenGenerator(): Promise<void> {
  await tokenGenerator.cleanup();
} 