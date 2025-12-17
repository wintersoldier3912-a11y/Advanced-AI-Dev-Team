import { Project, ProjectStatus, LogEntry, AgentRole, Candidate, Artifact } from '../types';
import { INITIAL_CANDIDATES, MOCK_PRD } from '../constants';

const uuid = () => Math.random().toString(36).substring(2, 9);

class SimulationService {
  private projects: Map<string, Project> = new Map();
  private subscribers: Map<string, (project: Project) => void> = new Map();
  private intervalIds: Map<string, any> = new Map();

  createProject(name: string, description: string): Project {
    const project: Project = {
      id: uuid(),
      name,
      description,
      status: ProjectStatus.IDLE,
      progress: 0,
      logs: [],
      candidates: [],
      artifacts: [],
      createdAt: Date.now(),
    };
    this.projects.set(project.id, project);
    return project;
  }

  getProject(id: string): Project | undefined {
    return this.projects.get(id);
  }

  getAllProjects(): Project[] {
    return Array.from(this.projects.values()).sort((a, b) => b.createdAt - a.createdAt);
  }

  subscribe(projectId: string, callback: (project: Project) => void) {
    this.subscribers.set(projectId, callback);
    const project = this.getProject(projectId);
    if (project) callback(project);
    return () => this.subscribers.delete(projectId);
  }

  private notify(projectId: string) {
    const project = this.getProject(projectId);
    const cb = this.subscribers.get(projectId);
    if (project && cb) cb({ ...project });
  }

  private addLog(projectId: string, agent: AgentRole, message: string, level: LogEntry['level'] = 'info') {
    const project = this.getProject(projectId);
    if (!project) return;
    
    project.logs.push({
      id: uuid(),
      timestamp: Date.now(),
      agent,
      message,
      level
    });
    if (project.logs.length > 200) project.logs.shift();
    this.notify(projectId);
  }

  startSimulation(projectId: string) {
    const project = this.getProject(projectId);
    if (!project) return;
    if (this.intervalIds.has(projectId)) return;

    project.status = ProjectStatus.PLANNING;
    this.addLog(projectId, AgentRole.IT_PROJECT_MANAGER, 'Initializing project scope, timeline, and resource allocation.', 'info');
    
    let tick = 0;
    const interval = setInterval(() => {
      tick++;
      this.runSimulationStep(projectId, tick);
    }, 1000); 

    this.intervalIds.set(projectId, interval);
  }

