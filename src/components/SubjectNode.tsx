import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

const STATUS_STYLES: Record<string, { border: string; bg: string; dot: string; label: string }> = {
  approved: {
    border: 'border-green-400 dark:border-green-500',
    bg: 'bg-green-100 dark:bg-green-900/40',
    dot: 'bg-green-500',
    label: 'text-green-700 dark:text-green-300',
  },
  'in-progress': {
    border: 'border-yellow-400 dark:border-yellow-500',
    bg: 'bg-yellow-100 dark:bg-yellow-900/40',
    dot: 'bg-yellow-500',
    label: 'text-yellow-700 dark:text-yellow-300',
  },
  pending: {
    border: 'border-gray-300 dark:border-gray-600',
    bg: 'bg-white dark:bg-gray-800',
    dot: 'bg-gray-400',
    label: 'text-gray-500 dark:text-gray-400',
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
        ${style.border} ${style.bg} text-gray-800 dark:text-gray-100 ${opacity} ${highlight}
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
        <div className="text-[10px] font-mono leading-tight opacity-60">
          {nodeData.code as string}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${style.dot}`} />
          <span className="text-xs font-semibold leading-tight line-clamp-2">
            {nodeData.name as string}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1 text-[10px] opacity-60">
          <span>{nodeData.hours as number}h</span>
          <span className={`capitalize font-medium ${style.label}`}>{status}</span>
        </div>
      </div>
    </div>
  );
}

export default memo(SubjectNode);
