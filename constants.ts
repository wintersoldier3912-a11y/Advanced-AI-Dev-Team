import { AgentRole } from './types';

export const AGENT_COLORS: Record<AgentRole, string> = {
  [AgentRole.IT_PROJECT_MANAGER]: 'text-teal-400',
  [AgentRole.PRODUCT_MANAGER]: 'text-pink-400',
  [AgentRole.PRODUCT_OWNER]: 'text-orange-400',
  [AgentRole.AI_PRODUCT_MANAGER]: 'text-fuchsia-400',
  [AgentRole.UI_UX_DESIGNER]: 'text-rose-400',
  [AgentRole.ARCHITECT]: 'text-purple-400',
  [AgentRole.FRONTEND_DEVELOPER]: 'text-sky-300',
  [AgentRole.BACKEND_DEVELOPER]: 'text-violet-400',
  [AgentRole.ENGINEER]: 'text-blue-400',
  [AgentRole.QA]: 'text-yellow-400',
  [AgentRole.GEN_AI_ENGINEER]: 'text-indigo-400',
  [AgentRole.DEVOPS]: 'text-cyan-400',
  [AgentRole.SECURITY]: 'text-red-400',
  [AgentRole.DOCS]: 'text-green-400',
};

// Based on PDF Page 11 & 13
export const INITIAL_CANDIDATES = [
  {
    id: 'c1',
    name: 'Engineer Agent 1',
    model: 'gpt-4',
    stack: 'FastAPI + React + PostgreSQL',
    status: 'generating',
    unitTestsPassed: 0,
    totalTests: 50,
    coverage: 0,
    securityScore: 0,
    maintainabilityIndex: 0,
    executability: 0,
    selected: false,
  },
  {
    id: 'c2',
    name: 'Engineer Agent 2',
    model: 'claude-3.5',
    stack: 'FastAPI + React + Redis',
    status: 'generating',
    unitTestsPassed: 0,
    totalTests: 48,
    coverage: 0,
    securityScore: 0,
    maintainabilityIndex: 0,
    executability: 0,
    selected: false,
  },
  {
    id: 'c3',
    name: 'Engineer Agent 3',
    model: 'llama-70b',
    stack: 'FastAPI + HTMX + SQLite',
    status: 'generating',
    unitTestsPassed: 0,
    totalTests: 45,
    coverage: 0,
    securityScore: 0,
    maintainabilityIndex: 0,
    executability: 0,
    selected: false,
  }
];

// Based on PDF Page 7 output
export const MOCK_PRD = `{
 "prd": {
  "title": "Enterprise Team Task Manager",
  "vision": "High-velocity task management platform for engineering teams with automated AI optimizations.",
  "user_stories": [
   {"as_a": "Team Lead", "i_want": "to assign tasks", "so_that": "collaboration is seamless"},
   {"as_a": "Dev", "i_want": "git integration", "so_that": "status updates are auto"}
  ],
  "requirements": ["Functional: OAuth2, CRUD, Real-time", "Non-functional: <100ms latency"],
  "acceptance_criteria": [],
  "competitive_analysis": {}
 }
}`;
