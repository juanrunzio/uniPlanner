export interface Subject {
  id: string;
  code: string;
  name: string;
  hours: number;
  prerequisites: string[];
  category: string;
  semester?: number;
}

export interface SubjectState extends Subject {
  status: 'pending' | 'in-progress' | 'approved';
  grade?: number;
}

export interface Plan {
  id: string;
  name: string;
  subjects: SubjectState[];
}

export interface PlanExport {
  name: string;
  subjects: Subject[];
}
