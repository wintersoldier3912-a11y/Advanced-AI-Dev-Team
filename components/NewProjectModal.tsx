import React, { useState } from 'react';
import { Button } from './ui';
import { X, Sparkles } from 'lucide-react';

interface NewProjectModalProps {
  onClose: () => void;
  onCreate: (name: string, description: string) => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({ onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && description) {
      onCreate(name, description);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-gray-700 rounded-xl w-full max-w-lg shadow-2xl transform transition-all scale-100">
        <div className="flex justify-between items-center p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="text-primary" size={20} />
            Initialize New Project
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Project Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Enterprise Task Manager"
              className="w-full bg-black/20 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Natural Language Requirements</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you want to build. The agents will handle the rest..."
              className="w-full bg-black/20 border border-gray-700 rounded-lg p-3 text-white h-32 focus:outline-none focus:border-primary transition-colors resize-none"
              required
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button variant="secondary" onClick={onClose} type="button">Cancel</Button>
            <Button type="submit">Initialize Agents</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
