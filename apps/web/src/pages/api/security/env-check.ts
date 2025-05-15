import type { NextApiRequest, NextApiResponse } from 'next';

interface EnvVariableCheck {
  variableName: string;
  isSet: boolean;
  source?: 'process.env' | '.env.local' | '.env.production' | 'vault' | 'unloaded'; // Example sources
  isSensitive: boolean; // Indicates if it's a sensitive key like API_KEY
  notes?: string;
}

// Simulate checking environment variables
const getEnvVariableChecks = (): EnvVariableCheck[] => {
  const checks: EnvVariableCheck[] = [
    { variableName: 'NODE_ENV', isSet: !!process.env.NODE_ENV, source: 'process.env', isSensitive: false },
    { variableName: 'DATABASE_URL', isSet: Math.random() > 0.2, source: '.env.local', isSensitive: true, notes: 'Required for database connection.' },
    { variableName: 'CLAUDE_API_KEY', isSet: Math.random() > 0.3, source: 'vault', isSensitive: true },
    { variableName: 'NEXTAUTH_SECRET', isSet: Math.random() > 0.1, source: '.env.production', isSensitive: true },
    { variableName: 'NEXTAUTH_URL', isSet: !!process.env.NEXTAUTH_URL || Math.random() > 0.1, source: 'process.env', isSensitive: false },
    { variableName: 'PGVECTOR_CONNECTION_STRING', isSet: Math.random() > 0.5, source: 'unloaded', isSensitive: true, notes: 'Should be loaded from secure source.' },
    { variableName: 'AGENTLAND_MCP_REGISTRY_URL', isSet: true, source: '.env.local', isSensitive: false },
  ];

  // Simulate some being unset
  checks.forEach(check => {
    if (check.isSensitive && Math.random() < 0.15 && check.isSet) { // 15% chance a sensitive key that was set is now 'unloaded' for demo
        check.isSet = false;
        check.source = 'unloaded';
        check.notes = (check.notes || '') + ' Expected but not found in environment.';
    }
  });

  return checks;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<EnvVariableCheck[] | { error: string }>
) {
  if (req.method === 'GET') {
    try {
      const envData = getEnvVariableChecks();
      res.status(200).json(envData);
    } catch (error) {
      console.error('Error generating env variable status:', error);
      res.status(500).json({ error: 'Failed to retrieve env variable status.' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
