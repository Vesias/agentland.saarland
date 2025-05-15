---
title: "Security Template for agentland.saarland"
version: "1.0.0"
date: "2025-05-16"
owner: "security@agentland.saarland"
status: "active"
---

# Security Template for agentland.saarland

This template defines the security standards, configurations, and best practices for all agentland.saarland projects. It serves as a comprehensive guide for implementing secure coding practices, credential management, and security validation processes.

## 1. Credential Management

### 1.1 Environment Variables

All credentials and secrets MUST be stored in environment variables, not hardcoded in source code. Use the following pattern for accessing environment variables:

```typescript
// INCORRECT - Do not use default values for secrets
const apiKey = process.env.API_KEY || 'default-secret-key';

// CORRECT - Require environment variables to be set
if (!process.env.API_KEY) {
  throw new Error('API_KEY environment variable is required');
}
const apiKey = process.env.API_KEY;
```

### 1.2 .env File Structure

Create a `.env.example` file in the project root with the following structure:

```bash
# A2A Security Configuration
A2A_JWT_SECRET=
A2A_JWT_ISSUER=a2a-manager
A2A_JWT_AUDIENCE=a2a-agents
A2A_JWT_EXPIRES_IN=1d

# MCP API Configuration
MCP_API_KEY=
MCP_PROFILE=
MCP_SERVER_URL=

# RAG Configuration
RAG_API_KEY=
RAG_VECTOR_DB_PATH=

# Web Security
SESSION_SECRET=
CORS_ORIGINS=http://localhost:5000
CSP_REPORT_URI=
```

Add the following patterns to `.gitignore`:

```gitignore
# Environment variables
.env
.env.local
.env.development
.env.test
.env.production
*.env

# Secrets
**/api-keys*.json
**/secret*.json
```

### 1.3 Environment Variable Validation

Implement the validation utility in `libs/core/src/config/env-validator.ts` to check for required environment variables:

```typescript
import { logger } from '../logging/logger';

export interface EnvValidationOptions {
  throwOnMissing?: boolean;
  logLevel?: 'error' | 'warn' | 'info';
}

export interface EnvValidationResult {
  isValid: boolean;
  missingVars: string[];
  message: string;
}

/**
 * Validates the required environment variables
 * @param requiredVars List of required environment variables
 * @param options Validation options
 * @returns Validation result
 */
export function validateEnv(
  requiredVars: string[],
  options: EnvValidationOptions = { throwOnMissing: true, logLevel: 'error' }
): EnvValidationResult {
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  const isValid = missingVars.length === 0;
  const message = isValid
    ? 'All required environment variables are present.'
    : `Missing required environment variables: ${missingVars.join(', ')}`;
  
  if (!isValid) {
    if (options.logLevel === 'error') {
      logger.error(message);
    } else if (options.logLevel === 'warn') {
      logger.warn(message);
    } else {
      logger.info(message);
    }
    
    if (options.throwOnMissing) {
      throw new Error(message);
    }
  }
  
  return { isValid, missingVars, message };
}
```

## 2. Input Validation

### 2.1 Server-Side Validation

Implement comprehensive server-side validation for all inputs using zod schemas:

```typescript
import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

export function validateRequest(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.parse(req.body);
      req.body = result;
      next();
    } catch (error) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid request data',
        details: error.errors
      });
    }
  };
}

// Usage in routes
router.post('/login', validateRequest(loginSchema), loginController);
```

### 2.2 Frontend Validation

Frontend validation should complement server-side validation, not replace it:

```jsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  });
  
  const onSubmit = (data) => {
    // Submit form
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
      
      <input type="password" {...register('password')} />
      {errors.password && <span>{errors.password.message}</span>}
      
      <button type="submit">Login</button>
    </form>
  );
}
```

## 3. Authentication and Authorization

### 3.1 JWT Configuration

Configure JWT with the following security parameters:

