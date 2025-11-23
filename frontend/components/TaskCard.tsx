import React from "react";
import { Task } from "../types/Task";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
}) => {
  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "#ff4444";
      case "medium":
        return "#ffaa00";
      case "low":
        return "#44ff44";
      default:
        return "#cccccc";
    }
  };

  const getStatusText = (status: Task["status"]) => {
    switch (status) {
      case "pending":
        return "Pendiente";
      case "in-progress":
        return "En Progreso";
      case "completed":
        return "Completada";
      default:
        return status;
    }
  };

  const isOverdue =
    new Date(task.deadline) < new Date() && task.status !== "completed";

  const handleDelete = () => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta tarea?")) {
      onDelete(task.id);
    }
  };

  return (
    <div className={`task-card ${isOverdue ? "overdue" : ""}`}>
      <div className="task-header">
        <h3 className="task-title">{task.title}</h3>
        <div className="task-actions">
          <button
            onClick={() => onEdit(task)}
            className="btn-icon"
            title="Editar"
          >
            ✏️
          </button>
          <button onClick={handleDelete} className="btn-icon" title="Eliminar">
            🗑️
          </button>
        </div>
      </div>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      <div className="task-meta">
        <div className="task-info">
          <span className="task-deadline">
            📅 {new Date(task.deadline).toLocaleDateString()}
          </span>
          {task.category && (
            <span className="task-category">🏷️ {task.category}</span>
          )}
        </div>

        <div className="task-status">
          <span
            className="priority-badge"
            style={{ backgroundColor: getPriorityColor(task.priority) }}
          >
            {task.priority}
          </span>
          <span className={`status-badge status-${task.status}`}>
            {getStatusText(task.status)}
          </span>
        </div>
      </div>

      {isOverdue && (
        <div className="overdue-warning">⚠️ Esta tarea está vencida</div>
      )}
    </div>
  );
};
