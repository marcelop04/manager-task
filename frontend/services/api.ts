import axios from "axios";
import { Task, TaskStats } from "../types/Task";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const taskService = {
  // CRUD Operations
  getAllTasks: async (): Promise<Task[]> => {
    const response = await api.get("/tasks");
    return response.data;
  },

  getTask: async (id: number): Promise<Task> => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  createTask: async (task: Omit<Task, "id" | "created_at">): Promise<Task> => {
    const response = await api.post("/tasks", task);
    return response.data;
  },

  updateTask: async (id: number, task: Partial<Task>): Promise<Task> => {
    const response = await api.put(`/tasks/${id}`, task);
    return response.data;
  },

  updateTaskStatus: async (
    id: number,
    status: Task["status"]
  ): Promise<Task> => {
    const response = await api.patch(`/tasks/${id}`, { status });
    return response.data;
  },

  deleteTask: async (id: number): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },

  // Stats
  getStats: async (): Promise<TaskStats> => {
    const response = await api.get("/stats");
    return response.data;
  },
};
