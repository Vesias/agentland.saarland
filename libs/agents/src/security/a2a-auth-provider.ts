/**
 * A2A Authentication Provider
 * =========================
 * 
 * Provides authentication services for Agent-to-Agent communication,
 * supporting multiple authentication mechanisms including API keys, 
 * JWT tokens, and mutual TLS certificate authentication.
 */

import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { promises as fs } from 'fs';
import path from 'path';
import { Logger } from '../../../core/src/logging/logger';
import {
  AgentAccessLevel,
  AgentCredentialType,
  AuthenticationResult,
  SecureA2AMessage,
  AgentCredentials
} from './a2a-security.types';
import A2ADNSVerifier, { DNSVerificationOptions } from './a2a-dns-verifier';

/**
 * Agent identity
 */
interface AgentIdentity {
  agentId: string;
  accessLevel: AgentAccessLevel;
  roles: string[];
  metadata?: Record<string, unknown>;
}

/**
 * API key record
 */
interface ApiKeyRecord {
  keyHash: string;
  identity: AgentIdentity;
  createdAt: Date;
  expiresAt?: Date;
  lastUsed?: Date;
  usageCount: number;
  disabled: boolean;
}

/**
 * JWT token configuration
 */
interface JwtConfig {
  secretKey: string;
  issuer: string;
  audience: string;
  expiresIn: string; // e.g., '1h', '7d'
}

/**
 * Certificate configuration
 */
interface CertConfig {
  caCertPath: string;
  caKeyPath: string;
  certsDir: string;
}

/**
 * DNS Authentication configuration
 */
interface DNSAuthConfig {
  // Whether to enable DNS authentication
  enabled: boolean;
  
  // Domain for DNS verification
  domain: string;
  
  // Authentication token stored in DNS
  authToken: string;
  
  // Domain verification token
  verificationToken: string;
  
  // DNS verification options
  options?: DNSVerificationOptions;
}

/**
 * Authentication configuration
 */
interface AuthConfig {
  apiKeysFile?: string;
  jwt?: JwtConfig;
  cert?: CertConfig;
  allowedIPRanges?: string[];
  dns?: DNSAuthConfig;
}

/**
 * JWT token payload
 */
interface JwtPayload {
  iss: string;           // Issuer
  aud: string;           // Audience
  sub: string;           // Subject (agent ID)
  iat: number;           // Issued at
  exp: number;           // Expires at
  accessLevel: string;   // Agent access level
  roles: string[];       // Agent roles
}

/**
 * A2A Authentication Provider
 */
export class A2AAuthProvider {
  private logger: Logger;
  private apiKeys: Map<string, ApiKeyRecord>;
  private jwtConfig?: JwtConfig;
  private certConfig?: CertConfig;
  private allowedIPRanges: string[];
  private apiKeysFile?: string;
  private dnsConfig?: DNSAuthConfig;
  private dnsVerifier?: A2ADNSVerifier;
  
  /**
   * Create a new A2A authentication provider
   * 
   * @param config - Authentication configuration
   */
  constructor(config: AuthConfig = {}) {
    this.logger = new Logger('a2a-auth');
    this.apiKeys = new Map();
    this.jwtConfig = config.jwt;
    this.certConfig = config.cert;
    this.allowedIPRanges = config.allowedIPRanges || [];
    this.apiKeysFile = config.apiKeysFile;
    this.dnsConfig = config.dns;
    
    // Initialize DNS verifier if configured
    if (this.dnsConfig?.enabled) {
      this.dnsVerifier = new A2ADNSVerifier(this.dnsConfig.options);
      this.logger.info('DNS authentication enabled', {
        domain: this.dnsConfig.domain
      });
    }
    
    this.logger.info('A2A Authentication Provider initialized');
  }
  
  /**
   * Initialize authentication provider
   * Loads API keys from file if specified
   */
  public async initialize(): Promise<void> {
    if (this.apiKeysFile) {
      await this.loadApiKeys();
    }
    
    // Test DNS configuration if enabled
    if (this.dnsConfig?.enabled && this.dnsVerifier) {
      try {
        const result = await this.dnsVerifier.verifyDomainAuth(
          this.dnsConfig.domain,
          this.dnsConfig.authToken
        );
        
        if (result.verified) {
          this.logger.info('DNS authentication configuration verified successfully');
        } else {
          this.logger.warn('DNS authentication configuration verification failed', {
            error: result.error
          });
        }
      } catch (error) {
        this.logger.error('Error testing DNS authentication configuration', { error });
      }
    }
  }
  
