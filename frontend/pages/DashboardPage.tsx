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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await taskService.getStats();
        setStats(data);
      } catch (err) {
        setError("Error al cargar las estadísticas");
        console.error("Error fetching stats:", err);
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
    return <div className="error">{error}</div>;
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
      </div>
    </div>
  );
};
