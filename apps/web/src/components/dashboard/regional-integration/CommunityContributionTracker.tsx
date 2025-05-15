import React, { useEffect, useState } from 'react';

// Placeholder for Contribution/Feedback data type
interface ContributionItem {
  id: string;
  type: 'feedback' | 'data_suggestion' | 'correction';
  summary: string;
  status: 'new' | 'under_review' | 'accepted' | 'rejected';
  submittedBy: string; // Could be anonymized like "Community Member" or a user ID
  submittedAt: string; // ISO date string
}

// Placeholder for API response type
interface ContributionsApiResponse {
  contributions: ContributionItem[];
  summaryStats?: {
    totalContributions: number;
    pendingReview: number;
    acceptedRate: number; // Percentage
  };
}

const CommunityContributionTracker: React.FC = () => {
  const [contributions, setContributions] = useState<ContributionItem[]>([]);
  const [stats, setStats] = useState<ContributionsApiResponse['summaryStats'] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Fetch community contributions data from the backend API
    // Example:
    // const fetchContributions = async () => {
    //   try {
    //     const response = await fetch('/api/community/contributions?limit=5&status=recent'); // Replace with actual API endpoint
    //     if (!response.ok) {
    //       throw new Error(`HTTP error! status: ${response.status}`);
    //     }
    //     const data: ContributionsApiResponse = await response.json();
    //     setContributions(data.contributions);
    //     setStats(data.summaryStats || null);
    //   } catch (e) {
    //     setError(e instanceof Error ? e.message : String(e));
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchContributions();

    // Mock data for now
    setTimeout(() => {
      setContributions([
        { id: 'contrib-001', type: 'feedback', summary: 'Agent response for "best hiking trails" was outdated.', status: 'under_review', submittedBy: 'UserA123', submittedAt: new Date(Date.now() - 3600000 * 2).toISOString() },
        { id: 'contrib-002', type: 'data_suggestion', summary: 'Suggest adding info about the new museum in Saarbrücken.', status: 'new', submittedBy: 'UserB456', submittedAt: new Date(Date.now() - 3600000 * 5).toISOString() },
        { id: 'contrib-003', type: 'correction', summary: 'Opening hours for Völklinger Hütte are incorrect.', status: 'accepted', submittedBy: 'UserC789', submittedAt: new Date(Date.now() - 86400000).toISOString() },
      ]);
      setStats({
        totalContributions: 125,
        pendingReview: 15,
        acceptedRate: 75.2,
      });
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: ContributionItem['status']) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-700';
      case 'under_review': return 'bg-yellow-100 text-yellow-700';
      case 'accepted': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading community contributions...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error fetching contributions: {error}</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">"Mitmach-KI" Contribution Tracker</h2>
      
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-3 bg-gray-50 rounded text-center">
            <p className="text-sm font-medium text-gray-500">Total Contributions</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.totalContributions}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded text-center">
            <p className="text-sm font-medium text-gray-500">Pending Review</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.pendingReview}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded text-center">
            <p className="text-sm font-medium text-gray-500">Accepted Rate</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.acceptedRate.toFixed(1)}%</p>
          </div>
        </div>
      )}

      <h3 className="text-lg font-medium text-gray-700 mb-2">Recent Contributions</h3>
      {contributions.length === 0 ? (
        <p className="text-gray-600">No recent contributions.</p>
      ) : (
        <ul className="space-y-3">
          {contributions.map((item) => (
            <li key={item.id} className="p-3 border border-gray-200 rounded-md">
              <div className="flex justify-between items-start mb-1">
                <span className="font-medium text-sm text-gray-800">{item.summary}</span>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                  {item.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-gray-500">Type: {item.type.replace('_', ' ')} | By: {item.submittedBy} | At: {new Date(item.submittedAt).toLocaleString()}</p>
              {/* TODO: Add action to view details or manage contribution */}
            </li>
          ))}
        </ul>
      )}
      {/* TODO: Add link to a full contribution management page */}
    </div>
  );
};

export default CommunityContributionTracker;
