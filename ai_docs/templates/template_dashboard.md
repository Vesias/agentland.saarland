---
title: "Dashboard Template for agentland.saarland"
version: "1.0.0"
date: "2025-05-16"
status: "active"
---

# Dashboard Template for agentland.saarland

This template defines the dashboard structure, components, and agent visualization systems for agentland.saarland projects. The dashboard serves as the primary user interface for monitoring and interacting with the agent system.

## Dashboard Architecture

The dashboard is built using React with the following architecture:

1. **Core Framework**: React 18+ with TypeScript
2. **Build Tool**: Vite for fast development and production builds
3. **Styling**: Tailwind CSS for utility-first styling
4. **State Management**: React Context for shared state
5. **Layout**: Modular component-based layout system
6. **Routing**: React Router for navigation
7. **Authentication**: JWT-based authentication
8. **Internationalization**: i18n support with language switching

## Directory Structure

```
apps/web/
├── configs/                  # Dashboard-specific configs
│   └── color-schema/         # Color scheme configuration
├── public/                   # Static assets
├── src/                      # Source code
│   ├── components/           # React components
│   │   ├── auth/             # Authentication components
│   │   ├── dashboard/        # Dashboard components
│   │   │   ├── agent-orchestration/  # Agent orchestration
│   │   │   ├── knowledge-management/ # Knowledge management
│   │   │   ├── regional-integration/ # Regional integration
│   │   │   └── system-health/        # System health
│   │   ├── form/             # Form components
│   │   ├── i18n/             # Internationalization
│   │   ├── layout/           # Layout components
│   │   ├── mcp/              # MCP components
│   │   ├── profile/          # Profile components
│   │   ├── security/         # Security components
│   │   └── support/          # Support components
│   ├── contexts/             # React contexts
│   ├── core/                 # Core functionality
│   ├── hooks/                # React hooks
│   │   └── mcp/              # MCP hooks
│   ├── layouts/              # Page layouts
│   └── pages/                # Page components
├── index.html                # Entry point
├── package.json              # Dependencies
├── start-dashboard.sh        # Startup script
├── tailwind.config.js        # Tailwind configuration
├── tsconfig.json             # TypeScript configuration
└── vite.config.js            # Vite configuration
```

## Core Dashboard Components

### DashboardLayout

The main layout component for the dashboard:

```tsx
// apps/web/src/layouts/DashboardLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { DashboardNavbar } from '../components/layout/DashboardNavbar';
import { SidebarNavigation } from '../components/dashboard/SidebarNavigation';
import { NotificationSystem } from '../components/dashboard/NotificationSystem';
import { ThemeProvider } from '../components/dashboard/ThemeProvider';

export function DashboardLayout() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <DashboardNavbar />
        <div className="flex">
          <SidebarNavigation />
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
        <NotificationSystem />
      </div>
    </ThemeProvider>
  );
}
```

### Dashboard Page

The main dashboard page component:

```tsx
// apps/web/src/pages/Dashboard.tsx
import React from 'react';
import { ActiveAgentsOverview } from '../components/dashboard/agent-orchestration/ActiveAgentsOverview';
import { SystemStatusIndicator } from '../components/dashboard/system-health/SystemStatusIndicator';
import { KnowledgeBaseExplorer } from '../components/dashboard/knowledge-management/KnowledgeBaseExplorer';
import { RegionalIdentityWidget } from '../components/dashboard/RegionalIdentityWidget';

export function DashboardPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="col-span-1 md:col-span-2 lg:col-span-3">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
          <SystemStatusIndicator />
        </div>
      </div>
      
      <div className="col-span-1 md:col-span-2 lg:col-span-2">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 h-full">
          <h2 className="text-xl font-semibold mb-4">Active Agents</h2>
          <ActiveAgentsOverview />
        </div>
      </div>
      
      <div className="col-span-1">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 h-full">
          <h2 className="text-xl font-semibold mb-4">Knowledge Base</h2>
          <KnowledgeBaseExplorer />
        </div>
      </div>
      
      <div className="col-span-1 md:col-span-2 lg:col-span-3">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <h2 className="text-xl font-semibold mb-4">Regional Identity</h2>
          <RegionalIdentityWidget />
        </div>
      </div>
    </div>
  );
}
```

## Agent Orchestration Components

The agent orchestration components provide visibility and control over the agent system:

