// Sistema de monitoramento automático da VPN

import { connectVPN, disconnectVPN, isVPNConnected, testVPNConnection, getCurrentVPN } from './vpnManager';
import { getRotationStats, forceIPRotation } from './ipRotation';

class VPNMonitor {
  private isMonitoring = false;
  private checkInterval: NodeJS.Timeout | null = null;
  private lastCheck = Date.now();
  private failureCount = 0;
  private maxFailures = 3;

  constructor() {
    this.startMonitoring();
  }

  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    console.log('🔍 Iniciando monitoramento automático da VPN...');

    // Verificar a cada 5 minutos
    this.checkInterval = setInterval(async () => {
      await this.performHealthCheck();
    }, 5 * 60 * 1000); // 5 minutos
  }

  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isMonitoring = false;
    console.log('🛑 Monitoramento da VPN parado');
  }

  private async performHealthCheck(): Promise<void> {
    try {
      console.log('🔍 Verificando saúde da VPN...');
      
      // Verificar se VPN está conectada
      if (!isVPNConnected()) {
        console.log('⚠️ VPN desconectada, tentando reconectar...');
        const connected = await connectVPN();
        if (connected) {
          console.log('✅ VPN reconectada automaticamente');
          this.failureCount = 0;
        } else {
          this.failureCount++;
          console.log(`❌ Falha ao reconectar VPN (${this.failureCount}/${this.maxFailures})`);
        }
        return;
      }

      // Testar conexão
      const connectionTest = await testVPNConnection();
      if (!connectionTest) {
        console.log('⚠️ Teste de conexão falhou, tentando rotação...');
        this.failureCount++;
        
        if (this.failureCount >= this.maxFailures) {
          console.log('🔄 Limite de falhas atingido, forçando rotação de IP...');
          const rotated = await forceIPRotation();
          if (rotated) {
            console.log('✅ IP rotacionado com sucesso');
            this.failureCount = 0;
          } else {
            console.log('❌ Falha na rotação de IP');
          }
        }
      } else {
        // Conexão OK, resetar contador
        this.failureCount = 0;
        const currentVPN = getCurrentVPN();
        if (currentVPN) {
          console.log(`✅ VPN saudável: ${currentVPN.server} (${currentVPN.country})`);
        }
      }

      this.lastCheck = Date.now();
    } catch (error) {
      console.error('❌ Erro no monitoramento da VPN:', error);
    }
  }

  // Método para forçar verificação manual
  async forceHealthCheck(): Promise<void> {
    console.log('🔍 Forçando verificação de saúde da VPN...');
    await this.performHealthCheck();
  }

  // Obter estatísticas do monitoramento
  getMonitoringStats(): any {
    const stats = getRotationStats();
    return {
      isMonitoring: this.isMonitoring,
      lastCheck: new Date(this.lastCheck),
      failureCount: this.failureCount,
      maxFailures: this.maxFailures,
      isVPNConnected: isVPNConnected(),
      currentVPN: getCurrentVPN(),
      rotationStats: stats
    };
  }

  // Configurar intervalo de verificação
  setCheckInterval(minutes: number): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    
    this.checkInterval = setInterval(async () => {
      await this.performHealthCheck();
    }, minutes * 60 * 1000);
    
    console.log(`⏰ Intervalo de verificação definido para ${minutes} minutos`);
  }

  // Configurar limite de falhas
  setMaxFailures(max: number): void {
    this.maxFailures = max;
    console.log(`🔢 Limite de falhas definido para ${max}`);
  }
}

// Instância singleton
const vpnMonitor = new VPNMonitor();

export function startVPNMonitoring(): void {
  vpnMonitor.startMonitoring();
}

export function stopVPNMonitoring(): void {
  vpnMonitor.stopMonitoring();
}

export async function forceVPNHealthCheck(): Promise<void> {
  return await vpnMonitor.forceHealthCheck();
}

export function getVPNMonitoringStats(): any {
  return vpnMonitor.getMonitoringStats();
}

export function setVPNCheckInterval(minutes: number): void {
  vpnMonitor.setCheckInterval(minutes);
}

export function setVPNMaxFailures(max: number): void {
  vpnMonitor.setMaxFailures(max);
} 