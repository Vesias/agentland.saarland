import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Create the security context
const SecurityContext = createContext(null);

/**
 * Security Provider Component
 * 
 * Provides security status and functions to manage A2A security
 * throughout the application
 */
export const SecurityProvider = ({ children }) => {
  // Security state
  const [securityState, setSecurityState] = useState({
    // Authentication status
    isAuthenticated: false,
    currentAgent: null,
    accessLevel: null,
    roles: [],
    
    // Security features status
    encryptionEnabled: false,
    messageSigningEnabled: false,
    securityLevel: 'medium', // 'high', 'medium', 'low'
    
    // Metrics
    activeAgents: 0,
    messagesProcessed: 0,
    messagesBlocked: 0,
    lastUpdated: null
  });

  // Error state
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch security status from the API
  const fetchSecurityStatus = useCallback(async () => {
    setLoading(true);
    try {
      // In a real implementation, this would be an API call:
      // const response = await fetch('/api/security/status');
      // const data = await response.json();
      
      // For demo, use mock data
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
      
      const mockData = {
        isAuthenticated: true,
        currentAgent: 'user-agent',
        accessLevel: 'protected',
        roles: ['user', 'reader'],
        encryptionEnabled: true,
        messageSigningEnabled: false,
        securityLevel: 'medium',
        activeAgents: Math.floor(Math.random() * 10) + 1,
        messagesProcessed: Math.floor(Math.random() * 1000) + 50,
        messagesBlocked: Math.floor(Math.random() * 50),
        lastUpdated: new Date()
      };
      
      setSecurityState(mockData);
      setError(null);
    } catch (err) {
      console.error('Error fetching security status:', err);
      setError('Could not fetch security status');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load initial security status
  useEffect(() => {
    fetchSecurityStatus();
    
    // Set up polling for periodic updates
    const interval = setInterval(fetchSecurityStatus, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [fetchSecurityStatus]);

  // Generate a new API key for the current agent
  const generateApiKey = useCallback(async () => {
    setLoading(true);
    try {
      // In a real implementation, this would be an API call:
      // const response = await fetch('/api/security/generate-key', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ agentId: securityState.currentAgent })
      // });
      // const data = await response.json();
      // return data.apiKey;
      
      // For demo, return a mock API key
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
      return 'a2a_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    } catch (err) {
      console.error('Error generating API key:', err);
      setError('Could not generate API key');
      return null;
    } finally {
      setLoading(false);
    }
  }, [securityState.currentAgent]);

  // Toggle encryption status
  const toggleEncryption = useCallback(async (enabled) => {
    setLoading(true);
    try {
      // In a real implementation, this would be an API call:
      // const response = await fetch('/api/security/toggle-encryption', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ enabled })
      // });
      // await response.json();
      
      // For demo, just update the local state
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      setSecurityState(prev => ({
        ...prev,
        encryptionEnabled: enabled
      }));
      
      return true;
    } catch (err) {
      console.error('Error toggling encryption:', err);
      setError('Could not update encryption settings');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Toggle message signing status
  const toggleMessageSigning = useCallback(async (enabled) => {
    setLoading(true);
    try {
      // In a real implementation, this would be an API call
      // Similar to toggleEncryption
      
      // For demo, just update the local state
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      setSecurityState(prev => ({
        ...prev,
        messageSigningEnabled: enabled
      }));
      
      return true;
    } catch (err) {
      console.error('Error toggling message signing:', err);
      setError('Could not update message signing settings');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Change security level
  const setSecurityLevel = useCallback(async (level) => {
    if (!['high', 'medium', 'low'].includes(level)) {
      setError('Invalid security level');
      return false;
    }
    
    setLoading(true);
    try {
      // In a real implementation, this would be an API call
      
      // For demo, just update the local state
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      setSecurityState(prev => ({
        ...prev,
        securityLevel: level
      }));
      
      return true;
    } catch (err) {
      console.error('Error setting security level:', err);
      setError('Could not update security level');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Context value with all security state and functions
  const contextValue = {
    // Security state
    ...securityState,
    
    // Loading and error state
    loading,
    error,
    
    // Functions
    fetchSecurityStatus,
    generateApiKey,
    toggleEncryption,
    toggleMessageSigning,
    setSecurityLevel,
    clearError
  };

  return (
    <SecurityContext.Provider value={contextValue}>
      {children}
    </SecurityContext.Provider>
  );
};

/**
 * Custom hook to use the security context
 */
export const useSecurity = () => {
  const context = useContext(SecurityContext);
  
  if (context === null) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  
  return context;
};

export default SecurityContext;