import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { TaskStats } from "../types/Task";
import { taskService } from "../services/api";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658"];

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔥 NUEVA FUNCIÓN: Calcular stats desde las tareas
  const calculateStatsFromTasks = async (): Promise<TaskStats> => {
    try {
      const tasks = await taskService.getAllTasks();
      const now = new Date();
      const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

      const stats: TaskStats = {
        total: tasks.length,
        pending: tasks.filter((t) => t.status === "pending").length,
        inProgress: tasks.filter((t) => t.status === "in-progress").length,
        completed: tasks.filter((t) => t.status === "completed").length,
        overdue: tasks.filter(
          (t) => new Date(t.deadline) < now && t.status !== "completed"
        ).length,
        dueSoon: tasks.filter((t) => {
          const deadline = new Date(t.deadline);
          return (
            deadline >= now &&
            deadline <= twoDaysFromNow &&
            t.status !== "completed"
          );
        }).length,
        byPriority: {
          low: tasks.filter((t) => t.priority === "low").length,
          medium: tasks.filter((t) => t.priority === "medium").length,
          high: tasks.filter((t) => t.priority === "high").length,
        },
        byCategory: Array.from(
          new Set(tasks.map((t) => t.category).filter(Boolean))
        ).map((category) => ({
          category: category as string,
          count: tasks.filter((t) => t.category === category).length,
        })),
      };

      return stats;
    } catch (err) {
      throw new Error("Error calculando estadísticas");
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        // 🔥 INTENTAR PRIMERO EL ENDPOINT DE STATS
        try {
          const data = await taskService.getStats();
          setStats(data);
          setError(null);
        } catch (statsError) {
          // 🔥 SI FALLA, CALCULAR DESDE LAS TAREAS
          console.warn("Stats endpoint failed, calculating from tasks...");
          const calculatedStats = await calculateStatsFromTasks();
          setStats(calculatedStats);
          setError(null);
        }
      } catch (err: any) {
        console.error("Error fetching stats:", err);
        setError(
          "Error al cargar las estadísticas. Verifica la conexión con el backend."
        );
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="loading">Cargando dashboard...</div>;
  }

  if (error) {
    return (
      <div className="error">
        {error}
        <br />
        <button
          onClick={() => window.location.reload()}
          className="btn btn-primary"
          style={{ marginTop: "1rem" }}
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!stats) {
    return <div>No hay datos disponibles</div>;
  }

  const priorityData = [
    { name: "Alta", value: stats.byPriority.high },
    { name: "Media", value: stats.byPriority.medium },
    { name: "Baja", value: stats.byPriority.low },
  ];

  const statusData = [
    { name: "Pendiente", value: stats.pending },
    { name: "En Progreso", value: stats.inProgress },
    { name: "Completada", value: stats.completed },
  ];

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>Dashboard de Tareas</h1>
      </div>

      {/* Estadísticas Principales */}
      <div className="stats-grid">
        <div className="stat-card total">
          <h3>Total Tareas</h3>
          <div className="stat-value">{stats.total}</div>
        </div>

        <div className="stat-card pending">
          <h3>Pendientes</h3>
          <div className="stat-value">{stats.pending}</div>
        </div>

        <div className="stat-card in-progress">
          <h3>En Progreso</h3>
          <div className="stat-value">{stats.inProgress}</div>
        </div>

        <div className="stat-card completed">
          <h3>Completadas</h3>
          <div className="stat-value">{stats.completed}</div>
        </div>

        <div className="stat-card overdue">
          <h3>Vencidas</h3>
          <div className="stat-value">{stats.overdue}</div>
        </div>

        <div className="stat-card due-soon">
          <h3>Próximas</h3>
          <div className="stat-value">{stats.dueSoon}</div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="charts-grid">
        <div className="chart-container">
          <h3>Distribución por Prioridad</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={priorityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} (${(percent * 100).toFixed(0)}%)`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {priorityData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Tareas por Estado</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {stats.byCategory.length > 0 && (
          <div className="chart-container full-width">
            <h3>Tareas por Categoría</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.byCategory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};
