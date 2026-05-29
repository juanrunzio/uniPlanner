import { create } from 'zustand';
import type { Subject, SubjectState, Plan } from './types';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

const STORAGE_KEY = 'uniplanner-storage';

function loadState(): { plans: Plan[]; activePlanId: string | null; darkMode: boolean } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { plans: [], activePlanId: null, darkMode: false };
    const parsed = JSON.parse(raw);
    return {
      plans: parsed.state?.plans ?? [],
      activePlanId: parsed.state?.activePlanId ?? null,
      darkMode: parsed.state?.darkMode ?? false,
    };
  } catch {
    return { plans: [], activePlanId: null, darkMode: false };
  }
}

interface AppState {
  plans: Plan[];
  activePlanId: string | null;
  darkMode: boolean;

  createPlan: (name: string) => string;
  deletePlan: (id: string) => void;
  setActivePlan: (id: string) => void;
  renamePlan: (id: string, name: string) => void;

  addSubject: (subject: Omit<Subject, 'id'>) => string;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;

  setSubjectStatus: (id: string, status: SubjectState['status'], grade?: number) => void;
  setSubjectGrade: (id: string, grade: number | undefined) => void;

  importPlanFromJSON: (json: string) => boolean;
  exportActivePlan: () => string | null;
  importPlanData: (data: { name: string; subjects: Subject[] }) => string;
  exportPlanData: (planId: string) => { name: string; subjects: Subject[] } | null;

  clearAllPlans: () => void;
  toggleDarkMode: () => void;
}

const initial = loadState();

export const useStore = create<AppState>()((set, get) => {
  function save() {
    const { plans, activePlanId, darkMode } = get();
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ state: { plans, activePlanId, darkMode } })
      );
    } catch { /* storage full */ }
  }

  return {
    plans: initial.plans,
    activePlanId: initial.activePlanId,
    darkMode: initial.darkMode,

    createPlan: (name) => {
      const id = generateId();
      set((s) => {
        const newState = {
          plans: [...s.plans, { id, name, subjects: [] }],
          activePlanId: s.activePlanId ?? id,
        };
        return newState;
      });
      save();
      return id;
    },

    deletePlan: (id) => {
      set((s) => {
        const plans = s.plans.filter((p) => p.id !== id);
        const activePlanId = s.activePlanId === id
          ? (plans[0]?.id ?? null)
          : s.activePlanId;
        return { plans, activePlanId };
      });
      save();
    },

    setActivePlan: (id) => {
      set({ activePlanId: id });
      save();
    },

    renamePlan: (id, name) => {
      set((s) => ({
        plans: s.plans.map((p) => (p.id === id ? { ...p, name } : p)),
      }));
      save();
    },

    addSubject: (subject) => {
      const id = generateId();
      const newSubject: SubjectState = {
        ...subject,
        id,
        status: 'pending',
      };
      set((s) => ({
        plans: s.plans.map((p) =>
          p.id === s.activePlanId
            ? { ...p, subjects: [...p.subjects, newSubject] }
            : p
        ),
      }));
      save();
      return id;
    },

    updateSubject: (id, updates) => {
      set((s) => ({
        plans: s.plans.map((p) =>
          p.id === s.activePlanId
            ? {
                ...p,
                subjects: p.subjects.map((sub) =>
                  sub.id === id ? { ...sub, ...updates } : sub
                ),
              }
            : p
        ),
      }));
      save();
    },

    deleteSubject: (id) => {
      set((s) => {
        const activePlan = s.plans.find((p) => p.id === s.activePlanId);
        if (!activePlan) return s;

        const newSubjects = activePlan.subjects
          .filter((sub) => sub.id !== id)
          .map((sub) => ({
            ...sub,
            prerequisites: sub.prerequisites.filter((pr) => pr !== id),
          }));

        return {
          plans: s.plans.map((p) =>
            p.id === s.activePlanId ? { ...p, subjects: newSubjects } : p
          ),
        };
      });
      save();
    },

    setSubjectStatus: (id, status, grade) => {
      set((s) => ({
        plans: s.plans.map((p) =>
          p.id === s.activePlanId
            ? {
                ...p,
                subjects: p.subjects.map((sub) =>
                  sub.id === id
                    ? {
                        ...sub,
                        status,
                        grade: status === 'approved' ? (grade ?? sub.grade) : undefined,
                      }
                    : sub
                ),
              }
            : p
        ),
      }));
      save();
    },

    setSubjectGrade: (id, grade) => {
      set((s) => ({
        plans: s.plans.map((p) =>
          p.id === s.activePlanId
            ? {
                ...p,
                subjects: p.subjects.map((sub) =>
                  sub.id === id ? { ...sub, grade } : sub
                ),
              }
            : p
        ),
      }));
      save();
    },

    importPlanFromJSON: (json) => {
      try {
        const data = JSON.parse(json);
        if (!data.name || !Array.isArray(data.subjects)) return false;
        const id = generateId();
        const subjects: SubjectState[] = data.subjects.map((s: any) => ({
          ...s,
          id: s.id ?? generateId(),
          status: 'pending',
          prerequisites: s.prerequisites ?? [],
          category: s.category ?? 'General',
          hours: s.hours ?? 0,
        }));
        set((s) => ({
          plans: [...s.plans, { id, name: data.name, subjects }],
          activePlanId: id,
        }));
        save();
        return true;
      } catch {
        return false;
      }
    },

    exportActivePlan: () => {
      const plan = get().plans.find((p) => p.id === get().activePlanId);
      if (!plan) return null;
      const data = {
        name: plan.name,
        subjects: plan.subjects.map(({ status, grade, ...rest }) => rest),
      };
      return JSON.stringify(data, null, 2);
    },

    importPlanData: (data) => {
      const id = generateId();
      const subjects: SubjectState[] = data.subjects.map((s) => ({
        ...s,
        id: s.id || generateId(),
        status: 'pending',
        prerequisites: s.prerequisites || [],
        category: s.category || 'General',
        hours: s.hours ?? 0,
      }));
      set((s) => ({
        plans: [...s.plans, { id, name: data.name, subjects }],
        activePlanId: id,
      }));
      save();
      return id;
    },

    exportPlanData: (planId) => {
      const plan = get().plans.find((p) => p.id === planId);
      if (!plan) return null;
      return {
        name: plan.name,
        subjects: plan.subjects.map(({ status, grade, ...rest }) => rest),
      };
    },

    clearAllPlans: () => {
      set({ plans: [], activePlanId: null });
      save();
    },

    toggleDarkMode: () => {
      set((s) => ({ darkMode: !s.darkMode }));
      save();
    },
  };
});
