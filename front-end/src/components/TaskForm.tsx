import React, { useState, useEffect } from 'react';

interface Task {
  id: string;
  name: string;
  label:string;
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
  parent_id:number;
}

interface Template {
  id: string;
  name: string;
  description: string;
  tasks: Task[];
}

interface Section {
  id: string;
  label: string;
  type: string;
  required: boolean;
  options?: string[];
}

interface TaskFormProps {
  template: Template;
  task?: Task;
  onClose: () => void;
  onSave: (formData: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
}

const buttonStyle = {
  padding: '8px 16px',
  borderRadius: '4px',
  border: 'none',
  color: 'white',
  cursor: 'pointer',
  backgroundColor: '#007bff'
};

export const TaskForm: React.FC<TaskFormProps> = ({
  template,
  task,
  onClose,
  onSave,
  onDelete,
}) => {
  const [formData, setFormData] = useState<Partial<Task>>({});
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Define form sections
    const formSections: Section[] = [
      { id: 'name', label: 'Name', type: 'text', required: true },
      { id: 'slug', label: 'Slug', type: 'text', required: true },
      { id: 'description', label: 'Description', type: 'text', required: true },
      { id: 'help_text', label: 'Help Text', type: 'text', required: true },
      { id: 'input_format', label: 'Input Format', type: 'text', required: true },
      { id: 'output_format', label: 'Output Format', type: 'text', required: true },
      { id: 'dependent_task_slug', label: 'Dependent Task Slug', type: 'text', required: false },
      { id: 'repeats_on', label: 'Repeats On', type: 'number', required: false },
      { id: 'bulk_input', label: 'Bulk Input', type: 'select', options: ['TRUE', 'FALSE'], required: false },
      { id: 'input_http_method', label: 'HTTP Method', type: 'number', options: ['0', '1', '2'], required: true },
      { id: 'api_endpoint', label: 'API Endpoint', type: 'text', required: true },
      { id: 'api_timeout_in_ms', label: 'API Timeout (ms)', type: 'number', required: true },
      { id: 'response_type', label: 'Response Type', type: 'number', required: true },
      { id: 'is_json_input_needed', label: 'JSON Input Needed', type: 'select', options: ['TRUE', 'FALSE'], required: true },
      { id: 'task_type', label: 'Task Type', type: 'number', required: true },
      { id: 'is_active', label: 'Is Active', type: 'select', options: ['TRUE', 'FALSE'], required: true },
      { id: 'is_optional', label: 'Is Optional', type: 'select', options: ['TRUE', 'FALSE'], required: true },
      { id: 'eta', label: 'ETA', type: 'text', required: true },
      { id: 'service_id', label: 'Service ID', type: 'number', required: true },
      { id: 'email_list', label: 'Email List', type: 'text', required: false },
      { id: 'action', label: 'Action', type: 'text', required: true }
    ];
    setSections(formSections);

    // Initialize form data with task data if editing
    if (task) {
      setFormData({
        name: task.name,
        description: task.description,
        slug: task.slug,
        help_text: task.help_text,
        input_format: JSON.stringify(task.input_format),
        output_format: JSON.stringify(task.output_format),
        dependent_task_slug: task.dependent_task_slug,
        repeats_on: task.repeats_on,
        bulk_input: task.bulk_input,
        input_http_method: task.input_http_method,
        api_endpoint: task.api_endpoint,
        api_timeout_in_ms: task.api_timeout_in_ms,
        response_type: task.response_type,
        is_json_input_needed: task.is_json_input_needed,
        task_type: task.task_type,
        is_active: task.is_active,
        is_optional: task.is_optional,
        eta: JSON.stringify(task.eta),
        service_id: task.service_id,
        email_list: task.email_list,
        action: task.action
      });
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = task 
        ? `http://localhost:8080/task/${task.id}`
        : 'http://localhost:8080/task';

        // console.log(endpoint);

      const method = task ? 'PUT' : 'POST';
      const body = task 
        ? formData 
        : { ...formData, parent_id: template.id};

      // console.log(method);
      // console.log(body);
      // console.log(body.output_format);

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      console.log(response);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      onSave(formData);
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Failed to save task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!task || !window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/master/${task.id}`, { 
        method: 'DELETE' 
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      onDelete(task.id);
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task. Please try again.');
    }
  };

  const renderField = (section: Section) => {
    const value = formData[section.id as keyof Task];

    if (section.type === 'json') {
      return (
        <textarea
          value={value ? JSON.stringify(value, null, 2) : ''}
          onChange={e => {
            try {
              const parsed = JSON.parse(e.target.value);
              setFormData({ ...formData, [section.id]: parsed });
            } catch {
              setFormData({ ...formData, [section.id]: e.target.value });
            }
          }}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontFamily: 'monospace',
            minHeight: '100px'
          }}
          required={section.required}
        />
      );
    }

    if (section.type === 'select') {
      const selectValue = typeof value === 'boolean' ? (value ? 'TRUE' : 'FALSE') : value?.toString();
      return (
        <select
          value={selectValue || ''}
          onChange={e => {
            const newValue = e.target.value === 'TRUE' ? true : 
                           e.target.value === 'FALSE' ? false : 
                           e.target.value;
            setFormData({ ...formData, [section.id]: newValue });
          }}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}
          required={section.required}
        >
          <option value="">Select {section.label}</option>
          {section.options?.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      );
    }

    return (
      <input
        type={section.type}
        value={value !== undefined ? value : ''}
        onChange={e => {
          const newValue = section.type === 'number' 
            ? Number(e.target.value) 
            : e.target.value;
          setFormData({ ...formData, [section.id]: newValue });
        }}
        style={{
          width: '100%',
          padding: '8px',
          border: '1px solid #ddd',
          borderRadius: '4px'
        }}
        required={section.required}
      />
    );
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '8px',
        padding: '20px',
        width: '800px',
        maxWidth: '90%',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h3 style={{ margin: 0 }}>
            {task ? 'Edit Task' : 'Create Task'} - {template?.name}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {sections.map(section => (
            <div key={section.id} style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                {section.label}
                {section.required && <span style={{ color: 'red' }}>*</span>}
              </label>
              {renderField(section)}
            </div>
          ))}

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '20px'
          }}>
            {task && (
              <button
                type="button"
                onClick={handleDelete}
                style={{
                  ...buttonStyle,
                  backgroundColor: '#dc3545'
                }}
                disabled={loading}
              >
                Delete
              </button>
            )}
            <div style={{ marginLeft: 'auto' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  ...buttonStyle,
                  backgroundColor: '#6c757d',
                  marginRight: '10px'
                }}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={buttonStyle}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;