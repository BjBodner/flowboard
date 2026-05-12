import { useState, useCallback, useEffect, useRef, useMemo } from "react";
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
import { STATUS_ORDER, PRESET_TAGS, POINTS_BY_PRIORITY, getCurrentLevel, getNextLevel } from "../types/task";
import type { GameLevel } from "../types/task";
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

const CONFETTI_COLORS = ["#6366f1", "#a855f7", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#f43f5e"];

interface Particle {
  id: number;
  tx: string;
  ty: string;
  rot: string;
  color: string;
  size: number;
  delay: number;
}

interface CompletionAnim {
  points: number;
  leveledUp: boolean;
  newLevel?: GameLevel;
  particles: Particle[];
}

function generateParticles(): Particle[] {
  return Array.from({ length: 40 }, (_, i) => {
    const angle = (i / 40) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
    const distance = 130 + Math.random() * 200;
    return {
      id: i,
      tx: `${Math.cos(angle) * distance}px`,
      ty: `${Math.sin(angle) * distance}px`,
      rot: `${Math.random() * 720 - 360}deg`,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: 7 + Math.random() * 9,
      delay: Math.random() * 0.25,
    };
  });
}

function Board() {
  const { tasks, customTags, createTask, updateTask, deleteTask, moveTask, reorderWithinColumn, addCustomTag } =
    useTasks();

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [newTaskStatus, setNewTaskStatus] = useState<Status | null>(null);
  const [quickTitle, setQuickTitle] = useState("");
  const [quoteIndex, setQuoteIndex] = useState(() => Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length));
  const [quoteKey, setQuoteKey] = useState(0);
  const [completionAnim, setCompletionAnim] = useState<CompletionAnim | null>(null);

  const prevDoneIds = useRef<Set<string>>(
    new Set(tasks.filter((t) => t.status === "done").map((t) => t.id))
  );

  const totalPoints = useMemo(
    () => tasks.filter((t) => t.status === "done").reduce((sum, t) => sum + POINTS_BY_PRIORITY[t.priority], 0),
    [tasks]
  );
  const currentLevel = useMemo(() => getCurrentLevel(totalPoints), [totalPoints]);
  const nextLevel = useMemo(() => getNextLevel(totalPoints), [totalPoints]);

  useEffect(() => {
    const currentDoneIds = new Set(tasks.filter((t) => t.status === "done").map((t) => t.id));
    const newlyCompleted = tasks.filter((t) => t.status === "done" && !prevDoneIds.current.has(t.id));

    if (newlyCompleted.length > 0) {
      const earned = newlyCompleted.reduce((sum, t) => sum + POINTS_BY_PRIORITY[t.priority], 0);
      const currentTotal = tasks
        .filter((t) => t.status === "done")
        .reduce((sum, t) => sum + POINTS_BY_PRIORITY[t.priority], 0);
      const prevTotal = currentTotal - earned;
      const prevLvl = getCurrentLevel(prevTotal);
      const newLvl = getCurrentLevel(currentTotal);
      const didLevelUp = newLvl.level > prevLvl.level;

      setCompletionAnim({
        points: earned,
        leveledUp: didLevelUp,
        newLevel: didLevelUp ? newLvl : undefined,
        particles: generateParticles(),
      });

      const timer = setTimeout(() => setCompletionAnim(null), didLevelUp ? 4000 : 2200);
      prevDoneIds.current = currentDoneIds;
      return () => clearTimeout(timer);
    }

    prevDoneIds.current = currentDoneIds;
  }, [tasks]);

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

      <StageIndicator
        taskCounts={taskCounts}
        totalPoints={totalPoints}
        currentLevel={currentLevel}
        nextLevel={nextLevel}
      />

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

      {completionAnim && (
        <div className="completion-overlay" onClick={() => setCompletionAnim(null)}>
          {completionAnim.particles.map((p) => (
            <div
              key={p.id}
              className="confetti-particle"
              style={{
                "--tx": p.tx,
                "--ty": p.ty,
                "--rot": p.rot,
                backgroundColor: p.color,
                width: `${p.size}px`,
                height: `${p.size * 0.55}px`,
                animationDelay: `${p.delay}s`,
              } as React.CSSProperties}
            />
          ))}
          <div className={`points-popup${completionAnim.leveledUp ? " points-popup-levelup" : ""}`}>
            <div className="points-earned">+{completionAnim.points}</div>
            <div className="points-label">נקודות! 🎉</div>
            {completionAnim.leveledUp && completionAnim.newLevel && (
              <div className="level-up-banner">
                <span className="level-up-icon">{completionAnim.newLevel.icon}</span>
                <span>עלית לשלב "{completionAnim.newLevel.name}"!</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Board;
