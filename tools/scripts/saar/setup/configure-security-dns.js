#!/usr/bin/env node

/**
 * DNS Security Configuration Tool
 * ==============================
 * 
 * This tool configures DNS security settings for the AGENT_LAND_SAARLAND domain,
 * including SPF, DKIM, DMARC, and security TXT records for agent authentication.
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const chalk = require('chalk');

// Configuration
const domain = 'agentland.saarland';
const configPath = path.resolve(process.cwd(), 'configs/security/dns-security.json');
const dnsOutputPath = path.resolve(process.cwd(), 'configs/security/dns-records.json');

/**
 * Generate DKIM keys
 * @returns {Promise<{privateKey: string, publicKey: string}>}
 */
async function generateDKIMKeys() {
  console.log(chalk.blue('Generating DKIM keys...'));
  
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });

  // Format the public key for DNS
  const formattedPublicKey = publicKey
    .replace(/-----BEGIN PUBLIC KEY-----/, '')
    .replace(/-----END PUBLIC KEY-----/, '')
    .replace(/\n/g, '')
    .trim();
  
  return {
    privateKey,
    publicKey: formattedPublicKey
  };
}

/**
 * Generate security verification tokens
 * @returns {Object} Security verification tokens
 */
function generateSecurityTokens() {
  console.log(chalk.blue('Generating security verification tokens...'));
  
  return {
    domainVerification: crypto.randomBytes(32).toString('hex'),
    agentAuthToken: crypto.randomBytes(32).toString('hex'),
    securityChallenge: crypto.randomBytes(16).toString('hex')
  };
}

/**
 * Generate DNS records for security
 * @param {Object} dkimKeys - DKIM keys
 * @param {Object} tokens - Security tokens
 * @returns {Object} DNS records
 */
function generateDNSRecords(dkimKeys, tokens) {
  console.log(chalk.blue('Generating DNS security records...'));
  
  const records = {
    spf: {
      type: 'TXT',
      name: '@',
      value: 'v=spf1 mx a include:_spf.agentland.saarland ~all',
      ttl: 3600
    },
    dkim: {
      type: 'TXT',
      name: 'default._domainkey',
      value: `v=DKIM1; k=rsa; p=${dkimKeys.publicKey}`,
      ttl: 3600
    },
    dmarc: {
      type: 'TXT',
      name: '_dmarc',
      value: 'v=DMARC1; p=quarantine; rua=mailto:dmarc@agentland.saarland',
      ttl: 3600
    },
    agentAuth: {
      type: 'TXT',
      name: '_a2a-auth',
      value: `v=A2A1; t=${tokens.agentAuthToken}; d=${domain}`,
      ttl: 3600
    },
    securityChallenge: {
      type: 'TXT',
      name: '_security-challenge',
      value: `challenge=${tokens.securityChallenge}; domain=${domain}`,
      ttl: 3600
    },
    domainVerification: {
      type: 'TXT',
      name: '@',
      value: `agentland-verification=${tokens.domainVerification}`,
      ttl: 3600
    },
    caa: {
      type: 'CAA',
      name: '@',
      value: '0 issue "letsencrypt.org"',
      ttl: 3600
    }
  };
  
  return records;
}

/**
 * Save configuration to file
 * @param {Object} config - Configuration object
 * @returns {Promise<void>}
 */
async function saveConfiguration(config) {
  console.log(chalk.blue(`Saving configuration to ${configPath}...`));
  
  try {
    // Create directory if it doesn't exist
    const dir = path.dirname(configPath);
    await fs.mkdir(dir, { recursive: true });
    
    // Write config file
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    console.log(chalk.green('Configuration saved successfully!'));
  } catch (error) {
    console.error(chalk.red('Error saving configuration:'), error);
    throw error;
  }
}

/**
 * Save DNS records to file
 * @param {Object} records - DNS records
 * @returns {Promise<void>}
 */
async function saveDNSRecords(records) {
  console.log(chalk.blue(`Saving DNS records to ${dnsOutputPath}...`));
  
  try {
    // Create directory if it doesn't exist
    const dir = path.dirname(dnsOutputPath);
    await fs.mkdir(dir, { recursive: true });
    
    // Write records file
    await fs.writeFile(dnsOutputPath, JSON.stringify(records, null, 2));
    console.log(chalk.green('DNS records saved successfully!'));
  } catch (error) {
    console.error(chalk.red('Error saving DNS records:'), error);
    throw error;
  }
}

/**
 * Generate formatted DNS records for display
 * @param {Object} records - DNS records
 * @returns {String} Formatted DNS records
 */
function formatDNSRecordsForDisplay(records) {
  let output = chalk.bold('DNS Records for AGENT_LAND_SAARLAND Security:\n\n');
  
  Object.entries(records).forEach(([key, record]) => {
    output += chalk.bold(`${key.toUpperCase()} Record:\n`);
    output += `  Type: ${chalk.yellow(record.type)}\n`;
    output += `  Name: ${chalk.yellow(record.name)}\n`;
    output += `  Value: ${chalk.yellow(record.value)}\n`;
    output += `  TTL: ${chalk.yellow(record.ttl)}\n\n`;
  });
  
  return output;
}

/**
 * Main function
 */
async function main() {
  try {
    console.log(chalk.bold('AGENT_LAND_SAARLAND DNS Security Configuration\n'));
    
    // Generate DKIM keys
    const dkimKeys = await generateDKIMKeys();
    
    // Generate security tokens
    const tokens = generateSecurityTokens();
    
    // Generate DNS records
    const records = generateDNSRecords(dkimKeys, tokens);
    
    // Create complete config
    const config = {
      domain,
      dkimKeys,
      tokens,
      generatedAt: new Date().toISOString()
    };
    
    // Save configuration
    await saveConfiguration(config);
    
    // Save DNS records
    await saveDNSRecords(records);
    
    // Display records
    console.log(formatDNSRecordsForDisplay(records));
    
    console.log(chalk.bold('Next Steps:\n'));
    console.log(chalk.yellow('1. Add these DNS records to your domain provider'));
    console.log(chalk.yellow('2. Verify the records are properly configured'));
    console.log(chalk.yellow('3. Configure the A2A security middleware to use these settings'));
    console.log(chalk.yellow('4. Test the agent authentication against the DNS records\n'));
    
    console.log(chalk.green('DNS security configuration completed successfully!'));
    
  } catch (error) {
    console.error(chalk.red('Error generating DNS security configuration:'), error);
    process.exit(1);
  }
}

// Run main function
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  generateDKIMKeys,
  generateSecurityTokens,
  generateDNSRecords
};