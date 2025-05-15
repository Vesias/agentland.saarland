# A2A Security System

This module provides a comprehensive security system for Agent-to-Agent (A2A) communication within the agentland.saarland framework. It includes authentication, authorization, message validation, and message prioritization features.

## Components

### A2A Security Middleware

The security middleware (`a2a-security-middleware.ts`) is the central component that coordinates all security features. It can be configured with different security levels and integrates with the following components:

- **Authentication Provider**: Manages agent identities and credentials
- **Message Validator**: Validates message formats and content
- **Priority Manager**: Prioritizes and queues messages

### Authentication Provider

The authentication provider (`a2a-auth-provider.ts`) handles agent identity verification using:

- **API Keys**: Simple key-based authentication
- **JWT Tokens**: More secure token-based authentication with expiration
- **Role-Based Access**: Assigns roles and access levels to agents

### Message Validator

The message validator (`a2a-message-validator.ts`) ensures messages conform to expected schemas:

- **Schema Validation**: Validates messages against predefined schemas
- **Content Sanitization**: Prevents security issues like injection attacks
- **Task-Specific Rules**: Applies specialized validation for different tasks

### Priority Manager

The priority manager (`a2a-priority-manager.ts`) handles message prioritization:

- **Priority Queues**: Sorts messages by priority level
- **Fairness Mechanisms**: Prevents monopolization by any single agent
- **Quota System**: Limits high-priority message usage

## Usage

### Basic Integration

To use the security system in your A2A communication:

```typescript
import A2ASecurityMiddleware from './security/a2a-security-middleware';
import { AgentAccessLevel, SecureA2AMessage } from './security/a2a-security.types';

// Create security middleware
const securityMiddleware = new A2ASecurityMiddleware({
  enableAuthentication: true,
  enableAuthorization: true,
  enableValidation: true,
  enablePrioritization: true
});

// Process a message through security middleware
async function securelyProcessMessage(message: SecureA2AMessage) {
  const secureMessage = await securityMiddleware.processMessage(message);
  
  if (secureMessage) {
    // Message passed all security checks
    // Process it further...
  } else {
    // Message rejected by security middleware
  }
}
```

### Agent Registration

To register an agent with the security system:

```typescript
// Register an agent with API key
const apiKey = await securityMiddleware.registerAgentApiKey(
  'my-agent',
  undefined, // Generate a new key
  AgentAccessLevel.PUBLIC,
  ['reader', 'writer'], // Roles
  30 // Expires in 30 days
);

// Or generate a JWT token
const token = securityMiddleware.generateJwtToken(
  'my-agent',
  AgentAccessLevel.PROTECTED,
  ['admin'],
  '1d' // Expires in 1 day
);
```

### Using the A2A Security Admin CLI

The security system includes a command-line tool for managing agent security settings:

```bash
# Install dependencies
npm install

# Register a new agent with API key
npm run a2a:security register-agent --id my-agent --access-level protected --roles reader,writer

# Generate a JWT token for an agent
npm run a2a:security generate-jwt --id my-agent --access-level private --roles admin --expires-in 7d

# Create a credentials file for an agent
npm run a2a:security create-credentials --id my-agent --type api_key --output ./credentials/my-agent.json
```

## Access Levels

The security system uses the following access levels:

- **PUBLIC**: Open access to all authenticated agents
- **PROTECTED**: Access for specific agent groups
- **PRIVATE**: Access only for trusted system agents
- **RESTRICTED**: Access requires special authorization

## Message Priorities

Messages can be assigned the following priority levels:

- **CRITICAL** (5): Highest priority, for urgent system messages
- **HIGH** (4): Important messages that should be processed quickly
- **NORMAL** (3): Standard priority for most messages
- **LOW** (2): Lower priority messages that can wait
- **BACKGROUND** (1): Lowest priority, for non-time-sensitive operations

## Security Configuration

The security middleware can be configured with different settings:

```typescript
const securityConfig = {
  enableAuthentication: true,
  enableAuthorization: true,
  enableValidation: true,
  enablePrioritization: true,
  enableAuditLog: true,
  defaultMessageTTL: 60000, // 1 minute
  maxMessageSize: 1048576, // 1 MB
  tokenExpirationTime: 3600000, // 1 hour
  auditLogPath: 'logs/a2a-security.log'
};

const securityMiddleware = new A2ASecurityMiddleware(securityConfig);
```