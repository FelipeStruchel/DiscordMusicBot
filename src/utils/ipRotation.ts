// Sistema de rotação de IP para contornar IPs queimados

import { connectVPN, rotateVPN, isVPNConnected, testVPNConnection } from './vpnManager';

export interface IPRotationConfig {
  autoRotate: boolean;
  rotationInterval: number; // em minutos
  maxFailuresBeforeRotation: number;
  enableVPN: boolean;
  enableProxy: boolean;
}

class IPRotationManager {
  private config: IPRotationConfig;
  private failureCount = 0;
  private lastRotation = Date.now();
  private isRotating = false;

  constructor(config: IPRotationConfig = {
    autoRotate: true,
    rotationInterval: 15, // 15 minutos
    maxFailuresBeforeRotation: 3,
    enableVPN: true,
    enableProxy: true
  }) {
    this.config = config;
  }

  async handleFailure(error: any): Promise<boolean> {
    this.failureCount++;
    
    console.log(`❌ Falha detectada (${this.failureCount}/${this.config.maxFailuresBeforeRotation})`);
    
    // Verificar se é um erro de IP queimado
    if (this.isIPBlockedError(error)) {
      console.log('🚨 IP bloqueado detectado! Iniciando rotação...');
      return await this.rotateIP();
    }
    
    // Verificar se atingiu limite de falhas
    if (this.failureCount >= this.config.maxFailuresBeforeRotation) {
      console.log('🔄 Limite de falhas atingido, rotacionando IP...');
      return await this.rotateIP();
    }
    
    // Verificar rotação por tempo
    if (this.shouldRotateByTime()) {
      console.log('⏰ Rotação por tempo, mudando IP...');
      return await this.rotateIP();
    }
    
    return false; // Não rotacionou
  }

  private isIPBlockedError(error: any): boolean {
    const errorMessage = error.message || error.toString();
    
    const blockedPatterns = [
      'Failed to extract any player response',
      'IP has been blocked',
      'Access denied',
      'Forbidden',
      'HTTP Error 403',
      'HTTP Error 429',
      'Too many requests',
      'Rate limit exceeded',
      'Your IP has been temporarily blocked'
    ];
    
    return blockedPatterns.some(pattern => 
      errorMessage.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  private shouldRotateByTime(): boolean {
    if (!this.config.autoRotate) return false;
    
    const timeSinceLastRotation = Date.now() - this.lastRotation;
    const rotationIntervalMs = this.config.rotationInterval * 60 * 1000;
    
    return timeSinceLastRotation > rotationIntervalMs;
  }

  async rotateIP(): Promise<boolean> {
    if (this.isRotating) {
      console.log('⏳ Rotação já em andamento...');
      return false;
    }

    this.isRotating = true;
    
    try {
      console.log('🔄 Iniciando rotação de IP...');
      
      let success = false;
      
      // Tentar VPN primeiro
      if (this.config.enableVPN) {
        console.log('🔒 Tentando rotação via VPN...');
        success = await this.rotateViaVPN();
      }
      
      // Se VPN falhou, tentar proxy
      if (!success && this.config.enableProxy) {
        console.log('🌐 Tentando rotação via Proxy...');
        success = await this.rotateViaProxy();
      }
      
      if (success) {
        console.log('✅ IP rotacionado com sucesso!');
        this.resetFailureCount();
        this.lastRotation = Date.now();
        
        // Testar nova conexão
        const connectionTest = await testVPNConnection();
        if (connectionTest) {
          console.log('✅ Conexão testada e funcionando');
        } else {
          console.log('⚠️ Conexão testada mas pode ter problemas');
        }
      } else {
        console.log('❌ Falha na rotação de IP');
      }
      
      return success;
    } catch (error) {
      console.error('❌ Erro durante rotação de IP:', error);
      return false;
    } finally {
      this.isRotating = false;
    }
  }

  private async rotateViaVPN(): Promise<boolean> {
    try {
      // Se já está conectado, desconectar primeiro
      if (isVPNConnected()) {
        console.log('🔌 Desconectando VPN atual...');
        const { disconnectVPN } = require('./vpnManager');
        await disconnectVPN();
        await new Promise(resolve => setTimeout(resolve, 3000)); // Aguardar desconexão
      }
      
      // Tentar conectar nova VPN
      console.log('🔌 Conectando nova VPN...');
      const connected = await connectVPN();
      
      if (connected) {
        console.log('✅ VPN conectada com sucesso');
        return true;
      } else {
        console.log('❌ Falha ao conectar VPN');
        return false;
      }
    } catch (error) {
      console.error('❌ Erro ao rotacionar via VPN:', error);
      return false;
    }
  }

  private async rotateViaProxy(): Promise<boolean> {
    try {
      // Implementar rotação via proxy
      // Por enquanto, retornar false para usar VPN
      console.log('⚠️ Rotação via proxy não implementada ainda');
      return false;
    } catch (error) {
      console.error('❌ Erro ao rotacionar via proxy:', error);
      return false;
    }
  }

  private resetFailureCount(): void {
    this.failureCount = 0;
  }

  // Método para forçar rotação manual
  async forceRotation(): Promise<boolean> {
    console.log('🔄 Forçando rotação de IP...');
    this.failureCount = this.config.maxFailuresBeforeRotation; // Forçar rotação
    return await this.rotateIP();
  }

  // Obter estatísticas de rotação
  getRotationStats(): any {
    return {
      failureCount: this.failureCount,
      maxFailures: this.config.maxFailuresBeforeRotation,
      lastRotation: new Date(this.lastRotation),
      timeSinceLastRotation: Date.now() - this.lastRotation,
      isRotating: this.isRotating,
      autoRotate: this.config.autoRotate
    };
  }

  // Configurar intervalo de rotação
  setRotationInterval(minutes: number): void {
    this.config.rotationInterval = minutes;
    console.log(`⏰ Intervalo de rotação definido para ${minutes} minutos`);
  }

  // Habilitar/desabilitar rotação automática
  setAutoRotate(enabled: boolean): void {
    this.config.autoRotate = enabled;
    console.log(`🔄 Rotação automática ${enabled ? 'habilitada' : 'desabilitada'}`);
  }
}

// Instância singleton
const ipRotationManager = new IPRotationManager();

export async function handleIPFailure(error: any): Promise<boolean> {
  return await ipRotationManager.handleFailure(error);
}

export async function forceIPRotation(): Promise<boolean> {
  return await ipRotationManager.forceRotation();
}

export function getRotationStats(): any {
  return ipRotationManager.getRotationStats();
}

export function setRotationInterval(minutes: number): void {
  ipRotationManager.setRotationInterval(minutes);
}

export function setAutoRotate(enabled: boolean): void {
  ipRotationManager.setAutoRotate(enabled);
} 