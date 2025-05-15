import React, { useEffect, useState } from 'react';

// Using KBItem from KnowledgeBaseExplorer for consistency, or a simplified version
interface FeedItem {
  id: string;
  title: string;
  source: string;
  type: 'document' | 'website' | 'text_chunk';
  embeddedAt: string; // ISO date string
}

// Placeholder for API response type
interface FeedApiResponse {
  recentItems: FeedItem[];
}

const RecentEmbeddingsFeed: React.FC = () => {
  const [recentItems, setRecentItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Fetch recent embeddings data from the backend API
    // Example:
    // const fetchRecentItems = async () => {
    //   try {
    //     const response = await fetch('/api/kb/recent-embeddings?limit=10'); // Replace with actual API endpoint
    //     if (!response.ok) {
    //       throw new Error(`HTTP error! status: ${response.status}`);
    //     }
    //     const data: FeedApiResponse = await response.json();
    //     setRecentItems(data.recentItems);
    //   } catch (e) {
    //     setError(e instanceof Error ? e.message : String(e));
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchRecentItems();

    // Mock data for now
    setTimeout(() => {
      setRecentItems([
        { id: 'feed-item-001', title: 'New Press Release Q2.docx', source: 'uploads/press_release_q2.docx', type: 'document', embeddedAt: new Date(Date.now() - 60000 * 5).toISOString() }, // 5 mins ago
        { id: 'feed-item-002', title: 'Updated Saarland Events Calendar', source: 'external_api/saar_events', type: 'website', embeddedAt: new Date(Date.now() - 60000 * 30).toISOString() }, // 30 mins ago
        { id: 'feed-item-003', title: 'Chunk from "AI Ethics Guidelines v1.1"', source: 'internal_docs/ai_ethics_v1.1.md', type: 'text_chunk', embeddedAt: new Date(Date.now() - 60000 * 120).toISOString() }, // 2 hours ago
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return <div className="p-4 text-center">Loading recent embeddings feed...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error fetching recent embeddings: {error}</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Recent Embeddings Feed</h2>
      {recentItems.length === 0 ? (
        <p className="text-gray-600">No recent embeddings found.</p>
      ) : (
        <ul className="space-y-3">
          {recentItems.map((item) => (
            <li key={item.id} className="p-3 border-b border-gray-100 last:border-b-0">
              <h3 className="font-medium text-sm text-gray-800">{item.title}</h3>
              <p className="text-xs text-gray-500">Source: {item.source} ({item.type})</p>
              <p className="text-xs text-gray-400">Embedded: {new Date(item.embeddedAt).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
      {/* TODO: Add link to view item in KnowledgeBaseExplorer or view details */}
    </div>
  );
};

export default RecentEmbeddingsFeed;
