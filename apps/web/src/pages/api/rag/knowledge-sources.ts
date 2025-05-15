import type { NextApiRequest, NextApiResponse } from 'next';

interface KnowledgeSource {
  id: string;
  name: string;
  type: 'document_collection' | 'web_crawl' | 'api_feed' | 'database_sync';
  status: 'active' | 'syncing' | 'error' | 'disabled';
  documentCount: number;
  lastSync: string;
  errorDetails?: string;
}

// Simulate fetching or generating knowledge source data
const getKnowledgeSourceData = (): KnowledgeSource[] => {
  const now = new Date();
  const randomStatus: Array<'active' | 'syncing' | 'error' | 'disabled'> = ['active', 'active', 'syncing', 'error', 'disabled'];
  
  return [
    {
      id: 'ks-project-docs',
      name: 'Project Documentation (ai_docs)',
      type: 'document_collection',
      status: randomStatus[Math.floor(Math.random() * randomStatus.length)],
      documentCount: Math.floor(Math.random() * 200) + 50, // 50-250
      lastSync: new Date(now.getTime() - Math.random() * 72 * 60 * 60000).toISOString(), // Within last 3 days
    },
    {
      id: 'ks-saarland-gov-news',
      name: 'Saarland.de News Feed',
      type: 'web_crawl',
      status: randomStatus[Math.floor(Math.random() * randomStatus.length)],
      documentCount: Math.floor(Math.random() * 1000) + 500, // 500-1500
      lastSync: new Date(now.getTime() - Math.random() * 6 * 60 * 60000).toISOString(), // Within last 6 hours
    },
    {
      id: 'ks-internal-wiki',
      name: 'Internal Confluence Wiki',
      type: 'api_feed',
      status: 'error',
      documentCount: 1230,
      lastSync: new Date(now.getTime() - 48 * 60 * 60000).toISOString(),
      errorDetails: 'API Authentication Failed (401)',
    },
    {
      id: 'ks-research-papers-db',
      name: 'Research Papers DB Sync',
      type: 'database_sync',
      status: 'syncing',
      documentCount: Math.floor(Math.random() * 5000) + 10000, // 10000-15000
      lastSync: new Date(now.getTime() - Math.random() * 30 * 60000).toISOString(), // Within last 30 mins
    },
  ];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<KnowledgeSource[] | { error: string }>
) {
  if (req.method === 'GET') {
    try {
      const sourceData = getKnowledgeSourceData();
      res.status(200).json(sourceData);
    } catch (error) {
      console.error('Error generating knowledge source data:', error);
      res.status(500).json({ error: 'Failed to retrieve knowledge source data.' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
