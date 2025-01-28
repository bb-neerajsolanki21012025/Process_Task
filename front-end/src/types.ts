export interface Task {
    id: string;
    label: string;
  }
  
  export interface Template {
    id: string;
    label: string;
    tasks: Task[];
  }
  
  export interface Section {
    id: string;
    label: string;
    type: 'text' | 'select';
    required?: boolean;
    options?: string[];
  }