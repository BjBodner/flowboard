import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Task, Status } from "../types/task";
import { COLUMN_CONFIG } from "../types/task";
import TaskCard from "./TaskCard";

interface Props {
  status: Status;
  tasks: Task[];
  onAddTask: (status: Status) => void;
  onCardClick: (task: Task) => void;
  activeFilter: string | null;
  onTagClick: (tag: string) => void;
}

const EMPTY_ICONS: Record<Status, string> = {
  todo: "📭",
  in_progress: "🔧",
  needs_approval: "🔍",
  done: "🎉",
};

const EMPTY_HINTS: Record<Status, string> = {
  todo: "לחץ + הוסף משימה כדי להתחיל",
  in_progress: "גרור משימה לכאן",
  needs_approval: "גרור משימה לכאן",
  done: "כשתסיים משימה — היא תגיע לכאן",
};

function Column({ status, tasks, onAddTask, onCardClick, activeFilter, onTagClick }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const config = COLUMN_CONFIG[status];
  const sorted = [...tasks].sort((a, b) => a.orderInColumn - b.orderInColumn);

  return (
    <div className={`column${isOver ? " is-over" : ""}`}>
      <div className="column-accent-bar" style={{ background: config.accent }} />
      <div className="column-header">
        <div className="column-header-left">
          <span className="column-icon">{config.icon}</span>
          <h2>{config.label}</h2>
        </div>
        <span className="column-count">{tasks.length}</span>
      </div>

      <div ref={setNodeRef} className="column-body">
        <SortableContext items={sorted.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {sorted.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => onCardClick(task)}
              activeFilter={activeFilter}
              onTagClick={onTagClick}
              accentColor={config.accent}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">{EMPTY_ICONS[status]}</span>
            <span className="empty-text">אין משימות כאן</span>
            <span className="empty-hint">{EMPTY_HINTS[status]}</span>
          </div>
        )}
      </div>

      <button className="add-task-btn" onClick={() => onAddTask(status)}>
        <span>+</span>
        <span>הוסף משימה</span>
      </button>
    </div>
  );
}

export default Column;
