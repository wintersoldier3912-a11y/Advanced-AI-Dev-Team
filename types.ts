export enum AgentRole {
  PRODUCT_MANAGER = 'Product Manager',
  ARCHITECT = 'Architect',
  ENGINEER = 'Engineer',
  QA = 'QA',
  DEVOPS = 'DevOps',
  SECURITY = 'Security',
  DOCS = 'Docs',
}

export enum ProjectStatus {
  IDLE = 'IDLE',
  PLANNING = 'PLANNING',
  ARCHITECTING = 'ARCHITECTING',
  RACE_MODE = 'RACE_MODE',
  TESTING = 'TESTING',
  DEPLOYING = 'DEPLOYING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface LogEntry {
  id: string;
  timestamp: number;
  agent: AgentRole;
  message: string;
  level: 'info' | 'warning' | 'error' | 'success';
}

export interface Candidate {
  id: string;
  name: string;
  model: string;
  stack: string;
  status: 'generating' | 'compiling' | 'testing' | 'complete';
  unitTestsPassed: number;
  totalTests: number;
  coverage: number;
  securityScore: number; // 0-10
  maintainabilityIndex: number; // 0-100
  executability: number; // 0-100
  selected: boolean;
}

export interface Artifact {
  id: string;
  name: string;
  type: 'markdown' | 'code' | 'json' | 'yaml';
  content: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  progress: number;
  logs: LogEntry[];
  candidates: Candidate[];
  artifacts: Artifact[];
  createdAt: number;
}