  private runSimulationStep(projectId: string, tick: number) {
    const project = this.getProject(projectId);
    if (!project) return;

    // --- PHASE 1: PLANNING (PM, PO, AI-PM, RESEARCHER) ---
    if (tick === 2) {
      this.addLog(projectId, AgentRole.RESEARCHER, 'Analyzing market trends and competitor solutions...', 'info');
    }
    if (tick === 3) {
      this.addLog(projectId, AgentRole.RESEARCHER, 'Feasibility study complete. Identified 3 key technical risks.', 'success');
      project.artifacts.push({
        id: uuid(),
        name: 'planning/feasibility_study.md',
        type: 'markdown',
        content: '# Feasibility Study\n\n## Risks\n1. Real-time latency\n2. AI model cost\n3. Data privacy compliance\n\n## Recommendation\nProceed with Microservices architecture.'
      });
    }
    if (tick === 4) {
      this.addLog(projectId, AgentRole.PRODUCT_MANAGER, 'Drafting initial Product Requirements Document (PRD) based on research...', 'info');
    }
    if (tick === 5) {
      this.addLog(projectId, AgentRole.PRODUCT_OWNER, 'Refining backlog. Prioritizing user stories based on business value.', 'info');
    }
    if (tick === 6) {
      this.addLog(projectId, AgentRole.AI_PRODUCT_MANAGER, 'Evaluating AI feasibility and defining model capability requirements.', 'info');
    }
    if (tick === 7) {
      project.artifacts.push({
        id: uuid(),
        name: 'PRD.json',
        type: 'json',
        content: MOCK_PRD
      });
      this.addLog(projectId, AgentRole.PRODUCT_MANAGER, 'PRD Published. Handing off to Architecture Team.', 'success');
      project.status = ProjectStatus.ARCHITECTING;
      project.progress = 15;
    }

    // --- PHASE 2: ARCHITECT & DESIGN (RAG + UI/UX) ---
    if (tick === 8) {
      this.addLog(projectId, AgentRole.UI_UX_DESIGNER, 'Creating high-fidelity mockups and design system tokens.', 'info');
    }
    if (tick === 9) {
      this.addLog(projectId, AgentRole.ARCHITECT, 'RAG: Querying Vector DB for similar system designs...', 'warning');
    }
    if (tick === 10) {
      project.artifacts.push({
        id: uuid(),
        name: 'design/theme.css',
        type: 'code',
        content: `:root {\n  --primary: #3b82f6;\n  --background: #0f172a;\n  --surface: #1e293b;\n  --text: #f8fafc;\n}`
      });
      this.addLog(projectId, AgentRole.UI_UX_DESIGNER, 'Design System finalized. Exporting CSS variables.', 'success');
    }
    if (tick === 11) {
      this.addLog(projectId, AgentRole.ARCHITECT, 'Retrieved 3 high-confidence patterns. Creating Microservices architecture.', 'info');
    }
    if (tick === 13) {
      project.artifacts.push({
        id: uuid(),
        name: 'architecture/system_design.json',
        type: 'json',
        content: `{\n "pattern": "Microservices",\n "stack": {\n  "backend": "FastAPI",\n  "frontend": "React"\n },\n "database": "PostgreSQL"\n}`
      });
      this.addLog(projectId, AgentRole.ARCHITECT, 'Architecture finalized. Starting Race Mode.', 'success');
      project.progress = 30;
      project.status = ProjectStatus.RACE_MODE;
      project.candidates = JSON.parse(JSON.stringify(INITIAL_CANDIDATES)); 
      this.addLog(projectId, AgentRole.ENGINEER, 'RACE MODE STARTED: Spawning GPT-4, Claude-3.5, and Llama-70b agents.', 'warning');
    }

    // --- PHASE 3: RACE MODE (Engineer + QA + Frontend/Backend Devs) ---
    if (tick > 13 && tick < 32) {
      project.candidates.forEach(c => {
        if (c.status === 'generating') {
           if (Math.random() > 0.3) c.unitTestsPassed += Math.floor(Math.random() * 5);
           c.coverage += Math.random() * 2;
           c.maintainabilityIndex += Math.random() * 1.5;
           c.executability += Math.random() * 2;
           
           if (c.unitTestsPassed >= c.totalTests) {
             c.status = 'testing';
             c.unitTestsPassed = c.totalTests;
           }
           if (c.coverage > 98) c.coverage = 98;
           if (c.maintainabilityIndex > 95) c.maintainabilityIndex = 95;
           if (c.executability > 100) c.executability = 100;
        }
      });
      
      // Interleave developer logs
      if (tick === 16) {
        this.addLog(projectId, AgentRole.BACKEND_DEVELOPER, 'Structuring database schema and API endpoints...', 'info');
      }
      if (tick === 19) {
        this.addLog(projectId, AgentRole.FRONTEND_DEVELOPER, 'Scaffolding React components based on UI designs...', 'info');
      }
      if (tick === 24) {
        this.addLog(projectId, AgentRole.BACKEND_DEVELOPER, 'Optimizing query performance and implementing caching layer.', 'info');
      }
      if (tick === 28) {
         this.addLog(projectId, AgentRole.FRONTEND_DEVELOPER, 'Integrating API clients and state management.', 'info');
      }

      const models = ['gpt-4', 'claude-3.5', 'llama-70b'];
      if (tick % 4 === 0) { // Slower generic log
        const model = models[tick % 3];
        this.addLog(projectId, AgentRole.ENGINEER, `[${model}] Generating core modules...`, 'info');
      }
    }

    if (tick === 32) {
       // Evaluate Candidates
       const c1 = project.candidates[0]; // GPT-4
       c1.status = 'complete'; c1.coverage = 92.5; c1.securityScore = 9; c1.maintainabilityIndex = 88; c1.executability = 98;
       
       const c2 = project.candidates[1]; // Claude
       c2.status = 'complete'; c2.coverage = 95.2; c2.securityScore = 10; c2.maintainabilityIndex = 94; c2.executability = 100;

       const c3 = project.candidates[2]; // Llama
       c3.status = 'complete'; c3.coverage = 84.1; c3.securityScore = 7; c3.maintainabilityIndex = 76; c3.executability = 91;

       this.addLog(projectId, AgentRole.QA, 'Race complete. Analyzing metrics...', 'info');
       project.progress = 60;
    }

    if (tick === 34) {
      // Select Winner (Claude)
      project.candidates[1].selected = true;
      this.addLog(projectId, AgentRole.QA, 'Selected: Claude-3.5 (Best Maintainability & Security).', 'success');
      this.addLog(projectId, AgentRole.ENGINEER, 'Merging winning codebase...', 'success');
      
      project.status = ProjectStatus.DEPLOYING;
      project.progress = 75;
      
      // Artifacts per PDF directory structure
      project.artifacts.push({
        id: uuid(),
        name: 'backend/app/main.py',
        type: 'code',
        content: `from fastapi import FastAPI\n\napp = FastAPI(title="Task Manager API")\n\n@app.get("/")\ndef read_root():\n    return {"Status": "Active"}`
      });
      project.artifacts.push({
        id: uuid(),
        name: 'frontend/src/App.tsx',
        type: 'code',
        content: `import React from 'react';\n\nexport const App = () => {\n  return <div className="p-4">AdvancedAI DevTeam Generated App</div>;\n};`
      });
      project.artifacts.push({
        id: uuid(),
        name: 'scripts/dev.sh',
        type: 'code',
        content: `#!/bin/bash\n# Boots backend and frontend\nuvicorn backend.app.main:app --reload & \ncd frontend && npm start`
      });
    }

    // --- PHASE 4: GEN AI ENGINEER (Optimization) ---
    if (tick === 36) {
      this.addLog(projectId, AgentRole.GEN_AI_ENGINEER, 'Optimizing system prompts and configuring embedding models...', 'info');
      project.artifacts.push({
        id: uuid(),
        name: 'ai/config/prompts.yaml',
        type: 'yaml',
        content: `system_prompts:\n  task_classifier:\n    role: "Classifier"\n    instruction: "You are an AI that classifies engineering tasks into categories."\n  code_generator:\n    role: "Developer"\n    instruction: "Generate clean, pythonic code following PEP-8 standards."\nmodels:\n  embedding: "text-embedding-004"\n  generation: "gemini-1.5-pro"`
      });
    }

    // --- PHASE 5: DEVOPS & SECURITY ---
    if (tick === 38) {
       this.addLog(projectId, AgentRole.DEVOPS, 'Generating Helm Charts and Terraform IaC...', 'info');
       project.artifacts.push({
         id: uuid(),
         name: 'infrastructure/kubernetes/deployment.yaml',
         type: 'yaml',
         content: `apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: backend\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: backend`
       });
       project.artifacts.push({
         id: uuid(),
         name: 'infrastructure/terraform/main.tf',
         type: 'code',
         content: `provider "aws" {\n  region = "us-east-1"\n}\n\nresource "aws_s3_bucket" "artifacts" {\n  bucket = "devteam-artifacts"\n}`
       });
    }
    
    if (tick === 40) {
       this.addLog(projectId, AgentRole.SECURITY, 'SAST Scan passed. Dependency check: Clean.', 'success');
       project.progress = 95;
    }

    // --- PHASE 6: DOCS ---
    if (tick === 42) {
      this.addLog(projectId, AgentRole.DOCS, 'Generating README.md and API.md...', 'info');
      project.artifacts.push({
        id: uuid(),
        name: 'README.md',
        type: 'markdown',
        content: `# Project Overview\nGenerated by AdvancedAI DevTeam.\n\n## Setup\nRun ./scripts/setup.sh`
      });
    }

    if (tick === 45) {
      project.status = ProjectStatus.COMPLETED;
      project.progress = 100;
      this.addLog(projectId, AgentRole.IT_PROJECT_MANAGER, 'Project deliverables accepted. Sprint complete.', 'success');
      
      clearInterval(this.intervalIds.get(projectId));
      this.intervalIds.delete(projectId);
    }

    this.notify(projectId);
  }
}

export const simulationService = new SimulationService();