```typescript
const jwtOptions = {
  secretKey: process.env.JWT_SECRET, // Required environment variable
  issuer: process.env.JWT_ISSUER || 'agentland.saarland',
  audience: process.env.JWT_AUDIENCE || 'agentland-api',
  expiresIn: process.env.JWT_EXPIRES_IN || '1h', // Short expiration time
  algorithm: 'HS256' // Use stronger algorithms in production (RS256)
};
```

### 3.2 Session Management

Implement secure session management with proper timeout handling and CSRF protection:

```typescript
import session from 'express-session';
import csrf from 'csurf';

if (!process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET environment variable is required');
}

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Secure in production
    httpOnly: true, // Prevent client-side JS access
    maxAge: 3600000, // 1 hour in milliseconds
    sameSite: 'strict' // Prevent CSRF
  }
}));

// CSRF protection for all state-changing routes
const csrfProtection = csrf({ cookie: false });
app.use('/api/auth', csrfProtection);
app.use('/api/user', csrfProtection);
```

## 4. CI/CD Security Integration

### 4.1 Secret Scanning

Implement secret scanning in CI/CD pipeline using gitleaks:

```yaml
# .github/workflows/security-checks.yml
name: Security Checks

on:
  pull_request:
    branches: [ main, develop ]
  push:
    branches: [ main, develop ]

jobs:
  secrets-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run secret scanning
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Check for hardcoded secrets
        run: |
          # Custom patterns for finding potential hardcoded secrets
          ! grep -r --include="*.{ts,js,json}" -E "(secret|password|apikey|token)([ ]?[:=][ ]?[\'\"])[^\'\"]+" --exclude-dir={node_modules,.git,dist}
```

### 4.2 Dependency Scanning

Add dependency vulnerability scanning to CI/CD:

```yaml
# Add to .github/workflows/security-checks.yml
  dependency-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run npm audit
        run: npm audit --audit-level=high
      
      - name: Run Snyk to check for vulnerabilities
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

### 4.3 SAST (Static Application Security Testing)

Integrate security-focused linting:

```yaml
# Add to .github/workflows/security-checks.yml
  code-security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run ESLint with security plugins
        run: npx eslint . --ext .ts,.tsx,.js,.jsx --config .eslintrc.security.js
```

## 5. Security Checklist for Pull Requests

All pull requests must be reviewed against this security checklist:

```markdown
## Security Checklist

- [ ] No hardcoded secrets or credentials in the codebase
- [ ] Environment variables are validated before use
- [ ] Input validation is implemented for all user inputs
- [ ] Authentication and authorization are properly implemented
- [ ] CSRF protection is implemented for state-changing operations
- [ ] API endpoints are properly secured
- [ ] Secure HTTP headers are set (Content-Security-Policy, X-XSS-Protection, etc.)
- [ ] Dependencies are free from known vulnerabilities
- [ ] Logging does not expose sensitive information
- [ ] Error handling does not expose sensitive information
```

## 6. Security Audit and Review Process

Regular security audits should be conducted with the following frequency:

1. **Weekly**: Automated security scanning (dependency checks, secret scanning)
2. **Monthly**: Code review focused on security aspects
3. **Quarterly**: Comprehensive security audit

Security audit reports should be stored in the `ai_docs/security/` directory with the following format:

```markdown
---
title: "Security Audit: agentland.saarland"
date: "YYYY-MM-DD"
riskLevel: "[low|medium|high|critical]"
lastAudited: "YYYY-MM-DD"
owner: "security@agentland.saarland"
version: "1.0.0"
---

# Security Audit: [Project Name]

## Executive Summary

[Brief summary of findings]

## Vulnerabilities

### 1. [Vulnerability Title] ([RISK LEVEL])

- **Description**: [Description of the vulnerability]
- **Location**: [File path or component name]
- **Impact**: [Potential impact of the vulnerability]
- **Recommendation**: [Steps to remediate]

[...additional vulnerabilities...]

## Recommendations

