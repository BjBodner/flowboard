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

export const POINTS_BY_PRIORITY: Record<Priority, number> = { low: 10, medium: 20, high: 30 };

export interface GameLevel {
  level: number;
  name: string;
  icon: string;
  minPoints: number;
}

export const LEVELS: GameLevel[] = [
  { level: 1, name: "מתחיל",  icon: "🌱", minPoints: 0 },
  { level: 2, name: "מתקדם",  icon: "⭐", minPoints: 50 },
  { level: 3, name: "מנוסה",  icon: "🔥", minPoints: 150 },
  { level: 4, name: "מומחה",  icon: "💎", minPoints: 350 },
  { level: 5, name: "אלוף",   icon: "👑", minPoints: 700 },
];

export function getCurrentLevel(points: number): GameLevel {
  let current = LEVELS[0];
  for (const lvl of LEVELS) {
    if (points >= lvl.minPoints) current = lvl;
  }
  return current;
}

export function getNextLevel(points: number): GameLevel | null {
  const current = getCurrentLevel(points);
  return LEVELS.find((l) => l.level === current.level + 1) ?? null;
}
