import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  useEdgesState,
  useNodesState,
  Node,
  XYPosition,
} from 'reactflow';
import 'reactflow/dist/style.css';

// Import the Sidebar component
import { Sidebar } from './components/Sidebar';
import { TaskBox } from './components/TaskBox';
import { TaskForm } from './components/TaskForm';

// Add the buttonStyle export
export const buttonStyle = {
  padding: '8px 16px',
  borderRadius: '4px',
  border: 'none',
  color: 'white',
  cursor: 'pointer',
  backgroundColor: '#007bff'
};

// Define the Template interface
export interface Template {
  id: string;
  name: string;
  description: string;
  tasks: Task;
  parentTaskId?: string; // Add this optional property
}

// Define the Task interface
export interface Task {
  id: string;
  label: string;
  description: string;
  slug: string;
  help_text: string;
  input_format: any;
  output_format: any;
  dependent_task_slug: string;
  repeats_on: number;
  bulk_input: boolean;
  input_http_method: number;
  api_endpoint: string;
  api_timeout_in_ms: number;
  response_type: number;
  is_json_input_needed: boolean;
  task_type: number;
  is_active: boolean;
  is_optional: boolean;
  eta: any;
  service_id: number;
  email_list: string;
  action: string;
}

const App: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [masterTasks, setMasterTasks] = useState<Template[]>([]);
  const [childTasks,setChildTasks] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  // const [master, setMaster] = useState<Task | null>(null);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const fetchTemplates = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8080/master');
      if (!response.ok) {
        throw new Error(`Failed to fetch templates: ${response.statusText}`);
      }
      const data = await response.json();

      const templates: Template[] = data.map((item: any) => ({
        id: item.id.toString(),
        name: item.name,
        description: item.description,
        tasks: [
          {
            id: item.id.toString(),
            label: item.name,
            description: item.description,
            slug: item.slug,
            help_text: item.help_text,
            input_format: JSON.stringify(item.input_format),
            output_format: JSON.stringify(item.output_format),
            dependent_task_slug: item.dependent_task_slug,
            repeats_on: item.repeats_on,
            bulk_input: item.bulk_input,
            input_http_method: item.input_http_method,
            api_endpoint: item.api_endpoint,
            api_timeout_in_ms: item.api_timeout_in_ms,
            response_type: item.response_type,
            is_json_input_needed: item.is_json_input_needed,
            task_type: item.task_type,
            is_active: item.is_active,
            is_optional: item.is_optional,
            eta: JSON.stringify(item.eta),
            service_id: item.service_id,
            email_list: item.email_list,
            action: item.action
          },
        ],
      }));

      setMasterTasks(templates);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const fetchChildTasks = useCallback(async (parentTaskId: string) => {
    try {
      const response = await fetch(`http://localhost:8080/master/task/${parentTaskId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch child tasks: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching child tasks:', error);
      return [];
    }
  }, []);

  const handleMasterTaskClick = useCallback(async (template: Template) => {
    // setIsLoading(true);
    try {
      const childTasks = await fetchChildTasks(template.id);
      setSelectedTemplate({ ...template, tasks: childTasks, parentTaskId: template.id });
    } catch (error) {
      console.error('Error in handleMasterTaskClick:', error);
    } finally {
      // setIsLoading(false);
    }
  }, [fetchChildTasks]);

  const handleCreateTask = useCallback((task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  }, []);

  const handleEditTask = useCallback((task: Task) => {
    console.log(task);
    setEditingTask(task);
    setShowForm(true);
  }, []);

  const handleFormSave = useCallback(
    async (formData: Partial<Task>) => {
      if (!selectedTemplate) return;

      // setSelectedTemplate((prev) => {
      //   if (!prev) return prev;
      //   const updatedTasks = editingTask
      //     ? prev.tasks.map((t) => (t.id === editingTask.id ? { ...t, ...formData } : t))
      //     : [...prev.tasks, { id: Date.now().toString(), ...formData } as Task];
      //   return { ...prev, tasks: updatedTasks };
      // });
      const childTasks = await fetchChildTasks(selectedTemplate.id);
      setSelectedTemplate({ ...selectedTemplate, tasks: childTasks, parentTaskId: selectedTemplate.id });

      setShowForm(false);
    },
    [selectedTemplate, editingTask]
  );

  const handleFormDelete = useCallback(
    (taskId: string) => {
      if (!selectedTemplate) return;

      setSelectedTemplate((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          tasks: prev.tasks.filter((t) => t.id !== taskId),
        };
      });
      setShowForm(false);
    },
    [selectedTemplate]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = document.querySelector('.react-flow')?.getBoundingClientRect();
      const task = JSON.parse(event.dataTransfer.getData('application/json')) as Task;

      if (!reactFlowBounds) return;

      const position: XYPosition = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };

      const newNode: Node = {
        id: `${task.id}-${Date.now()}`,
        type: 'default',
        position,
        data: { label: task.label },
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes]
  );

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
        masterTasks={masterTasks}
        onMasterTaskClick={handleMasterTaskClick}
      />

      <div style={{ flexGrow: 1, position: 'relative' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={(connection) => setEdges((eds) => addEdge(connection, eds))}
          onDragOver={onDragOver}
          onDrop={onDrop}
          fitView
        >
          <Controls />
          <Background />
        </ReactFlow>

        {selectedTemplate && (
          <TaskBox
            template={selectedTemplate}
            tasks={selectedTemplate.tasks}
            onCreate={handleCreateTask}
            onEdit={handleEditTask}
            // master = {master || undefined}
            onClose={() => setSelectedTemplate(null)}
            setNodes={setNodes}
            parentTaskId={selectedTemplate.parentTaskId}
          />
        )}

        {showForm && selectedTemplate && (
          <TaskForm
            template={selectedTemplate}
            task={editingTask || undefined}
            onClose={() => setShowForm(false)}
            onSave={handleFormSave}
            onDelete={handleFormDelete}
          />
        )}
      </div>
    </div>
  );
};

export default App;