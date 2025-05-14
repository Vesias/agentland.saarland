import { executeTestSuiteTool } from './executeTestSuite';
import { measurePerformanceTool } from './measurePerformance';
import { monitorStabilityTool } from './monitorStability';
import { scanSecurityTool } from './scanSecurity';
import { manageTestConfigTool } from './manageTestConfig';
import { collectTestDataTool } from './collectTestData';
import { generateReportTool } from './generateReport';
import { QualityGuardTool } from '../types';

export const qualityGuardTools: QualityGuardTool[] = [
  executeTestSuiteTool,
  measurePerformanceTool,
  monitorStabilityTool,
  scanSecurityTool,
  manageTestConfigTool,
  collectTestDataTool,
  generateReportTool,
];

export {
  executeTestSuiteTool,
  measurePerformanceTool,
  monitorStabilityTool,
  scanSecurityTool,
  manageTestConfigTool,
  collectTestDataTool,
  generateReportTool,
};