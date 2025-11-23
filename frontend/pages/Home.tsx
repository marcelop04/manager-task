import React, { useState } from "react";
import { Task } from "../types/Task";
import { TaskCard } from "../components/TaskCard";
import { TaskForm } from "../components/TaskForm";
import { VoiceTaskModal } from "../components/VoiceTaskModal";
import { useTasks } from "../hooks/useTasks";

export const Home: React.FC = () => {
  const { tasks, loading, error, createTask, updateTask, deleteTask } =
    useTasks();
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [prefilledTaskData, setPrefilledTaskData] = useState<Omit<
    Task,
    "id" | "created_at"
  > | null>(null);

  const handleCreateTask = async (
    taskData: Omit<Task, "id" | "created_at">
  ) => {
    setFormLoading(true);
    try {
      await createTask(taskData);
      setShowForm(false);
      setPrefilledTaskData(null);
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateTask = async (
    taskData: Omit<Task, "id" | "created_at">
  ) => {
    if (!editingTask) return;

    setFormLoading(true);
    try {
      await updateTask(editingTask.id, taskData);
      setEditingTask(null);
      setPrefilledTaskData(null);
    } finally {
      setFormLoading(false);
    }
  };

  const handleVoiceConfirm = (voiceText: string) => {
    setShowVoiceModal(false);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formattedDate = tomorrow.toISOString().split("T")[0];

    setPrefilledTaskData({
      title: voiceText,
      description: `Tarea creada por voz: "${voiceText}"`,
      deadline: formattedDate,
      priority: "medium",
      category: "Voz",
      status: "pending",
    });

    setShowForm(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setPrefilledTaskData(null);
  };

  const handleDeleteTask = async (id: number) => {
    try {
      await deleteTask(id);
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  const overdueTasks = tasks.filter(
    (task) =>
      new Date(task.deadline) < new Date() && task.status !== "completed"
  );

  const dueSoonTasks = tasks.filter((task) => {
    const deadline = new Date(task.deadline);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0 && task.status !== "completed";
  });

  if (loading) {
    return <div className="loading">Cargando tareas...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="home-page">
      <div className="page-header">
        <h1>Mis Tareas</h1>
        <div className="header-actions">
          <button
            onClick={() => setShowVoiceModal(true)}
            className="btn btn-secondary"
          >
            🎤 Crear por Voz
          </button>
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            ➕ Nueva Tarea
          </button>
        </div>
      </div>

      {(overdueTasks.length > 0 || dueSoonTasks.length > 0) && (
        <div className="reminders-section">
          <h2>Recordatorios</h2>

          {overdueTasks.length > 0 && (
            <div className="reminder-group overdue">
              <h3>⚠️ Tareas Vencidas ({overdueTasks.length})</h3>
              <div className="tasks-grid">
                {overdueTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                  />
                ))}
              </div>
            </div>
          )}

          {dueSoonTasks.length > 0 && (
            <div className="reminder-group due-soon">
              <h3>⏰ Tareas Próximas a Vencer ({dueSoonTasks.length})</h3>
              <div className="tasks-grid">
                {dueSoonTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="all-tasks-section">
        <h2>Todas las Tareas ({tasks.length})</h2>
        {tasks.length === 0 ? (
          <div className="empty-state">
            <p>No hay tareas creadas aún.</p>
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary"
            >
              Crear mi primera tarea
            </button>
          </div>
        ) : (
          <div className="tasks-grid">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>
        )}
      </div>

      {(showForm || editingTask) && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editingTask ? "Editar Tarea" : "Nueva Tarea"}</h2>
            <TaskForm
              task={editingTask}
              initialData={prefilledTaskData}
              onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
              onCancel={() => {
                setShowForm(false);
                setEditingTask(null);
                setPrefilledTaskData(null);
              }}
              loading={formLoading}
            />
          </div>
        </div>
      )}

      <VoiceTaskModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onConfirm={handleVoiceConfirm}
      />
    </div>
  );
};
