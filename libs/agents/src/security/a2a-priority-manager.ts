/**
 * A2A Priority Manager
 * =================
 * 
 * Manages message priorities for the A2A manager, including
 * prioritization rules, quotas, and fairness mechanisms.
 */

import { Logger } from '../../../core/src/logging/logger';
import { MessagePriority, SecureA2AMessage } from './a2a-security.types';

/**
 * Priority queue options
 */
interface PriorityQueueOptions {
  fairnessEnabled: boolean;            // Enable fairness mechanisms
  maxQueueSize: number;                // Maximum queue size per priority
  fairnessInterval: number;            // Interval to adjust fairness in milliseconds
  agentQuotaRefreshInterval: number;   // Interval to refresh agent quotas in milliseconds
}

/**
 * Agent quota information
 */
interface AgentQuota {
  agentId: string;                         // Agent identifier
  highPriorityQuota: number;               // Quota for high priority messages
  criticalPriorityQuota: number;           // Quota for critical priority messages
  highPriorityUsed: number;                // High priority messages used
  criticalPriorityUsed: number;            // Critical priority messages used
  lastResetTime: number;                   // Last quota reset time
  totalMessagesProcessed: number;          // Total messages processed
  fairnessScore: number;                   // Fairness score (lower is better)
}

/**
 * Message with metadata
 */
interface QueuedMessage {
  message: SecureA2AMessage;               // Original message
  enqueuedAt: number;                      // Time message was enqueued
  attempts: number;                        // Number of processing attempts
  fairnessScore: number;                   // Fairness score
}

/**
 * Default priority queue options
 */
const DEFAULT_PRIORITY_QUEUE_OPTIONS: PriorityQueueOptions = {
  fairnessEnabled: true,
  maxQueueSize: 1000,
  fairnessInterval: 60000, // 1 minute
  agentQuotaRefreshInterval: 3600000 // 1 hour
};

/**
 * A2A Priority Manager
 */
export class A2APriorityManager {
  private logger: Logger;
  private options: PriorityQueueOptions;
  private priorityQueues: Map<MessagePriority, QueuedMessage[]>;
  private agentQuotas: Map<string, AgentQuota>;
  private fairnessAdjustmentInterval: NodeJS.Timeout | null = null;
  private agentQuotaRefreshInterval: NodeJS.Timeout | null = null;
  
  /**
   * Create a new A2A priority manager
   * 
   * @param options - Priority queue options
   */
  constructor(options: Partial<PriorityQueueOptions> = {}) {
    this.logger = new Logger('a2a-priority-manager');
    this.options = { ...DEFAULT_PRIORITY_QUEUE_OPTIONS, ...options };
    
    // Initialize priority queues
    this.priorityQueues = new Map();
    Object.values(MessagePriority)
      .filter(value => typeof value === 'number')
      .forEach(priority => {
        this.priorityQueues.set(priority as MessagePriority, []);
      });
    
    // Initialize agent quotas
    this.agentQuotas = new Map();
    
    // Start fairness adjustment if enabled
    if (this.options.fairnessEnabled) {
      this.startFairnessAdjustment();
      this.startAgentQuotaRefresh();
    }
    
    this.logger.info('A2A Priority Manager initialized', {
      fairnessEnabled: this.options.fairnessEnabled,
      maxQueueSize: this.options.maxQueueSize
    });
  }
  
  /**
   * Start fairness adjustment interval
   * @private
   */
  private startFairnessAdjustment(): void {
    if (this.fairnessAdjustmentInterval) {
      return;
    }
    
    this.fairnessAdjustmentInterval = setInterval(() => {
      this.adjustFairness();
    }, this.options.fairnessInterval);
  }
  
  /**
   * Stop fairness adjustment interval
   * @private
   */
  private stopFairnessAdjustment(): void {
    if (this.fairnessAdjustmentInterval) {
      clearInterval(this.fairnessAdjustmentInterval);
      this.fairnessAdjustmentInterval = null;
    }
  }
  
  /**
   * Start agent quota refresh interval
   * @private
   */
  private startAgentQuotaRefresh(): void {
    if (this.agentQuotaRefreshInterval) {
      return;
    }
    
    this.agentQuotaRefreshInterval = setInterval(() => {
      this.refreshAgentQuotas();
    }, this.options.agentQuotaRefreshInterval);
  }
  
  /**
   * Stop agent quota refresh interval
   * @private
   */
  private stopAgentQuotaRefresh(): void {
    if (this.agentQuotaRefreshInterval) {
      clearInterval(this.agentQuotaRefreshInterval);
      this.agentQuotaRefreshInterval = null;
    }
  }
  
