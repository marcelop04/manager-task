import React, { useState } from "react";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { Task } from "../types/Task";
import { KanbanColumn } from "../components/KanbanColumn";
import { TaskForm } from "../components/TaskForm";
import { useTasks } from "../hooks/useTasks";

export const Kanban: React.FC = () => {
  const {
    tasks,
    loading,
    error,
    updateTaskStatus,
    createTask,
    updateTask,
    deleteTask,
  } = useTasks();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showForm, setShowForm] = useState(false);

  const pendingTasks = tasks.filter((task) => task.status === "pending");
  const inProgressTasks = tasks.filter((task) => task.status === "in-progress");
  const completedTasks = tasks.filter((task) => task.status === "completed");

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const taskId = parseInt(result.draggableId);
    const newStatus = result.destination.droppableId as Task["status"];

    try {
      await updateTaskStatus(taskId, newStatus);
    } catch (err) {
      console.error("Error updating task status:", err);
    }
  };

  const handleCreateTask = async (
    taskData: Omit<Task, "id" | "created_at">
  ) => {
    try {
      await createTask(taskData);
      setShowForm(false);
    } catch (err) {
      console.error("Error creating task:", err);
    }
  };

  const handleUpdateTask = async (
    taskData: Omit<Task, "id" | "created_at">
  ) => {
    if (!editingTask) return;

    try {
      await updateTask(editingTask.id, taskData);
      setEditingTask(null);
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  if (loading) {
    return <div className="loading">Cargando tablero...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="kanban-page">
      <div className="page-header">
        <h1>Tablero Kanban</h1>
        <button onClick={() => setShowForm(true)} className="btn btn-primary">
          ➕ Nueva Tarea
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="kanban-board">
          <KanbanColumn
            title="Pendiente"
            tasks={pendingTasks}
            status="pending"
            onEditTask={setEditingTask}
            onDeleteTask={deleteTask}
          />

          <KanbanColumn
            title="En Progreso"
            tasks={inProgressTasks}
            status="in-progress"
            onEditTask={setEditingTask}
            onDeleteTask={deleteTask}
          />

          <KanbanColumn
            title="Completada"
            tasks={completedTasks}
            status="completed"
            onEditTask={setEditingTask}
            onDeleteTask={deleteTask}
          />
        </div>
      </DragDropContext>

      {/* Modal de Formulario */}
      {(showForm || editingTask) && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editingTask ? "Editar Tarea" : "Nueva Tarea"}</h2>
            <TaskForm
              task={editingTask}
              onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
              onCancel={() => {
                setShowForm(false);
                setEditingTask(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
