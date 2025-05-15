import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';

interface EnvVarCheck {
  name: string;
  isSet: boolean;
  isCritical: boolean;
  description?: string;
}

const EnvVariableStatus: React.FC = () => {
  // Placeholder data - in a real implementation, this would be fetched
  // from a backend service that checks environment variables on the server.
  // IMPORTANT: The actual values of environment variables should NEVER be sent to the client.
  const [envVarChecks, setEnvVarChecks] = useState<EnvVarCheck[]>([
    { name: 'A2A_JWT_SECRET', isSet: true, isCritical: true, description: 'Secret for A2A JWT signing.' },
    { name: 'MCP_API_KEY', isSet: true, isCritical: true, description: 'API key for MCP server access.' },
    { name: 'RAG_API_KEY', isSet: false, isCritical: true, description: 'API key for RAG system services.' },
    { name: 'DATABASE_URL', isSet: true, isCritical: true, description: 'Connection string for the primary database.' },
    { name: 'LOG_LEVEL', isSet: true, isCritical: false, description: 'Defines the application log level.' },
    { name: 'NODE_ENV', isSet: true, isCritical: false, description: 'Application environment (development/production).' },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  // useEffect(() => {
  //   setIsLoading(true);
  //   fetch('/api/security/env-status') // Example API endpoint
  //     .then(res => res.json())
  //     .then(data => {
  //       setEnvVarChecks(data);
  //       setIsLoading(false);
  //     })
  //     .catch(error => {
  //       console.error("Failed to fetch environment variable statuses:", error);
  //       setIsLoading(false);
  //     });
  // }, []);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 text-center">
        <FaSpinner className="animate-spin text-blue-500 text-2xl mx-auto mb-2" />
        <p className="text-gray-600 dark:text-gray-300">Prüfe Umgebungsvariablen...</p>
      </div>
    );
  }

  const criticalUnsetCount = envVarChecks.filter(v => v.isCritical && !v.isSet).length;

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
        Status kritischer Umgebungsvariablen
      </h2>
      {criticalUnsetCount > 0 && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-700 border border-red-300 dark:border-red-600 rounded-md text-red-700 dark:text-red-100">
          <FaExclamationTriangle className="inline mr-2 mb-0.5" />
          <strong>Warnung:</strong> {criticalUnsetCount} kritische Umgebungsvariable(n) sind nicht gesetzt! Dies kann die Systemsicherheit oder -funktionalität beeinträchtigen.
        </div>
      )}
      <div className="space-y-2">
        {envVarChecks.map(envVar => (
          <div key={envVar.name} className={`flex items-center justify-between p-2 rounded-md ${envVar.isSet ? 'bg-green-50 dark:bg-green-800' : (envVar.isCritical ? 'bg-red-50 dark:bg-red-800' : 'bg-yellow-50 dark:bg-yellow-800')}`} >
            <div>
              <span className={`font-medium ${envVar.isSet ? 'text-green-700 dark:text-green-200' : (envVar.isCritical ? 'text-red-700 dark:text-red-200' : 'text-yellow-700 dark:text-yellow-200')}`} >
                {envVar.name}
              </span>
              {envVar.description && 
                <p className="text-xs text-gray-500 dark:text-gray-400">{envVar.description}</p>
              }
            </div>
            {envVar.isSet ? 
              <FaCheckCircle className="text-green-500 dark:text-green-400 text-lg" /> : 
              <FaExclamationTriangle className={`${envVar.isCritical ? 'text-red-500 dark:text-red-400' : 'text-yellow-500 dark:text-yellow-400'} text-lg`} />
            }
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
        Hinweis: Zeigt nur den Status (gesetzt/nicht gesetzt), nicht die Werte.
      </p>
    </div>
  );
};

export default EnvVariableStatus;
