import React, { useState, useEffect } from 'react';
import { FaCog, FaSyncAlt, FaPlus, FaTimes, FaGripLines } from 'react-icons/fa';

/**
 * Dashboard Component
 * 
 * A modular dashboard with draggable and configurable widgets
 * for the AGENT_LAND.SAARLAND Dashboard Concept V1
 */
const Dashboard = ({ 
  widgets = [],
  availableWidgets = [],
  title = 'AGENT_LAND.SAARLAND',
  subtitle = 'Dashboard',
  onLayoutChange = () => {}
}) => {
  const [activeWidgets, setActiveWidgets] = useState(widgets);
  const [editMode, setEditMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedWidget, setDraggedWidget] = useState(null);
  const [addWidgetModalOpen, setAddWidgetModalOpen] = useState(false);
  
  // Apply layout changes when activeWidgets changes
  useEffect(() => {
    onLayoutChange(activeWidgets);
  }, [activeWidgets, onLayoutChange]);
  
  // Handle adding a widget
  const handleAddWidget = (widgetType) => {
    const widgetToAdd = availableWidgets.find(w => w.type === widgetType);
    
    if (widgetToAdd) {
      const newWidget = {
        ...widgetToAdd,
        id: `widget-${Date.now()}`, // Generate unique ID
        position: activeWidgets.length // Add to the end
      };
      
      setActiveWidgets([...activeWidgets, newWidget]);
    }
    
    setAddWidgetModalOpen(false);
  };
  
  // Handle removing a widget
  const handleRemoveWidget = (widgetId) => {
    const updatedWidgets = activeWidgets
      .filter(w => w.id !== widgetId)
      .map((widget, index) => ({
        ...widget,
        position: index // Update positions
      }));
    
    setActiveWidgets(updatedWidgets);
  };
  
  // Handle widget drag start
  const handleDragStart = (e, widget) => {
    setIsDragging(true);
    setDraggedWidget(widget);
  };
  
  // Handle widget drag end
  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedWidget(null);
  };
  
  // Handle widget drag over
  const handleDragOver = (e, targetWidget) => {
    e.preventDefault();
    
    if (!draggedWidget || draggedWidget.id === targetWidget.id) {
      return;
    }
    
    // Reorder widgets
    const reorderedWidgets = [...activeWidgets];
    const draggedIndex = reorderedWidgets.findIndex(w => w.id === draggedWidget.id);
    const targetIndex = reorderedWidgets.findIndex(w => w.id === targetWidget.id);
    
    // Remove dragged widget
    const [removed] = reorderedWidgets.splice(draggedIndex, 1);
    
    // Insert at target position
    reorderedWidgets.splice(targetIndex, 0, removed);
    
    // Update positions
    const updatedWidgets = reorderedWidgets.map((widget, index) => ({
      ...widget,
      position: index
    }));
    
    setActiveWidgets(updatedWidgets);
  };
  
  // Render add widget modal
  const renderAddWidgetModal = () => {
    if (!addWidgetModalOpen) return null;
    
    return (
      <div className="add-widget-modal">
        <div className="modal-content">
          <div className="modal-header">
            <h3>Add Widget</h3>
            <button 
              className="close-button"
              onClick={() => setAddWidgetModalOpen(false)}
            >
              <FaTimes />
            </button>
          </div>
          
          <div className="widget-options">
            {availableWidgets.map(widget => (
              <div 
                key={widget.type}
                className="widget-option"
                onClick={() => handleAddWidget(widget.type)}
              >
                <div className="widget-icon">
                  {widget.icon}
                </div>
                <div className="widget-info">
                  <h4>{widget.title}</h4>
                  <p>{widget.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>{title}</h1>
          <h2>{subtitle}</h2>
        </div>
        
        <div className="dashboard-actions">
          <button 
            className="action-button"
            onClick={() => setActiveWidgets([...activeWidgets])}
            title="Refresh Dashboard"
          >
            <FaSyncAlt />
          </button>
          
          <button 
            className={`action-button ${editMode ? 'active' : ''}`}
            onClick={() => setEditMode(!editMode)}
            title="Edit Dashboard"
          >
            <FaCog />
          </button>
          
          {editMode && (
            <button 
              className="action-button"
              onClick={() => setAddWidgetModalOpen(true)}
              title="Add Widget"
            >
              <FaPlus />
            </button>
          )}
        </div>
      </div>
      
      <div className="widgets-container">
        {activeWidgets
          .sort((a, b) => a.position - b.position)
          .map(widget => (
            <div 
              key={widget.id}
              className={`widget-wrapper ${editMode ? 'edit-mode' : ''} ${isDragging && draggedWidget?.id === widget.id ? 'dragging' : ''}`}
              draggable={editMode}
              onDragStart={(e) => handleDragStart(e, widget)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, widget)}
            >
              <div className="widget-inner">
                {editMode && (
                  <div className="widget-controls">
                    <div className="drag-handle">
                      <FaGripLines />
                    </div>
                    <button 
                      className="remove-widget"
                      onClick={() => handleRemoveWidget(widget.id)}
                    >
                      <FaTimes />
                    </button>
                  </div>
                )}
                <div className="widget-content">
                  <div className="widget-header">
                    <h3>{widget.title}</h3>
                  </div>
                  <div className="widget-body">
                    {widget.component}
                  </div>
                </div>
              </div>
            </div>
          ))}
        
        {activeWidgets.length === 0 && !editMode && (
          <div className="empty-dashboard">
            <p>No widgets added to dashboard yet.</p>
            <button 
              className="add-widgets-button"
              onClick={() => {
                setEditMode(true);
                setAddWidgetModalOpen(true);
              }}
            >
              <FaPlus className="button-icon" />
              Add Widgets
            </button>
          </div>
        )}
        
        {activeWidgets.length === 0 && editMode && (
          <div className="empty-dashboard edit-mode">
            <p>Click the "+" button to add widgets to your dashboard.</p>
          </div>
        )}
      </div>
      
      {renderAddWidgetModal()}
      
      <style jsx>{`
        .dashboard-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1.5rem;
        }
        
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        
        .dashboard-title h1 {
          margin: 0;
          font-size: 1.75rem;
          font-weight: 700;
          color: #333;
        }
        
        .dashboard-title h2 {
          margin: 0.25rem 0 0;
          font-size: 1rem;
          font-weight: 400;
          color: #666;
        }
        
        .dashboard-actions {
          display: flex;
          gap: 0.5rem;
        }
        
        .action-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 4px;
          border: 1px solid #ddd;
          background-color: #fff;
          color: #555;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .action-button:hover {
          background-color: #f5f5f5;
        }
        
        .action-button.active {
          background-color: #3a6ea5;
          color: white;
          border-color: #3a6ea5;
        }
        
        .widgets-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        
        .widget-wrapper {
          min-height: 250px;
        }
        
        .widget-wrapper.edit-mode {
          cursor: grab;
        }
        
        .widget-wrapper.dragging {
          opacity: 0.5;
        }
        
        .widget-inner {
          height: 100%;
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          position: relative;
        }
        
        .widget-controls {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem;
          background-color: rgba(0, 0, 0, 0.05);
        }
        
        .drag-handle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          cursor: grab;
          color: #777;
        }
        
        .remove-widget {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border: none;
          background-color: transparent;
          color: #d9534f;
          cursor: pointer;
        }
        
        .widget-content {
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .widget-header {
          padding: 1rem;
          border-bottom: 1px solid #eee;
        }
        
        .widget-header h3 {
          margin: 0;
          font-size: 1.1rem;
          color: #333;
        }
        
        .widget-body {
          flex: 1;
          padding: 1rem;
          overflow: auto;
        }
        
        .empty-dashboard {
          grid-column: 1 / -1;
          text-align: center;
          padding: 3rem 1rem;
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .empty-dashboard p {
          margin: 0 0 1.5rem;
          color: #777;
        }
        
        .add-widgets-button {
          display: inline-flex;
          align-items: center;
          padding: 0.75rem 1.25rem;
          background-color: #3a6ea5;
          color: white;
          border: none;
          border-radius: 4px;
          font-weight: 500;
          cursor: pointer;
        }
        
        .button-icon {
          margin-right: 0.5rem;
        }
        
        .add-widget-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        
        .modal-content {
          width: 500px;
          max-width: 90%;
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          max-height: 80vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid #eee;
        }
        
        .modal-header h3 {
          margin: 0;
          font-size: 1.25rem;
        }
        
        .close-button {
          background: none;
          border: none;
          font-size: 1rem;
          color: #777;
          cursor: pointer;
        }
        
        .widget-options {
          padding: 1rem;
          overflow-y: auto;
          max-height: 60vh;
        }
        
        .widget-option {
          display: flex;
          padding: 1rem;
          border: 1px solid #eee;
          border-radius: 4px;
          margin-bottom: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .widget-option:hover {
          background-color: #f8f9fa;
          border-color: #ddd;
        }
        
        .widget-option:last-child {
          margin-bottom: 0;
        }
        
        .widget-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 50px;
          height: 50px;
          background-color: rgba(58, 110, 165, 0.1);
          color: #3a6ea5;
          border-radius: 8px;
          margin-right: 1rem;
          font-size: 1.5rem;
        }
        
        .widget-info {
          flex: 1;
        }
        
        .widget-info h4 {
          margin: 0 0 0.5rem;
          font-size: 1rem;
        }
        
        .widget-info p {
          margin: 0;
          font-size: 0.875rem;
          color: #777;
        }
        
        @media (max-width: 768px) {
          .dashboard-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          
          .widgets-container {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;