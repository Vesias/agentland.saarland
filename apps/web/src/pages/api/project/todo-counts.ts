import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface TodoCount {
  total: number;
  byModule?: Record<string, number>;
}

const relevantDirs = ['apps', 'libs']; // Directories to scan at the monorepo root
const excludedDirs = ['node_modules', '.next', 'dist', 'coverage'];
const includedExtensions = ['.ts', '.tsx', '.js', '.jsx', '.md']; // File extensions to scan

// Recursive function to get all files in a directory
const getAllFiles = (dirPath: string, arrayOfFiles: string[] = []): string[] => {
  try {
    const files = fs.readdirSync(dirPath);

    files.forEach((file) => {
      const fullPath = path.join(dirPath, file);
      if (excludedDirs.includes(file)) {
        return;
      }
      try {
        if (fs.statSync(fullPath).isDirectory()) {
          arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
        } else {
          if (includedExtensions.includes(path.extname(fullPath))) {
            arrayOfFiles.push(fullPath);
          }
        }
      } catch (e) {
        // console.warn(`Could not stat file/dir: ${fullPath}`, e);
      }
    });
  } catch (e) {
    // console.warn(`Could not read directory: ${dirPath}`, e);
  }
  return arrayOfFiles;
};

const countTodosInFile = (filePath: string): number => {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const todoRegex = /\/\/\s*TODO[:\s]/gi; // Case-insensitive search for "// TODO:" or "// TODO "
    const matches = content.match(todoRegex);
    return matches ? matches.length : 0;
  } catch (e) {
    // console.warn(`Could not read file for TODO count: ${filePath}`, e);
    return 0;
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TodoCount | { error: string }>
) {
  if (req.method === 'GET') {
    try {
      // Assuming process.cwd() is the monorepo root when deployed,
      // or apps/web during local dev (adjust pathing as needed for your setup)
      const projectRoot = process.env.NODE_ENV === 'development' 
        ? path.join(process.cwd(), '../../..') // Adjust if cwd is apps/web/src/pages/api
        : process.cwd(); 
      
      // A more robust way to find monorepo root might be needed.
      // For now, let's assume a simpler structure for local dev if the above fails.
      let basePath = path.join(process.cwd(), '../../../../'); // from apps/web/src/pages/api
      if (!fs.existsSync(path.join(basePath, 'libs')) || !fs.existsSync(path.join(basePath, 'apps'))) {
        basePath = path.join(process.cwd(), '..', '..', '..'); // from apps/web/.next/server/pages/api
         if (!fs.existsSync(path.join(basePath, 'libs')) || !fs.existsSync(path.join(basePath, 'apps'))) {
            basePath = path.join(process.cwd(), '..'); // if cwd is apps/web
         }
      }


      let totalTodos = 0;
      const byModule: Record<string, number> = {};

      for (const dir of relevantDirs) {
        const dirPath = path.join(basePath, dir);
        if (fs.existsSync(dirPath)) {
          const filesInDir = getAllFiles(dirPath);
          let moduleTodoCount = 0;
          filesInDir.forEach(file => {
            moduleTodoCount += countTodosInFile(file);
          });
          byModule[dir] = moduleTodoCount;
          totalTodos += moduleTodoCount;
        } else {
          // console.warn(`Directory not found for TODO scan: ${dirPath}`);
        }
      }
      
      // Scan root files like README.md if needed
      // const rootFiles = fs.readdirSync(basePath).filter(f => includedExtensions.includes(path.extname(f)) && fs.statSync(path.join(basePath, f)).isFile());
      // rootFiles.forEach(file => {
      //   totalTodos += countTodosInFile(path.join(basePath, file));
      // });


      res.status(200).json({ total: totalTodos, byModule });
    } catch (error) {
      console.error('Error scanning for TODOs:', error);
      res.status(500).json({ error: 'Failed to count TODOs.' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