  /**
   * Load API keys from file
   * @private
   */
  private async loadApiKeys(): Promise<void> {
    if (!this.apiKeysFile) {
      return;
    }
    
    try {
      const keysDir = path.dirname(this.apiKeysFile);
      await fs.mkdir(keysDir, { recursive: true });
      
      try {
        const data = await fs.readFile(this.apiKeysFile, 'utf-8');
        const records = JSON.parse(data) as Array<ApiKeyRecord>;
        
        // Convert string dates to Date objects
        records.forEach(record => {
          record.createdAt = new Date(record.createdAt);
          if (record.expiresAt) record.expiresAt = new Date(record.expiresAt);
          if (record.lastUsed) record.lastUsed = new Date(record.lastUsed);
          
          this.apiKeys.set(record.keyHash, record);
        });
        
        this.logger.info(`Loaded ${records.length} API keys`);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
          // File doesn't exist yet, will be created on save
          this.logger.info(`API keys file not found, will create on first save`);
        } else {
          this.logger.error('Error loading API keys', { error });
          throw error;
        }
      }
    } catch (error) {
      this.logger.error('Failed to initialize API keys', { error });
      throw new Error(`Failed to initialize API keys: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Save API keys to file
   * @private
   */
  private async saveApiKeys(): Promise<void> {
    if (!this.apiKeysFile) {
      return;
    }
    
    try {
      const records = Array.from(this.apiKeys.values());
      const data = JSON.stringify(records, null, 2);
      
      const keysDir = path.dirname(this.apiKeysFile);
      await fs.mkdir(keysDir, { recursive: true });
      
      await fs.writeFile(this.apiKeysFile, data, 'utf-8');
      this.logger.info(`Saved ${records.length} API keys`);
    } catch (error) {
      this.logger.error('Error saving API keys', { error });
      throw new Error(`Failed to save API keys: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Generate a secure API key
   * 
   * @returns API key string
   */
  public generateApiKey(): string {
    // Generate 32 bytes of random data
    const buffer = crypto.randomBytes(32);
    
    // Format as hex string with prefix
    return `a2a_${buffer.toString('hex')}`;
  }
  
  /**
   * Hash an API key
   * 
   * @param apiKey - API key to hash
   * @returns Hashed API key
   * @private
   */
  private hashApiKey(apiKey: string): string {
    return crypto
      .createHash('sha256')
      .update(apiKey)
      .digest('hex');
  }
  
  /**
   * Register a new API key for an agent
   * 
   * @param agentId - Agent identifier
   * @param accessLevel - Access level
   * @param roles - Agent roles
   * @param expiresInDays - Number of days until expiration (0 for no expiration)
   * @param metadata - Additional metadata
   * @returns Generated API key
   */
  public async registerApiKey(
    agentId: string,
    accessLevel: AgentAccessLevel = AgentAccessLevel.PUBLIC,
    roles: string[] = [],
    expiresInDays: number = 0,
    metadata: Record<string, unknown> = {}
  ): Promise<string> {
    const apiKey = this.generateApiKey();
    const keyHash = this.hashApiKey(apiKey);
    
    // Create expiration date if specified
    let expiresAt: Date | undefined;
    if (expiresInDays > 0) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);
    }
    
    // Create API key record
    const record: ApiKeyRecord = {
      keyHash,
      identity: {
        agentId,
        accessLevel,
        roles,
        metadata
      },
      createdAt: new Date(),
      expiresAt,
      usageCount: 0,
      disabled: false
    };
    
    // Store API key
    this.apiKeys.set(keyHash, record);
    
    // Save API keys to file
    await this.saveApiKeys();
    
    this.logger.info(`API key registered for agent: ${agentId}`, {
      accessLevel,
      roles,
      expiresInDays
    });
    
    return apiKey;
  }
  
  /**
   * Revoke an API key
   * 
   * @param apiKey - API key to revoke
   * @returns True if key was revoked
   */
  public async revokeApiKey(apiKey: string): Promise<boolean> {
    const keyHash = this.hashApiKey(apiKey);
    const record = this.apiKeys.get(keyHash);
    
    if (!record) {
      return false;
    }
    
    // Set disabled flag
    record.disabled = true;
    
    // Save API keys to file
    await this.saveApiKeys();
    
    this.logger.info(`API key revoked for agent: ${record.identity.agentId}`);
    
    return true;
  }
  
