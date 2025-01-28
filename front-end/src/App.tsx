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
import { Template, Task } from './types';
import { Sidebar } from './components/Sidebar';
import { TaskBox } from './components/TaskBox';
import { TaskForm } from './components/TaskForm';

const App: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [masterTasks, setMasterTasks] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const fetchTemplates = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8080/master');
      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }
      const data = await response.json();
      console.log('Fetched data:', data); // Add a console log to see the fetched data
  
      // Map backend response to the Template format
      const templates: Template[] = data.map((item: any) => ({
        id: item.id.toString(),
        name: item.name,
        description: item.description,
        tasks: [
          {
            id: item.id.toString(),
            label: item.name, // Ensure the template name is properly set here
            description: item.description,
          },
        ],
      }));
  
      setMasterTasks(templates); // Update the state with the fetched templates
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  }, []);
  

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleMasterTaskClick = useCallback((template: Template) => {
    setSelectedTemplate(template);
  }, []);

  const handleCreateTask = useCallback(() => {
    setEditingTask(null);
    setShowForm(true);
  }, []);

  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  }, []);

  const handleFormSave = useCallback((formData: Partial<Task>) => {
    if (!selectedTemplate) return;

    setSelectedTemplate((prev) => {
      if (!prev) return prev;
      const updatedTasks = editingTask
        ? prev.tasks.map((t) => (t.id === editingTask.id ? { ...t, ...formData } : t))
        : [...prev.tasks, { id: Date.now().toString(), ...formData } as Task];
      return { ...prev, tasks: updatedTasks };
    });
    setShowForm(false);
  }, [selectedTemplate, editingTask]);

  const handleFormDelete = useCallback((taskId: string) => {
    if (!selectedTemplate) return;

    setSelectedTemplate((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        tasks: prev.tasks.filter((t) => t.id !== taskId),
      };
    });
    setShowForm(false);
  }, [selectedTemplate]);

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
            onClose={() => setSelectedTemplate(null)}
            setNodes={setNodes}
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
