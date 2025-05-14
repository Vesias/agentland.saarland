// Configuration index for security
// This file provides standardized imports for configuration

const fs = require('fs');
const path = require('path');
const constraints = require('./constraints.json');

// Load DNS security configuration if it exists
let dnsConfig = null;
const dnsConfigPath = path.join(__dirname, 'dns-security.json');

try {
  if (fs.existsSync(dnsConfigPath)) {
    dnsConfig = require('./dns-security.json');
  }
} catch (error) {
  console.warn(`Warning: Failed to load DNS security configuration: ${error.message}`);
}

module.exports = {
  constraints,
  dnsConfig,
  
  // Helper function to get DNS security configuration for auth provider
  getDnsAuthConfig: () => {
    if (!dnsConfig) return null;
    
    return {
      enabled: true,
      domain: dnsConfig.domain,
      authToken: dnsConfig.tokens.agentAuthToken,
      verificationToken: dnsConfig.tokens.domainVerification
    };
  }
};
