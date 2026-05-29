import { useState, useEffect } from 'react';
import { useStore } from './store';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import GraphCanvas from './components/GraphCanvas';
import ProgressBar from './components/ProgressBar';

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const darkMode = useStore((s) => s.darkMode);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return (
    <div className="h-full flex flex-col">
      <Header />
      <div className="flex-1 flex min-h-0">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <div className="flex-1 relative">
          <GraphCanvas />
        </div>
      </div>
      <ProgressBar />
    </div>
  );
}