### ActiveAgentsOverview

```tsx
// apps/web/src/components/dashboard/agent-orchestration/ActiveAgentsOverview.tsx
import React, { useState, useEffect } from 'react';
import { useAgents } from '../../../hooks/useAgents';

interface Agent {
  id: string;
  name: string;
  status: 'idle' | 'working' | 'error';
  type: string;
  lastActive: string;
}

export function ActiveAgentsOverview() {
  const { agents, isLoading, error } = useAgents();
  
  if (isLoading) {
    return <div className="animate-pulse">Loading agents...</div>;
  }
  
  if (error) {
    return <div className="text-red-500">Error loading agents: {error.message}</div>;
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Active</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
          {agents.map((agent) => (
            <tr key={agent.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{agent.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{agent.type}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                <StatusBadge status={agent.status} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatTime(agent.lastActive)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 mr-2">
                  View
                </button>
                <button className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">
                  Stop
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusColors = {
    idle: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    working: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  };
  
  const colorClass = status in statusColors 
    ? statusColors[status as keyof typeof statusColors] 
    : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  
  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClass}`}>
      {status}
    </span>
  );
}

function formatTime(timeString: string): string {
  const date = new Date(timeString);
  return new Intl.DateTimeFormat('de-DE', {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}
```

### AgentWorkflowVisualizer

```tsx
// apps/web/src/components/dashboard/agent-orchestration/AgentWorkflowVisualizer.tsx
import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface Node {
  id: string;
  name: string;
  type: string;
  status: 'idle' | 'working' | 'error';
}

interface Link {
  source: string;
  target: string;
  label?: string;
}

interface AgentWorkflowVisualizerProps {
  nodes: Node[];
  links: Link[];
}

export function AgentWorkflowVisualizer({ nodes, links }: AgentWorkflowVisualizerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;
    
    const width = svgRef.current.clientWidth;
    const height = 400;
    
    // Clear previous visualization
    d3.select(svgRef.current).selectAll("*").remove();
    
    // Create the simulation
    const simulation = d3.forceSimulation<Node & d3.SimulationNodeDatum>()
      .force("link", d3.forceLink<Node, Link & d3.SimulationLinkDatum<Node>>().id(d => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));
    
    // Create the links
    const link = d3.select(svgRef.current)
      .selectAll(".link")
      .data(links)
      .enter()
      .append("g")
      .attr("class", "link");
    
    link.append("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 2);
    
    link.append("text")
      .attr("dy", -5)
      .attr("text-anchor", "middle")
      .attr("fill", "#666")
      .text(d => d.label || "");
    
    // Create the nodes
    const node = d3.select(svgRef.current)
      .selectAll(".node")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .call(d3.drag<SVGGElement, Node>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
      );
    
    node.append("circle")
      .attr("r", 20)
      .attr("fill", d => {
        switch (d.status) {
          case 'idle': return "#FCD34D";
          case 'working': return "#6EE7B7";
          case 'error': return "#FCA5A5";
          default: return "#9CA3AF";
        }
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);
    
    node.append("text")
      .attr("dy", 30)
      .attr("text-anchor", "middle")
      .attr("fill", "#4B5563")
      .text(d => d.name);
    
    // Add tooltips
    node.append("title")
      .text(d => `${d.name} (${d.type})\nStatus: ${d.status}`);
    
    // Update simulation
    simulation
      .nodes(nodes)
      .on("tick", ticked);
    
    (simulation.force("link") as d3.ForceLink<Node, Link>)
      .links(links as any);
    
    function ticked() {
      link.select("line")
        .attr("x1", d => (d.source as unknown as Node).x || 0)
        .attr("y1", d => (d.source as unknown as Node).y || 0)
        .attr("x2", d => (d.target as unknown as Node).x || 0)
        .attr("y2", d => (d.target as unknown as Node).y || 0);
      
      link.select("text")
        .attr("x", d => ((d.source as unknown as Node).x || 0 + (d.target as unknown as Node).x || 0) / 2)
        .attr("y", d => ((d.source as unknown as Node).y || 0 + (d.target as unknown as Node).y || 0) / 2);
      
      node.attr("transform", d => `translate(${d.x || 0},${d.y || 0})`);
    }
    
    function dragstarted(event: any, d: Node & d3.SimulationNodeDatum) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    
    function dragged(event: any, d: Node & d3.SimulationNodeDatum) {
      d.fx = event.x;
      d.fy = event.y;
    }
    
    function dragended(event: any, d: Node & d3.SimulationNodeDatum) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
    
    return () => {
      simulation.stop();
    };
  }, [nodes, links]);
  
  return (
    <div className="w-full h-full">
      <svg ref={svgRef} width="100%" height="400" className="bg-white dark:bg-gray-800 rounded-lg shadow"></svg>
    </div>
  );
}
```

## Knowledge Management Components

The knowledge management components provide access to the RAG system and knowledge base:

### KnowledgeBaseExplorer

```tsx
// apps/web/src/components/dashboard/knowledge-management/KnowledgeBaseExplorer.tsx
import React, { useState } from 'react';
import { useKnowledgeBase } from '../../../hooks/useKnowledgeBase';

interface KnowledgeItem {
  id: string;
  title: string;
  type: 'document' | 'code' | 'image' | 'video';
  tags: string[];
  lastUpdated: string;
  embeddings: number;
}

export function KnowledgeBaseExplorer() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const { items, isLoading, error } = useKnowledgeBase();
  
  // Filter items based on search term and selected type
  const filteredItems = items.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = selectedType === null || item.type === selectedType;
    
    return matchesSearch && matchesType;
  });
  
  if (isLoading) {
    return <div className="animate-pulse">Loading knowledge base...</div>;
  }
  
  if (error) {
    return <div className="text-red-500">Error loading knowledge base: {error.message}</div>;
  }
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
        <input
          type="text"
          placeholder="Search knowledge base..."
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          value={selectedType || ''}
          onChange={(e) => setSelectedType(e.target.value === '' ? null : e.target.value)}
        >
          <option value="">All Types</option>
          <option value="document">Documents</option>
          <option value="code">Code</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
        </select>
      </div>
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div 
              key={item.id} 
              className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-md font-medium text-gray-900 dark:text-white">{item.title}</h3>
                  <div className="flex flex-wrap mt-1 gap-1">
                    {item.tags.map((tag) => (
                      <span 
                        key={tag} 
                        className="px-2 py-1 text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end text-xs text-gray-500 dark:text-gray-400">
                  <span>{item.type}</span>
                  <span>{formatDate(item.lastUpdated)}</span>
                  <span>{item.embeddings} embeddings</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            No items found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}
```

### RAGPerformanceMonitor

```tsx
// apps/web/src/components/dashboard/knowledge-management/RAGPerformanceMonitor.tsx
import React, { useEffect, useRef } from 'react';
import { useRAGMetrics } from '../../../hooks/useRAGMetrics';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

export function RAGPerformanceMonitor() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const { metrics, isLoading, error } = useRAGMetrics();
  
  useEffect(() => {
    if (!chartRef.current || isLoading || error || !metrics) return;
    
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;
    
    // Prepare data for the chart
    const labels = metrics.map(m => m.date);
    const queryTimeData = metrics.map(m => m.avgQueryTime);
    const precisionData = metrics.map(m => m.precision * 100); // Convert to percentage
    const recallData = metrics.map(m => m.recall * 100); // Convert to percentage
    
    // Create chart
    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Avg Query Time (ms)',
            data: queryTimeData,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            yAxisID: 'y',
          },
          {
            label: 'Precision (%)',
            data: precisionData,
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            yAxisID: 'y1',
          },
          {
            label: 'Recall (%)',
            data: recallData,
            borderColor: 'rgb(245, 158, 11)',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            yAxisID: 'y1',
          }
        ]
      },
      options: {
        responsive: true,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Query Time (ms)'
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Precision/Recall (%)'
            },
            min: 0,
            max: 100,
            grid: {
              drawOnChartArea: false,
            },
          }
        }
      }
    });
    
    // Clean up
    return () => {
      chart.destroy();
    };
  }, [metrics, isLoading, error]);
  
  if (isLoading) {
    return <div className="animate-pulse">Loading RAG metrics...</div>;
  }
  
  if (error) {
    return <div className="text-red-500">Error loading RAG metrics: {error.message}</div>;
  }
  
  if (!metrics || metrics.length === 0) {
    return <div className="text-gray-500 dark:text-gray-400">No RAG metrics available.</div>;
  }
  
  // Calculate latest metrics
  const latestMetrics = metrics[metrics.length - 1];
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Query Time</h3>
          <p className="text-2xl font-semibold">{latestMetrics.avgQueryTime.toFixed(2)} ms</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Precision</h3>
          <p className="text-2xl font-semibold">{(latestMetrics.precision * 100).toFixed(1)}%</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Recall</h3>
          <p className="text-2xl font-semibold">{(latestMetrics.recall * 100).toFixed(1)}%</p>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h3 className="text-md font-medium mb-4">RAG Performance Trends</h3>
        <canvas ref={chartRef} height="300"></canvas>
      </div>
    </div>
  );
}
```

## Regional Integration Components

The regional integration components showcase Saarland-specific features:

### SaarlandDataStatus

```tsx
// apps/web/src/components/dashboard/regional-integration/SaarlandDataStatus.tsx
import React from 'react';
import { useSaarlandData } from '../../../hooks/useSaarlandData';

