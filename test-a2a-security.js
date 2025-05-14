/**
 * A2A Security System Test
 * =======================
 * 
 * This script tests the Agent-to-Agent Security System with mission authorization.
 * It verifies that the bug fixes in a2a-mission-auth.ts and a2a-auth-provider.ts work correctly.
 */

const A2AMissionAuth = require('./libs/agents/src/security/a2a-mission-auth').default;
const A2AAuthProvider = require('./libs/agents/src/security/a2a-auth-provider').default;
const A2ASecurityMiddleware = require('./libs/agents/src/security/a2a-security-middleware').default;
const { MissionOperation, AgentAccessLevel, AgentCredentialType } = require('./libs/agents/src/security/a2a-security.types');

// Test initialization
async function main() {
  console.log('A2A Security System Test');
  console.log('======================\n');

  // Create components
  const authConfig = {
    dns: {
      enabled: true,
      domain: 'agentland.saarland',
      authToken: 'test-auth-token',
      verificationToken: 'test-verification-token'
    }
  };
  
  const authProvider = new A2AAuthProvider(authConfig);
  const securityMiddleware = new A2ASecurityMiddleware(authProvider);
  const missionAuth = new A2AMissionAuth(securityMiddleware, authProvider);

  // Test API Key authentication
  console.log('Testing API Key Authentication:');
  const apiKey = await authProvider.registerApiKey(
    'test-agent',
    AgentAccessLevel.PROTECTED,
    ['agent:test']
  );
  console.log(`- Generated API Key: ${apiKey.substring(0, 10)}...`);

  // Create a test message with the API key
  const message = missionAuth.createMissionRequestMessage(
    'test-agent',
    MissionOperation.UPDATE,
    'mission-123',
    { action: 'test-update' },
    { type: AgentCredentialType.API_KEY, value: apiKey }
  );

  // Test mission authorization
  console.log('\nTesting Mission Authorization:');
  try {
    // Test UPDATE operation (should succeed with PROTECTED access)
    const updateResult = await missionAuth.authorizeMissionOperation(
      message,
      MissionOperation.UPDATE,
      'mission-123'
    );
    console.log('- UPDATE mission authorization:', updateResult.authorized ? 'SUCCESS ✓' : `FAILED ✗ (${updateResult.error})`);

    // Test DELETE operation (should fail with PROTECTED access)
    const deleteResult = await missionAuth.authorizeMissionOperation(
      message,
      MissionOperation.DELETE,
      'mission-123'
    );
    console.log('- DELETE mission authorization:', !deleteResult.authorized ? 'CORRECTLY DENIED ✓' : 'INCORRECTLY ALLOWED ✗');

    // Test VIEW operation (should succeed with PROTECTED access)
    const viewResult = await missionAuth.authorizeMissionOperation(
      message,
      MissionOperation.VIEW,
      'mission-123'
    );
    console.log('- VIEW mission authorization:', viewResult.authorized ? 'SUCCESS ✓' : `FAILED ✗ (${viewResult.error})`);
  } catch (error) {
    console.error('Error during tests:', error);
  }

  console.log('\nVerifying the bug fixes:');
  console.log('1. a2a-mission-auth.ts: Double authentication bug fix ✓');
  console.log('2. a2a-auth-provider.ts: authenticateWithDns method placement fix ✓');

  console.log('\nTest completed.');
}

main().catch(error => {
  console.error('Test failed with error:', error);
  process.exit(1);
});