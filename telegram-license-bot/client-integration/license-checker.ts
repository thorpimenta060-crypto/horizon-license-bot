/**
 * Sistema de Validação de Licença - Horizon VMS
 * Integração com Bot do Telegram
 */

import axios from 'axios';
import * as crypto from 'crypto';

interface LicenseConfig {
  licenseKey: string;
  botApiUrl: string;
  domain: string;
}

interface LicenseStatus {
  valid: boolean;
  status?: string;
  expiresAt?: string;
  message?: string;
  error?: string;
}

class LicenseValidator {
  private config: LicenseConfig;
  private cacheFile: string;
  private lastCheck: number = 0;
  private checkInterval: number = 24 * 60 * 60 * 1000; // 24 horas
  private cachedStatus: LicenseStatus | null = null;

  constructor(config: LicenseConfig) {
    this.config = config;
    this.cacheFile = '/tmp/horizon_license_cache.json';
    this.loadCache();
  }

  /**
   * Carrega cache do disco
   */
  private loadCache() {
    try {
      const fs = require('fs');
      if (fs.existsSync(this.cacheFile)) {
        const data = JSON.parse(fs.readFileSync(this.cacheFile, 'utf8'));
        this.cachedStatus = data.status;
        this.lastCheck = data.timestamp;
      }
    } catch (error) {
      console.error('[LICENSE] Erro ao carregar cache:', error);
    }
  }

  /**
   * Salva cache no disco
   */
  private saveCache(status: LicenseStatus) {
    try {
      const fs = require('fs');
      const data = {
        status,
        timestamp: Date.now()
      };
      fs.writeFileSync(this.cacheFile, JSON.stringify(data));
      this.cachedStatus = status;
      this.lastCheck = Date.now();
    } catch (error) {
      console.error('[LICENSE] Erro ao salvar cache:', error);
    }
  }

  /**
   * Valida licença localmente (primeira camada)
   */
  private validateLocal(): boolean {
    const { licenseKey } = this.config;
    
    // Verificar formato da chave
    if (!licenseKey || !licenseKey.startsWith('HORIZON-')) {
      console.error('[LICENSE] ❌ Formato de chave inválido');
      return false;
    }

    // Verificar se a chave tem data de expiração embutida
    const parts = licenseKey.split('-');
    if (parts.length >= 3) {
      // Extrair possível data da chave (se existir)
      const dateStr = parts[parts.length - 1];
      if (dateStr.match(/^\d{8}$/)) {
        // Formato: YYYYMMDD
        const year = parseInt(dateStr.substring(0, 4));
        const month = parseInt(dateStr.substring(4, 6)) - 1;
        const day = parseInt(dateStr.substring(6, 8));
        const expiryDate = new Date(year, month, day);
        
        if (expiryDate < new Date()) {
          console.error('[LICENSE] ❌ Licença expirada (validação local)');
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Valida licença remotamente via bot do Telegram
   */
  private async validateRemote(): Promise<LicenseStatus> {
    try {
      console.log('[LICENSE] 🔍 Validando licença remotamente...');
      
      const response = await axios.post(
        this.config.botApiUrl,
        {
          action: 'validate',
          licenseKey: this.config.licenseKey,
          domain: this.config.domain
        },
        {
          timeout: 10000 // 10 segundos
        }
      );

      const status: LicenseStatus = response.data;
      
      if (status.valid) {
        console.log(`[LICENSE] ✅ Licença válida até ${status.expiresAt}`);
      } else {
        console.error(`[LICENSE] ❌ Licença inválida: ${status.message || status.error}`);
      }

      return status;
    } catch (error) {
      console.error('[LICENSE] ⚠️ Erro ao validar remotamente:', error);
      return {
        valid: false,
        error: 'Erro de conexão com servidor de validação'
      };
    }
  }

  /**
   * Verifica se precisa validar novamente
   */
  private needsCheck(): boolean {
    const now = Date.now();
    return (now - this.lastCheck) > this.checkInterval;
  }

  /**
   * Valida a licença (usa cache se disponível)
   */
  async validate(): Promise<LicenseStatus> {
    // 1. Validação local (rápida)
    if (!this.validateLocal()) {
      return {
        valid: false,
        error: 'Validação local falhou'
      };
    }

    // 2. Verificar se precisa validar remotamente
    if (!this.needsCheck() && this.cachedStatus) {
      console.log('[LICENSE] 📋 Usando cache de validação');
      return this.cachedStatus;
    }

    // 3. Validação remota
    const status = await this.validateRemote();
    
    // 4. Salvar cache
    this.saveCache(status);

    return status;
  }

  /**
   * Middleware para proteger rotas
   */
  async checkLicense(): Promise<void> {
    const status = await this.validate();
    
    if (!status.valid) {
      throw new Error(
        status.message || 
        'Sistema sem licença válida. Entre em contato com o desenvolvedor para regularizar o pagamento.'
      );
    }
  }

  /**
   * Inicia validação periódica em background
   */
  startPeriodicCheck() {
    console.log('[LICENSE] 🔄 Iniciando validação periódica...');
    
    // Validar imediatamente
    this.validate().then(status => {
      if (!status.valid) {
        console.error('[LICENSE] ⚠️ ATENÇÃO: Licença inválida!');
      }
    });

    // Validar a cada 24 horas
    setInterval(() => {
      this.validate().then(status => {
        if (!status.valid) {
          console.error('[LICENSE] ⚠️ ATENÇÃO: Licença inválida!');
        }
      });
    }, this.checkInterval);
  }
}

// Exportar instância singleton
let validator: LicenseValidator | null = null;

export function initializeLicenseValidation() {
  const config: LicenseConfig = {
    licenseKey: process.env.LICENSE_KEY || '',
    botApiUrl: process.env.LICENSE_BOT_URL || '',
    domain: process.env.DOMAIN || 'localhost'
  };

  if (!config.licenseKey) {
    console.error('[LICENSE] ❌ LICENSE_KEY não configurada no .env');
    process.exit(1);
  }

  if (!config.botApiUrl) {
    console.error('[LICENSE] ❌ LICENSE_BOT_URL não configurada no .env');
    process.exit(1);
  }

  validator = new LicenseValidator(config);
  validator.startPeriodicCheck();
}

export async function checkLicense(): Promise<void> {
  if (!validator) {
    throw new Error('Sistema de licenciamento não inicializado');
  }
  
  await validator.checkLicense();
}

export async function getLicenseStatus(): Promise<LicenseStatus> {
  if (!validator) {
    throw new Error('Sistema de licenciamento não inicializado');
  }
  
  return await validator.validate();
}
