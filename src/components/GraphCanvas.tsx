import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeChange,
  MarkerType,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { RotateCcw } from 'lucide-react';
import { useStore } from '../store';
import SubjectNode from './SubjectNode';
import type { SubjectState } from '../types';

const nodeTypes = { subjectNode: SubjectNode };
const EMPTY_SUBJECTS: SubjectState[] = [];
const EMPTY_NODES: Node[] = [];
const EMPTY_EDGES: Edge[] = [];
const EMPTY_RESULT = { nodes: EMPTY_NODES, edges: EMPTY_EDGES };

function getLayoutedElements(
  subjects: SubjectState[],
  highlightedId: string | null,
): { nodes: Node[]; edges: Edge[] } {
  if (!subjects || subjects.length === 0) return EMPTY_RESULT;

  const dimmedIds = new Set<string>();
  const highlightedIds = new Set<string>();

  if (highlightedId) {
    highlightedIds.add(highlightedId);
    const visited = new Set<string>();
    const queue = [highlightedId];
    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);
      highlightedIds.add(current);

      for (const s of subjects) {
        if (s.prerequisites.includes(current) && !visited.has(s.id)) {
          queue.push(s.id);
        }
      }
    }

    const prereqQueue = [highlightedId];
    const prereqVisited = new Set<string>();
    while (prereqQueue.length > 0) {
      const current = prereqQueue.shift()!;
      if (prereqVisited.has(current)) continue;
      prereqVisited.add(current);
      highlightedIds.add(current);

      const currentSubject = subjects.find((s) => s.id === current);
      if (currentSubject) {
        for (const pr of currentSubject.prerequisites) {
          if (!prereqVisited.has(pr)) {
            prereqQueue.push(pr);
          }
        }
      }
    }

    for (const s of subjects) {
      if (!highlightedIds.has(s.id)) {
        dimmedIds.add(s.id);
      }
    }
  }

  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'LR', nodesep: 60, ranksep: 120, marginx: 40, marginy: 40 });

  for (const sub of subjects) {
    g.setNode(sub.id, { width: 160, height: 72 });
  }

  for (const sub of subjects) {
    for (const pr of sub.prerequisites) {
      if (subjects.some((s) => s.id === pr)) {
        g.setEdge(pr, sub.id);
      }
    }
  }

  dagre.layout(g);

  const nodes: Node[] = subjects.map((sub) => {
    const dagrePos = g.node(sub.id);
    let x = dagrePos?.x ?? 0;
    let y = dagrePos?.y ?? 0;

    if (sub.position) {
      x = sub.position.x;
      y = sub.position.y;
    }

    const nodeData: Record<string, unknown> = {
      code: sub.code,
      name: sub.name,
      hours: sub.hours,
      status: sub.status,
      category: sub.category,
      isHighlighted: highlightedIds.has(sub.id),
      isDimmed: dimmedIds.has(sub.id),
    };
    return {
      id: sub.id,
      type: 'subjectNode',
      position: { x, y },
      data: nodeData,
    };
  });

  const edges: Edge[] = [];
  for (const sub of subjects) {
    for (const pr of sub.prerequisites) {
      if (subjects.some((s) => s.id === pr)) {
        const isHighlightedEdge = highlightedId && (highlightedIds.has(sub.id) || highlightedIds.has(pr));
        edges.push({
          id: `${pr}->${sub.id}`,
          source: pr,
          target: sub.id,
          type: 'smoothstep',
          markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
          style: {
            stroke: isHighlightedEdge ? 'var(--color-accent)' : '#94a3b8',
            strokeWidth: isHighlightedEdge ? 2 : 1,
            opacity: highlightedId && !isHighlightedEdge ? 0.2 : 1,
          },
        });
      }
    }
  }

  return { nodes, edges };
}

