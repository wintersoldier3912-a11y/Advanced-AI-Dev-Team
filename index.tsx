import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');
if (!container) {
  throw new Error("Could not find root element to mount to");
}

try {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error("Application failed to mount:", error);
  container.innerHTML = `
    <div style="color: #ef4444; padding: 2rem; font-family: sans-serif;">
      <h1>Application Error</h1>
      <p>Failed to load the application.</p>
      <pre style="background: #1e293b; padding: 1rem; border-radius: 0.5rem; overflow: auto;">${error instanceof Error ? error.message : String(error)}</pre>
    </div>
  `;
}
