import React, { useState, useEffect } from 'react';
import { FaShieldAlt, FaCheck, FaTimes, FaExclamationTriangle, FaSync } from 'react-icons/fa';

/**
 * DNSSecurityStatus Component
 * 
 * Displays the status of DNS security records for the domain
 * and provides verification of agent authentication via DNS
 */
const DNSSecurityStatus = ({ domain = 'agentland.saarland', className = '' }) => {
  const [loading, setLoading] = useState(true);
  const [dnsRecords, setDNSRecords] = useState({
    spf: { status: 'unknown', value: '' },
    dkim: { status: 'unknown', value: '' },
    dmarc: { status: 'unknown', value: '' },
    agentAuth: { status: 'unknown', value: '' },
    securityChallenge: { status: 'unknown', value: '' },
    domainVerification: { status: 'unknown', value: '' },
    caa: { status: 'unknown', value: '' }
  });
  const [lastChecked, setLastChecked] = useState(null);
  const [expandedRecord, setExpandedRecord] = useState(null);

  // Fetch DNS records
  useEffect(() => {
    const checkDNSRecords = async () => {
      setLoading(true);
      
      try {
        // Fetch domain verification instructions which includes DNS records
        const response = await fetch(`/api/a2a/security/dns/verification-instructions`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch DNS records: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch DNS records');
        }
        
        // Now verify each record against the DNS
        const verifyAuth = await fetch('/api/a2a/security/dns/verify-auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ domain })
        });
        
        const verifyDomain = await fetch('/api/a2a/security/dns/verify-domain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ domain })
        });
        
        const authData = await verifyAuth.json();
        const domainData = await verifyDomain.json();
        
        // Create records object with verification results
        const recordsData = {};
        
        // Map the records from the API to our component format
        data.records.forEach(record => {
          const recordType = mapRecordTypeToKey(record.name);
          const value = record.value;
          
          let status = 'unknown';
          
          // Check if this is an auth record and was verified
          if (recordType === 'agentAuth' && authData.success) {
            status = authData.verified ? 'verified' : 'error';
          }
          // Check if this is a domain verification record and was verified
          else if (recordType === 'domainVerification' && domainData.success) {
            status = domainData.verified ? 'verified' : 'error';
          }
          // For other records, assume they exist but set warning since we can't verify
          else {
            status = 'warning';
          }
          
          recordsData[recordType] = {
            status,
            value,
            lastChecked: new Date().toISOString(),
            error: status === 'error' ? 'Record not found or invalid' : null
          };
        });
        
        // Add standard DNS security records if they don't exist in the API response
        const requiredRecords = ['spf', 'dkim', 'dmarc', 'caa', 'securityChallenge'];
        requiredRecords.forEach(recordType => {
          if (!recordsData[recordType]) {
            recordsData[recordType] = {
              status: 'warning',
              value: 'Not configured',
              lastChecked: new Date().toISOString(),
              error: 'Record not configured in DNS security settings'
            };
          }
        });
        
        setDNSRecords(recordsData);
        setLastChecked(new Date());
      } catch (error) {
        console.error('Error checking DNS records:', error);
        // Set all records to error state
        const errorData = {};
        Object.keys(dnsRecords).forEach(key => {
          errorData[key] = { 
            status: 'error', 
            value: '', 
            error: `Failed to fetch: ${error.message || 'Unknown error'}` 
          };
        });
        setDNSRecords(errorData);
      } finally {
        setLoading(false);
      }
    };
    
    // Helper function to map DNS record name to our component's key
    function mapRecordTypeToKey(name) {
      switch (name.toLowerCase()) {
        case '@':
          return 'domainVerification';
        case '_a2a-auth':
        case '_a2a-auth.agentland.saarland':
          return 'agentAuth';
        case '_security-challenge':
        case '_security-challenge.agentland.saarland':
          return 'securityChallenge';
        case 'default._domainkey':
        case 'default._domainkey.agentland.saarland':
          return 'dkim';
        case '_dmarc':
        case '_dmarc.agentland.saarland':
          return 'dmarc';
        default:
          // Try to extract the record type from the name
          if (name.includes('spf')) return 'spf';
          if (name.includes('dkim')) return 'dkim';
          if (name.includes('dmarc')) return 'dmarc';
          if (name.includes('caa')) return 'caa';
          if (name.includes('security')) return 'securityChallenge';
          if (name.includes('a2a')) return 'agentAuth';
          if (name.includes('verification')) return 'domainVerification';
          
          // Default to the name itself
          return name.replace(/\./g, '_');
      }
    }
    
    checkDNSRecords();
    
    // Set up periodic checks every 30 minutes
    const interval = setInterval(checkDNSRecords, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [domain]);

  // Refresh DNS records manually
  const handleRefresh = async () => {
    setLoading(true);
    
    try {
      // In a real implementation, this would force a refresh via API
      // Example: await fetch(`/api/security/dns-status?domain=${domain}&refresh=true`);
      
      // For demonstration, wait and then update the last checked time
      await new Promise(resolve => setTimeout(resolve, 1500));
      setLastChecked(new Date());
    } catch (error) {
      console.error('Error refreshing DNS records:', error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle expanded record
  const toggleRecordDetails = (recordType) => {
    if (expandedRecord === recordType) {
      setExpandedRecord(null);
    } else {
      setExpandedRecord(recordType);
    }
  };

  // Render status icon
  const renderStatusIcon = (status) => {
    switch (status) {
      case 'verified':
        return <FaCheck className="status-icon verified" />;
      case 'warning':
        return <FaExclamationTriangle className="status-icon warning" />;
      case 'error':
        return <FaTimes className="status-icon error" />;
      default:
        return <FaExclamationTriangle className="status-icon unknown" />;
    }
  };

  // Get status text
  const getStatusText = (status) => {
    switch (status) {
      case 'verified':
        return 'Verified';
      case 'warning':
        return 'Warning';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  // Get human-readable record type
  const getRecordLabel = (recordType) => {
    switch (recordType) {
      case 'spf':
        return 'SPF Record';
      case 'dkim':
        return 'DKIM Record';
      case 'dmarc':
        return 'DMARC Record';
      case 'agentAuth':
        return 'Agent Authentication';
      case 'securityChallenge':
        return 'Security Challenge';
      case 'domainVerification':
        return 'Domain Verification';
      case 'caa':
        return 'CAA Record';
      default:
        return recordType.toUpperCase();
    }
  };

  // Get description for record type
  const getRecordDescription = (recordType) => {
    switch (recordType) {
      case 'spf':
        return 'Sender Policy Framework - Controls which mail servers can send emails on behalf of your domain.';
      case 'dkim':
        return 'DomainKeys Identified Mail - Ensures that emails are not altered in transit.';
      case 'dmarc':
        return 'Domain-based Message Authentication, Reporting & Conformance - Prevents email spoofing.';
      case 'agentAuth':
        return 'Agent Authentication - Validates agent identities via DNS for A2A communication.';
      case 'securityChallenge':
        return 'Security Challenge - Provides challenge-response authentication for agents.';
      case 'domainVerification':
        return 'Domain Verification - Proves ownership of the domain for security purposes.';
      case 'caa':
        return 'Certificate Authority Authorization - Controls which CAs can issue SSL certificates for the domain.';
      default:
        return 'DNS record for security purposes.';
    }
  };

  return (
    <div className={`dns-security-status ${className}`}>
      <div className="dns-security-header">
        <div className="title-area">
          <FaShieldAlt className="title-icon" />
          <h3>DNS Security Configuration</h3>
        </div>
        
        <div className="actions-area">
          <button 
            className="refresh-button" 
            onClick={handleRefresh} 
            disabled={loading}
          >
            <FaSync className={loading ? 'rotating' : ''} />
            Refresh
          </button>
        </div>
      </div>
      
      {loading && !lastChecked ? (
        <div className="loading-message">
          Loading DNS security records...
        </div>
      ) : (
        <>
          <div className="dns-records-list">
            {Object.entries(dnsRecords).map(([recordType, record]) => (
              <div 
                key={recordType}
                className={`dns-record-item ${record.status} ${expandedRecord === recordType ? 'expanded' : ''}`}
                onClick={() => toggleRecordDetails(recordType)}
              >
                <div className="record-summary">
                  <div className="record-status">
                    {renderStatusIcon(record.status)}
                  </div>
                  <div className="record-info">
                    <span className="record-label">{getRecordLabel(recordType)}</span>
                    <span className="record-status-text">{getStatusText(record.status)}</span>
                  </div>
                </div>
                
                {expandedRecord === recordType && (
                  <div className="record-details">
                    <p className="record-description">
                      {getRecordDescription(recordType)}
                    </p>
                    <div className="record-value">
                      <p><strong>Value:</strong></p>
                      <pre>{record.value || 'No value available'}</pre>
                    </div>
                    {record.error && (
                      <p className="record-error">{record.error}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="dns-security-footer">
            <p className="last-checked">
              Last checked: {lastChecked ? lastChecked.toLocaleString() : 'Never'}
            </p>
            <div className="security-summary">
              <div className="summary-item">
                Domain: <strong>{domain}</strong>
              </div>
              <div className="summary-item">
                Security: <strong className={getSummaryClass()}>
                  {getSummaryText()}
                </strong>
              </div>
            </div>
          </div>
        </>
      )}
      
      <style jsx>{`
        .dns-security-status {
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          padding: 1.25rem;
          margin-bottom: 1.5rem;
        }
        
        .dns-security-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
        }
        
        .title-area {
          display: flex;
          align-items: center;
        }
        
        .title-icon {
          color: #3a6ea5;
          margin-right: 0.5rem;
        }
        
        .dns-security-header h3 {
          margin: 0;
          font-size: 1.25rem;
          color: #333;
        }
        
        .refresh-button {
          display: flex;
          align-items: center;
          background-color: transparent;
          border: 1px solid #ccc;
          border-radius: 4px;
          padding: 0.25rem 0.5rem;
          cursor: pointer;
          font-size: 0.875rem;
        }
        
        .refresh-button:hover {
          background-color: #f0f0f0;
        }
        
        .refresh-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .refresh-button svg {
          margin-right: 0.25rem;
        }
        
        .rotating {
          animation: rotate 1.5s linear infinite;
        }
        
        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .loading-message {
          text-align: center;
          padding: 2rem 0;
          color: #777;
        }
        
        .dns-records-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1.25rem;
        }
        
        .dns-record-item {
          border: 1px solid #eee;
          border-radius: 4px;
          overflow: hidden;
          cursor: pointer;
        }
        
        .dns-record-item.verified {
          border-left: 4px solid #5cb85c;
        }
        
        .dns-record-item.warning {
          border-left: 4px solid #f0ad4e;
        }
        
        .dns-record-item.error {
          border-left: 4px solid #d9534f;
        }
        
        .dns-record-item.unknown {
          border-left: 4px solid #777;
        }
        
        .record-summary {
          display: flex;
          align-items: center;
          padding: 0.75rem;
          background-color: #f8f9fa;
        }
        
        .dns-record-item.expanded .record-summary {
          border-bottom: 1px solid #eee;
        }
        
        .record-status {
          margin-right: 0.75rem;
        }
        
        .status-icon {
          font-size: 1rem;
        }
        
        .status-icon.verified {
          color: #5cb85c;
        }
        
        .status-icon.warning {
          color: #f0ad4e;
        }
        
        .status-icon.error {
          color: #d9534f;
        }
        
        .status-icon.unknown {
          color: #777;
        }
        
        .record-info {
          display: flex;
          flex-direction: column;
        }
        
        .record-label {
          font-weight: 500;
          color: #333;
        }
        
        .record-status-text {
          font-size: 0.75rem;
          color: #777;
        }
        
        .record-details {
          padding: 0.75rem;
          background-color: #fff;
        }
        
        .record-description {
          margin-top: 0;
          margin-bottom: 0.75rem;
          font-size: 0.875rem;
          color: #555;
        }
        
        .record-value {
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }
        
        .record-value p {
          margin-top: 0;
          margin-bottom: 0.25rem;
          font-size: 0.875rem;
        }
        
        .record-value pre {
          background-color: #f5f5f5;
          padding: 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          overflow-x: auto;
          margin: 0;
        }
        
        .record-error {
          color: #d9534f;
          font-size: 0.875rem;
          margin: 0.5rem 0 0;
        }
        
        .dns-security-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid #eee;
          padding-top: 0.75rem;
          font-size: 0.875rem;
          color: #777;
        }
        
        .last-checked {
          margin: 0;
        }
        
        .security-summary {
          display: flex;
          gap: 1rem;
        }
        
        .summary-item {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        
        .summary-item strong.verified {
          color: #5cb85c;
        }
        
        .summary-item strong.warning {
          color: #f0ad4e;
        }
        
        .summary-item strong.error {
          color: #d9534f;
        }
        
        @media (max-width: 768px) {
          .dns-security-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
          }
          
          .dns-security-footer {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
  
  // Helper function to determine overall security status
  function getSummaryClass() {
    const statuses = Object.values(dnsRecords).map(record => record.status);
    
    if (statuses.includes('error')) {
      return 'error';
    } else if (statuses.includes('warning')) {
      return 'warning';
    } else if (statuses.every(status => status === 'verified')) {
      return 'verified';
    } else {
      return '';
    }
  }
  
  // Helper function to get summary text
  function getSummaryText() {
    const summaryClass = getSummaryClass();
    
    switch (summaryClass) {
      case 'verified':
        return 'Fully Secured';
      case 'warning':
        return 'Partially Secured';
      case 'error':
        return 'Security Issues';
      default:
        return 'Unknown';
    }
  }
};

export default DNSSecurityStatus;