export default function GraphCanvas() {
  const activePlan = useStore((s) => s.plans.find((p) => p.id === s.activePlanId));
  const setSubjectStatus = useStore((s) => s.setSubjectStatus);
  const setSubjectPosition = useStore((s) => s.setSubjectPosition);

  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(EMPTY_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(EMPTY_EDGES);

  const subjects = activePlan?.subjects ?? EMPTY_SUBJECTS;

  const { nodes: nextNodes, edges: nextEdges } = useMemo(
    () => getLayoutedElements(subjects, highlightedId),
    [subjects, highlightedId],
  );

  const prevLayoutRef = useRef<string>('');

  useEffect(() => {
    const statusHash = subjects.map((s) => `${s.id}:${s.status}`).join(',');
    const key = JSON.stringify({
      n: nextNodes.length,
      e: nextEdges.length,
      h: highlightedId ?? '',
      s: statusHash,
      p: subjects.filter((s) => s.position).map((s) => `${s.id}:${s.position?.x},${s.position?.y}`).join(';'),
    });
    if (key === prevLayoutRef.current) return;
    prevLayoutRef.current = key;

    setNodes(nextNodes);
    setEdges(nextEdges);
  }, [nextNodes, nextEdges, highlightedId, setNodes, setEdges, subjects]);

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes);

      for (const change of changes) {
        if (change.type === 'position' && change.position && change.dragging === false) {
          setSubjectPosition(change.id, change.position);
        }
      }
    },
    [onNodesChange, setSubjectPosition],
  );

  const handleResetLayout = useCallback(() => {
    for (const sub of subjects) {
      setSubjectPosition(sub.id, null);
    }
  }, [subjects, setSubjectPosition]);

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setHighlightedId((prev) => (prev === node.id ? null : node.id));
    },
    [],
  );

  const onNodeDoubleClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      const subject = subjects.find((s) => s.id === node.id);
      if (!subject) return;
      const order: Array<'pending' | 'in-progress' | 'approved'> = [
        'pending',
        'in-progress',
        'approved',
      ];
      const idx = order.indexOf(subject.status);
      const next = order[(idx + 1) % order.length];
      setSubjectStatus(node.id, next);
    },
    [subjects, setSubjectStatus],
  );

  const onPaneClick = useCallback(() => {
    setHighlightedId(null);
  }, []);

  const hasCustomPositions = subjects.some((s) => s.position);

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.2}
        maxZoom={2}
        defaultEdgeOptions={{
          type: 'smoothstep',
          style: { stroke: '#94a3b8', strokeWidth: 1 },
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="var(--color-border)" gap={20} />
        <Controls className="!bg-[var(--color-surface)] !border-[var(--color-border)] !rounded-lg !shadow-sm" />
        <MiniMap
          className="!bg-[var(--color-surface)] !border-[var(--color-border)] !rounded-lg"
          nodeColor={(n) => {
            const d = n.data as Record<string, unknown>;
            if (d?.status === 'approved') return '#22c55e';
            if (d?.status === 'in-progress') return '#eab308';
            return '#9ca3af';
          }}
        />
        <Panel position="top-center" className="!bg-transparent !m-0">
          <div className="flex items-center gap-2">
            {highlightedId && (
              <span className="px-3 py-1.5 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-sm">
                <span className="text-[var(--color-text-muted)]">Selected — click canvas to deselect</span>
              </span>
            )}
          </div>
        </Panel>
        <Panel position="top-right" className="!bg-transparent !m-0 !mt-12">
          {hasCustomPositions && (
            <button
              onClick={handleResetLayout}
              className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm hover:bg-[var(--color-border)] transition-colors"
              title="Reset all node positions to auto-layout"
            >
              <RotateCcw size={12} />
              Reset Layout
            </button>
          )}
        </Panel>
      </ReactFlow>
      {subjects.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-sm text-[var(--color-text-muted)]">
            Add subjects in the sidebar to see them here.
          </p>
        </div>
      )}
    </div>
  );
}
