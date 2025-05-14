// In libs/core/src/security/security.types.ts
export enum PolicyLevel {
  STRICT = "strict",
  MODERATE = "moderate",
  OPEN = "open",
}

export interface ApiAccessRule {
  readonly resource: string;
  readonly methods: ReadonlyArray<string>; // e.g., ['GET', 'POST']
  readonly allowedRoles: ReadonlyArray<string>;
  readonly policyLevel?: PolicyLevel;
}

export interface SecurityConfig {
  readonly defaultPolicyLevel: PolicyLevel;
  readonly apiAccessRules: ReadonlyArray<ApiAccessRule>;
  readonly enableAuditLog: boolean;
  readonly auditLogPath?: string;
  // Füge hier weitere relevante Sicherheitskonfigurationen hinzu, falls nötig
}

export interface SecurityEvent {
  readonly timestamp: Date;
  readonly severity: 'info' | 'warning' | 'error' | 'critical';
  readonly message: string;
  readonly details?: Record<string, unknown>; // Geändert von any zu unknown
}

export interface SecurityReport {
  readonly generatedAt: Date;
  readonly summary: string;
  readonly events: ReadonlyArray<SecurityEvent>;
  readonly recommendations?: ReadonlyArray<string>;
}

// Zusätzliche Typen für security_check.ts

export interface SecurityCheckOptions {
  readonly autofix?: boolean;
  readonly relaxed?: boolean;
  readonly output?: string;
  readonly dir?: string;
  readonly files?: string; // Komma-separierte Liste
  readonly exclude?: string; // Komma-separierte Liste
  readonly verbose?: boolean;
}

export interface ValidationContext {
  readonly targetDir?: string; // Geändert zu optional
  readonly targetFiles?: ReadonlyArray<string>;
  readonly excludePatterns?: ReadonlyArray<string>;
}

export interface SecurityReviewSummary {
  readonly securityScore: number;
  readonly passedValidators: number;
  readonly totalValidators: number;
  readonly vulnerabilitiesCount: number;
  readonly findingsCount: number;
}

export interface SecurityFinding {
  readonly id: string; // Hinzugefügt als readonly und nicht-optional
  readonly timestamp: string; // ISO Date String, hinzugefügt als readonly und nicht-optional
  readonly title: string;
  readonly description: string;
  readonly location: string;
  readonly severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  readonly recommendation?: string;
  readonly validator?: string; // Für Findings
  readonly type?: 'vulnerability' | 'finding' | 'general'; // 'general' hinzugefügt
}

export interface Recommendation {
  readonly title: string;
  readonly description: string;
  readonly type: 'vulnerability' | 'finding' | 'general';
  readonly severity?: 'critical' | 'high' | 'medium' | 'low';
}

export interface ValidatorResults {
  readonly summary: SecurityReviewSummary;
  readonly vulnerabilities?: ReadonlyArray<SecurityFinding>;
  readonly findings?: ReadonlyArray<SecurityFinding>;
  readonly recommendations?: ReadonlyArray<Recommendation>;
  readonly reportPath?: string;
}

// Zusätzliche Typen für security_review.ts

export interface SecurityReviewOptions {
  readonly autoFix?: boolean;
  readonly strictMode?: boolean;
  readonly reportPath?: string;
  // Ggf. weitere Optionen aus dem Konstruktor von SecurityReview
}

export interface ValidatorFunction {
  (context: ValidationContext): Promise<ValidatorResults>; // Geändert, um ValidatorResults zurückzugeben
}

export interface SecurityReviewReport {
  readonly id: string;
  readonly timestamp: string; // ISO Date String
  readonly framework: {
    readonly name: string;
    readonly version: string;
  };
  readonly summary: SecurityReviewSummary;
  readonly findings: ReadonlyArray<SecurityFinding>;
  readonly vulnerabilities: ReadonlyArray<SecurityFinding>;
  readonly recommendations: ReadonlyArray<Recommendation>;
}

// Typ für die SecurityError-Optionen
export interface SecurityErrorOptions {
  code?: string;
  status?: number;
  metadata?: Record<string, unknown>; // Geändert von any zu unknown
}

// Zusätzliche Typen für secure_api.ts

export interface SecureApiOptions {
  readonly rateLimitRequests?: number;
  readonly rateLimitWindowMs?: number;
  readonly sessionTimeoutMs?: number;
  readonly requireHTTPS?: boolean;
  readonly csrfProtection?: boolean;
  readonly secureHeaders?: boolean;
  readonly inputValidation?: boolean;
  readonly policyLevel?: PolicyLevel; // Hinzugefügt, verwendet PolicyLevel aus dieser Datei
  /**
   * Allows for additional, unspecified options.
   */
  readonly [key: string]: any; // Beibehaltung der Flexibilität für zusätzliche Optionen
  // Ggf. weitere Optionen aus dem Konstruktor von SecureAPI
}

// Minimaldefinition für Request und Response Objekte,
// die in einer realen Anwendung spezifischer wären (z.B. von Express).
export interface MockRequest {
  readonly secure?: boolean;
  readonly headers: Record<string, string | string[] | undefined>;
  readonly connection: { remoteAddress?: string };
  readonly method?: string;
  readonly body?: unknown; // Geändert von any zu unknown
  readonly query?: unknown; // Geändert von any zu unknown
  readonly session?: import('express-session').Session & Partial<import('express-session').SessionData>; // Typsichere Session
  // Weitere Request-Eigenschaften nach Bedarf
}

export interface MockResponse {
  setHeader(name: string, value: string | number | readonly string[]): void;
  status(code: number): this; // Ermöglicht Chaining wie res.status(200).json(...)
  json(body: unknown): this; // Ermöglicht Chaining, body von any zu unknown geändert
  // Weitere Response-Eigenschaften und Methoden nach Bedarf
}

export interface FormattedErrorResponse {
  readonly message: string;
  readonly code: string;
  readonly status: number;
  readonly component?: string;
  readonly retryAfter?: number; // Für Rate Limiting
}
