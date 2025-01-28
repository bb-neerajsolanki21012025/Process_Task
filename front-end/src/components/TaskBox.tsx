import React from 'react';
import { Template, Task } from '../types';
import { buttonStyle } from '../styles';
import { Node } from 'reactflow';

interface TaskBoxProps {
  template: Template;
  tasks: Task[];
  onCreate: () => void;
  onEdit: (task: Task) => void;
  onClose: () => void;
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
}

export const TaskBox: React.FC<TaskBoxProps> = ({
  template,
  tasks = [], // Ensure tasks has a default value of an empty array
  onCreate,
  onEdit,
  onClose,
  setNodes,
}) => {
  const onDragStart = (event: React.DragEvent, task: Task) => {
    event.dataTransfer.setData('application/json', JSON.stringify(task));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: '10%',
        left: '10%',
        width: '300px',
        backgroundColor: '#fff',
        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
        borderRadius: '8px',
        padding: '20px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px',
        }}
      >
        <h3 style={{ margin: 0 }}>{template.label}</h3>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '0 5px',
          }}
        >
          ×
        </button>
      </div>
      <button
        onClick={onCreate}
        style={{ ...buttonStyle, marginBottom: '10px', width: '100%' }}
      >
        Create Task
      </button>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <li
              key={task.id}
              draggable
              onDragStart={(e) => onDragStart(e, task)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px',
                padding: '5px 10px',
                backgroundColor: '#f1f1f1',
                borderRadius: '4px',
                cursor: 'grab',
              }}
            >
              {task.label}
              <button
                onClick={() => onEdit(task)}
                style={buttonStyle}
              >
                Edit
              </button>
            </li>
          ))
        ) : (
          <li
            style={{
              textAlign: 'center',
              color: '#666',
              marginTop: '10px',
            }}
          >
            No tasks available.
          </li>
        )}
      </ul>
    </div>
  );
};
