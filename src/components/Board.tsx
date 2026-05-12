import { useState, useCallback, useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import type { Task, Status } from "../types/task";
import { STATUS_ORDER, PRESET_TAGS } from "../types/task";
import Column from "./Column";
import TaskModal from "./TaskModal";
import StageIndicator from "./StageIndicator";
import useTasks from "../hooks/useTasks";

const MOTIVATIONAL_QUOTES = [
  "כל משימה גדולה מתחילה בצעד קטן אחד 🚀",
  "ההצלחה היא סכום של מאמצים קטנים שחוזרים על עצמם 💪",
  "אל תחכה לרגע המושלם — עשה את הרגע הזה מושלם ✨",
  "פרודוקטיביות היא לא מקרה — זו בחירה יומיומית 🎯",
  "כל יום הוא הזדמנות חדשה לעשות דברים נפלאים 🌟",
  "המסע של אלף מיל מתחיל בצעד אחד 🏃",
  "אתה מסוגל ליותר ממה שאתה חושב! 🔥",
  "גמור את מה שהתחלת — זו הדרך למצוינות ⚡",
  "כל בדיקה מחוצ'קת היא ניצחון קטן 🏆",
];

void arrayMove;

function Board() {
  const { tasks, customTags, createTask, updateTask, deleteTask, moveTask, reorderWithinColumn, addCustomTag } =
    useTasks();

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [newTaskStatus, setNewTaskStatus] = useState<Status | null>(null);
  const [quickTitle, setQuickTitle] = useState("");
  const [quoteIndex, setQuoteIndex] = useState(() => Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length));
  const [quoteKey, setQuoteKey] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setQuoteIndex((i) => (i + 1) % MOTIVATIONAL_QUOTES.length);
      setQuoteKey((k) => k + 1);
    }, 9000);
    return () => clearInterval(id);
  }, []);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const allTags = [...new Set([...PRESET_TAGS, ...customTags])];

  const filteredTasks = activeFilter
    ? tasks.filter((t) => t.tags.includes(activeFilter))
    : tasks;

  const taskCounts = STATUS_ORDER.reduce((acc, s) => {
    acc[s] = tasks.filter((t) => t.status === s).length;
    return acc;
  }, {} as Record<Status, number>);

  const handleDragOver = useCallback((_event: DragOverEvent) => {}, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeTask = tasks.find((t) => t.id === active.id);
      if (!activeTask) return;

      const overIsColumn = STATUS_ORDER.includes(over.id as Status);

      if (overIsColumn) {
        const targetStatus = over.id as Status;
        if (activeTask.status !== targetStatus) {
          const targetTasks = tasks.filter((t) => t.status === targetStatus);
          moveTask(activeTask.id, targetStatus, targetTasks.length);
        }
      } else {
        const overTask = tasks.find((t) => t.id === over.id);
        if (!overTask) return;

        if (activeTask.status === overTask.status) {
          const inColumn = tasks
            .filter((t) => t.status === activeTask.status)
            .sort((a, b) => a.orderInColumn - b.orderInColumn);
          const fromIdx = inColumn.findIndex((t) => t.id === activeTask.id);
          const toIdx = inColumn.findIndex((t) => t.id === overTask.id);
          if (fromIdx !== toIdx) reorderWithinColumn(activeTask.status, fromIdx, toIdx);
        } else {
          const targetTasks = tasks.filter((t) => t.status === overTask.status);
          const toIdx = targetTasks
            .sort((a, b) => a.orderInColumn - b.orderInColumn)
            .findIndex((t) => t.id === overTask.id);
          moveTask(activeTask.id, overTask.status, toIdx);
        }
      }
    },
    [tasks, moveTask, reorderWithinColumn]
  );

  const handleAddTask = (status: Status) => {
    setNewTaskStatus(status);
    setQuickTitle("");
  };

  const handleQuickCreate = () => {
    if (!quickTitle.trim() || !newTaskStatus) return;
    createTask(quickTitle.trim(), newTaskStatus);
    setNewTaskStatus(null);
    setQuickTitle("");
  };

  const handleTagFilter = (tag: string) => {
    setActiveFilter((prev) => (prev === tag ? null : tag));
  };

  return (
    <div className="board-wrapper">
      <header className="app-header">
        <div className="header-left">
          <h1>FlowBoard</h1>
          <div className="header-quote-wrap">
            <span key={quoteKey} className="header-quote">
              {MOTIVATIONAL_QUOTES[quoteIndex]}
            </span>
          </div>
        </div>
        <div className="header-controls">
          {activeFilter && (
            <button className="filter-badge" onClick={() => setActiveFilter(null)}>
              מסנן: {activeFilter} ✕
            </button>
          )}
          <button className="btn-primary" onClick={() => handleAddTask("todo")}>+ משימה חדשה</button>
        </div>
      </header>

      <StageIndicator taskCounts={taskCounts} />

      {newTaskStatus && (
        <div className="quick-create-bar">
          <input
            autoFocus
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            placeholder="כותרת המשימה..."
            maxLength={100}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleQuickCreate();
              if (e.key === "Escape") setNewTaskStatus(null);
            }}
          />
          <button onClick={handleQuickCreate} disabled={!quickTitle.trim()}>צור</button>
          <button onClick={() => setNewTaskStatus(null)}>ביטול</button>
        </div>
      )}

      <div className="filter-bar">
        <span>סנן לפי תגית:</span>
        {allTags.map((tag) => (
          <button
            key={tag}
            className={`tag-chip ${activeFilter === tag ? "active" : ""}`}
            onClick={() => handleTagFilter(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
        <div className="board">
          {STATUS_ORDER.map((status) => (
            <Column
              key={status}
              status={status}
              tasks={filteredTasks.filter((t) => t.status === status)}
              onAddTask={handleAddTask}
              onCardClick={setEditingTask}
              activeFilter={activeFilter}
              onTagClick={handleTagFilter}
            />
          ))}
        </div>
      </DndContext>

      {editingTask && (
        <TaskModal
          task={editingTask}
          allTags={customTags}
          onSave={updateTask}
          onDelete={deleteTask}
          onClose={() => setEditingTask(null)}
          onAddTag={addCustomTag}
        />
      )}
    </div>
  );
}

export default Board;
