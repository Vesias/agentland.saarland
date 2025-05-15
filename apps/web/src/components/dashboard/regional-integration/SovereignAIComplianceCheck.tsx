import React, { useState, useEffect } from 'react';
import { FaCheckSquare, FaRegSquare, FaSpinner, FaShieldAlt, FaGlobeEurope, FaBalanceScale, FaInfoCircle, FaExchangeAlt } from 'react-icons/fa';

interface ComplianceItem {
  id: string;
  name: string;
  description: string;
  status: 'compliant' | 'partial' | 'non-compliant' | 'not-applicable' | 'pending-review';
  detailsLink?: string;
  category: 'Data Sovereignty' | 'Transparency' | 'Open Standards' | 'Ethical AI';
}

const SovereignAIComplianceCheck: React.FC = () => {
  // Placeholder data - in a real implementation, this would be fetched
  // from a backend service or configuration management.
  const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>([
    { id: 'dsc001', name: 'Data Locality (Saarland/EU)', category: 'Data Sovereignty', description: 'Ensures user data is processed and stored within defined sovereign boundaries.', status: 'compliant', detailsLink: '/docs/data-locality-policy' },
    { id: 'dsc002', name: 'Open Source Model Usage', category: 'Open Standards', description: 'Prioritizes the use of open-source AI models where feasible.', status: 'partial', detailsLink: '/docs/model-selection-criteria' },
    { id: 'dsc003', name: 'Explainable AI (XAI) Features', category: 'Transparency', description: 'Provides mechanisms for understanding AI decision-making processes.', status: 'pending-review' },
    { id: 'dsc004', name: 'GDPR Compliance', category: 'Data Sovereignty', description: 'Adherence to General Data Protection Regulation.', status: 'compliant' },
    { id: 'dsc005', name: 'Bias Detection & Mitigation', category: 'Ethical AI', description: 'Processes in place to identify and address biases in AI models and data.', status: 'non-compliant', detailsLink: '/docs/bias-mitigation-plan' },
    { id: 'dsc006', name: 'Interoperability Standards (MCP)', category: 'Open Standards', description: 'Utilizes Model Context Protocol for interoperable AI services.', status: 'compliant' },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  // useEffect(() => {
  //   setIsLoading(true);
  //   fetch('/api/sovereignty/compliance-status') // Example API
  //     .then(res => res.json())
  //     .then(data => {
  //       setComplianceItems(data);
  //       setIsLoading(false);
  //     })
  //     .catch(error => {
  //       console.error("Failed to fetch compliance status:", error);
  //       setIsLoading(false);
  //     });
  // }, []);

  const getStatusIcon = (status: ComplianceItem['status']) => {
    switch (status) {
      case 'compliant': return <FaCheckSquare className="text-green-500 dark:text-green-400" />;
      case 'partial': return <FaCheckSquare className="text-yellow-500 dark:text-yellow-400" />; // Or a specific partial icon
      case 'non-compliant': return <FaRegSquare className="text-red-500 dark:text-red-400" />; // Or FaTimesSquare
      case 'pending-review': return <FaSpinner className="text-blue-500 dark:text-blue-400 animate-spin" />;
      default: return <FaRegSquare className="text-gray-400 dark:text-gray-500" />;
    }
  };

  const getCategoryIcon = (category: ComplianceItem['category']) => {
    switch (category) {
      case 'Data Sovereignty': return <FaGlobeEurope className="mr-2 text-blue-500" />;
      case 'Transparency': return <FaInfoCircle className="mr-2 text-purple-500" />; // Assuming FaInfoCircle is imported
      case 'Open Standards': return <FaExchangeAlt className="mr-2 text-orange-500" />;
      case 'Ethical AI': return <FaBalanceScale className="mr-2 text-teal-500" />;
      default: return <FaShieldAlt className="mr-2 text-gray-500" />;
    }
  };
  
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 text-center">
        <FaSpinner className="animate-spin text-blue-500 text-2xl mx-auto mb-2" />
        <p className="text-gray-600 dark:text-gray-300">Lade Sovereign AI Compliance Status...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
        <FaShieldAlt className="mr-2 text-indigo-500" /> Sovereign AI Compliance-Status
      </h2>
      <div className="space-y-3">
        {complianceItems.map(item => (
          <div key={item.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-md hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {getCategoryIcon(item.category)}
                <h3 className="text-md font-medium text-gray-700 dark:text-gray-200">{item.name}</h3>
              </div>
              <div className="text-lg">{getStatusIcon(item.status)}</div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-2">{item.description}</p>
            {item.detailsLink && (
              <a href={item.detailsLink} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline dark:text-blue-400">
                Weitere Details
              </a>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
        Status basierend auf internen Richtlinien und Audits.
      </p>
    </div>
  );
};

// Assuming FaInfoCircle is imported if not already available globally
// import { FaInfoCircle } from 'react-icons/fa'; 

export default SovereignAIComplianceCheck;
