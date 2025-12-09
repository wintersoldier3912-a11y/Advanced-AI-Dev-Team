import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { ProjectList } from './components/ProjectList';
import { ProjectDetail } from './views/ProjectDetail';
import { NewProjectModal } from './components/NewProjectModal';
import { simulationService } from './services/simulationService';
import { Project } from './types';

// Simple router state since we can't use react-router in this setup comfortably
// without adding more files, though HashRouter is allowed, state is simpler for this single view.
type Route = { view: 'list' } | { view: 'detail', projectId: string };

const App: React.FC = () => {
  const [route, setRoute] = useState<Route>({ view: 'list' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Force re-render on project update to show list
  const [projects, setProjects] = useState<Project[]>(simulationService.getAllProjects());

  const handleCreateProject = (name: string, description: string) => {
    const project = simulationService.createProject(name, description);
    setProjects(simulationService.getAllProjects());
    setIsModalOpen(false);
    setRoute({ view: 'detail', projectId: project.id });
  };

  const renderContent = () => {
    switch (route.view) {
      case 'list':
        return (
          <ProjectList 
            projects={projects} 
            onSelect={(id) => setRoute({ view: 'detail', projectId: id })} 
            onCreate={() => setIsModalOpen(true)}
          />
        );
      case 'detail':
        return (
          <ProjectDetail 
            projectId={route.projectId} 
            onBack={() => {
              setProjects(simulationService.getAllProjects()); // Refresh list
              setRoute({ view: 'list' });
            }} 
          />
        );
      default:
        return <div>Not found</div>;
    }
  };

  return (
    <Layout>
      {renderContent()}
      {isModalOpen && (
        <NewProjectModal 
          onClose={() => setIsModalOpen(false)} 
          onCreate={handleCreateProject} 
        />
      )}
    </Layout>
  );
};

export default App;
