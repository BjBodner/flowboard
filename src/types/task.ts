export type Priority = "low" | "medium" | "high";
export type Status = "todo" | "in_progress" | "needs_approval" | "done";

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  tags: string[];
  status: Status;
  createdAt: string;
  completedAt?: string;
  orderInColumn: number;
}

export interface AppState {
  tasks: Task[];
  customTags: string[];
}

export const PRESET_TAGS = ["עבודה", "אישי", "לימוד", "פרויקט", "בריאות"] as const;

export const COLUMN_CONFIG: Record<Status, { label: string; color: string; accent: string; icon: string }> = {
  todo: { label: "עדיין לא התחיל", color: "#f8fafc", accent: "#64748b", icon: "📋" },
  in_progress: { label: "בביצוע", color: "#fffbeb", accent: "#f59e0b", icon: "⚡" },
  needs_approval: { label: "Review", color: "#faf5ff", accent: "#a855f7", icon: "👁️" },
  done: { label: "הושלם", color: "#f0fdf4", accent: "#10b981", icon: "✅" },
};

export const STATUS_ORDER: Status[] = ["todo", "in_progress", "needs_approval", "done"];
