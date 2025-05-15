import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface AuditSectionProgress {
  name: string;
  completed: number;
  inProgress: number;
  pending: number;
  total: number;
}

// Helper function to parse the progress.md file (simplified)
// A more robust Markdown parser might be needed for complex files.
const parseProgressMarkdown = (markdownContent: string): AuditSectionProgress[] => {
  const sections: AuditSectionProgress[] = [];
  // Split content by lines
  const lines = markdownContent.split('\\n');
  
  let currentSection: AuditSectionProgress | null = null;

  for (const line of lines) {
    // Detect section headers (e.g., "### 3.1. Section Name")
    const sectionMatch = line.match(/^###\s\\d+\\.\\d+\\.\\s(.+)/);
    if (sectionMatch) {
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = { 
        name: sectionMatch[1].trim(), 
        completed: 0, 
        inProgress: 0, 
        pending: 0, 
        total: 0 
      };
    } else if (currentSection) {
      // Detect task items
      if (line.includes('✅')) {
        currentSection.completed++;
        currentSection.total++;
      } else if (line.includes('⏳')) {
        currentSection.inProgress++;
        currentSection.total++;
      } else if (line.includes('⭕')) {
        currentSection.pending++;
        currentSection.total++;
      }
      // Could add more sophisticated task detection if needed
    }
  }

  if (currentSection) {
    sections.push(currentSection);
  }

  return sections;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AuditSectionProgress[] | { error: string }>
) {
  if (req.method === 'GET') {
    try {
      // Construct the absolute path to the progress.md file
      // Assuming the API route is in apps/web/src/pages/api/
      // and progress.md is at the root of the monorepo in ai_docs/memory-bank/
      const progressFilePath = path.join(process.cwd(), '../../../../ai_docs/memory-bank/progress.md');
      
      if (!fs.existsSync(progressFilePath)) {
        // Try an alternative path if the above is incorrect relative to `process.cwd()` when deployed
        // This path assumes `process.cwd()` is `apps/web`
        const alternativePath = path.join(process.cwd(), '../ai_docs/memory-bank/progress.md');
        if (fs.existsSync(alternativePath)) {
            // This is not ideal for production, but for local dev it might work.
            // A better solution would be to copy the file during build or use a config for the path.
             const markdownContent = fs.readFileSync(alternativePath, 'utf-8');
             const progressData = parseProgressMarkdown(markdownContent);
             return res.status(200).json(progressData);
        }
        console.error(`File not found at ${progressFilePath} or ${alternativePath}`);
        return res.status(404).json({ error: 'Progress file not found.' });
      }

      const markdownContent = fs.readFileSync(progressFilePath, 'utf-8');
      const progressData = parseProgressMarkdown(markdownContent);
      res.status(200).json(progressData);
    } catch (error) {
      console.error('Error reading or parsing progress file:', error);
      res.status(500).json({ error: 'Failed to retrieve audit progress.' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
