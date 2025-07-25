// Gerenciador de VPN/Proxy para contornar IPs queimados

export interface VPNConfig {
  type: 'openvpn' | 'wireguard' | 'proxy' | 'socks';
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
    // Configurações de VPN gratuitas e pagas
    this.vpnConfigs = [
      // OpenVPN (gratuito)
      {
        type: 'openvpn',
        config: 'us1.freeopenvpn.org',
        country: 'US',
        server: 'us1.freeopenvpn.org',
        port: 1194
      },
      {
        type: 'openvpn',
        config: 'nl1.freeopenvpn.org',
        country: 'NL',
        server: 'nl1.freeopenvpn.org',
        port: 1194
      },
      
      // WireGuard (mais rápido)
      {
        type: 'wireguard',
        config: 'wg0',
        country: 'DE',
        server: 'de1.wireguard.com',
        port: 51820
      },
      
      // SOCKS Proxy
      {
        type: 'socks',
        config: 'socks5://proxy1.example.com:1080',
        country: 'CA',
        server: 'proxy1.example.com',
        port: 1080
      }
    ];

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
        case 'openvpn':
          await this.connectOpenVPN(vpn);
          break;
        case 'wireguard':
          await this.connectWireGuard(vpn);
          break;
        case 'proxy':
        case 'socks':
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

  private async connectOpenVPN(vpn: VPNConfig): Promise<void> {
    const { exec } = require('child_process');
    const util = require('util');
    const execAsync = util.promisify(exec);

    // Comando para conectar OpenVPN
    const command = `sudo openvpn --config /etc/openvpn/${vpn.config}.ovpn --daemon`;
    
    try {
      await execAsync(command);
      // Aguardar conexão
      await new Promise(resolve => setTimeout(resolve, 5000));
    } catch (error) {
      throw new Error(`Falha ao conectar OpenVPN: ${error}`);
    }
  }

  private async connectWireGuard(vpn: VPNConfig): Promise<void> {
    const { exec } = require('child_process');
    const util = require('util');
    const execAsync = util.promisify(exec);

    // Comando para conectar WireGuard
    const command = `sudo wg-quick up ${vpn.config}`;
    
    try {
      await execAsync(command);
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (error) {
      throw new Error(`Falha ao conectar WireGuard: ${error}`);
    }
  }

  private async connectProxy(vpn: VPNConfig): Promise<void> {
    // Configurar proxy para o processo Node.js
    process.env.HTTP_PROXY = `http://${vpn.server}:${vpn.port}`;
    process.env.HTTPS_PROXY = `http://${vpn.server}:${vpn.port}`;
    
    if (vpn.username && vpn.password) {
      process.env.HTTP_PROXY_AUTH = `${vpn.username}:${vpn.password}`;
      process.env.HTTPS_PROXY_AUTH = `${vpn.username}:${vpn.password}`;
    }
  }

  async disconnectVPN(): Promise<void> {
    if (!this.isConnected) return;

    try {
      const vpn = this.currentRotation.currentVPN;
      if (!vpn) return;

      switch (vpn.type) {
        case 'openvpn':
          await this.disconnectOpenVPN();
          break;
        case 'wireguard':
          await this.disconnectWireGuard(vpn);
          break;
        case 'proxy':
        case 'socks':
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

  private async disconnectOpenVPN(): Promise<void> {
    const { exec } = require('child_process');
    const util = require('util');
    const execAsync = util.promisify(exec);

    try {
      await execAsync('sudo pkill openvpn');
    } catch (error) {
      console.error('Erro ao desconectar OpenVPN:', error);
    }
  }

  private async disconnectWireGuard(vpn: VPNConfig): Promise<void> {
    const { exec } = require('child_process');
    const util = require('util');
    const execAsync = util.promisify(exec);

    try {
      await execAsync(`sudo wg-quick down ${vpn.config}`);
    } catch (error) {
      console.error('Erro ao desconectar WireGuard:', error);
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
      console.error('❌ Falha no teste de conexão:', error);
      return false;
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