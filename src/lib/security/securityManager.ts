import { notificationManager } from '@/lib/notifications/notificationSystem';

// Encryption key types
export type EncryptionKeyType = 'aes-256-gcm' | 'aes-256-cbc';

// Two-factor authentication methods
export type TwoFactorMethod = 'app' | 'email' | 'sms';

// Security log entry
export interface SecurityLogEntry {
  id: string;
  timestamp: Date;
  action: string;
  status: 'success' | 'failure';
  ipAddress?: string;
  userAgent?: string;
  details?: string;
  metadata?: Record<string, any>;
}

// API Key
export interface ApiKey {
  id: string;
  exchange: string;
  label: string;
  encryptedKey: string;
  encryptedSecret: string;
  encryptedPassphrase?: string;
  keyType: 'read' | 'trade' | 'withdraw';
  createdAt: Date;
  lastUsed?: Date;
  ipRestrictions?: string[];
  active: boolean;
}

// Security settings
export interface SecuritySettings {
  twoFactorEnabled: boolean;
  twoFactorMethod: TwoFactorMethod;
  sessionTimeout: number; // minutes
  ipWhitelist: string[];
  alertOnNewDevice: boolean;
  alertOnLogin: boolean;
  alertOnApiAccess: boolean;
  encryptionType: EncryptionKeyType;
  passwordLastChanged?: Date;
  requirePasswordChange: boolean;
}

// Default security settings
export const DEFAULT_SECURITY_SETTINGS: SecuritySettings = {
  twoFactorEnabled: false,
  twoFactorMethod: 'app',
  sessionTimeout: 30, // 30 minutes
  ipWhitelist: [],
  alertOnNewDevice: true,
  alertOnLogin: true,
  alertOnApiAccess: true,
  encryptionType: 'aes-256-gcm',
  requirePasswordChange: false,
};

// Security Manager class
export class SecurityManager {
  private settings: SecuritySettings;
  private securityLogs: SecurityLogEntry[] = [];
  private apiKeys: ApiKey[] = [];
  private encryptionKey?: string;
  
  constructor(settings: SecuritySettings = DEFAULT_SECURITY_SETTINGS) {
    this.settings = settings;
  }
  
  // Initialize encryption - in a real app, this would use a secure key management system
  async initializeEncryption(masterPassword: string): Promise<boolean> {
    try {
      // In a real app, we would derive a cryptographic key from the master password
      // For demo purposes, we'll just store the password directly (NEVER do this in production)
      this.encryptionKey = masterPassword;
      
      // Log the initialization
      this.addSecurityLog('encryption_initialized', 'success', 'Encryption system initialized');
      
      return true;
    } catch (error) {
      this.addSecurityLog('encryption_initialized', 'failure', `Failed to initialize encryption: ${error}`);
      return false;
    }
  }
  
  // Check if encryption is initialized
  isEncryptionInitialized(): boolean {
    return !!this.encryptionKey;
  }
  
  // Encrypt sensitive data - in a real app, this would use actual encryption
  encryptData(data: string): string {
    if (!this.encryptionKey) {
      throw new Error('Encryption not initialized');
    }
    
    // In a real app, this would use proper encryption algorithms
    // For demo purposes, we'll just use a simple obfuscation
    const obfuscated = Buffer.from(data).toString('base64');
    return `encrypted:${obfuscated}`;
  }
  
  // Decrypt sensitive data - in a real app, this would use actual decryption
  decryptData(encryptedData: string): string {
    if (!this.encryptionKey) {
      throw new Error('Encryption not initialized');
    }
    
    // In a real app, this would use proper decryption algorithms
    // For demo purposes, we'll just reverse our simple obfuscation
    if (!encryptedData.startsWith('encrypted:')) {
      throw new Error('Invalid encrypted data format');
    }
    
    const obfuscated = encryptedData.substring(10); // Remove 'encrypted:' prefix
    return Buffer.from(obfuscated, 'base64').toString();
  }
  
