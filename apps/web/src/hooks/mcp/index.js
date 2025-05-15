/**
 * MCP Hooks Library
 *
 * This library provides React hooks for interacting with MCP tools directly
 * from frontend components.
 */

// Import hooks
import useMcpGameState from './useGameState';
import { useMcpDailyRewards } from './useDailyRewards';
import useSequentialPlanner_default from './useSequentialPlanner'; // Correctly import the default export

// Mock hooks for testing
const useMcpSequentialThinking = () => {
  return {
    generateThoughts: async () => [],
    continueThinking: async () => [],
    getConclusion: async () => 'Conclusion'
  };
};

const useMcpBraveSearch = () => {
  return {
    searchWeb: async () => [],
    nextPage: async () => {},
    previousPage: async () => {},
    results: [],
    totalResults: 0,
    currentPage: 0
  };
};

const useMcpImageGeneration = () => {
  return {
    generateImages: async () => [],
    getImagesById: async () => [],
    createGalleryHtml: async () => ''
  };
};

const useMcp21stDevMagic = () => {
  return {
    generateComponent: async () => ({ name: 'MockComponent', code: 'Mock code' })
  };
};

const useMcpRealTimeUpdates = () => {
  return {
    subscribe: () => {},
    unsubscribe: () => {}
  };
};

const useMcpContext7 = () => {
  return {
    searchDocuments: async () => []
  };
};

// Export all hooks
export {
  useMcpSequentialThinking,
  useMcpBraveSearch,
  useMcpImageGeneration,
  useMcp21stDevMagic,
  useMcpRealTimeUpdates,
  useMcpContext7,
  useMcpDailyRewards,
  useSequentialPlanner_default as useMcpSequentialPlanner // Re-export with the desired name
};

// Export useGameState as both the MCP version and a more convenient alias
export { useMcpGameState as useGameState };
export default useMcpGameState;
