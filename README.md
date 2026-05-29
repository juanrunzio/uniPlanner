# uniPlanner

A universal interactive university subject planner. Build prerequisite dependency maps for any degree program with a visual, draggable graph.

Inspired by [FIUBA-Map](https://github.com/FdelMazo/FIUBA-Map).

## How It Works

1. **Create a plan** for your degree (e.g., "Computer Science 2024")
2. **Add subjects** with code, name, hours/credits, and prerequisites
3. **See the map** — subjects render as nodes connected by arrows showing prerequisite relationships
4. **Click a node** to highlight its prerequisites and dependents
5. **Double-click a node** to cycle its status: pending → in-progress → approved
6. **Drag nodes** to rearrange, or reload to reset the auto layout
7. **Track progress** in the sidebar with status dots and counts

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Build | Vite + React 18 + TypeScript |
| Graph | @xyflow/react (ReactFlow) |
| Layout | dagre (hierarchical left-to-right) |
| State | Zustand + localStorage persistence |
| Styling | Tailwind CSS v4 |
| Icons | lucide-react |

## Project Structure

```
src/
├── types.ts                  # Subject, SubjectState, Plan type definitions
├── store.ts                  # Zustand store (plans CRUD, dark mode, persistence)
├── examplePlan.ts            # Pre-loaded Computer Science example plan
├── App.tsx                   # Root layout: header + sidebar + graph canvas
├── main.tsx                  # Entry point
├── index.css                 # Tailwind directives + CSS custom properties
└── components/
    ├── Header.tsx            # Plan selector dropdown, dark mode toggle
    ├── Sidebar.tsx           # Plan management, import/export, subject CRUD
    ├── SubjectForm.tsx       # Add/edit subject form
    ├── SubjectList.tsx       # Subjects grouped by category with status dots
    ├── SubjectNode.tsx       # Custom ReactFlow node (code, name, hours, status)
    └── GraphCanvas.tsx       # ReactFlow canvas with dagre auto-layout
```

## Data Model

```typescript
interface Subject {
  id: string;           // Unique identifier
  code: string;         // e.g. "CS101"
  name: string;         // e.g. "Introduction to Programming"
  hours: number;        // Credits, weekly hours, or whatever you prefer
  prerequisites: string[]; // IDs of prerequisite subjects
  category: string;     // e.g. "Required", "Elective"
  semester?: number;    // Optional semester/term number
}

interface SubjectState extends Subject {
  status: 'pending' | 'in-progress' | 'approved';
  grade?: number;       // Optional grade (0-10)
}

interface Plan {
  id: string;
  name: string;
  subjects: SubjectState[];
}
```

## Features

- **Subject CRUD** — add, edit, delete subjects with all fields
- **Prerequisite graph** — arrows flow from prerequisite → dependent
- **Node highlighting** — click a node to highlight its prerequisite chain and dependents
- **Status tracking** — three states: pending (gray), in-progress (yellow), approved (green)
- **Draggable nodes** — rearrange the graph to your preference
- **Auto-layout** — dagre produces a hierarchical left-to-right layout by semester
- **Multiple plans** — manage several degree plans at once via the header dropdown
- **Import/Export** — share plans as JSON files
- **Dark mode** — toggle in the header, persisted in localStorage
- **Collapsible sidebar** — maximize graph space when needed
- **Pre-loaded example** — a 12-subject Computer Science plan to demonstrate the tool

## Interactions

| Action | Result |
|--------|--------|
| **Click node** | Highlights that node's full dependency chain (prerequisites + dependents), dims others |
| **Double-click node** | Cycles status: pending → in-progress → approved → pending |
| **Click empty canvas** | Clears selection / un-highlights |
| **Click status dot** (sidebar) | Cycles subject status |
| **Drag node** | Moves node (position persists until re-layout) |
| **Zoom/pan** | Standard ReactFlow controls + scroll wheel |

## Getting Started

```bash
npm install
npm run dev        # → http://localhost:5173
```

On first load, click **"Load Example Plan"** in the sidebar to see how it works, or create your own plan.

## Build

```bash
npm run build      # Outputs to dist/
```
