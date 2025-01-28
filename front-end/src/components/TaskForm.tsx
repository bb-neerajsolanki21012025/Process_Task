import React, { useState, useEffect } from 'react';
import { Task, Template, Section } from '../types';
import { buttonStyle } from '../styles';

interface TaskFormProps {
  template: Template;
  task?: Task;
  onClose: () => void;
  onSave: (formData: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  template,
  task,
  onClose,
  onSave,
  onDelete,
}) => {
  const [formData, setFormData] = useState<Partial<Task>>(task || {});
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);

  useEffect(() => {
    // Fetch templates from the backend
    const fetchTemplates = async () => {
      try {
        const response = await fetch('http://localhost:8080/master');
        const data = await response.json();
        setTemplates(data);
      } catch (error) {
        console.error('Error fetching templates:', error);
      }
    };

    fetchTemplates();
  }, []);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const sections = [
          { id: 'name', label: 'Name', type: 'text', required: true },
          { id: 'slug', label: 'Slug', type: 'text', required: true },
          { id: 'description', label: 'Description', type: 'text', required: true },
          { id: 'help_text', label: 'Help Text', type: 'text', required: true },
          { id: 'input_format', label: 'Input Format', type: 'json', required: true },
          { id: 'output_format', label: 'Output Format', type: 'json', required: true },
          { id: 'dependent_task_slug', label: 'Dependent Task Slug', type: 'text', required: false },
          { id: 'repeats_on', label: 'Repeats On', type: 'text', required: false },
          { id: 'bulk_input', label: 'Bulk Input', type: 'text', required: false },
          {
            id: 'input_http_method',
            label: 'HTTP Method',
            type: 'select',
            options: ['0', '1', '2'],
            required: true
          },
          { id: 'api_endpoint', label: 'API Endpoint', type: 'text', required: true },
          { id: 'api_timeout_in_ms', label: 'API Timeout (ms)', type: 'number', required: true },
          { id: 'response_type', label: 'Response Type', type: 'text', required: true },
          {
            id: 'is_json_input_needed',
            label: 'JSON Input Needed',
            type: 'select',
            options: ['TRUE', 'FALSE'],
            required: true
          },
          { id: 'task_type', label: 'Task Type', type: 'text', required: true },
          {
            id: 'is_active',
            label: 'Is Active',
            type: 'select',
            options: ['TRUE', 'FALSE'],
            required: true
          },
          {
            id: 'is_optional',
            label: 'Is Optional',
            type: 'select',
            options: ['TRUE', 'FALSE'],
            required: true
          },
          { id: 'eta', label: 'ETA', type: 'json', required: true },
          { id: 'service_id', label: 'Service ID', type: 'text', required: true },
          { id: 'email_list', label: 'Email List', type: 'text', required: false },
          { id: 'action', label: 'Action', type: 'text', required: true }
        ];

        setSections(sections);

        // If editing, populate form with template data
        if (template) {
          setFormData(template);
        }
      } catch (error) {
        console.error('Error fetching sections:', error);
      }
    };

    fetchSections();
  }, [template]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Replace with your API endpoints
      if (task) {
        // Update existing task
        await fetch(`/api/tasks/${task.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
        // Create new task
        await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, templateId: template.id })
        });
      }
      onSave(formData);
    } catch (error) {
      console.error('Error saving task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!task || !window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await fetch(`/api/tasks/${task.id}`, { method: 'DELETE' });
      onDelete(task.id);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const renderField = (section: Section) => {
    const value = formData[section.id as keyof Task] || '';

    if (section.type === 'json') {
      return (
        <textarea
          value={typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
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
      return (
        <select
          value={value}
          onChange={e => setFormData({ ...formData, [section.id]: e.target.value })}
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
        value={value}
        onChange={e => setFormData({ ...formData, [section.id]: e.target.value })}
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
