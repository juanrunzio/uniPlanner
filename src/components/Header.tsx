import { useState } from 'react';
import { BookOpen, Moon, Sun, Plus, ChevronDown } from 'lucide-react';
import { useStore } from '../store';
import { examplePlan } from '../examplePlan';

export default function Header() {
  const store = useStore();
  const darkMode = useStore((s) => s.darkMode);
  const toggleDarkMode = useStore((s) => s.toggleDarkMode);

  const [showPlanMenu, setShowPlanMenu] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');

  const activePlan = store.plans.find((p) => p.id === store.activePlanId);

  const handleCreatePlan = () => {
    if (newPlanName.trim()) {
      store.createPlan(newPlanName.trim());
      setNewPlanName('');
      setShowPlanMenu(false);
    }
  };

  const loadExample = () => {
    store.importPlanData(examplePlan);
    setShowPlanMenu(false);
  };

  return (
    <header className="h-12 flex items-center gap-2 px-3 border-b border-[var(--color-border)] bg-[var(--color-surface)] shrink-0">
      <div className="flex items-center gap-2">
        <BookOpen size={20} className="text-[var(--color-accent)]" />
        <span className="text-sm font-bold">uniPlanner</span>
      </div>

      <div className="flex-1" />

      {store.plans.length > 0 && (
        <div className="relative">
          <button
            onClick={() => setShowPlanMenu(!showPlanMenu)}
            className="flex items-center gap-1 px-2 py-1 text-xs rounded border border-[var(--color-border)] hover:bg-[var(--color-border)]"
          >
            <span className="max-w-[120px] truncate">
              {activePlan?.name ?? 'Select Plan'}
            </span>
            <ChevronDown size={12} />
          </button>

          {showPlanMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowPlanMenu(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-56 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-lg z-20 py-1">
                {store.plans.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => {
                      store.setActivePlan(plan.id);
                      setShowPlanMenu(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[var(--color-border)] ${
                      plan.id === store.activePlanId ? 'font-semibold' : ''
                    }`}
                  >
                    {plan.name}
                    <span className="text-[var(--color-text-muted)] ml-2">
                      ({plan.subjects.length})
                    </span>
                  </button>
                ))}
                <div className="border-t border-[var(--color-border)] mt-1 pt-1 px-2">
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={newPlanName}
                      onChange={(e) => setNewPlanName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCreatePlan()}
                      placeholder="New plan name..."
                      className="flex-1 px-2 py-1 text-xs rounded border border-[var(--color-border)] bg-[var(--color-bg)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                    />
                    <button
                      onClick={handleCreatePlan}
                      className="p-1 rounded bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  {store.plans.length === 0 && (
                    <button
                      onClick={loadExample}
                      className="w-full mt-1 px-2 py-1 text-xs rounded border border-[var(--color-border)] hover:bg-[var(--color-border)]"
                    >
                      Load Example Plan
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <button
        onClick={toggleDarkMode}
        className="p-1.5 rounded hover:bg-[var(--color-border)]"
        title="Toggle dark mode"
      >
        {darkMode ? <Sun size={16} /> : <Moon size={16} />}
      </button>
    </header>
  );
}
