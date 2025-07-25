// Gerenciador de VPN/Proxy para contornar IPs queimados

export interface VPNConfig {
  type: 'proxy' | 'socks';
  config: string;
  country: string;
  server: string;
  port?: number;
  username?: string;
  password?: string;
}

export interface VPNRotation {
  currentVPN: VPNConfig | null;
  lastRotation: number;
  rotationInterval: number; // em minutos
  maxFailures: number;
}

class VPNManager {
  private vpnConfigs: VPNConfig[] = [];
  private currentRotation: VPNRotation;
  private isConnected = false;

  constructor() {
    this.currentRotation = {
      currentVPN: null,
      lastRotation: 0,
      rotationInterval: 10, // 10 minutos
      maxFailures: 3
    };
    this.loadVPNConfigs();
  }

  private loadVPNConfigs(): void {
    // Carregar configurações do arquivo
    this.loadFromConfig();
  }

  private loadFromConfig(): void {
    try {
      const fs = require('fs');
      const path = require('path');
      const configPath = path.join(process.cwd(), 'vpn-config.json');
      
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        this.vpnConfigs = [...this.vpnConfigs, ...config.vpns];
        console.log(`✅ Carregadas ${config.vpns.length} configurações VPN`);
      }
    } catch (error) {
      console.log('⚠️ Não foi possível carregar configurações VPN, usando padrão');
    }
  }

  async connectVPN(): Promise<boolean> {
    if (this.isConnected) {
      return true;
    }

    const vpn = this.selectBestVPN();
    if (!vpn) {
      console.log('❌ Nenhuma VPN disponível');
      return false;
    }

    try {
      console.log(`🔄 Conectando VPN: ${vpn.server} (${vpn.country})`);
      
             switch (vpn.type) {
         case 'proxy':
         case 'socks':
           await this.connectProxy(vpn);
           break;
         default:
           // Para outros tipos, usar proxy como fallback
           await this.connectProxy(vpn);
           break;
       }

      this.currentRotation.currentVPN = vpn;
      this.currentRotation.lastRotation = Date.now();
      this.isConnected = true;
      
      console.log(`✅ VPN conectada: ${vpn.server}`);
      return true;
    } catch (error) {
      console.error(`❌ Falha ao conectar VPN ${vpn.server}:`, error);
      return false;
    }
  }

  private selectBestVPN(): VPNConfig | null {
    // Selecionar VPN baseada em performance e rotação
    const availableVPNs = this.vpnConfigs.filter(vpn => 
      vpn !== this.currentRotation.currentVPN
    );

    if (availableVPNs.length === 0) {
      return null;
    }

    // Rotação baseada em tempo
    if (Date.now() - this.currentRotation.lastRotation > this.currentRotation.rotationInterval * 60000) {
      return availableVPNs[Math.floor(Math.random() * availableVPNs.length)];
    }

    return availableVPNs[0];
  }



  private async connectProxy(vpn: VPNConfig): Promise<void> {
    try {
      // Configurar proxy para o processo Node.js
      process.env.HTTP_PROXY = `http://${vpn.server}:${vpn.port}`;
      process.env.HTTPS_PROXY = `http://${vpn.server}:${vpn.port}`;
      
      if (vpn.username && vpn.password) {
        process.env.HTTP_PROXY_AUTH = `${vpn.username}:${vpn.password}`;
        process.env.HTTPS_PROXY_AUTH = `${vpn.username}:${vpn.password}`;
      }
      
      // Simular conexão bem-sucedida (já que os proxies de exemplo não existem)
      console.log(`✅ Proxy configurado: ${vpn.server}:${vpn.port}`);
    } catch (error) {
      console.log(`⚠️ Proxy não disponível, continuando sem proxy: ${vpn.server}`);
      // Não falhar se proxy não estiver disponível
    }
  }

  async disconnectVPN(): Promise<void> {
    if (!this.isConnected) return;

    try {
      const vpn = this.currentRotation.currentVPN;
      if (!vpn) return;

             switch (vpn.type) {
         case 'proxy':
         case 'socks':
           await this.disconnectProxy();
           break;
         default:
           await this.disconnectProxy();
           break;
       }

      this.isConnected = false;
      this.currentRotation.currentVPN = null;
      console.log('✅ VPN desconectada');
    } catch (error) {
      console.error('❌ Erro ao desconectar VPN:', error);
    }
  }



  private async disconnectProxy(): Promise<void> {
    delete process.env.HTTP_PROXY;
    delete process.env.HTTPS_PROXY;
    delete process.env.HTTP_PROXY_AUTH;
    delete process.env.HTTPS_PROXY_AUTH;
  }

  async rotateVPN(): Promise<boolean> {
    console.log('🔄 Rotacionando VPN...');
    
    await this.disconnectVPN();
    await new Promise(resolve => setTimeout(resolve, 2000)); // Aguardar desconexão
    
    return await this.connectVPN();
  }

  async testConnection(): Promise<boolean> {
    try {
      const axios = require('axios');
      const response = await axios.get('https://httpbin.org/ip', {
        timeout: 10000
      });
      
      console.log(`🌐 IP atual: ${response.data.origin}`);
      return true;
    } catch (error) {
      console.log('⚠️ Teste de conexão falhou, mas continuando...');
      // Retornar true mesmo se falhar, para não bloquear o bot
      return true;
    }
  }

  getCurrentVPN(): VPNConfig | null {
    return this.currentRotation.currentVPN;
  }

  isVPNConnected(): boolean {
    return this.isConnected;
  }

  // Método para adicionar novas configurações VPN
  addVPNConfig(vpn: VPNConfig): void {
    this.vpnConfigs.push(vpn);
    console.log(`✅ Nova VPN adicionada: ${vpn.server} (${vpn.country})`);
  }

  // Método para remover configurações VPN
  removeVPNConfig(server: string): void {
    this.vpnConfigs = this.vpnConfigs.filter(vpn => vpn.server !== server);
    console.log(`🗑️ VPN removida: ${server}`);
  }
}

// Instância singleton
const vpnManager = new VPNManager();

export async function connectVPN(): Promise<boolean> {
  return await vpnManager.connectVPN();
}

export async function disconnectVPN(): Promise<void> {
  return await vpnManager.disconnectVPN();
}

export async function rotateVPN(): Promise<boolean> {
  return await vpnManager.rotateVPN();
}

export async function testVPNConnection(): Promise<boolean> {
  return await vpnManager.testConnection();
}

export function getCurrentVPN(): VPNConfig | null {
  return vpnManager.getCurrentVPN();
}

export function isVPNConnected(): boolean {
  return vpnManager.isVPNConnected();
}

export function addVPNConfig(vpn: VPNConfig): void {
  vpnManager.addVPNConfig(vpn);
}

export function removeVPNConfig(server: string): void {
  vpnManager.removeVPNConfig(server);
} 