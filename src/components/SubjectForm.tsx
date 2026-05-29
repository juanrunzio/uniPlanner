import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { useStore } from '../store';
import type { Subject } from '../types';

interface SubjectFormProps {
  editId?: string | null;
  onClose: () => void;
}

export default function SubjectForm({ editId, onClose }: SubjectFormProps) {
  const activePlan = useStore((s) => s.plans.find((p) => p.id === s.activePlanId));
  const addSubject = useStore((s) => s.addSubject);
  const updateSubject = useStore((s) => s.updateSubject);

  const existing = editId ? activePlan?.subjects.find((s) => s.id === editId) : null;

  const [code, setCode] = useState(existing?.code ?? '');
  const [name, setName] = useState(existing?.name ?? '');
  const [hours, setHours] = useState(existing?.hours ?? 4);
  const [category, setCategory] = useState(existing?.category ?? 'Required');
  const [semester, setSemester] = useState(existing?.semester?.toString() ?? '');
  const [prerequisites, setPrerequisites] = useState<string[]>(existing?.prerequisites ?? []);

  const availableSubjects = (activePlan?.subjects ?? []).filter(
    (s) => s.id !== editId
  );

  useEffect(() => {
    if (existing) {
      setCode(existing.code);
      setName(existing.name);
      setHours(existing.hours);
      setCategory(existing.category);
      setSemester(existing.semester?.toString() ?? '');
      setPrerequisites(existing.prerequisites);
    }
  }, [editId]);

  const togglePrerequisite = (subjectId: string) => {
    setPrerequisites((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) return;

    const data: Omit<Subject, 'id'> = {
      code: code.trim(),
      name: name.trim(),
      hours,
      category: category.trim() || 'General',
      prerequisites,
    };

    if (semester) {
      (data as any).semester = parseInt(semester);
    }

    if (existing) {
      updateSubject(existing.id, data);
    } else {
      addSubject(data);
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">
          {existing ? 'Edit Subject' : 'Add Subject'}
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded hover:bg-[var(--color-border)]"
        >
          <X size={16} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
            Code
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="CS101"
            className="w-full px-2 py-1.5 text-sm rounded border border-[var(--color-border)] bg-[var(--color-surface)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
            Hours
          </label>
          <input
            type="number"
            value={hours}
            onChange={(e) => setHours(Math.max(0, parseInt(e.target.value) || 0))}
            min={0}
            className="w-full px-2 py-1.5 text-sm rounded border border-[var(--color-border)] bg-[var(--color-surface)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
          Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Introduction to Programming"
          className="w-full px-2 py-1.5 text-sm rounded border border-[var(--color-border)] bg-[var(--color-surface)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
            Category
          </label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Required"
            className="w-full px-2 py-1.5 text-sm rounded border border-[var(--color-border)] bg-[var(--color-surface)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
            Semester (optional)
          </label>
          <input
            type="number"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            min={1}
            placeholder="1"
            className="w-full px-2 py-1.5 text-sm rounded border border-[var(--color-border)] bg-[var(--color-surface)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
          />
        </div>
      </div>

      {availableSubjects.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
            Prerequisites
          </label>
          <div className="max-h-32 overflow-y-auto border border-[var(--color-border)] rounded p-1.5 space-y-0.5">
            {availableSubjects.map((s) => (
              <label
                key={s.id}
                className="flex items-center gap-1.5 text-sm cursor-pointer hover:bg-[var(--color-border)] rounded px-1 py-0.5"
              >
                <input
                  type="checkbox"
                  checked={prerequisites.includes(s.id)}
                  onChange={() => togglePrerequisite(s.id)}
                  className="accent-[var(--color-accent)]"
                />
                <span className="text-xs font-mono text-[var(--color-text-muted)]">
                  {s.code}
                </span>
                <span className="truncate">{s.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <button
        type="submit"
        className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-colors"
      >
        <Plus size={14} />
        {existing ? 'Update' : 'Add'} Subject
      </button>
    </form>
  );
}
