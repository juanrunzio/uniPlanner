import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

const STATUS_STYLES: Record<string, { border: string; bg: string }> = {
  approved: {
    border: 'border-green-500 dark:border-green-400',
    bg: 'bg-green-50 dark:bg-green-900/20',
  },
  'in-progress': {
    border: 'border-yellow-500 dark:border-yellow-400',
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
  },
  pending: {
    border: 'border-gray-300 dark:border-gray-600',
    bg: 'bg-white dark:bg-gray-800',
  },
};

function SubjectNode({ data, selected }: NodeProps) {
  const nodeData = data as Record<string, unknown>;
  const status = (nodeData.status as string) ?? 'pending';
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.pending;
  const opacity = nodeData.isDimmed ? 'opacity-30' : 'opacity-100';
  const highlight = nodeData.isHighlighted ? 'ring-2 ring-[var(--color-accent)]' : '';

  return (
    <div
      className={`
        relative min-w-[140px] max-w-[200px] rounded-lg border-2 shadow-sm
        ${style.border} ${style.bg} ${opacity} ${highlight}
        ${selected ? 'ring-2 ring-[var(--color-accent)]' : ''}
        transition-opacity duration-200
      `}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-gray-400 !w-2 !h-2 !border-2 !border-white dark:!border-gray-700"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-gray-400 !w-2 !h-2 !border-2 !border-white dark:!border-gray-700"
      />

      <div className="px-3 py-2">
        <div className="text-[10px] font-mono text-[var(--color-text-muted)] leading-tight">
          {nodeData.code as string}
        </div>
        <div className="text-xs font-medium leading-tight mt-0.5 line-clamp-2">
          {nodeData.name as string}
        </div>
        <div className="flex items-center gap-2 mt-1 text-[10px] text-[var(--color-text-muted)]">
          <span>{nodeData.hours as number}h</span>
          <span className="capitalize">{status}</span>
        </div>
      </div>
    </div>
  );
}

export default memo(SubjectNode);
