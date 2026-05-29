import { useStore } from '../store';

function getMotivationalText(pct: number): string {
  if (pct === 0) return 'Every journey begins with a single step.';
  if (pct < 25) return 'A strong start — keep the momentum going.';
  if (pct < 50) return 'You are building something great. Stay focused.';
  if (pct < 75) return 'Over halfway there. The finish line is in sight.';
  if (pct < 100) return 'Almost there. One subject at a time.';
  return 'All done. Congratulations, you made it.';
}

export default function ProgressBar() {
  const activePlan = useStore((s) => s.plans.find((p) => p.id === s.activePlanId));

  if (!activePlan || activePlan.subjects.length === 0) return null;

  const total = activePlan.subjects.length;
  const approved = activePlan.subjects.filter((s) => s.status === 'approved').length;
  const totalHours = activePlan.subjects.reduce((sum, s) => sum + s.hours, 0);
  const doneHours = activePlan.subjects
    .filter((s) => s.status === 'approved')
    .reduce((sum, s) => sum + s.hours, 0);

  const pct = Math.round((approved / total) * 100);

  return (
    <div className="h-10 shrink-0 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-3 flex items-center gap-3">
      <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] min-w-0 flex-1">
        <span className="hidden sm:inline whitespace-nowrap">
          {approved}/{total} subjects
        </span>
        <span className="text-[10px] text-[var(--color-text-muted)]/60 hidden sm:inline">·</span>
        <span className="hidden sm:inline whitespace-nowrap">
          {doneHours}/{totalHours}h
        </span>

        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <div className="h-1.5 flex-1 rounded-full bg-[var(--color-border)] overflow-hidden min-w-[60px]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--color-accent)] to-green-400 transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="font-mono text-[10px] font-semibold w-8 text-right tabular-nums">
            {pct}%
          </span>
        </div>
      </div>

      <span className="text-[10px] text-[var(--color-text-muted)]/70 italic truncate hidden md:inline">
        {getMotivationalText(pct)}
      </span>
    </div>
  );
}
