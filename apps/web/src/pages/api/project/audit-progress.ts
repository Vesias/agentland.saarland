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
  const lines = markdownContent.split('\n'); // Corrected: split by newline character
  
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
      // process.cwd() for API routes in Next.js is typically the project root.
      const progressFilePath = path.join(process.cwd(), 'ai_docs/memory-bank/progress.md');
      
      if (!fs.existsSync(progressFilePath)) {
        console.error(`Progress file not found at ${progressFilePath}`);
        // Fallback data for consistent JSON response
        return res.status(404).json([{ 
          name: 'Error', 
          completed: 0, 
          inProgress: 0, 
          pending: 1, 
          total: 1 
        }]);
      }

      const markdownContent = fs.readFileSync(progressFilePath, 'utf-8');
      const progressData = parseProgressMarkdown(markdownContent);
      
      // Ensure progressData is always an array, even if empty, for valid JSON response
      res.status(200).json(progressData.length > 0 ? progressData : []);
    } catch (error) {
      console.error('Error reading or parsing progress file:', error);
      // Fallback data for consistent JSON response
      res.status(500).json([{ 
        name: 'Error Processing File', 
        completed: 0, 
        inProgress: 0, 
        pending: 1, 
        total: 1 
      }]);
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