[Prioritized list of security improvements]
```

## 7. Content Security Policy (CSP)

Implement a strict Content Security Policy to prevent XSS and other injection attacks:

```typescript
import helmet from 'helmet';

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"], // Consider removing unsafe-inline in production
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:"],
    connectSrc: ["'self'"],
    fontSrc: ["'self'"],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'none'"],
    reportUri: process.env.CSP_REPORT_URI || '/api/csp-report'
  }
}));
```

## 8. Encryption and Data Protection

### 8.1 Sensitive Data Storage

Use encryption for sensitive data at rest:

```typescript
import crypto from 'crypto';

export function encryptData(data: string, key: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
  
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
}

export function decryptData(encrypted: string, key: string): string {
  const parts = encrypted.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encryptedText = parts[1];
  
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
  
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
```

### 8.2 API Keys Storage

Store API keys in encrypted format:

```typescript
import fs from 'fs';
import { encryptData, decryptData } from './encryption';

interface ApiKey {
  id: string;
  key: string;
  owner: string;
  createdAt: string;
}

export class ApiKeyManager {
  private encryptionKey: string;
  private filePath: string;
  
  constructor(encryptionKey: string, filePath: string) {
    if (!encryptionKey) {
      throw new Error('Encryption key is required for ApiKeyManager');
    }
    this.encryptionKey = encryptionKey;
    this.filePath = filePath;
  }
  
  public saveApiKey(apiKey: ApiKey): void {
    const keys = this.loadApiKeys();
    keys.push(apiKey);
    
    const encryptedData = encryptData(JSON.stringify(keys), this.encryptionKey);
    fs.writeFileSync(this.filePath, encryptedData);
  }
  
  public loadApiKeys(): ApiKey[] {
    if (!fs.existsSync(this.filePath)) {
      return [];
    }
    
    const encryptedData = fs.readFileSync(this.filePath, 'utf8');
    const decryptedData = decryptData(encryptedData, this.encryptionKey);
    
    return JSON.parse(decryptedData);
  }
}
```

## 9. A2A Security Implementation

The Agent-to-Agent (A2A) security implementation should follow these secure patterns:

```typescript
import jwt from 'jsonwebtoken';
import { validateEnv } from '../config/env-validator';

// Validate required environment variables
validateEnv(['A2A_JWT_SECRET', 'A2A_JWT_ISSUER', 'A2A_JWT_AUDIENCE']);

export class A2ASecurityMiddleware {
  private jwtSecret: string;
  private jwtIssuer: string;
  private jwtAudience: string;
  
  constructor() {
    this.jwtSecret = process.env.A2A_JWT_SECRET!;
    this.jwtIssuer = process.env.A2A_JWT_ISSUER!;
    this.jwtAudience = process.env.A2A_JWT_AUDIENCE!;
  }
  
  public generateToken(agentId: string, permissions: string[]): string {
    return jwt.sign(
      { 
        agentId, 
        permissions,
        timestamp: Date.now() // Prevent replay attacks
      },
      this.jwtSecret,
      {
        expiresIn: process.env.A2A_JWT_EXPIRES_IN || '1h',
        issuer: this.jwtIssuer,
        audience: this.jwtAudience
      }
    );
  }
  
  public validateToken(token: string): any {
    return jwt.verify(token, this.jwtSecret, {
      issuer: this.jwtIssuer,
      audience: this.jwtAudience
    });
  }
}
```

## 10. Regular Security Training

All developers on the project should complete security training covering:

1. OWASP Top 10 vulnerabilities
2. Secure coding practices for Node.js and TypeScript
3. Common security pitfalls in web applications
4. Credential management and secret handling
5. Security incident response procedures

## Conclusion

Following these security patterns and practices will help ensure that agentland.saarland maintains a strong security posture. All code contributions must adhere to these guidelines, and all pull requests should be reviewed for security compliance.

Security is a continuous process, not a one-time achievement. Regular security audits, dependency updates, and developer training are essential components of maintaining application security over time.

## Related Templates

| Template | Relationship |
|----------|--------------|
| [Configurations](./template_configurations.md) | Defines how to securely manage configuration and environment variables |
| [CI/CD](./template_ci_cd.md) | Provides workflows for security scanning and vulnerability detection |
| [Dashboard](./template_dashboard.md) | Implements frontend security practices for the web application |