export function SaarlandDataStatus() {
  const { data, isLoading, error } = useSaarlandData();
  
  if (isLoading) {
    return <div className="animate-pulse">Loading Saarland data...</div>;
  }
  
  if (error) {
    return <div className="text-red-500">Error loading Saarland data: {error.message}</div>;
  }
  
  if (!data) {
    return <div className="text-gray-500 dark:text-gray-400">No Saarland data available.</div>;
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <h2 className="text-xl font-semibold mb-4 text-blue-700 dark:text-blue-400">
        Saarland Data Status
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-medium mb-2">Regional Coverage</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="block text-sm text-gray-500 dark:text-gray-400">Districts</span>
              <span className="text-xl font-semibold">{data.districts.total}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                ({data.districts.covered} covered)
              </span>
            </div>
            <div>
              <span className="block text-sm text-gray-500 dark:text-gray-400">Municipalities</span>
              <span className="text-xl font-semibold">{data.municipalities.total}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                ({data.municipalities.covered} covered)
              </span>
            </div>
          </div>
          <div className="mt-4 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 rounded-full" 
              style={{ width: `${(data.districts.covered / data.districts.total) * 100}%` }}
            ></div>
          </div>
        </div>
        
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-medium mb-2">Data Sources</h3>
          <ul className="space-y-2">
            {data.sources.map((source) => (
              <li key={source.id} className="flex items-center justify-between">
                <span>{source.name}</span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  source.status === 'active' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                }`}>
                  {source.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 md:col-span-2">
          <h3 className="text-lg font-medium mb-2">Regional Data Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="block text-sm text-gray-500 dark:text-gray-400">Documents</span>
              <span className="text-xl font-semibold">{data.statistics.documents.toLocaleString()}</span>
            </div>
            <div>
              <span className="block text-sm text-gray-500 dark:text-gray-400">Embeddings</span>
              <span className="text-xl font-semibold">{data.statistics.embeddings.toLocaleString()}</span>
            </div>
            <div>
              <span className="block text-sm text-gray-500 dark:text-gray-400">Last Update</span>
              <span className="text-xl font-semibold">{formatDate(data.statistics.lastUpdate)}</span>
            </div>
            <div>
              <span className="block text-sm text-gray-500 dark:text-gray-400">Languages</span>
              <span className="text-xl font-semibold">{data.statistics.languages.join(', ')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}
```

### DialectUsageStats

```tsx
// apps/web/src/components/dashboard/regional-integration/DialectUsageStats.tsx
import React, { useEffect, useRef } from 'react';
import { useDialectStats } from '../../../hooks/useDialectStats';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

export function DialectUsageStats() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const { stats, isLoading, error } = useDialectStats();
  
  useEffect(() => {
    if (!chartRef.current || isLoading || error || !stats) return;
    
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;
    
    // Prepare data for the chart
    const labels = stats.map(s => s.name);
    const data = stats.map(s => s.usagePercentage);
    const colors = [
      'rgba(0, 102, 179, 0.8)',
      'rgba(255, 204, 0, 0.8)',
      'rgba(0, 144, 54, 0.8)',
      'rgba(220, 0, 78, 0.8)',
      'rgba(103, 58, 183, 0.8)',
      'rgba(33, 150, 243, 0.8)',
    ];
    
    // Create chart
    const chart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: colors.slice(0, stats.length),
            borderWidth: 1,
            borderColor: '#fff'
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'right',
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.formattedValue;
                return `${label}: ${value}%`;
              }
            }
          }
        }
      }
    });
    
    // Clean up
    return () => {
      chart.destroy();
    };
  }, [stats, isLoading, error]);
  
  if (isLoading) {
    return <div className="animate-pulse">Loading dialect stats...</div>;
  }
  
  if (error) {
    return <div className="text-red-500">Error loading dialect stats: {error.message}</div>;
  }
  
  if (!stats || stats.length === 0) {
    return <div className="text-gray-500 dark:text-gray-400">No dialect stats available.</div>;
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <h2 className="text-xl font-semibold mb-4 text-yellow-600 dark:text-yellow-400">
        Saarland Dialect Usage
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <canvas ref={chartRef} height="300"></canvas>
        </div>
        
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-medium mb-2">Top Dialects</h3>
          <ul className="space-y-2">
            {stats.slice(0, 5).map((dialect) => (
              <li key={dialect.id} className="flex items-center justify-between">
                <span>{dialect.name}</span>
                <span className="font-semibold">{dialect.usagePercentage}%</span>
              </li>
            ))}
          </ul>
          
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">Key Phrases</h3>
            <div className="flex flex-wrap gap-2">
              {stats[0].commonPhrases.map((phrase, index) => (
                <span 
                  key={index} 
                  className="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 rounded-full text-sm"
                >
                  {phrase}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## System Health Components

The system health components provide monitoring of the system's status:

### SystemStatusIndicator

```tsx
// apps/web/src/components/dashboard/system-health/SystemStatusIndicator.tsx
import React from 'react';
import { useSystemStatus } from '../../../hooks/useSystemStatus';

interface SystemComponent {
  id: string;
  name: string;
  status: 'operational' | 'degraded' | 'outage' | 'maintenance';
  lastChecked: string;
  uptime: number;
}

export function SystemStatusIndicator() {
  const { components, isLoading, error } = useSystemStatus();
  
  if (isLoading) {
    return <div className="animate-pulse">Loading system status...</div>;
  }
  
  if (error) {
    return <div className="text-red-500">Error loading system status: {error.message}</div>;
  }
  
  // Calculate overall system status
  const overallStatus = getOverallStatus(components);
  
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">System Status</h2>
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${getStatusColorClass(overallStatus)}`}></div>
          <span className="font-medium">{formatStatus(overallStatus)}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {components.map((component) => (
          <div 
            key={component.id} 
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">{component.name}</h3>
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColorClass(component.status)}`}></div>
                <span className="text-sm">{formatStatus(component.status)}</span>
              </div>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <div className="flex justify-between">
                <span>Uptime</span>
                <span>{formatUptime(component.uptime)}</span>
              </div>
              <div className="flex justify-between">
                <span>Last Checked</span>
                <span>{formatTime(component.lastChecked)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getOverallStatus(components: SystemComponent[]): string {
  if (components.some(c => c.status === 'outage')) {
    return 'outage';
  } else if (components.some(c => c.status === 'degraded')) {
    return 'degraded';
  } else if (components.some(c => c.status === 'maintenance')) {
    return 'maintenance';
  } else {
    return 'operational';
  }
}

function getStatusColorClass(status: string): string {
  switch (status) {
    case 'operational': return 'bg-green-500';
    case 'degraded': return 'bg-yellow-500';
    case 'outage': return 'bg-red-500';
    case 'maintenance': return 'bg-blue-500';
    default: return 'bg-gray-500';
  }
}

function formatStatus(status: string): string {
  switch (status) {
    case 'operational': return 'Operational';
    case 'degraded': return 'Degraded';
    case 'outage': return 'Outage';
    case 'maintenance': return 'Maintenance';
    default: return 'Unknown';
  }
}

function formatUptime(uptime: number): string {
  if (uptime >= 99.9) {
    return `${uptime.toFixed(2)}%`;
  } else {
    return `${uptime.toFixed(2)}% ⚠️`;
  }
}

function formatTime(timeString: string): string {
  const date = new Date(timeString);
  return new Intl.DateTimeFormat('de-DE', {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
  }).format(date);
}
```

### APIUsageMetrics

```tsx
// apps/web/src/components/dashboard/system-health/APIUsageMetrics.tsx
import React, { useEffect, useRef } from 'react';
import { useAPIMetrics } from '../../../hooks/useAPIMetrics';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

export function APIUsageMetrics() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const { metrics, isLoading, error } = useAPIMetrics();
  
  useEffect(() => {
    if (!chartRef.current || isLoading || error || !metrics) return;
    
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;
    
    // Prepare data for the chart
    const labels = metrics.timePoints;
    
    // Create chart
    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'API Requests',
            data: metrics.requests,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.3,
            yAxisID: 'y',
          },
          {
            label: 'Response Time (ms)',
            data: metrics.responseTime,
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.3,
            yAxisID: 'y1',
          },
          {
            label: 'Error Rate (%)',
            data: metrics.errorRate,
            borderColor: 'rgb(244, 63, 94)',
            backgroundColor: 'rgba(244, 63, 94, 0.1)',
            tension: 0.3,
            yAxisID: 'y2',
          }
        ]
      },
      options: {
        responsive: true,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Time'
            }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Requests'
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Response Time (ms)'
            },
            grid: {
              drawOnChartArea: false,
            },
          },
          y2: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Error Rate (%)'
            },
            min: 0,
            max: 100,
            grid: {
              drawOnChartArea: false,
            },
          }
        }
      }
    });
    
    // Clean up
    return () => {
      chart.destroy();
    };
  }, [metrics, isLoading, error]);
  
  if (isLoading) {
    return <div className="animate-pulse">Loading API metrics...</div>;
  }
  
  if (error) {
    return <div className="text-red-500">Error loading API metrics: {error.message}</div>;
  }
  
  if (!metrics) {
    return <div className="text-gray-500 dark:text-gray-400">No API metrics available.</div>;
  }
  
  // Calculate summary statistics
  const totalRequests = metrics.requests.reduce((sum, val) => sum + val, 0);
  const avgResponseTime = metrics.responseTime.reduce((sum, val) => sum + val, 0) / metrics.responseTime.length;
  const avgErrorRate = metrics.errorRate.reduce((sum, val) => sum + val, 0) / metrics.errorRate.length;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <h2 className="text-xl font-semibold mb-4">API Usage Metrics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Requests</h3>
          <p className="text-2xl font-semibold">{totalRequests.toLocaleString()}</p>
        </div>
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Response Time</h3>
          <p className="text-2xl font-semibold">{avgResponseTime.toFixed(2)} ms</p>
        </div>
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Error Rate</h3>
          <p className="text-2xl font-semibold">{avgErrorRate.toFixed(2)}%</p>
        </div>
      </div>
      
      <canvas ref={chartRef} height="300"></canvas>
    </div>
  );
}
```

## Color Schema Integration

The dashboard integrates with the color schema system for theming:

### ThemeProvider

```tsx
// apps/web/src/components/dashboard/ThemeProvider.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { loadColorSchema } from '../../core/config/config_manager';

