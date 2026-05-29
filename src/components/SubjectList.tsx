import { useState } from 'react';
import { Pencil, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { useStore } from '../store';
import SubjectForm from './SubjectForm';
import type { SubjectState } from '../types';

const STATUS_COLORS: Record<SubjectState['status'], string> = {
  'approved': 'bg-green-500',
  'in-progress': 'bg-yellow-500',
  'pending': 'bg-gray-400',
};

const STATUS_LABELS: Record<SubjectState['status'], string> = {
  'approved': 'Approved',
  'in-progress': 'In Progress',
  'pending': 'Pending',
};

function cycleStatus(status: SubjectState['status']): SubjectState['status'] {
  const order: SubjectState['status'][] = ['pending', 'in-progress', 'approved'];
  const idx = order.indexOf(status);
  return order[(idx + 1) % order.length];
}

export default function SubjectList() {
  const activePlan = useStore((s) => s.plans.find((p) => p.id === s.activePlanId));
  const deleteSubject = useStore((s) => s.deleteSubject);
  const setSubjectStatus = useStore((s) => s.setSubjectStatus);

  const [editId, setEditId] = useState<string | null>(null);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  const subjects = activePlan?.subjects ?? [];

  const grouped = new Map<string, SubjectState[]>();
  for (const sub of subjects) {
    const cat = sub.category || 'General';
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat)!.push(sub);
  }

  const toggleCategory = (cat: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  if (editId) {
    return (
      <div className="p-3">
        <SubjectForm editId={editId} onClose={() => setEditId(null)} />
      </div>
    );
  }

  return (
    <div className="divide-y divide-[var(--color-border)]">
      {Array.from(grouped.entries()).map(([category, catSubjects]) => {
        const isCollapsed = collapsedCategories.has(category);
        return (
          <div key={category}>
            <button
              onClick={() => toggleCategory(category)}
              className="w-full flex items-center gap-1 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] transition-colors"
            >
              {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
              {category}
              <span className="ml-auto font-normal normal-case">
                {catSubjects.length}
              </span>
            </button>

            {!isCollapsed && (
              <div>
                {catSubjects.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center gap-2 px-3 py-1.5 hover:bg-[var(--color-surface)] group"
                  >
                    <button
                      onClick={() => {
                        const newStatus = cycleStatus(sub.status);
                        setSubjectStatus(sub.id, newStatus);
                      }}
                      title={STATUS_LABELS[sub.status]}
                      className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${STATUS_COLORS[sub.status]} cursor-pointer hover:scale-125 transition-transform`}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-[var(--color-text-muted)]">
                          {sub.code}
                        </span>
                        <span className="text-sm truncate">{sub.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-[var(--color-text-muted)]">
                        <span>{sub.hours}h</span>
                        {sub.semester && <span>Sem {sub.semester}</span>}
                        {sub.prerequisites.length > 0 && (
                          <span>{sub.prerequisites.length} req</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditId(sub.id)}
                        className="p-1 rounded hover:bg-[var(--color-border)]"
                        title="Edit"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        onClick={() => deleteSubject(sub.id)}
                        className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500"
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {subjects.length === 0 && (
        <div className="p-4 text-center text-sm text-[var(--color-text-muted)]">
          No subjects yet. Click "Add Subject" to get started.
        </div>
      )}
    </div>
  );
}
