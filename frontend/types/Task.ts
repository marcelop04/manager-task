export interface Task {
  id: number;
  title: string;
  description?: string;
  deadline: string;
  priority: "low" | "medium" | "high";
  category: string;
  status: "pending" | "in-progress" | "completed";
  created_at: string;
}

export interface TaskStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
  dueSoon: number;
  byPriority: {
    low: number;
    medium: number;
    high: number;
  };
  byCategory: Array<{
    category: string;
    count: number;
  }>;
}