// Create context
export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [colorSchema, setColorSchema] = useState(null);
  
  // Load color schema from config
  useEffect(() => {
    const loadSchema = async () => {
      try {
        const schema = await loadColorSchema();
        setColorSchema(schema);
      } catch (error) {
        console.error('Failed to load color schema:', error);
      }
    };
    
    loadSchema();
  }, []);
  
  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark');
  };
  
  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
      setTheme(savedTheme);
      
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      }
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
  }, []);
  
  // Apply color schema to CSS variables
  useEffect(() => {
    if (!colorSchema) return;
    
    const colors = colorSchema[theme];
    const root = document.documentElement;
    
    // Set primary colors
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-secondary', colors.secondary);
    root.style.setProperty('--color-background', colors.background);
    root.style.setProperty('--color-surface', colors.surface);
    
    // Set status colors
    root.style.setProperty('--color-error', colors.error);
    root.style.setProperty('--color-warning', colors.warning);
    root.style.setProperty('--color-info', colors.info);
    root.style.setProperty('--color-success', colors.success);
    
    // Set text colors
    root.style.setProperty('--color-text-primary', colors.text.primary);
    root.style.setProperty('--color-text-secondary', colors.text.secondary);
    root.style.setProperty('--color-text-disabled', colors.text.disabled);
    
    // Set regional colors if available
    if (colorSchema.regional && colorSchema.regional.saarland) {
      root.style.setProperty('--color-regional-primary', colorSchema.regional.saarland.primary);
      root.style.setProperty('--color-regional-secondary', colorSchema.regional.saarland.secondary);
      root.style.setProperty('--color-regional-accent', colorSchema.regional.saarland.accent);
    }
  }, [colorSchema, theme]);
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colorSchema }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook for using the theme
export function useTheme() {
  return useContext(ThemeContext);
}
```

### color-schema-integration.js

```js
// apps/web/src/components/dashboard/color-schema-integration.js
import { loadColorSchema } from '../../core/config/config_manager';

