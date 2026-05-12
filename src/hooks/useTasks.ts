import { useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import useLocalStorage from "./useLocalStorage";
import type { Task, Priority, Status } from "../types/task";

function useTasks() {
  const [tasks, setTasks] = useLocalStorage<Task[]>("flowboard:tasks", []);
  const [customTags, setCustomTags] = useLocalStorage<string[]>("flowboard:tags", []);

  const createTask = useCallback((title: string, status: Status = "todo") => {
    setTasks((prev) => {
      const sameStatus = prev.filter((t) => t.status === status);
      const newTask: Task = {
        id: uuidv4(),
        title,
        priority: "medium",
        tags: [],
        status,
        createdAt: new Date().toISOString(),
        orderInColumn: sameStatus.length,
      };
      return [...prev, newTask];
    });
  }, [setTasks]);

  const updateTask = useCallback((id: string, changes: Partial<Omit<Task, "id" | "createdAt">>) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const updated = { ...t, ...changes };
        if (changes.status === "done" && t.status !== "done") {
          updated.completedAt = new Date().toISOString();
        } else if (changes.status && changes.status !== "done") {
          updated.completedAt = undefined;
        }
        return updated;
      })
    );
  }, [setTasks]);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, [setTasks]);

  const moveTask = useCallback((taskId: string, newStatus: Status, newOrder: number) => {
    setTasks((prev) => {
      const task = prev.find((t) => t.id === taskId);
      if (!task) return prev;

      const isMovingToDone = newStatus === "done" && task.status !== "done";

      const withoutTask = prev.filter((t) => t.id !== taskId);
      const inTarget = withoutTask
        .filter((t) => t.status === newStatus)
        .sort((a, b) => a.orderInColumn - b.orderInColumn);

      inTarget.splice(newOrder, 0, {
        ...task,
        status: newStatus,
        orderInColumn: newOrder,
        ...(isMovingToDone ? { completedAt: new Date().toISOString() } : {}),
        ...(newStatus !== "done" && task.status === "done" ? { completedAt: undefined } : {}),
      });

      const reordered = inTarget.map((t, i) => ({ ...t, orderInColumn: i }));
      const others = withoutTask.filter((t) => t.status !== newStatus);
      return [...others, ...reordered];
    });
  }, [setTasks]);

  const reorderWithinColumn = useCallback((status: Status, fromIndex: number, toIndex: number) => {
    setTasks((prev) => {
      const inColumn = prev
        .filter((t) => t.status === status)
        .sort((a, b) => a.orderInColumn - b.orderInColumn);
      const [moved] = inColumn.splice(fromIndex, 1);
      inColumn.splice(toIndex, 0, moved);
      const reordered = inColumn.map((t, i) => ({ ...t, orderInColumn: i }));
      const others = prev.filter((t) => t.status !== status);
      return [...others, ...reordered];
    });
  }, [setTasks]);

  const addCustomTag = useCallback((tag: string) => {
    setCustomTags((prev) => (prev.includes(tag) ? prev : [...prev, tag]));
  }, [setCustomTags]);

  return {
    tasks,
    customTags,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    reorderWithinColumn,
    addCustomTag,
  };
}

export default useTasks;