  /**
   * Adjust fairness for queued messages
   * @private
   */
  private adjustFairness(): void {
    const now = Date.now();
    
    // Adjust fairness for each priority queue
    for (const [priority, queue] of this.priorityQueues.entries()) {
      // Skip empty queues
      if (queue.length === 0) {
        continue;
      }
      
      // Group messages by agent
      const agentMessages = new Map<string, QueuedMessage[]>();
      
      queue.forEach(queuedMessage => {
        const agentId = queuedMessage.message.from;
        
        if (!agentMessages.has(agentId)) {
          agentMessages.set(agentId, []);
        }
        
        agentMessages.get(agentId)!.push(queuedMessage);
      });
      
      // Calculate fairness scores
      for (const [agentId, messages] of agentMessages.entries()) {
        const quota = this.getOrCreateAgentQuota(agentId);
        const messageCount = messages.length;
        const agentPercentage = messageCount / queue.length;
        const waitingTime = Math.max(...messages.map(m => now - m.enqueuedAt));
        
        // Update fairness score
        quota.fairnessScore = (agentPercentage * 0.7) + 
                             (quota.totalMessagesProcessed * 0.2) + 
                             (waitingTime < 60000 ? 0.1 : 0); // Add penalty for messages waiting < 1 minute
        
        // Update queued messages with new fairness score
        messages.forEach(queuedMessage => {
          queuedMessage.fairnessScore = quota.fairnessScore;
        });
      }
      
      // Sort queue by fairness score (lower is better) then by enqueued time
      queue.sort((a, b) => {
        // First by fairness score
        if (a.fairnessScore !== b.fairnessScore) {
          return a.fairnessScore - b.fairnessScore;
        }
        
        // Then by enqueued time
        return a.enqueuedAt - b.enqueuedAt;
      });
    }
    
    this.logger.debug('Fairness adjustment completed');
  }
  
  /**
   * Refresh agent quotas
   * @private
   */
  private refreshAgentQuotas(): void {
    const now = Date.now();
    
    for (const [agentId, quota] of this.agentQuotas.entries()) {
      // Reset quota if refresh interval passed
      if (now - quota.lastResetTime >= this.options.agentQuotaRefreshInterval) {
        quota.highPriorityUsed = 0;
        quota.criticalPriorityUsed = 0;
        quota.lastResetTime = now;
        
        this.logger.debug(`Quota refreshed for agent: ${agentId}`);
      }
    }
  }
  
  /**
   * Get or create agent quota
   * 
   * @param agentId - Agent identifier
   * @returns Agent quota
   * @private
   */
  private getOrCreateAgentQuota(agentId: string): AgentQuota {
    if (!this.agentQuotas.has(agentId)) {
      // Create default quota based on agent type
      let highPriorityQuota = 10;   // Default
      let criticalPriorityQuota = 2; // Default
      
      // Adjust quota based on agent ID (example logic)
      if (agentId === 'a2a-manager') {
        highPriorityQuota = 100;
        criticalPriorityQuota = 20;
      } else if (agentId.startsWith('system.')) {
        highPriorityQuota = 50;
        criticalPriorityQuota = 10;
      } else if (agentId.startsWith('user.')) {
        highPriorityQuota = 5;
        criticalPriorityQuota = 1;
      }
      
      this.agentQuotas.set(agentId, {
        agentId,
        highPriorityQuota,
        criticalPriorityQuota,
        highPriorityUsed: 0,
        criticalPriorityUsed: 0,
        lastResetTime: Date.now(),
        totalMessagesProcessed: 0,
        fairnessScore: 0
      });
    }
    
    return this.agentQuotas.get(agentId)!;
  }
  
  /**
   * Enqueue a message with priority
   * 
   * @param message - A2A message
   * @returns True if enqueued successfully
   */
  public enqueueMessage(message: SecureA2AMessage): boolean {
    // Get priority or default to normal
    const priority = message.priority || MessagePriority.NORMAL;
    
    // Get priority queue
    const queue = this.priorityQueues.get(priority);
    
    if (!queue) {
      this.logger.error(`Invalid priority: ${priority}`);
      return false;
    }
    
    // Check if queue is full
    if (queue.length >= this.options.maxQueueSize) {
      this.logger.warn(`Queue for priority ${MessagePriority[priority]} is full`);
      return false;
    }
    
    // Check quota for high priority messages
    if (priority === MessagePriority.HIGH || priority === MessagePriority.CRITICAL) {
      const quota = this.getOrCreateAgentQuota(message.from);
      
      if (priority === MessagePriority.HIGH && quota.highPriorityUsed >= quota.highPriorityQuota) {
        this.logger.warn(`Agent ${message.from} has exhausted high priority quota`);
        
        // Downgrade to normal priority
        const normalQueue = this.priorityQueues.get(MessagePriority.NORMAL);
        
        if (normalQueue && normalQueue.length < this.options.maxQueueSize) {
          normalQueue.push({
            message: { ...message, priority: MessagePriority.NORMAL },
            enqueuedAt: Date.now(),
            attempts: 0,
            fairnessScore: 0
          });
          
          this.logger.info(`Downgraded high priority message from ${message.from} to normal priority`);
          return true;
        }
        
        return false;
      }
      
      if (priority === MessagePriority.CRITICAL && quota.criticalPriorityUsed >= quota.criticalPriorityQuota) {
        this.logger.warn(`Agent ${message.from} has exhausted critical priority quota`);
        
        // Downgrade to high priority
        const highQueue = this.priorityQueues.get(MessagePriority.HIGH);
        
        if (highQueue && highQueue.length < this.options.maxQueueSize) {
          highQueue.push({
            message: { ...message, priority: MessagePriority.HIGH },
            enqueuedAt: Date.now(),
            attempts: 0,
            fairnessScore: 0
          });
          
          // Update high priority quota
          quota.highPriorityUsed++;
          
          this.logger.info(`Downgraded critical priority message from ${message.from} to high priority`);
          return true;
        }
        
        return false;
      }
      
      // Update quota
      if (priority === MessagePriority.HIGH) {
        quota.highPriorityUsed++;
      } else {
        quota.criticalPriorityUsed++;
      }
    }
    
    // Add message to queue
    queue.push({
      message,
      enqueuedAt: Date.now(),
      attempts: 0,
      fairnessScore: 0
    });
    
    this.logger.debug(`Message from ${message.from} enqueued with priority ${MessagePriority[priority]}`);
    
    return true;
  }
  
