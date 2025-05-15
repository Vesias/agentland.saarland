import React, { useEffect, useState, FormEvent } from 'react';

// Placeholder for Knowledge Base Item data type
interface KBItem {
  id: string;
  title: string; // e.g., document title or chunk summary
  source: string; // e.g., filename, URL
  type: 'document' | 'website' | 'text_chunk';
  embeddedAt: string; // ISO date string
  tags?: string[];
  // snippet?: string; // Optional: a short snippet of the content
}

// Placeholder for API response type
interface KBExplorerApiResponse {
  items: KBItem[];
  totalItems: number;
  // nextPageToken?: string; // For pagination
}

const KnowledgeBaseExplorer: React.FC = () => {
  const [items, setItems] = useState<KBItem[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // TODO: Add state for filters (type, date range), sorting, pagination

  const fetchKBItems = async (query?: string) => {
    setLoading(true);
    setError(null);
    // TODO: Fetch knowledge base items from the backend API
    // Append query to API endpoint if provided
    // Example:
    // const endpoint = query ? `/api/kb/items?search=${encodeURIComponent(query)}` : '/api/kb/items';
    // try {
    //   const response = await fetch(endpoint);
    //   if (!response.ok) {
    //     throw new Error(`HTTP error! status: ${response.status}`);
    //   }
    //   const data: KBExplorerApiResponse = await response.json();
    //   setItems(data.items);
    // } catch (e) {
    //   setError(e instanceof Error ? e.message : String(e));
    // } finally {
    //   setLoading(false);
    // }

    // Mock data for now
    setTimeout(() => {
      const mockItems: KBItem[] = [
        { id: 'kb-doc-001', title: 'Saarland Tourism Strategy 2025.pdf', source: 'uploads/Saarland_Tourism_Strategy_2025.pdf', type: 'document', embeddedAt: new Date(Date.now() - 86400000).toISOString(), tags: ['tourism', 'strategy'] },
        { id: 'kb-web-002', title: 'Official Saarland Government Portal - History Section', source: 'https://www.saarland.de/history', type: 'website', embeddedAt: new Date(Date.now() - 172800000).toISOString(), tags: ['government', 'history'] },
        { id: 'kb-chunk-003', title: 'Chunk from "Local Festivals Guide"', source: 'internal_db/festivals_guide.txt', type: 'text_chunk', embeddedAt: new Date(Date.now() - 3600000).toISOString(), tags: ['culture', 'events'] },
      ];
      const filteredItems = query
        ? mockItems.filter(item => item.title.toLowerCase().includes(query.toLowerCase()) || item.source.toLowerCase().includes(query.toLowerCase()))
        : mockItems;
      setItems(filteredItems);
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    fetchKBItems();
  }, []);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    fetchKBItems(searchTerm);
  };

  if (loading) {
    return <div className="p-4 text-center">Loading knowledge base items...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error fetching knowledge base items: {error}</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Knowledge Base Explorer</h2>
      
      <form onSubmit={handleSearchSubmit} className="mb-6 flex space-x-2">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search knowledge base..."
          className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Search
        </button>
      </form>

      {/* TODO: Add filter controls (by type, date, tags) */}

      {items.length === 0 ? (
        <p className="text-gray-600">No items found in the knowledge base{searchTerm && ` for "${searchTerm}"`}.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="p-3 border border-gray-200 rounded-md hover:bg-gray-50">
              <h3 className="font-medium text-gray-900">{item.title}</h3>
              <p className="text-sm text-gray-500">Source: {item.source}</p>
              <p className="text-xs text-gray-400">Type: {item.type} | Embedded: {new Date(item.embeddedAt).toLocaleDateString()}</p>
              {item.tags && item.tags.length > 0 && (
                <div className="mt-1">
                  {item.tags.map(tag => (
                    <span key={tag} className="mr-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">{tag}</span>
                  ))}
                </div>
              )}
              {/* TODO: Add action to view item details or snippet */}
            </li>
          ))}
        </ul>
      )}
      {/* TODO: Add pagination controls */}
    </div>
  );
};

export default KnowledgeBaseExplorer;
