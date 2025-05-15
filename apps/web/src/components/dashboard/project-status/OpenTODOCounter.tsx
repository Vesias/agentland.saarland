import React, { useState, useEffect } from 'react';
import { FaSpinner } from 'react-icons/fa';

interface TodoCount {
  total: number;
  byModule?: Record<string, number>; // Optional: count by module/area
}

const OpenTODOCounter: React.FC = () => {
  const [todoData, setTodoData] = useState<TodoCount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTodoCounts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/project/todo-counts');
        if (!response.ok) {
          throw new Error(`Failed to fetch TODO counts: ${response.statusText}`);
        }
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        setTodoData(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
        setTodoData({ // Fallback data
          total: 0,
          byModule: { 'Error': 0 }
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTodoCounts();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 text-center">
        <FaSpinner className="animate-spin text-blue-500 text-2xl mx-auto mb-2" />
        <p className="text-gray-600 dark:text-gray-300">Lade TODOs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-semibold text-red-500 dark:text-red-400 mb-4">
          Fehler bei TODOs
        </h2>
        <p className="text-red-500 dark:text-red-400">{error}</p>
        {todoData && <p className="text-xs text-gray-400 mt-2">(Fallback-Daten werden angezeigt)</p>}
      </div>
    );
  }
  
  if (!todoData) {
     return (
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Offene TODOs im Code
        </h2>
        <p className="text-gray-500 dark:text-gray-400">Keine Daten verfügbar.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
        Offene TODOs im Code
      </h2>
      <div className="text-center mb-4">
        <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">{todoData.total}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">Insgesamt offene TODOs</p>
      </div>
      {todoData.byModule && Object.keys(todoData.byModule).length > 0 && (
        <div>
          <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2">Nach Modul:</h3>
          <ul className="space-y-1 text-sm max-h-32 overflow-y-auto">
            {Object.entries(todoData.byModule).map(([moduleName, count]) => (
              <li key={moduleName} className="flex justify-between text-gray-600 dark:text-gray-300 pr-2">
                <span>{moduleName}:</span>
                <span className="font-medium">{count}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
        Daten basierend auf automatischem Codebase-Scan.
        {error && " (Fallback-Daten werden angezeigt)"}
      </p>
    </div>
  );
};

export default OpenTODOCounter;
