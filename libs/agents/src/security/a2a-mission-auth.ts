/**
 * A2A Mission Authorization
 * =======================
 * 
 * Specialized authorization middleware for agent missions, integrating with
 * the A2A security system to enforce permissions for mission operations
 */

import { Logger } from '../../../core/src/logging/logger';
import { AgentAccessLevel, AuthenticationResult, SecureA2AMessage } from './a2a-security.types';
import A2AAuthProvider from './a2a-auth-provider';
import A2ASecurityMiddleware from './a2a-security-middleware';

/**
 * Mission operation types
 */
export enum MissionOperation {
  VIEW = 'view',
  START = 'start',
  UPDATE = 'update',
  COMPLETE = 'complete',
  CREATE = 'create',
  DELETE = 'delete',
  MANAGE = 'manage'
}

/**
 * Mission access level
 * Maps access levels to the required agent access level
 */
export const MissionAccessMap = {
  [MissionOperation.VIEW]: AgentAccessLevel.PUBLIC,
  [MissionOperation.START]: AgentAccessLevel.PUBLIC,
  [MissionOperation.UPDATE]: AgentAccessLevel.PROTECTED,
  [MissionOperation.COMPLETE]: AgentAccessLevel.PROTECTED,
  [MissionOperation.CREATE]: AgentAccessLevel.PRIVATE,
  [MissionOperation.DELETE]: AgentAccessLevel.RESTRICTED,
  [MissionOperation.MANAGE]: AgentAccessLevel.RESTRICTED
};

/**
 * Mission authorization result
 */
export interface MissionAuthResult {
  authorized: boolean;
  operation: MissionOperation;
  missionId: string;
  agentId?: string;
  error?: string;
}

/**
 * Mission authorization middleware
 */
export class A2AMissionAuth {
  private logger: Logger;
  private securityMiddleware: A2ASecurityMiddleware;
  private authProvider: A2AAuthProvider;
  
  /**
   * Create a new mission authorization middleware
   * 
   * @param securityMiddleware - Security middleware to use for base authentication
   * @param authProvider - Auth provider for authentication operations
   */
  constructor(securityMiddleware: A2ASecurityMiddleware, authProvider: A2AAuthProvider) {
    this.logger = new Logger('a2a-mission-auth');
    this.securityMiddleware = securityMiddleware;
    this.authProvider = authProvider;
    
    this.logger.info('A2A Mission Authorization system initialized');
  }
  
  /**
   * Authorize a mission operation
   * 
   * @param message - Secure A2A message containing the mission operation request
   * @param operation - Mission operation to authorize
   * @param missionId - ID of the mission to operate on
   * @returns Mission authorization result
   */
  public async authorizeMissionOperation(
    message: SecureA2AMessage,
    operation: MissionOperation,
    missionId: string
  ): Promise<MissionAuthResult> {
    // First, authenticate the agent using standard security middleware
    let authResult: AuthenticationResult;
    
    try {
      // Authentifiziere nur einmal und prüfe dann den Rückgabetyp
      const authResponse = this.authProvider.authenticate(message);
      
      // Prüfe, ob das Ergebnis ein Promise ist oder direkt ein Objekt
      if (authResponse instanceof Promise) {
        authResult = await authResponse as Promise<AuthenticationResult>;
      } else {
        authResult = authResponse as AuthenticationResult;
      }
      
      if (!authResult.authenticated) {
        return {
          authorized: false,
          operation,
          missionId,
          error: `Authentication failed: ${authResult.error || 'Unknown error'}`
        };
      }
      
      const requiredAccessLevel = MissionAccessMap[operation];
      const hasRequiredAccess = this.hasRequiredAccessLevel(authResult.accessLevel!, requiredAccessLevel);
      
      if (!hasRequiredAccess) {
        this.logger.warn('Mission operation denied', {
          agent: authResult.agentId,
          operation,
          missionId,
          requiredAccess: requiredAccessLevel,
          actualAccess: authResult.accessLevel
        });
        
        return {
          authorized: false,
          operation,
          missionId,
          agentId: authResult.agentId,
          error: `Insufficient access level: ${authResult.accessLevel} (required: ${requiredAccessLevel})`
        };
      }
      
      // Additional role-based checks could be added here for more granular control
      
      // Log success
      this.logger.info('Mission operation authorized', {
        agent: authResult.agentId,
        operation,
        missionId
      });
      
      return {
        authorized: true,
        operation,
        missionId,
        agentId: authResult.agentId
      };
    } catch (error) {
      this.logger.error('Error during mission authorization', { error, operation, missionId });
      
      return {
        authorized: false,
        operation,
        missionId,
        error: `Authorization error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
  
  /**
   * Create secure mission request message
   * 
   * @param fromAgent - Agent ID initiating the request
   * @param operation - Mission operation
   * @param missionId - Mission ID
   * @param params - Additional parameters for the operation
   * @param credentials - Agent credentials
   * @returns Secure A2A message
   */
  public createMissionRequestMessage(
    fromAgent: string,
    operation: MissionOperation,
    missionId: string,
    params: Record<string, unknown> = {},
    credentials: any
  ): SecureA2AMessage {
    return {
      to: 'mission-service',
      from: fromAgent,
      task: `mission:${operation}`,
      params: {
        ...params,
        missionId
      },
      credentials,
      timestamp: Date.now()
    };
  }
  
  /**
   * Check if agent has the required access level
   * 
   * @param agentLevel - Agent's access level
   * @param requiredLevel - Required access level
   * @returns True if agent has the required level or higher
   * @private
   */
  private hasRequiredAccessLevel(agentLevel: AgentAccessLevel, requiredLevel: AgentAccessLevel): boolean {
    const accessLevels = {
      [AgentAccessLevel.PUBLIC]: 0,
      [AgentAccessLevel.PROTECTED]: 1,
      [AgentAccessLevel.PRIVATE]: 2,
      [AgentAccessLevel.RESTRICTED]: 3
    };
    
    return accessLevels[agentLevel] >= accessLevels[requiredLevel];
  }
}

export default A2AMissionAuth;