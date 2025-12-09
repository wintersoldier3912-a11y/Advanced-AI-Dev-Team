import React, { useState } from 'react';
import { Project, ProjectStatus } from '../types';
import { Card, Button, Badge } from './ui';
import { Plus, ArrowRight, Cpu, Clock } from 'lucide-react';

interface ProjectListProps {
  projects: Project[];
  onSelect: (id: string) => void;
  onCreate: () => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({ projects, onSelect, onCreate }) => {
  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">DevTeam Dashboard</h1>
          <p className="text-gray-400">Manage your autonomous development cycles</p>
        </div>
        <Button onClick={onCreate}>
          <Plus size={18} />
          New Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-800 rounded-xl">
          <Cpu className="mx-auto text-gray-700 mb-4" size={48} />
          <h3 className="text-xl text-gray-300 font-medium mb-2">No active projects</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">Start a new project to see the agents in action. They will handle everything from PRD to Deployment.</p>
          <Button onClick={onCreate}>Launch First Project</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="hover:border-primary/50 transition-colors group cursor-pointer" onClick={() => onSelect(project.id)}>
              <div onClick={() => onSelect(project.id)}>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Cpu size={24} />
                  </div>
                  <Badge color={getStatusColor(project.status)}>{project.status}</Badge>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{project.name}</h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{project.description}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mt-4 border-t border-gray-800 pt-4">
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="group-hover:translate-x-1 transition-transform text-primary flex items-center gap-1">
                    View <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

const getStatusColor = (status: ProjectStatus) => {
  switch (status) {
    case ProjectStatus.COMPLETED: return 'green';
    case ProjectStatus.FAILED: return 'red';
    case ProjectStatus.IDLE: return 'gray';
    default: return 'blue';
  }
};