  /**
   * Authenticate with API key
   * 
   * @param apiKey - API key to authenticate
   * @returns Authentication result
   * @private
   */
  private authenticateWithApiKey(apiKey: string): AuthenticationResult {
    const keyHash = this.hashApiKey(apiKey);
    const record = this.apiKeys.get(keyHash);
    
    if (!record) {
      return {
        authenticated: false,
        error: 'Invalid API key'
      };
    }
    
    // Check if disabled
    if (record.disabled) {
      return {
        authenticated: false,
        error: 'API key has been revoked'
      };
    }
    
    // Check if expired
    if (record.expiresAt && record.expiresAt < new Date()) {
      return {
        authenticated: false,
        error: 'API key has expired'
      };
    }
    
    // Update usage stats
    record.lastUsed = new Date();
    record.usageCount++;
    
    // Save asynchronously but don't wait for completion
    this.saveApiKeys().catch(error => {
      this.logger.error('Error saving API keys after authentication', { error });
    });
    
    return {
      authenticated: true,
      agentId: record.identity.agentId,
      accessLevel: record.identity.accessLevel,
      roles: record.identity.roles
    };
  }
  
  /**
   * Generate a JWT token for an agent
   * 
   * @param agentId - Agent identifier
   * @param accessLevel - Access level
   * @param roles - Agent roles
   * @param expiresIn - Expiration time (e.g., '1h', '7d')
   * @returns JWT token
   */
  public generateJwtToken(
    agentId: string,
    accessLevel: AgentAccessLevel,
    roles: string[] = [],
    expiresIn?: string
  ): string {
    if (!this.jwtConfig) {
      throw new Error('JWT authentication is not configured');
    }
    
    const payload: JwtPayload = {
      iss: this.jwtConfig.issuer,
      aud: this.jwtConfig.audience,
      sub: agentId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600, // Default 1 hour
      accessLevel,
      roles
    };
    
    const token = jwt.sign(
      payload,
      this.jwtConfig.secretKey,
      {
        expiresIn: expiresIn || this.jwtConfig.expiresIn
      }
    );
    
    this.logger.info(`JWT token generated for agent: ${agentId}`);
    
    return token;
  }
  