// Load and apply color schema to tailwind CSS
export async function initializeColorSchema() {
  try {
    const schema = await loadColorSchema();
    
    if (!schema) {
      console.warn('Color schema not found, using defaults');
      return;
    }
    
    // Get current theme from localStorage or system preference
    const isDarkMode = localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    const colors = isDarkMode ? schema.dark : schema.light;
    
    // Apply schema to CSS variables for Tailwind
    const tailwindConfig = {
      theme: {
        extend: {
          colors: {
            primary: colors.primary,
            secondary: colors.secondary,
            background: colors.background,
            surface: colors.surface,
            error: colors.error,
            warning: colors.warning,
            info: colors.info,
            success: colors.success,
            'text-primary': colors.text.primary,
            'text-secondary': colors.text.secondary,
            'text-disabled': colors.text.disabled,
          }
        }
      }
    };
    
    if (schema.regional && schema.regional.saarland) {
      tailwindConfig.theme.extend.colors.regional = {
        primary: schema.regional.saarland.primary,
        secondary: schema.regional.saarland.secondary,
        accent: schema.regional.saarland.accent,
      };
    }
    
    // Register the dynamic theme with Tailwind
    if (window.tailwind && window.tailwind.config) {
      window.tailwind.config(tailwindConfig);
    }
    
    return schema;
  } catch (error) {
    console.error('Failed to initialize color schema:', error);
    return null;
  }
}
```

## Best Practices

1. **Component Structure**: Follow a modular component structure with clear separation of concerns
2. **TypeScript**: Use TypeScript for all components for type safety
3. **Responsive Design**: Ensure all components are responsive and work on all device sizes
4. **Accessibility**: Ensure all components are accessible (keyboard navigation, screen readers, etc.)
5. **Internationalization**: Support multiple languages through the i18n system
6. **Theme Support**: Support light and dark themes through the ThemeProvider
7. **Error Handling**: Handle errors gracefully and provide meaningful error messages
8. **Loading States**: Show loading states during data fetching
9. **Data Fetching**: Use custom hooks for data fetching
10. **State Management**: Use React Context for shared state

## Dashboard Startup

The dashboard is started using the `start-dashboard.sh` script:

```bash
#!/bin/bash
# start-dashboard.sh

