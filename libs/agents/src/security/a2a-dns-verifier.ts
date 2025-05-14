/**
 * A2A DNS Verifier
 * ===============
 * 
 * Service for DNS-based verification of agent domains and authentication tokens.
 * Uses DNS TXT records for domain ownership verification and secure agent authentication.
 */

import dns from 'dns';
import { promisify } from 'util';
import { Logger } from '../../../core/src/logging/logger';

// Promisified DNS methods
const resolveTxt = promisify(dns.resolveTxt);

/**
 * DNS verification options
 */
export interface DNSVerificationOptions {
  // Time to cache DNS records in milliseconds (default: 5 minutes)
  cacheTTL?: number;
  
  // DNS resolver timeout in milliseconds (default: 5000ms)
  timeout?: number;
  
  // Whether to enable result caching (default: true)
  enableCache?: boolean;
}

/**
 * Cached DNS record
 */
interface CachedRecord {
  value: string[][];
  timestamp: number;
}

/**
 * DNS verification result
 */
export interface DNSVerificationResult {
  verified: boolean;
  domain: string;
  error?: string;
  records?: string[][];
}

/**
 * A2A DNS Verifier class
 */
export class A2ADNSVerifier {
  private logger: Logger;
  private cache: Map<string, CachedRecord>;
  private options: Required<DNSVerificationOptions>;
  
  /**
   * Create a new DNS verifier
   * 
   * @param options - DNS verification options
   */
  constructor(options: DNSVerificationOptions = {}) {
    this.logger = new Logger('a2a-dns-verifier');
    this.cache = new Map();
    
    // Set default options
    this.options = {
      cacheTTL: options.cacheTTL ?? 300000, // 5 minutes
      timeout: options.timeout ?? 5000, // 5 seconds
      enableCache: options.enableCache ?? true
    };
    
    this.logger.info('A2A DNS Verifier initialized');
  }
  
