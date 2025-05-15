import type { NextApiRequest, NextApiResponse } from 'next';

interface VectorStoreStats {
  storeName: string;
  totalEmbeddings: number;
  indexSize: string; // e.g., "5.2 GB"
  avgQueryTime: number; // in ms
  lastUpdate: string;
  status: 'healthy' | 'degraded' | 'offline' | 'indexing';
}

// Simulate fetching or generating vector store health data
const getVectorStoreHealthData = (): VectorStoreStats => {
  const now = new Date();
  const randomStatus: Array<'healthy' | 'degraded' | 'offline' | 'indexing'> = ['healthy', 'healthy', 'healthy', 'degraded', 'indexing'];
  
  return {
    storeName: 'pgvector Main Store (Primary Cluster)',
    totalEmbeddings: Math.floor(Math.random() * 500000) + 100000, // 100,000 - 600,000
    indexSize: `${(Math.random() * 10 + 1).toFixed(1)} GB`, // 1.0 - 11.0 GB
    avgQueryTime: Math.floor(Math.random() * 100) + 20, // 20-120 ms
    lastUpdate: new Date(now.getTime() - Math.random() * 24 * 60 * 60000).toISOString(), // Within last 24 hours
    status: randomStatus[Math.floor(Math.random() * randomStatus.length)],
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VectorStoreStats | { error: string }>
) {
  if (req.method === 'GET') {
    try {
      const healthData = getVectorStoreHealthData();
      res.status(200).json(healthData);
    } catch (error) {
      console.error('Error generating vector store health data:', error);
      res.status(500).json({ error: 'Failed to retrieve vector store health data.' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