# Start the agentland.saarland dashboard

set -e

echo "Starting agentland.saarland dashboard..."

# Check if port 5000 is available
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null ; then
  echo "Port 5000 is already in use. Trying to find an available port..."
  
  # Find an available port
  PORT=5001
  while lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; do
    PORT=$((PORT+1))
  done
  
  echo "Using port $PORT instead."
else
  PORT=5000
fi

# Navigate to the web app directory
cd apps/web

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Start the dashboard
echo "Starting dashboard on port $PORT..."
npm run dev -- --port $PORT

echo "Dashboard stopped."
```

## Conclusion

The dashboard template provides a comprehensive set of components and guidelines for building the agentland.saarland web interface. By following these patterns, developers can create a consistent, accessible, and feature-rich dashboard for monitoring and interacting with the agent system.

## Related Templates

| Template | Relationship |
|----------|--------------|
| [Structure](./template_structure.md) | Defines the directory structure for dashboard components |
| [Configurations](./template_configurations.md) | Provides configuration guidelines for dashboard settings |
| [Security](./template_security.md) | Outlines security practices for frontend applications |
| [Memory Bank](./template_memory_bank.md) | Dashboard displays memory bank status and content |

## Integration Points

The dashboard integrates with other components of the agentland.saarland system:

1. **Agent System** - Visualizes agent status and workflows
2. **MCP Integration** - Uses MCP hooks for enhanced functionality
3. **RAG System** - Displays knowledge base content and search results
4. **Security Framework** - Implements authentication and authorization UI
5. **Memory Bank** - Displays memory updates and progress

## Changelog

- **1.0.0** (2025-05-16): Initial version based on the agentland.saarland project