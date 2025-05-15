import React, { useEffect, useState } from 'react';

// Placeholder for Lighthouse App data type
interface LighthouseApp {
  id: string;
  name: string;
  description: string;
  imageUrl?: string; // Optional image for the app
  status: 'live' | 'beta' | 'in_development';
  userCount?: number;
  satisfactionScore?: number; // e.g., out of 5 or 100
  link: string; // Link to the app or more info
}

// Placeholder for API response type
interface LighthouseAppsApiResponse {
  apps: LighthouseApp[]; // Could feature one or a few apps
}

const LighthouseAppSpotlight: React.FC = () => {
  const [apps, setApps] = useState<LighthouseApp[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Fetch lighthouse app data from the backend API or a config file
    // Example:
    // const fetchLighthouseApps = async () => {
    //   try {
    //     const response = await fetch('/api/regional/lighthouse-apps'); // Replace with actual API endpoint
    //     if (!response.ok) {
    //       throw new Error(`HTTP error! status: ${response.status}`);
    //     }
    //     const data: LighthouseAppsApiResponse = await response.json();
    //     setApps(data.apps);
    //   } catch (e) {
    //     setError(e instanceof Error ? e.message : String(e));
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchLighthouseApps();

    // Mock data for now
    setTimeout(() => {
      setApps([
        { 
          id: 'app-saar-nav', 
          name: 'Saarland-Navigator 2.0', 
          description: 'Your multimodal, context-aware guide to Saarland. Personalized recommendations and dynamic tour planning with ÖPNV integration.',
          imageUrl: 'https://placehold.co/600x400/003366/FFFFFF/png?text=Saarland+Navigator', // Placeholder image
          status: 'beta', 
          userCount: 1250, 
          satisfactionScore: 4.5,
          link: '/apps/saarland-navigator' // Internal or external link
        },
        // Could add Saar-KI-Assistant, Wirtschafts-Navigator Saar, Saar-KulturBot here if needed
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return <div className="p-4 text-center">Loading lighthouse applications...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error fetching lighthouse apps: {error}</div>;
  }

  if (apps.length === 0) {
    return <div className="p-4 text-center text-gray-600">No lighthouse applications to display.</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Lighthouse Application Spotlight</h2>
      {apps.map(app => (
        <div key={app.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
          {app.imageUrl && (
            <img src={app.imageUrl} alt={app.name} className="w-full h-48 object-cover rounded-md mb-4" />
          )}
          <h3 className="text-lg font-semibold text-indigo-700 mb-1">{app.name} 
            <span className={`ml-2 px-2 py-0.5 text-xs font-semibold rounded-full 
              ${app.status === 'live' ? 'bg-green-100 text-green-700' : ''}
              ${app.status === 'beta' ? 'bg-yellow-100 text-yellow-700' : ''}
              ${app.status === 'in_development' ? 'bg-blue-100 text-blue-700' : ''}
            `}>
              {app.status.replace('_', ' ')}
            </span>
          </h3>
          <p className="text-sm text-gray-600 mb-3">{app.description}</p>
          <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
            {app.userCount !== undefined && <span>Users: {app.userCount.toLocaleString()}</span>}
            {app.satisfactionScore !== undefined && <span>Satisfaction: {app.satisfactionScore}/5</span>}
          </div>
          <a 
            href={app.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Learn More / Access
          </a>
        </div>
      ))}
      {/* TODO: Could add a carousel if there are multiple apps to spotlight */}
    </div>
  );
};

export default LighthouseAppSpotlight;