  /**
   * Resolve TXT records for a domain with timeout and caching
   * 
   * @param domain - Domain to resolve
   * @returns TXT records
   * @private
   */
  private async resolveTxtWithCache(domain: string): Promise<string[][]> {
    const cacheKey = `txt:${domain}`;
    
    // Check cache if enabled
    if (this.options.enableCache) {
      const cachedRecord = this.cache.get(cacheKey);
      const now = Date.now();
      
      if (cachedRecord && (now - cachedRecord.timestamp) < this.options.cacheTTL) {
        this.logger.debug(`Using cached TXT records for domain: ${domain}`);
        return cachedRecord.value;
      }
    }
    
    // Set up timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`DNS resolution timed out for domain: ${domain}`));
      }, this.options.timeout);
    });
    
    try {
      // Resolve with timeout
      const records = await Promise.race([
        resolveTxt(domain),
        timeoutPromise
      ]) as string[][];
      
      // Cache result if enabled
      if (this.options.enableCache) {
        this.cache.set(cacheKey, {
          value: records,
          timestamp: Date.now()
        });
      }
      
      return records;
    } catch (error) {
      this.logger.error(`Failed to resolve TXT records for domain: ${domain}`, { error });
      throw error;
    }
  }
  
  /**
   * Clear the DNS cache
   */
  public clearCache(): void {
    this.cache.clear();
    this.logger.info('DNS cache cleared');
  }
  
  /**
   * Verify a domain using authentication token in TXT record
   * 
   * @param domain - Domain to verify
   * @param expectedToken - Expected authentication token
   * @returns Verification result
   */
  public async verifyDomainAuth(domain: string, expectedToken: string): Promise<DNSVerificationResult> {
    try {
      // Format domain for TXT record lookup (prepend _a2a-auth)
      const authDomain = `_a2a-auth.${domain}`;
      
      this.logger.info(`Verifying domain authentication: ${domain}`);
      this.logger.debug(`Looking up TXT records for: ${authDomain}`);
      
      // Resolve TXT records
      const records = await this.resolveTxtWithCache(authDomain);
      
      if (!records || records.length === 0) {
        return {
          verified: false,
          domain,
          error: `No TXT records found for: ${authDomain}`,
          records: []
        };
      }
      
      // Parse TXT records for authentication token
      let foundToken = false;
      
      for (const recordSet of records) {
        for (const record of recordSet) {
          // Look for A2A authentication format: v=A2A1; t=TOKEN; d=DOMAIN
          if (record.includes('v=A2A1') && record.includes(`t=${expectedToken}`)) {
            // Check if domain matches
            if (record.includes(`d=${domain}`)) {
              foundToken = true;
              break;
            }
          }
        }
        
        if (foundToken) break;
      }
      
      return {
        verified: foundToken,
        domain,
        records,
        error: foundToken ? undefined : 'Authentication token not found or invalid'
      };
    } catch (error) {
      return {
        verified: false,
        domain,
        error: `DNS verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
  
  /**
   * Verify domain ownership using domain verification token
   * 
   * @param domain - Domain to verify
   * @param expectedToken - Expected verification token
   * @returns Verification result
   */
  public async verifyDomainOwnership(domain: string, expectedToken: string): Promise<DNSVerificationResult> {
    try {
      this.logger.info(`Verifying domain ownership: ${domain}`);
      
      // Resolve TXT records for the domain
      const records = await this.resolveTxtWithCache(domain);
      
      if (!records || records.length === 0) {
        return {
          verified: false,
          domain,
          error: `No TXT records found for: ${domain}`,
          records: []
        };
      }
      
      // Parse TXT records for verification token
      let foundToken = false;
      
      for (const recordSet of records) {
        for (const record of recordSet) {
          // Look for agentland-verification=TOKEN format
          if (record.includes(`agentland-verification=${expectedToken}`)) {
            foundToken = true;
            break;
          }
        }
        
        if (foundToken) break;
      }
      
      return {
        verified: foundToken,
        domain,
        records,
        error: foundToken ? undefined : 'Verification token not found or invalid'
      };
    } catch (error) {
      return {
        verified: false,
        domain,
        error: `Domain ownership verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
  
  /**
   * Verify a security challenge response
   * 
   * @param domain - Domain to verify
   * @param challenge - Security challenge
   * @returns Verification result
   */
  public async verifySecurityChallenge(domain: string, challenge: string): Promise<DNSVerificationResult> {
    try {
      // Format domain for TXT record lookup (prepend _security-challenge)
      const challengeDomain = `_security-challenge.${domain}`;
      
      this.logger.info(`Verifying security challenge: ${domain}`);
      this.logger.debug(`Looking up TXT records for: ${challengeDomain}`);
      
      // Resolve TXT records
      const records = await this.resolveTxtWithCache(challengeDomain);
      
      if (!records || records.length === 0) {
        return {
          verified: false,
          domain,
          error: `No TXT records found for: ${challengeDomain}`,
          records: []
        };
      }
      
      // Parse TXT records for challenge token
      let foundChallenge = false;
      
      for (const recordSet of records) {
        for (const record of recordSet) {
          // Look for challenge=TOKEN format
          if (record.includes(`challenge=${challenge}`) && record.includes(`domain=${domain}`)) {
            foundChallenge = true;
            break;
          }
        }
        
        if (foundChallenge) break;
      }
      
      return {
        verified: foundChallenge,
        domain,
        records,
        error: foundChallenge ? undefined : 'Security challenge not found or invalid'
      };
    } catch (error) {
      return {
        verified: false,
        domain,
        error: `Security challenge verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
  
  /**
   * Generate a new security challenge for a domain
   * 
   * @returns Security challenge token and instructions
   */
  public generateSecurityChallenge(): { token: string; instructions: string } {
    // Generate random challenge token
    const token = require('crypto')
      .randomBytes(16)
      .toString('hex');
    
    // Generate instructions
    const instructions = [
      'To verify domain ownership, add this TXT record to your DNS configuration:',
      '',
      'Record Type: TXT',
      'Name: _security-challenge',
      `Value: challenge=${token}; domain=YOUR_DOMAIN`,
      '',
      'Once added, allow time for DNS propagation (typically 15 minutes to 24 hours).'
    ].join('\n');
    
    return { token, instructions };
  }
}

export default A2ADNSVerifier;