  /**
   * Dequeue the next message to process
   * 
   * @returns A2A message or null if no messages
   */
  public dequeueMessage(): SecureA2AMessage | null {
    // Get priority levels in descending order (highest first)
    const priorities = Array.from(this.priorityQueues.keys())
      .filter(priority => typeof priority === 'number')
      .sort((a, b) => b - a);
    
    // Find first non-empty queue
    for (const priority of priorities) {
      const queue = this.priorityQueues.get(priority);
      
      if (queue && queue.length > 0) {
        // Remove and return first message
        const queuedMessage = queue.shift();
        
        if (queuedMessage) {
          // Update agent quota
          const quota = this.getOrCreateAgentQuota(queuedMessage.message.from);
          quota.totalMessagesProcessed++;
          
          this.logger.debug(`Message from ${queuedMessage.message.from} dequeued with priority ${MessagePriority[priority]}`);
          
          return queuedMessage.message;
        }
      }
    }
    
    return null;
  }
  
  /**
   * Get the number of messages in all queues
   * 
   * @returns Total message count
   */
  public getQueueCount(): number {
    let total = 0;
    
    for (const queue of this.priorityQueues.values()) {
      total += queue.length;
    }
    
    return total;
  }
  
  /**
   * Get the queue counts for each priority
   * 
   * @returns Map of priority to queue count
   */
  public getQueueCounts(): Map<MessagePriority, number> {
    const counts = new Map<MessagePriority, number>();
    
    for (const [priority, queue] of this.priorityQueues.entries()) {
      counts.set(priority, queue.length);
    }
    
    return counts;
  }
  
  /**
   * Set agent quota
   * 
   * @param agentId - Agent identifier
   * @param highPriorityQuota - High priority quota
   * @param criticalPriorityQuota - Critical priority quota
   */
  public setAgentQuota(
    agentId: string,
    highPriorityQuota: number,
    criticalPriorityQuota: number
  ): void {
    const quota = this.getOrCreateAgentQuota(agentId);
    
    quota.highPriorityQuota = highPriorityQuota;
    quota.criticalPriorityQuota = criticalPriorityQuota;
    
    this.logger.info(`Quota set for agent ${agentId}`, { highPriorityQuota, criticalPriorityQuota });
  }
  
  /**
   * Get queue statistics
   * 
   * @returns Queue statistics
   */
  public getQueueStats(): Record<string, unknown> {
    const stats: Record<string, unknown> = {
      totalMessages: this.getQueueCount(),
      queuesByPriority: {} as Record<string, number>,
      agentStats: {} as Record<string, {
        highPriorityQuota: number;
        criticalPriorityQuota: number;
        highPriorityUsed: number;
        criticalPriorityUsed: number;
        totalMessagesProcessed: number;
      }>
    };
    
    // Add queue counts by priority
    for (const [priority, count] of this.getQueueCounts().entries()) {
      stats.queuesByPriority[MessagePriority[priority]] = count;
    }
    
    // Add agent stats
    for (const [agentId, quota] of this.agentQuotas.entries()) {
      stats.agentStats[agentId] = {
        highPriorityQuota: quota.highPriorityQuota,
        criticalPriorityQuota: quota.criticalPriorityQuota,
        highPriorityUsed: quota.highPriorityUsed,
        criticalPriorityUsed: quota.criticalPriorityUsed,
        totalMessagesProcessed: quota.totalMessagesProcessed
      };
    }
    
    return stats;
  }
  
  /**
   * Cleans up resources when shutting down
   */
  public shutdown(): void {
    this.stopFairnessAdjustment();
    this.stopAgentQuotaRefresh();
  }
}

export default A2APriorityManager;