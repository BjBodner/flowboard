import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task, Status } from "../types/task";
import { STATUS_ORDER, COLUMN_CONFIG } from "../types/task";

interface Props {
  task: Task;
  onClick: () => void;
  activeFilter: string | null;
  onTagClick: (tag: string) => void;
  accentColor: string;
}

const PRIORITY_CLASS: Record<string, string> = {
  high: "priority-high",
  medium: "priority-medium",
  low: "priority-low",
};

const PRIORITY_LABEL: Record<string, string> = {
  high: "גבוה",
  medium: "בינוני",
  low: "נמוך",
};

const PRIORITY_ICON: Record<string, string> = {
  high: "🔴",
  medium: "🟡",
  low: "🟢",
};

function TaskCard({ task, onClick, activeFilter, onTagClick, accentColor }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.45 : 1,
  };

  const currentStageIdx = STATUS_ORDER.indexOf(task.status);

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, "--card-accent": accentColor } as React.CSSProperties}
      className={`task-card${isDragging ? " is-dragging" : ""}${task.status === "done" ? " done-card" : ""}`}
      {...attributes}
      {...listeners}
      onClick={onClick}
    >
      <div className="task-title">{task.title}</div>
      {task.description && <div className="task-desc">{task.description}</div>}

      <div className="task-footer">
        <span className={`priority-badge ${PRIORITY_CLASS[task.priority]}`}>
          {PRIORITY_ICON[task.priority]} {PRIORITY_LABEL[task.priority]}
        </span>

        <div className="card-stage-dots">
          {STATUS_ORDER.map((s: Status, i: number) => {
            const dotAccent = COLUMN_CONFIG[s].accent;
            let cls = "card-stage-dot";
            if (i < currentStageIdx) cls += " reached";
            if (i === currentStageIdx) cls += " current";
            return (
              <div
                key={s}
                className={cls}
                style={
                  i <= currentStageIdx
                    ? ({ background: dotAccent, "--dot-accent": dotAccent } as React.CSSProperties)
                    : undefined
                }
              />
            );
          })}
        </div>

        <div className="task-tags">
          {task.tags.map((tag) => (
            <span
              key={tag}
              className={`tag-chip small ${activeFilter === tag ? "active" : ""}`}
              onClick={(e) => { e.stopPropagation(); onTagClick(tag); }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TaskCard;
