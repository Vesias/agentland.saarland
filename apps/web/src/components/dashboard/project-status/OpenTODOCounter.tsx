import React, { useState, useEffect } from 'react';

interface TodoCount {
  total: number;
  byModule?: Record<string, number>; // Optional: count by module/area
}

const OpenTODOCounter: React.FC = () => {
  // Placeholder data - in a real implementation, this would be fetched
  // from a backend service that scans the codebase.
  const [todoData, setTodoData] = useState<TodoCount>({
    total: 42, // Example total
    byModule: {
      'libs/core': 15,
      'libs/agents': 10,
      'apps/web': 8,
      'apps/cli': 5,
      'Sonstige': 4,
    },
  });
  const [isLoading, setIsLoading] = useState(false); // Example for future API call

  // useEffect(() => {
  //   setIsLoading(true);
  //   // Replace with actual API call to fetch TODO counts
  //   fetch('/api/project/todo-counts') // Example API endpoint
  //     .then(res => res.json())
  //     .then(data => {
  //       setTodoData(data);
  //       setIsLoading(false);
  //     })
  //     .catch(error => {
  //       console.error("Failed to fetch TODO counts:", error);
  //       setIsLoading(false);
  //       // Keep placeholder or set error state
  //     });
  // }, []);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 text-center">
        <p className="text-gray-600 dark:text-gray-300">Lade TODOs...</p>
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
          <ul className="space-y-1 text-sm">
            {Object.entries(todoData.byModule).map(([moduleName, count]) => (
              <li key={moduleName} className="flex justify-between text-gray-600 dark:text-gray-300">
                <span>{moduleName}:</span>
                <span className="font-medium">{count}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
        Daten basierend auf Codebase-Scan.
      </p>
    </div>
  );
};

export default OpenTODOCounter;
