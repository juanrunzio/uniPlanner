import { useState } from 'react';
import {
  PanelLeftClose,
  PanelLeft,
  Plus,
  Upload,
  Download,
  Trash2,
  BookOpen,
} from 'lucide-react';
import { useStore } from '../store';
import { examplePlan } from '../examplePlan';
import SubjectForm from './SubjectForm';
import SubjectList from './SubjectList';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const store = useStore();
  const activePlan = store.plans.find((p) => p.id === store.activePlanId);

  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');

  const totalSubjects = activePlan?.subjects.length ?? 0;
  const approvedCount = activePlan?.subjects.filter((s) => s.status === 'approved').length ?? 0;
  const inProgressCount = activePlan?.subjects.filter((s) => s.status === 'in-progress').length ?? 0;

  const handleExport = () => {
    const json = store.exportActivePlan();
    if (!json) return;
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activePlan?.name?.replace(/\s+/g, '_') ?? 'plan'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (!importText.trim()) return;
    if (store.importPlanFromJSON(importText)) {
      setImportText('');
      setShowImport(false);
    } else {
      alert('Invalid JSON format.');
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        if (store.importPlanFromJSON(reader.result)) {
          setShowImport(false);
        } else {
          alert('Invalid JSON format.');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const loadExample = () => {
    store.importPlanData(examplePlan);
  };

  if (collapsed) {
    return (
      <div className="w-10 h-full flex flex-col items-center py-3 border-r border-[var(--color-border)] bg-[var(--color-surface)]">
        <button
          onClick={onToggle}
          className="p-1.5 rounded hover:bg-[var(--color-border)]"
          title="Expand sidebar"
        >
          <PanelLeft size={18} />
        </button>
      </div>
    );
  }

  return (
    <div className="w-72 h-full flex flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--color-border)]">
        <h2 className="text-sm font-semibold truncate">
          {activePlan?.name ?? 'No Plan'}
        </h2>
        <button
          onClick={onToggle}
          className="p-1 rounded hover:bg-[var(--color-border)]"
          title="Collapse sidebar"
        >
          <PanelLeftClose size={16} />
        </button>
      </div>

      {!activePlan && (
        <div className="flex-1 flex flex-col items-center justify-center p-4 gap-3">
          <BookOpen size={32} className="text-[var(--color-text-muted)]" />
          <p className="text-sm text-[var(--color-text-muted)] text-center">
            Create a plan or load the example to get started.
          </p>
          <button
            onClick={loadExample}
            className="px-3 py-1.5 text-sm font-medium rounded bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]"
          >
            Load Example Plan
          </button>
          <button
            onClick={() => store.createPlan('My Plan')}
            className="px-3 py-1.5 text-sm font-medium rounded border border-[var(--color-border)] hover:bg-[var(--color-border)]"
          >
            Create Empty Plan
          </button>
        </div>
      )}

      {activePlan && (
        <>
          <div className="px-3 py-2 border-b border-[var(--color-border)] text-xs text-[var(--color-text-muted)] space-y-1">
            <div className="flex justify-between">
              <span>Subjects:</span>
              <span>{totalSubjects}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-600">Approved:</span>
              <span>{approvedCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-yellow-600">In Progress:</span>
              <span>{inProgressCount}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 px-2 py-1.5 border-b border-[var(--color-border)]">
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]"
            >
              <Plus size={12} />
              Add
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-1 px-2 py-1 text-xs rounded border border-[var(--color-border)] hover:bg-[var(--color-border)]"
              title="Export JSON"
            >
              <Download size={12} />
              Export
            </button>
            <button
              onClick={() => setShowImport(true)}
              className="flex items-center gap-1 px-2 py-1 text-xs rounded border border-[var(--color-border)] hover:bg-[var(--color-border)]"
              title="Import JSON"
            >
              <Upload size={12} />
              Import
            </button>
            <label className="flex items-center gap-1 px-2 py-1 text-xs rounded border border-[var(--color-border)] hover:bg-[var(--color-border)] cursor-pointer">
              <Upload size={12} />
              File
              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
              />
            </label>
          </div>

          {showForm && (
            <div className="p-3 border-b border-[var(--color-border)]">
              <SubjectForm onClose={() => setShowForm(false)} />
            </div>
          )}

          {showImport && (
            <div className="p-3 border-b border-[var(--color-border)] space-y-2">
              <h3 className="text-xs font-semibold">Import Plan (JSON)</h3>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                rows={6}
                className="w-full px-2 py-1.5 text-xs rounded border border-[var(--color-border)] bg-[var(--color-bg)] font-mono resize-none focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                placeholder='Paste JSON here...'
              />
              <div className="flex gap-1">
                <button
                  onClick={handleImport}
                  className="flex-1 px-2 py-1 text-xs font-medium rounded bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]"
                >
                  Import
                </button>
                <button
                  onClick={() => { setShowImport(false); setImportText(''); }}
                  className="px-2 py-1 text-xs rounded border border-[var(--color-border)] hover:bg-[var(--color-border)]"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            <SubjectList />
          </div>

          <div className="px-3 py-2 border-t border-[var(--color-border)] flex items-center gap-1">
            <button
              onClick={() => {
                if (confirm('Delete this plan? This cannot be undone.')) {
                  store.deletePlan(store.activePlanId!);
                }
              }}
              className="flex items-center gap-1 px-2 py-1 text-xs text-red-500 rounded border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 size={12} />
              Delete Plan
            </button>
          </div>
        </>
      )}
    </div>
  );
}
