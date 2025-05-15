import type { NextApiRequest, NextApiResponse } from 'next';

interface ImpactMetric {
  id: string;
  name: string;
  value: string | number;
  unit?: string;
  trend: 'positive' | 'negative' | 'neutral' | 'stable';
  description: string;
  lastUpdated: string;
  target?: string | number;
}

interface PublicBenefitImpactSummary {
  reportDate: string;
  overallSentiment: 'positive' | 'neutral' | 'mixed' | 'concerning';
  metrics: ImpactMetric[];
}

// Simulate fetching or generating public benefit impact metrics
const getImpactMetricsData = (): PublicBenefitImpactSummary => {
  const now = new Date();
  const trends: Array<'positive' | 'negative' | 'neutral' | 'stable'> = ['positive', 'negative', 'neutral', 'stable'];

  const metrics: ImpactMetric[] = [
    {
      id: 'local-job-creation',
      name: 'Lokale Arbeitsplätze (KI-Sektor Saar)',
      value: Math.floor(Math.random() * 150) + 50, // 50-200
      unit: 'Neue Stellen',
      trend: trends[Math.floor(Math.random() * trends.length)],
      description: 'Anzahl der durch KI-Initiativen im Saarland geschaffenen oder unterstützten Arbeitsplätze.',
      lastUpdated: new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60000).toISOString(),
      target: 500,
    },
    {
      id: 'dialect-model-usage',
      name: 'Nutzung des Dialektmodells',
      value: Math.floor(Math.random() * 5000) + 1000, // 1000-6000
      unit: 'Anfragen/Tag',
      trend: 'positive',
      description: 'Tägliche Anfragen an KI-Dienste, die Saarland-spezifische Dialekte unterstützen.',
      lastUpdated: new Date(now.getTime() - Math.random() * 2 * 24 * 60 * 60000).toISOString(),
    },
    {
      id: 'public-service-efficiency',
      name: 'Effizienzsteigerung öffentl. Dienste',
      value: `${(Math.random() * 10 + 5).toFixed(1)}%`, // 5.0% - 15.0%
      trend: trends[Math.floor(Math.random() * trends.length)],
      description: 'Geschätzte Effizienzsteigerung in ausgewählten öffentlichen Diensten durch KI-Einsatz.',
      lastUpdated: new Date(now.getTime() - Math.random() * 60 * 24 * 60 * 60000).toISOString(),
      target: '10%',
    },
    {
      id: 'accessibility-improvements',
      name: 'Verbesserungen Barrierefreiheit',
      value: Math.floor(Math.random() * 20) + 5, // 5-25
      unit: 'Initiativen',
      trend: 'positive',
      description: 'Anzahl der KI-gestützten Initiativen zur Verbesserung der digitalen Barrierefreiheit.',
      lastUpdated: new Date(now.getTime() - Math.random() * 10 * 24 * 60 * 60000).toISOString(),
    }
  ];
  
  const overallSentimentOptions: Array<'positive' | 'neutral' | 'mixed' | 'concerning'> = ['positive', 'neutral', 'mixed'];
  if (metrics.some(m => m.trend === 'negative')) overallSentimentOptions.push('concerning');


  return {
    reportDate: now.toISOString(),
    overallSentiment: overallSentimentOptions[Math.floor(Math.random() * overallSentimentOptions.length)],
    metrics,
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PublicBenefitImpactSummary | { error: string }>
) {
  if (req.method === 'GET') {
    try {
      const metricsData = getImpactMetricsData();
      res.status(200).json(metricsData);
    } catch (error) {
      console.error('Error generating impact metrics data:', error);
      res.status(500).json({ error: 'Failed to retrieve impact metrics data.' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
