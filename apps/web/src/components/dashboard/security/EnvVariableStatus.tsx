import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaQuestionCircle, FaSpinner } from 'react-icons/fa'; // Added FaTimesCircle, FaQuestionCircle

// Interface aligned with the API response from /api/security/env-check
interface EnvVariableCheck {
  variableName: string;
  isSet: boolean;
  source?: 'process.env' | '.env.local' | '.env.production' | 'vault' | 'unloaded';
  isSensitive: boolean;
  notes?: string;
}

const EnvVariableStatus: React.FC = () => {
  const [envVars, setEnvVars] = useState<EnvVariableCheck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEnvStatus = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/security/env-check');
        if (!response.ok) {
          throw new Error(`Failed to fetch env variable status: ${response.statusText}`);
        }
        const data: EnvVariableCheck[] | { error: string } = await response.json();
        if ('error' in data) { // Type guard for error object
          throw new Error(data.error);
        }
        setEnvVars(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
        setEnvVars([]); // Fallback to empty
      } finally {
        setIsLoading(false);
      }
    };

    fetchEnvStatus();
  }, []);

  const getStatusIcon = (isSet: boolean, isSensitive: boolean, source?: EnvVariableCheck['source']) => {
    if (isSet) {
      return <FaCheckCircle className="text-green-500 dark:text-green-400 text-lg" />;
    }
    if (isSensitive) {
      return <FaExclamationTriangle className="text-red-500 dark:text-red-400 text-lg" title="Critical: Not Set!" />;
    }
    return <FaTimesCircle className="text-yellow-500 dark:text-yellow-400 text-lg" title="Warning: Not Set" />;
  };
  
  const getSourceDisplay = (source?: EnvVariableCheck['source']) => {
    if (!source || source === 'unloaded') return <span className="text-xs text-gray-400 dark:text-gray-500 italic">Unloaded</span>;
    return <span className="text-xs text-gray-500 dark:text-gray-400">{source}</span>;
  };


  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 text-center">
        <FaSpinner className="animate-spin text-blue-500 text-2xl mx-auto mb-2" />
        <p className="text-gray-600 dark:text-gray-300">Prüfe Umgebungsvariablen...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-semibold text-red-500 dark:text-red-400 mb-2">
          <FaExclamationTriangle className="inline mr-2" /> Fehler beim Laden des Env-Status
        </h2>
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  const criticalUnsetCount = envVars.filter(v => v.isSensitive && !v.isSet).length;

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
        Status der Umgebungsvariablen
      </h2>
      {criticalUnsetCount > 0 && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-800/30 border border-red-300 dark:border-red-600 rounded-md text-red-700 dark:text-red-200">
          <FaExclamationTriangle className="inline mr-2 mb-0.5" />
          <strong>Warnung:</strong> {criticalUnsetCount} sensible Umgebungsvariable(n) sind nicht gesetzt!
        </div>
      )}
      <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
        {envVars.map(envVar => (
          <div 
            key={envVar.variableName} 
            className={`flex items-center justify-between p-2.5 rounded-md border ${
              envVar.isSet 
                ? 'bg-green-50 dark:bg-green-800/20 border-green-200 dark:border-green-700' 
                : (envVar.isSensitive 
                    ? 'bg-red-50 dark:bg-red-800/20 border-red-200 dark:border-red-700' 
                    : 'bg-yellow-50 dark:bg-yellow-800/20 border-yellow-200 dark:border-yellow-700')
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center">
                <span className={`font-medium truncate ${
                  envVar.isSet 
                    ? 'text-green-700 dark:text-green-300' 
                    : (envVar.isSensitive 
                        ? 'text-red-700 dark:text-red-300' 
                        : 'text-yellow-700 dark:text-yellow-300')
                }`} title={envVar.variableName}>
                  {envVar.variableName}
                </span>
                {envVar.isSensitive && <FaExclamationTriangle className="ml-1.5 text-xs text-yellow-600 dark:text-yellow-400" title="Sensible Variable" />}
              </div>
              {envVar.notes && 
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate" title={envVar.notes}>{envVar.notes}</p>
              }
            </div>
            <div className="ml-2 flex-shrink-0 flex items-center">
              {getSourceDisplay(envVar.source)}
              <span className="ml-2">{getStatusIcon(envVar.isSet, envVar.isSensitive, envVar.source)}</span>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
        Hinweis: Zeigt nur den Status (gesetzt/nicht gesetzt) und die Quelle, nicht die Werte.
      </p>
    </div>
  );
};

export default EnvVariableStatus;
