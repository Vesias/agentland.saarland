/**
 * A2A Security API Routes
 * ======================
 * 
 * API endpoints for A2A security operations including domain verification,
 * agent authentication, and security challenges.
 */

const express = require('express');
const router = express.Router();
const logger = require('../../logging/logger').createLogger('a2a-security-api');
const SecurityConfig = require('../../../../configs/security');
const A2ADNSVerifier = require('../../../../agents/src/security/a2a-dns-verifier').default;
const A2AAuthProvider = require('../../../../agents/src/security/a2a-auth-provider').default;

// Initialize DNS verifier and auth provider if DNS config is available
const dnsConfig = SecurityConfig.getDnsAuthConfig();
let dnsVerifier = null;
let authProvider = null;

if (dnsConfig && dnsConfig.enabled) {
  dnsVerifier = new A2ADNSVerifier();
  authProvider = new A2AAuthProvider({
    dns: dnsConfig
  });
  authProvider.initialize().catch(err => {
    logger.error('Failed to initialize A2A Auth Provider', { error: err.message });
  });
}

/**
 * Middleware to check if DNS security is enabled
 */
function checkDnsEnabled(req, res, next) {
  if (!dnsConfig || !dnsConfig.enabled || !dnsVerifier || !authProvider) {
    return res.status(404).json({
      success: false,
      error: 'DNS security is not configured'
    });
  }
  next();
}

/**
 * GET /status
 * Returns the status of the A2A security system
 */
router.get('/status', (req, res) => {
  const status = {
    dnsEnabled: Boolean(dnsConfig && dnsConfig.enabled),
    dnsVerifier: Boolean(dnsVerifier),
    authProvider: Boolean(authProvider),
    domain: dnsConfig ? dnsConfig.domain : null
  };

  res.json({
    success: true,
    status
  });
});

/**
 * GET /dns/verification-instructions
 * Returns instructions for DNS verification
 */
router.get('/dns/verification-instructions', checkDnsEnabled, (req, res) => {
  try {
    // Generate and return verification records and instructions
    const verificationInfo = authProvider.generateDnsVerificationRecords(dnsConfig.domain);
    
    res.json({
      success: true,
      domain: dnsConfig.domain,
      records: verificationInfo.records,
      instructions: verificationInfo.instructions
    });
  } catch (error) {
    logger.error('Error generating DNS verification instructions', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to generate DNS verification instructions'
    });
  }
});

/**
 * POST /dns/verify-domain
 * Verifies a domain using DNS records
 */
router.post('/dns/verify-domain', checkDnsEnabled, async (req, res) => {
  try {
    const { domain } = req.body;
    
    if (!domain) {
      return res.status(400).json({
        success: false,
        error: 'Domain is required'
      });
    }
    
    // Verify domain ownership
    const verified = await authProvider.verifyDomainOwnership(domain);
    
    res.json({
      success: true,
      domain,
      verified,
      message: verified 
        ? 'Domain ownership verified successfully' 
        : 'Domain ownership verification failed'
    });
  } catch (error) {
    logger.error('Error verifying domain', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to verify domain'
    });
  }
});

/**
 * POST /dns/verify-auth
 * Verifies domain authentication
 */
router.post('/dns/verify-auth', checkDnsEnabled, async (req, res) => {
  try {
    const { domain } = req.body;
    
    if (!domain) {
      return res.status(400).json({
        success: false,
        error: 'Domain is required'
      });
    }
    
    // Verify domain auth
    const result = await dnsVerifier.verifyDomainAuth(domain, dnsConfig.authToken);
    
    res.json({
      success: true,
      domain,
      verified: result.verified,
      message: result.verified
        ? 'Domain authentication verified successfully'
        : `Domain authentication failed: ${result.error || 'Unknown error'}`
    });
  } catch (error) {
    logger.error('Error verifying domain authentication', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to verify domain authentication'
    });
  }
});

/**
 * POST /dns/generate-challenge
 * Generates a new security challenge
 */
router.post('/dns/generate-challenge', checkDnsEnabled, (req, res) => {
  try {
    // Generate security challenge
    const challenge = dnsVerifier.generateSecurityChallenge();
    
    res.json({
      success: true,
      token: challenge.token,
      instructions: challenge.instructions
    });
  } catch (error) {
    logger.error('Error generating security challenge', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to generate security challenge'
    });
  }
});

/**
 * POST /dns/verify-challenge
 * Verifies a security challenge
 */
router.post('/dns/verify-challenge', checkDnsEnabled, async (req, res) => {
  try {
    const { domain, challenge } = req.body;
    
    if (!domain || !challenge) {
      return res.status(400).json({
        success: false,
        error: 'Domain and challenge are required'
      });
    }
    
    // Verify challenge
    const result = await dnsVerifier.verifySecurityChallenge(domain, challenge);
    
    res.json({
      success: true,
      domain,
      verified: result.verified,
      message: result.verified
        ? 'Security challenge verified successfully'
        : `Security challenge failed: ${result.error || 'Unknown error'}`
    });
  } catch (error) {
    logger.error('Error verifying security challenge', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to verify security challenge'
    });
  }
});

module.exports = router;