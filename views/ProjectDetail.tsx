import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { Project, ProjectStatus, Artifact, Candidate, AgentRole } from '../types';
import { simulationService } from '../services/simulationService';
import { Terminal } from '../components/Terminal';
import { Button, Card, Badge, ProgressBar } from '../components/ui';
import { ArrowLeft, Play, FileText, Code, GitCommit, CheckCircle, Shield, AlertTriangle, Trophy, Clock, Cpu, Activity, Zap, Copy, Check, Loader2 } from 'lucide-react';
import { AGENT_COLORS } from '../constants';
import Prism from 'prismjs';
import { load, dump } from 'js-yaml';

interface ProjectDetailProps {
  projectId: string;
  onBack: () => void;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({ projectId, onBack }) => {
  const [project, setProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'artifacts' | 'race'>('overview');
  const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(null);

  useEffect(() => {
    // Dynamic import sequence to ensure dependencies load in correct order
    const loadPrismLanguages = async () => {
      try {
        // Expose Prism to window for plugins/components that expect a global
        if (Prism) {
          (window as any).Prism = Prism;
          
          // Core dependencies first
          await import('prismjs/components/prism-clike');
          await import('prismjs/components/prism-markup'); // For XML/HTML/SVG/MathML
          
          // Base languages
          await import('prismjs/components/prism-javascript');
          await import('prismjs/components/prism-bash');
          await import('prismjs/components/prism-json');
          await import('prismjs/components/prism-yaml');
          await import('prismjs/components/prism-python');
          
          // Extended languages
          await import('prismjs/components/prism-markdown');
          await import('prismjs/components/prism-hcl'); // For Terraform
          
          // Derived languages
          await import('prismjs/components/prism-jsx'); // Depends on javascript & markup
          await import('prismjs/components/prism-typescript'); // Depends on javascript
          await import('prismjs/components/prism-tsx'); // Depends on jsx & typescript

          // Trigger highlight after loading
          Prism.highlightAll();
        }
      } catch (err) {
        console.warn('Prism language loading failed:', err);
      }
    };

    loadPrismLanguages();
  }, []);

  useEffect(() => {
    const unsubscribe = simulationService.subscribe(projectId, (updatedProject) => {
      setProject(updatedProject);
      // Auto-switch to Race Mode when architecture is done and we are in overview
      if (updatedProject.status === ProjectStatus.RACE_MODE && activeTab === 'overview') {
        setActiveTab('race');
      }
      // Auto-select first artifact if none selected
      if (updatedProject.artifacts.length > 0 && !selectedArtifactId) {
        setSelectedArtifactId(updatedProject.artifacts[0].id);
      }
    });
    return unsubscribe;
  }, [projectId, activeTab, selectedArtifactId]);

  if (!project) return <div className="flex h-screen items-center justify-center text-gray-400">Loading project data...</div>;

  const startSimulation = () => {
    simulationService.startSimulation(project.id);
  };

  const handleViewArtifacts = () => {
    setActiveTab('artifacts');
    // Prioritize showing code artifacts when coming from "View Source Code"
    const codeArtifact = project.artifacts.find(a => a.type === 'code' || a.name.endsWith('.py') || a.name.endsWith('.tsx'));
    
    if (codeArtifact) {
      setSelectedArtifactId(codeArtifact.id);
    } else if (!selectedArtifactId && project.artifacts.length > 0) {
      setSelectedArtifactId(project.artifacts[0].id);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <header className="h-16 border-b border-gray-800 bg-surface flex items-center px-6 justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="!p-2">
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-3">
              {project.name}
              <Badge color={project.status === 'COMPLETED' ? 'green' : 'blue'}>{project.status}</Badge>
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {project.status === ProjectStatus.IDLE && (
            <Button onClick={startSimulation}>
              <Play size={16} /> Start DevTeam
            </Button>
          )}
          <div className="w-64">
            <div className="flex justify-between text-xs mb-1 text-gray-400">
              <span>Progress</span>
              <span>{Math.round(project.progress)}%</span>
            </div>
            <ProgressBar value={project.progress} color="bg-success" />
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-64 bg-surface border-r border-gray-800 p-4 flex flex-col gap-4 overflow-y-auto hidden md:flex">
          <h3 className="text-xs uppercase text-gray-500 font-bold tracking-wider mb-2">Agent Swarm</h3>
          {[AgentRole.PRODUCT_MANAGER, AgentRole.ARCHITECT, AgentRole.ENGINEER, AgentRole.QA, AgentRole.DEVOPS, AgentRole.SECURITY].map(role => {
             const isActive = getActiveAgent(project.status, role);
             return (
               <div key={role} className={`p-3 rounded-lg border transition-all duration-300 ${isActive ? 'bg-white/5 border-primary/50 shadow-lg shadow-primary/10' : 'bg-transparent border-transparent opacity-50'}`}>
                 <div className={`text-sm font-bold ${AGENT_COLORS[role]} mb-1`}>{role}</div>
                 <div className="text-xs text-gray-400 flex items-center gap-2">
                   <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-400 animate-blink' : 'bg-gray-600'}`} />
                   {isActive ? 'Active' : 'Standby'}
                 </div>
               </div>
             );
          })}
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex border-b border-gray-800 bg-[#0a0f18]">
             <button 
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'overview' ? 'border-primary text-white' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
             >
               Overview
             </button>
             <button 
                onClick={() => setActiveTab('race')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'race' ? 'border-primary text-white' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
             >
               <Trophy size={14} className={activeTab === 'race' ? 'text-yellow-500' : ''} />
               Race Mode
             </button>
             <button 
                onClick={() => setActiveTab('artifacts')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'artifacts' ? 'border-primary text-white' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
             >
               <FileText size={14} />
               Artifacts ({project.artifacts.length})
             </button>
          </div>

          <div className={`flex-1 overflow-y-auto p-6 bg-background relative ${activeTab === 'artifacts' ? 'flex flex-col' : ''}`}>
             {activeTab === 'overview' && <OverviewTab project={project} />}
             {activeTab === 'race' && <RaceModeTab candidates={project.candidates} onViewArtifacts={handleViewArtifacts} />}
             {activeTab === 'artifacts' && (
               <ArtifactsTab 
                 artifacts={project.artifacts} 
                 selectedArtifactId={selectedArtifactId}
                 onSelectArtifact={setSelectedArtifactId}
               />
             )}
          </div>

          <div className="h-64 shrink-0 border-t border-gray-800">
            <Terminal logs={project.logs} />
          </div>
        </div>
      </div>
    </div>
  );
};

const getActiveAgent = (status: ProjectStatus, role: AgentRole): boolean => {
  if (status === ProjectStatus.PLANNING && role === AgentRole.PRODUCT_MANAGER) return true;
  if (status === ProjectStatus.ARCHITECTING && role === AgentRole.ARCHITECT) return true;
  if (status === ProjectStatus.RACE_MODE && role === AgentRole.ENGINEER) return true;
  if (status === ProjectStatus.TESTING && role === AgentRole.QA) return true;
  if (status === ProjectStatus.DEPLOYING && (role === AgentRole.DEVOPS || role === AgentRole.SECURITY)) return true;
  if (status === ProjectStatus.COMPLETED && role === AgentRole.DOCS) return true;
  return false;
};

const OverviewTab = ({ project }: { project: Project }) => (
  <div className="max-w-4xl mx-auto space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
       <Card className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-surface to-surface/50">
          <div className="text-4xl font-bold text-white mb-1">{project.logs.length}</div>
          <div className="text-gray-400 text-sm">Total Actions</div>
       </Card>
       <Card className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-surface to-surface/50">
          <div className="text-4xl font-bold text-white mb-1">{project.artifacts.length}</div>
          <div className="text-gray-400 text-sm">Artifacts Generated</div>
       </Card>
       <Card className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-surface to-surface/50">
          <div className="text-4xl font-bold text-success mb-1">
             {project.status === ProjectStatus.COMPLETED ? '100%' : 'Running'}
          </div>
          <div className="text-gray-400 text-sm">System Health</div>
       </Card>
    </div>
    <Card className="p-6">
      <h3 className="text-lg font-bold text-white mb-4">Project Request</h3>
      <p className="text-gray-300 leading-relaxed p-4 bg-black/20 rounded-lg border border-gray-800">
        {project.description}
      </p>
    </Card>
  </div>
);

const RaceModeTab = ({ candidates, onViewArtifacts }: { candidates: Candidate[], onViewArtifacts: () => void }) => (
  <div className="h-full flex flex-col">
    <div className="text-center mb-8">
      <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
         <Trophy className="text-yellow-500" /> Race Mode Optimization
      </h2>
      <p className="text-gray-400">Competing agent swarms running in parallel to select the best implementation.</p>
    </div>

    {candidates.length === 0 ? (
      <div className="flex-1 flex items-center justify-center text-gray-500 flex-col gap-4">
        <Clock size={48} className="animate-pulse opacity-50" />
        <p>Waiting for Architecture phase to complete...</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto w-full px-4 pb-8">
        {candidates.map((candidate) => (
          <div key={candidate.id} className={`relative rounded-xl border-2 transition-all duration-500 p-6 flex flex-col ${candidate.selected ? 'border-success bg-success/5 shadow-2xl shadow-green-500/10 scale-105 z-10' : 'border-gray-800 bg-surface'}`}>
             {candidate.selected && (
               <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-success text-black font-bold px-4 py-1 rounded-full text-sm shadow-lg flex items-center gap-2">
                 <Trophy size={14} /> WINNER
               </div>
             )}
             
             <div className="flex justify-between items-start mb-6">
               <div>
                 <h3 className="text-lg font-bold text-white">{candidate.name}</h3>
                 <p className="text-primary text-xs font-mono mt-1">{candidate.model}</p>
                 <p className="text-gray-400 text-xs font-mono mt-0.5">{candidate.stack}</p>
               </div>
               <Badge color={candidate.status === 'complete' ? 'green' : 'yellow'}>{candidate.status}</Badge>
             </div>

             <div className="space-y-6 flex-1">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Test Coverage</span>
                    <span className="text-white font-mono">{candidate.coverage.toFixed(1)}%</span>
                  </div>
                  <ProgressBar value={candidate.coverage} color={candidate.coverage > 85 ? 'bg-green-500' : 'bg-yellow-500'} />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Executability</span>
                    <span className="text-white font-mono">{candidate.executability.toFixed(0)}%</span>
                  </div>
                  <ProgressBar value={candidate.executability} color="bg-blue-500" />
                </div>
                
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <MetricBox icon={Shield} label="Security" value={`${candidate.securityScore}/10`} />
                  <MetricBox icon={Activity} label="Maintainability" value={candidate.maintainabilityIndex.toFixed(0)} />
                  <MetricBox icon={Zap} label="Tests Passed" value={`${candidate.unitTestsPassed}/${candidate.totalTests}`} />
                  <MetricBox icon={Cpu} label="Token Eff." value="High" />
                </div>
             </div>

             {candidate.selected && (
               <div className="mt-6 pt-4 border-t border-gray-700">
                 <Button onClick={onViewArtifacts} variant="primary" className="w-full justify-center">
                    <FileText size={16} /> View Source Code
                 </Button>
               </div>
             )}
          </div>
        ))}
      </div>
    )}
  </div>
);

const MetricBox = ({ icon: Icon, label, value }: any) => (
  <div className="p-2 bg-black/20 rounded border border-gray-800 flex flex-col items-center text-center">
    <Icon size={16} className="text-gray-500 mb-1" />
    <div className="text-xs text-gray-500">{label}</div>
    <div className="text-sm font-bold text-white">{value}</div>
  </div>
);

interface ArtifactsTabProps {
  artifacts: Artifact[];
  selectedArtifactId: string | null;
  onSelectArtifact: (id: string) => void;
}

const ArtifactsTab: React.FC<ArtifactsTabProps> = ({ artifacts, selectedArtifactId, onSelectArtifact }) => {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);
  
  // Resolve the artifact object from the ID, or fallback to first if ID is invalid/null
  // We use fallback for render safety.
  const selectedArtifact = artifacts.find(a => a.id === selectedArtifactId) || artifacts[0] || null;

  useEffect(() => {
    if (selectedArtifact && codeRef.current && Prism) {
       Prism.highlightElement(codeRef.current);
       setCopied(false);
    }
  }, [selectedArtifact]);

  const formatContent = (artifact: Artifact): string => {
    if (!artifact.content) return '';

    if (artifact.type === 'json') {
      try {
        const parsed = typeof artifact.content === 'string' ? JSON.parse(artifact.content) : artifact.content;
        return JSON.stringify(parsed, null, 2);
      } catch (e) {
        return artifact.content;
      }
    }
    
    if (artifact.type === 'yaml' || artifact.name.endsWith('.yaml') || artifact.name.endsWith('.yml')) {
      try {
        const parsed = load(artifact.content);
        return dump(parsed, { indent: 2, lineWidth: -1, noRefs: true });
      } catch (e) {
        return artifact.content;
      }
    }

    return artifact.content;
  };

  const handleCopy = () => {
    if (selectedArtifact) {
      navigator.clipboard.writeText(formatContent(selectedArtifact));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getLanguageClass = (type: string, name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    
    if (type === 'json') return 'language-json';
    if (type === 'yaml') return 'language-yaml';
    if (type === 'markdown') return 'language-markdown';

    switch (ext) {
      case 'js': return 'language-javascript';
      case 'ts': return 'language-typescript';
      case 'tsx': return 'language-tsx';
      case 'jsx': return 'language-jsx';
      case 'py': return 'language-python';
      case 'sh': return 'language-bash';
      case 'json': return 'language-json';
      case 'yaml': 
      case 'yml': return 'language-yaml';
      case 'md': return 'language-markdown';
      case 'tf': return 'language-hcl';
      case 'html': 
      case 'xml': 
      case 'svg': return 'language-markup';
      default: return 'language-none';
    }
  };

  if (artifacts.length === 0) {
    return (
       <div className="flex flex-col items-center justify-center h-full text-gray-500 bg-[#0f172a] rounded-xl border-2 border-dashed border-gray-800 p-12">
         <div className="relative mb-6">
           <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
           <div className="bg-surface p-6 rounded-full ring-1 ring-gray-700 shadow-2xl relative">
             <FileText size={48} className="text-gray-400" />
             <div className="absolute -bottom-1 -right-1 bg-surface rounded-full p-1.5 ring-1 ring-gray-800">
               <Loader2 size={16} className="text-primary animate-spin" />
             </div>
           </div>
         </div>
         <h3 className="text-xl font-bold text-gray-200 mb-3">Generating Artifacts...</h3>
         <p className="text-gray-400 text-center max-w-md leading-relaxed mb-8">
           The autonomous agent swarm is currently working on your project. 
           Source code files, architectural diagrams, and configuration files 
           will populate here in real-time as they are created.
         </p>
         
         <div className="flex gap-4">
            <div className="flex flex-col items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }}></div>
               <span className="text-[10px] uppercase tracking-widest text-gray-600">Plan</span>
            </div>
            <div className="w-8 h-px bg-gray-800 mt-1"></div>
            <div className="flex flex-col items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }}></div>
               <span className="text-[10px] uppercase tracking-widest text-gray-600">Code</span>
            </div>
            <div className="w-8 h-px bg-gray-800 mt-1"></div>
            <div className="flex flex-col items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }}></div>
               <span className="text-[10px] uppercase tracking-widest text-gray-600">Review</span>
            </div>
         </div>
       </div>
    );
  }

  const formattedContent = selectedArtifact ? formatContent(selectedArtifact) : '';
  const languageClass = selectedArtifact ? getLanguageClass(selectedArtifact.type, selectedArtifact.name) : '';

  return (
    <div className="flex h-full border border-gray-800 rounded-lg overflow-hidden shadow-2xl bg-[#0f172a] flex-1">
      {/* File Explorer Sidebar */}
      <div className="w-72 border-r border-gray-800 overflow-y-auto shrink-0 bg-[#0f172a]">
         <div className="p-3 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-800 bg-[#0f172a]">
           Files Explorer
         </div>
         {artifacts.map(art => (
           <div 
             key={art.id} 
             onClick={() => onSelectArtifact(art.id)}
             className={`p-3 border-b border-gray-800/50 cursor-pointer transition-colors flex items-center gap-3 ${selectedArtifact?.id === art.id ? 'bg-primary/10 border-l-2 border-l-primary text-white' : 'text-gray-400 hover:bg-white/5'}`}
           >
             <Code size={16} className={selectedArtifact?.id === art.id ? 'text-primary' : 'text-gray-600'} />
             <div className="overflow-hidden">
               <div className="text-sm font-medium truncate">{art.name}</div>
               <div className="text-[10px] opacity-60 uppercase">{art.type}</div>
             </div>
           </div>
         ))}
      </div>
      
      {/* Code Viewer Area */}
      <div className="flex-1 bg-[#1e1e1e] flex flex-col min-w-0">
        {selectedArtifact ? (
          <>
            <div className="h-10 border-b border-gray-700 bg-[#252526] flex items-center justify-between px-4 shrink-0">
              <span className="text-sm text-gray-300 font-mono">{selectedArtifact.name}</span>
              <button 
                onClick={handleCopy}
                className="text-gray-400 hover:text-white flex items-center gap-1.5 text-xs transition-colors px-2 py-1 rounded hover:bg-white/10"
              >
                {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="flex-1 overflow-auto relative custom-scrollbar">
              <pre className="!bg-[#1e1e1e] !m-0 !p-4 min-h-full text-sm">
                <code ref={codeRef} className={languageClass}>
                  {formattedContent}
                </code>
              </pre>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 flex-col gap-2">
            <Code size={32} className="opacity-20" />
            <span>Select a file to view content</span>
          </div>
        )}
      </div>
    </div>
  );
};