  // Add a new API key
  addApiKey(
    exchange: string,
    label: string,
    apiKey: string,
    apiSecret: string,
    apiPassphrase?: string,
    keyType: 'read' | 'trade' | 'withdraw' = 'read',
    ipRestrictions?: string[]
  ): ApiKey {
    if (!this.encryptionKey) {
      throw new Error('Encryption not initialized. Cannot store API keys securely.');
    }
    
    // Encrypt sensitive data
    const encryptedKey = this.encryptData(apiKey);
    const encryptedSecret = this.encryptData(apiSecret);
    const encryptedPassphrase = apiPassphrase ? this.encryptData(apiPassphrase) : undefined;
    
    // Create new API key entry
    const newApiKey: ApiKey = {
      id: `apikey-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      exchange,
      label,
      encryptedKey,
      encryptedSecret,
      encryptedPassphrase,
      keyType,
      createdAt: new Date(),
      ipRestrictions,
      active: true,
    };
    
    this.apiKeys.push(newApiKey);
    
    // Log API key addition
    this.addSecurityLog(
      'api_key_added',
      'success',
      `API key added for ${exchange}: ${label}`
    );
    
    // Send notification
    if (this.settings.alertOnApiAccess) {
      notificationManager.notify(
        'API Key Added',
        `A new API key for ${exchange} (${label}) has been added to your account.`,
        'security',
        'high',
        'system',
        { keyId: newApiKey.id, exchange, label, keyType }
      );
    }
    
    return newApiKey;
  }
  
  // Get API keys (returns only non-sensitive data)
  getApiKeys(): Omit<ApiKey, 'encryptedKey' | 'encryptedSecret' | 'encryptedPassphrase'>[] {
    return this.apiKeys.map(({ encryptedKey, encryptedSecret, encryptedPassphrase, ...rest }) => rest);
  }
  
  // Get full API key details (including decrypted secrets)
  getApiKeyDetails(keyId: string): {
    id: string;
    exchange: string;
    label: string;
    key: string;
    secret: string;
    passphrase?: string;
    keyType: 'read' | 'trade' | 'withdraw';
    createdAt: Date;
    lastUsed?: Date;
    ipRestrictions?: string[];
    active: boolean;
  } | null {
    if (!this.encryptionKey) {
      throw new Error('Encryption not initialized. Cannot decrypt API key details.');
    }
    
    const apiKey = this.apiKeys.find(key => key.id === keyId);
    
    if (!apiKey) {
      return null;
    }
    
    // Log API key access
    this.addSecurityLog(
      'api_key_accessed',
      'success',
      `API key details accessed: ${apiKey.exchange} - ${apiKey.label}`
    );
    
    // Send notification if configured
    if (this.settings.alertOnApiAccess) {
      notificationManager.notify(
        'API Key Accessed',
        `The API key for ${apiKey.exchange} (${apiKey.label}) was accessed.`,
        'security',
        'medium',
        'system',
        { keyId: apiKey.id, exchange: apiKey.exchange, label: apiKey.label }
      );
    }
    
    // Update last used timestamp
    apiKey.lastUsed = new Date();
    
    // Decrypt and return
    return {
      id: apiKey.id,
      exchange: apiKey.exchange,
      label: apiKey.label,
      key: this.decryptData(apiKey.encryptedKey),
      secret: this.decryptData(apiKey.encryptedSecret),
      passphrase: apiKey.encryptedPassphrase ? this.decryptData(apiKey.encryptedPassphrase) : undefined,
      keyType: apiKey.keyType,
      createdAt: apiKey.createdAt,
      lastUsed: apiKey.lastUsed,
      ipRestrictions: apiKey.ipRestrictions,
      active: apiKey.active,
    };
  }
  
  // Update API key
  updateApiKey(
    keyId: string,
    updates: {
      label?: string;
      apiKey?: string;
      apiSecret?: string;
      apiPassphrase?: string;
      keyType?: 'read' | 'trade' | 'withdraw';
      ipRestrictions?: string[];
      active?: boolean;
    }
  ): boolean {
    if (!this.encryptionKey && (updates.apiKey || updates.apiSecret || updates.apiPassphrase)) {
      throw new Error('Encryption not initialized. Cannot update API key securely.');
    }
    
    const apiKeyIndex = this.apiKeys.findIndex(key => key.id === keyId);
    
    if (apiKeyIndex === -1) {
      return false;
    }
    
    const apiKey = this.apiKeys[apiKeyIndex];
    
    // Update fields
    if (updates.label) {
      apiKey.label = updates.label;
    }
    
    if (updates.apiKey) {
      apiKey.encryptedKey = this.encryptData(updates.apiKey);
    }
    
    if (updates.apiSecret) {
      apiKey.encryptedSecret = this.encryptData(updates.apiSecret);
    }
    
    if (updates.apiPassphrase !== undefined) {
      apiKey.encryptedPassphrase = updates.apiPassphrase 
        ? this.encryptData(updates.apiPassphrase) 
        : undefined;
    }
    
    if (updates.keyType) {
      apiKey.keyType = updates.keyType;
    }
    
    if (updates.ipRestrictions) {
      apiKey.ipRestrictions = updates.ipRestrictions;
    }
    
    if (updates.active !== undefined) {
      apiKey.active = updates.active;
    }
    
    // Update the API key in the array
    this.apiKeys[apiKeyIndex] = apiKey;
    
    // Log API key update
    this.addSecurityLog(
      'api_key_updated',
      'success',
      `API key updated: ${apiKey.exchange} - ${apiKey.label}`
    );
    
    // Send notification
    notificationManager.notify(
      'API Key Updated',
      `The API key for ${apiKey.exchange} (${apiKey.label}) has been updated.`,
      'security',
      'medium',
      'system',
      { keyId: apiKey.id, exchange: apiKey.exchange, label: apiKey.label }
    );
    
    return true;
  }
  
  // Delete API key
  deleteApiKey(keyId: string): boolean {
    const apiKeyIndex = this.apiKeys.findIndex(key => key.id === keyId);
    
    if (apiKeyIndex === -1) {
      return false;
    }
    
    const apiKey = this.apiKeys[apiKeyIndex];
    
    // Remove the API key
    this.apiKeys.splice(apiKeyIndex, 1);
    
    // Log API key deletion
    this.addSecurityLog(
      'api_key_deleted',
      'success',
      `API key deleted: ${apiKey.exchange} - ${apiKey.label}`
    );
    
    // Send notification
    notificationManager.notify(
      'API Key Deleted',
      `The API key for ${apiKey.exchange} (${apiKey.label}) has been deleted.`,
      'security',
      'high',
      'system',
      { keyId: apiKey.id, exchange: apiKey.exchange, label: apiKey.label }
    );
    
    return true;
  }
  
  // Generate a TOTP code for 2FA (mock implementation)
  generateTOTPCode(): string {
    // In a real app, this would generate a proper TOTP code
    // For demo purposes, we'll return a random 6-digit code
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
  
  // Verify a TOTP code (mock implementation)
  verifyTOTPCode(code: string): boolean {
    // In a real app, this would verify the code against the current TOTP value
    // For demo purposes, we'll just check if it's a 6-digit number
    const isValid = /^\d{6}$/.test(code);
    
    // Log the verification attempt
    this.addSecurityLog(
      '2fa_verification',
      isValid ? 'success' : 'failure',
      `2FA code verification attempt: ${isValid ? 'successful' : 'failed'}`
    );
    
    return isValid;
  }
  
  // Enable two-factor authentication
  enableTwoFactorAuth(method: TwoFactorMethod): { secret?: string; success: boolean } {
    if (this.settings.twoFactorEnabled) {
      return { success: false };
    }
    
    // Update settings
    this.settings.twoFactorEnabled = true;
    this.settings.twoFactorMethod = method;
    
    let secret = undefined;
    
    // For app-based 2FA, we would generate a secret key
    if (method === 'app') {
      // In a real app, this would be a proper secure random secret
      secret = 'EXAMPLEBASE32SECRET';
    }
    
    // Log 2FA enablement
    this.addSecurityLog(
      '2fa_enabled',
      'success',
      `Two-factor authentication enabled with method: ${method}`
    );
    
    // Send notification
    notificationManager.notify(
      'Two-Factor Authentication Enabled',
      `Two-factor authentication has been enabled for your account using ${method}.`,
      'security',
      'high',
      'system',
      { method }
    );
    
    return { secret, success: true };
  }
  
  // Disable two-factor authentication
  disableTwoFactorAuth(): boolean {
    if (!this.settings.twoFactorEnabled) {
      return false;
    }
    
    // Update settings
    this.settings.twoFactorEnabled = false;
    
    // Log 2FA disablement
    this.addSecurityLog(
      '2fa_disabled',
      'success',
      'Two-factor authentication disabled'
    );
    
    // Send high-priority notification
    notificationManager.notify(
      'Two-Factor Authentication Disabled',
      'Two-factor authentication has been disabled for your account. This reduces your account security.',
      'security',
      'critical',
      'system'
    );
    
    return true;
  }
  
  // Update security settings
  updateSecuritySettings(newSettings: Partial<SecuritySettings>): SecuritySettings {
    const oldSettings = { ...this.settings };
    this.settings = { ...this.settings, ...newSettings };
    
    // Log settings update
    this.addSecurityLog(
      'security_settings_updated',
      'success',
      'Security settings updated'
    );
    
    // Send notification if sensitive settings were changed
    if (
      oldSettings.twoFactorEnabled !== this.settings.twoFactorEnabled ||
      oldSettings.twoFactorMethod !== this.settings.twoFactorMethod ||
      oldSettings.ipWhitelist?.length !== this.settings.ipWhitelist?.length ||
      oldSettings.encryptionType !== this.settings.encryptionType
    ) {
      notificationManager.notify(
        'Security Settings Changed',
        'Your account security settings have been updated.',
        'security',
        'high',
        'system'
      );
    }
    
    return { ...this.settings };
  }
  
  // Get current security settings
  getSecuritySettings(): SecuritySettings {
    return { ...this.settings };
  }
  
  // Add a security log entry
  addSecurityLog(
    action: string,
    status: 'success' | 'failure',
    details?: string,
    metadata?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): SecurityLogEntry {
    const logEntry: SecurityLogEntry = {
      id: `security-log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      action,
      status,
      details,
      metadata,
      ipAddress,
      userAgent,
    };
    
    this.securityLogs.push(logEntry);
    
    // Limit log size to last 1000 entries
    if (this.securityLogs.length > 1000) {
      this.securityLogs.shift();
    }
    
    // For critical security events, send a notification
    if (
      status === 'failure' ||
      action.includes('login') ||
      action.includes('password') ||
      action.includes('2fa') ||
      action.includes('api_key')
    ) {
      const priority = status === 'failure' ? 'critical' : 'medium';
      
      // Only send login notifications if enabled
      if (action === 'login' && !this.settings.alertOnLogin) {
        return logEntry;
      }
      
      notificationManager.notify(
        `Security Alert: ${this.formatActionForDisplay(action)}`,
        `${this.formatActionForDisplay(action)} - ${status.toUpperCase()}${details ? `: ${details}` : ''}`,
        'security',
        priority,
        'system',
        { logId: logEntry.id, action, status, ipAddress }
      );
    }
    
    return logEntry;
  }
  
  // Get security logs
  getSecurityLogs(limit: number = 100, action?: string, status?: 'success' | 'failure'): SecurityLogEntry[] {
    let filteredLogs = [...this.securityLogs];
    
    if (action) {
      filteredLogs = filteredLogs.filter(log => log.action === action);
    }
    
    if (status) {
      filteredLogs = filteredLogs.filter(log => log.status === status);
    }
    
    // Sort by timestamp, newest first
    filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    // Apply limit
    return filteredLogs.slice(0, limit);
  }
  
  // Check if IP is whitelisted
  isIpWhitelisted(ip: string): boolean {
    if (this.settings.ipWhitelist.length === 0) {
      return true; // No whitelist means all IPs allowed
    }
    
    return this.settings.ipWhitelist.includes(ip);
  }
  
  // Helper method to format action names for display
  private formatActionForDisplay(action: string): string {
    return action
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}

// Create singleton instance
export const securityManager = new SecurityManager(); 