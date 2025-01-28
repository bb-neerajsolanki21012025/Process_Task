import React, { useState } from 'react';
import { Template } from '../types';
import { buttonStyle } from '../styles';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  masterTasks: Template[];
  onMasterTaskClick: (template: Template) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  masterTasks,
  onMasterTaskClick,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div
      style={{
        width: isOpen ? '250px' : '50px',
        transition: 'width 0.3s',
        height: '100vh',
        backgroundColor: '#f8f9fa',
        borderRight: '1px solid #ddd',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: isOpen ? 'space-between' : 'center',
          alignItems: 'center',
          padding: '10px',
          borderBottom: '1px solid #ddd',
        }}
      >
        {isOpen && <h3 style={{ margin: 0 }}>BigBasket</h3>}
        <button
          onClick={onToggle}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '18px',
            padding: '5px',
          }}
        >
          {isOpen ? '❮' : '❯'}
        </button>
      </div>

      {isOpen && (
        <div style={{ padding: '10px' }}>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{
                ...buttonStyle,
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>Master Tasks</span>
              <span>{isDropdownOpen ? '▼' : '▲'}</span>
            </button>

            {isDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: '#fff',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  marginTop: '4px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  zIndex: 10,
                }}
              >
                {masterTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => {
                      onMasterTaskClick(task); // Pass the selected template.
                      setIsDropdownOpen(false); // Close the dropdown.
                    }}
                    style={{
                      padding: '8px 12px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #eee',
                      backgroundColor: '#fff',
                    }}
                  >
                    {task.name} {/* Display template name here */}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