  /**
   * Authenticate with JWT token
   * 
   * @param token - JWT token to authenticate
   * @returns Authentication result
   * @private
   */
  private authenticateWithJwt(token: string): AuthenticationResult {
    if (!this.jwtConfig) {
      return {
        authenticated: false,
        error: 'JWT authentication is not configured'
      };
    }
    
    try {
      const decoded = jwt.verify(token, this.jwtConfig.secretKey, {
        issuer: this.jwtConfig.issuer,
        audience: this.jwtConfig.audience
      }) as JwtPayload;
      
      return {
        authenticated: true,
        agentId: decoded.sub,
        accessLevel: decoded.accessLevel as AgentAccessLevel,
        roles: decoded.roles
      };
    } catch (error) {
      return {
        authenticated: false,
        error: `JWT token validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
  
  /**
   * Authenticate a message
   * 
   * @param message - Message to authenticate
   * @returns Authentication result
   */
  public authenticate(message: SecureA2AMessage): Promise<AuthenticationResult> | AuthenticationResult {
    // Check if credentials are provided
    if (!message.credentials) {
      return {
        authenticated: false,
        error: 'No credentials provided'
      };
    }
    
    // Authenticate based on credential type
    switch (message.credentials.type) {
      case AgentCredentialType.API_KEY:
        return this.authenticateWithApiKey(message.credentials.value);
      
      case AgentCredentialType.JWT:
        return this.authenticateWithJwt(message.credentials.value);
      
      case AgentCredentialType.DNS:
        return this.authenticateWithDns(message.credentials.value, message.from);
      
      case AgentCredentialType.MUTUAL_TLS:
        // Not implemented yet
        return {
          authenticated: false,
          error: 'Mutual TLS authentication not implemented yet'
        };
      
      default:
        return {
          authenticated: false,
          error: `Unsupported credential type: ${message.credentials.type}`
        };
    }
  }
  
  /**
   * Create credentials for a message
   * 
   * @param agentId - Agent identifier
   * @param credentialType - Credential type
   * @param credentialValue - Credential value (optional, will be generated if not provided)
   * @returns Agent credentials
   */
  public createCredentials(
    agentId: string,
    credentialType: AgentCredentialType,
    credentialValue?: string
  ): AgentCredentials {
    let value = credentialValue;
    
    // Generate value if not provided
    if (!value) {
      switch (credentialType) {
        case AgentCredentialType.API_KEY:
          value = this.generateApiKey();
          break;
          
        case AgentCredentialType.JWT:
          if (!this.jwtConfig) {
            throw new Error('JWT authentication is not configured');
          }
          value = this.generateJwtToken(agentId, AgentAccessLevel.PUBLIC);
          break;
          
        default:
          throw new Error(`Cannot generate credential of type: ${credentialType}`);
      }
    }
    
    return {
      type: credentialType,
      value
    };
  }
}

  /**
   * Authenticate using DNS verification
   * 
   * @param domainName - Domain name to verify
   * @param agentId - Agent identifier (from message.from)
   * @returns Authentication result (Promise)
   * @private
   */
  private async authenticateWithDns(domainName: string, agentId: string): Promise<AuthenticationResult> {
    if (!this.dnsConfig?.enabled || !this.dnsVerifier) {
      return {
        authenticated: false,
        error: 'DNS authentication is not configured'
      };
    }
    
    try {
      // Extract domain from the provided value
      const domain = domainName.trim().toLowerCase();
      
      // Verify domain authentication using DNS
      const result = await this.dnsVerifier.verifyDomainAuth(
        domain,
        this.dnsConfig.authToken
      );
      
      if (!result.verified) {
        return {
          authenticated: false,
          error: result.error || 'DNS authentication failed'
        };
      }
      
      // Build agent ID from domain if not provided explicitly
      const effectiveAgentId = agentId || `dns-agent-${domain}`;
      
      this.logger.info(`DNS authentication successful for domain: ${domain}`, {
        agentId: effectiveAgentId
      });
      
      // Domain verified, return success
      return {
        authenticated: true,
        agentId: effectiveAgentId,
        accessLevel: AgentAccessLevel.PROTECTED,
        roles: [`domain:${domain}`],
        metadata: {
          authenticationType: 'dns',
          verifiedDomain: domain
        }
      };
    } catch (error) {
      this.logger.error('DNS authentication error', { error });
      
      return {
        authenticated: false,
        error: `DNS authentication error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
  
  /**
   * Verify domain ownership
   * 
   * @param domain - Domain to verify
   * @returns True if domain ownership is verified
   */
  public async verifyDomainOwnership(domain: string): Promise<boolean> {
    if (!this.dnsConfig?.enabled || !this.dnsVerifier) {
      this.logger.warn('Domain ownership verification failed: DNS verification not configured');
      return false;
    }
    
    try {
      const result = await this.dnsVerifier.verifyDomainOwnership(
        domain,
        this.dnsConfig.verificationToken
      );
      
      if (result.verified) {
        this.logger.info(`Domain ownership verified: ${domain}`);
      } else {
        this.logger.warn(`Domain ownership verification failed: ${domain}`, {
          error: result.error
        });
      }
      
      return result.verified;
    } catch (error) {
      this.logger.error('Domain ownership verification error', { error, domain });
      return false;
    }
  }
  
  /**
   * Generate DNS verification records for a domain
   * 
   * @param domain - Domain to generate records for
   * @returns DNS verification records and instructions
   */
  public generateDnsVerificationRecords(domain: string): {
    records: Array<{ type: string; name: string; value: string; ttl: number }>;
    instructions: string;
  } {
    if (!this.dnsConfig?.enabled) {
      throw new Error('DNS authentication is not configured');
    }
    
    // Generate records
    const records = [
      {
        type: 'TXT',
        name: '_a2a-auth',
        value: `v=A2A1; t=${this.dnsConfig.authToken}; d=${domain}`,
        ttl: 3600
      },
      {
        type: 'TXT',
        name: '@',
        value: `agentland-verification=${this.dnsConfig.verificationToken}`,
        ttl: 3600
      }
    ];
    
    // Generate instructions
    const instructions = [
      '# DNS Verification Records for Agent-to-Agent Communication',
      '',
      'Add the following TXT records to your DNS configuration:',
      '',
      '## Authentication Record',
      'Record Type: TXT',
      'Name: _a2a-auth',
      `Value: v=A2A1; t=${this.dnsConfig.authToken}; d=${domain}`,
      'TTL: 3600',
      '',
      '## Domain Verification Record',
      'Record Type: TXT',
      'Name: @',
      `Value: agentland-verification=${this.dnsConfig.verificationToken}`,
      'TTL: 3600',
      '',
      'Once added, allow time for DNS propagation (typically 15 minutes to 24 hours).',
      'Then use the domain verification API to verify your domain ownership.'
    ].join('\n');
    
    return { records, instructions };
  }
}

export default A2AAuthProvider;