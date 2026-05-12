import { useState, useEffect, useRef } from "react";
import type { Task, Priority } from "../types/task";
import { PRESET_TAGS } from "../types/task";

interface Props {
  task: Task | null;
  allTags: string[];
  onSave: (id: string, changes: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  onAddTag: (tag: string) => void;
}

function TaskModal({ task, allTags, onSave, onDelete, onClose, onAddTag }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? "");
      setPriority(task.priority);
      setTags(task.tags);
    }
    titleRef.current?.focus();
  }, [task]);

  if (!task) return null;

  const handleSave = () => {
    if (!title.trim()) return;
    onSave(task.id, { title: title.trim(), description: description.trim() || undefined, priority, tags });
    onClose();
  };

  const toggleTag = (tag: string) => {
    setTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  };

  const handleAddTag = () => {
    const t = newTag.trim();
    if (!t || allTags.includes(t)) { setNewTag(""); return; }
    onAddTag(t);
    setTags((prev) => [...prev, t]);
    setNewTag("");
  };

  const priorityLabels: Record<Priority, string> = {
    high: "🔴 גבוה",
    medium: "🟡 בינוני",
    low: "🟢 נמוך",
  };
  const combinedTags = [...new Set([...PRESET_TAGS, ...allTags])];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>✏️ עריכת משימה</h2>
          <button className="modal-close" onClick={onClose} aria-label="סגור">✕</button>
        </div>

        <div className="modal-body">
          <label>
            כותרת *
            <input
              ref={titleRef}
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 100))}
              maxLength={100}
              placeholder="כותרת המשימה..."
            />
          </label>

          <label>
            תיאור
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="תיאור אופציונלי..."
            />
          </label>

          <label>
            עדיפות
            <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
              {(["high", "medium", "low"] as Priority[]).map((p) => (
                <option key={p} value={p}>{priorityLabels[p]}</option>
              ))}
            </select>
          </label>

          <div className="tag-section">
            <span>תגיות</span>
            <div className="tag-list">
              {combinedTags.map((tag) => (
                <button
                  key={tag}
                  className={`tag-chip ${tags.includes(tag) ? "active" : ""}`}
                  onClick={() => toggleTag(tag)}
                  type="button"
                >
                  {tag}
                </button>
              ))}
            </div>
            <div className="tag-add-row">
              <input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="תגית חדשה..."
                onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
              />
              <button type="button" onClick={handleAddTag}>+ הוסף</button>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-delete" type="button" onClick={() => {
            if (window.confirm("למחוק את המשימה?")) { onDelete(task.id); onClose(); }
          }}>🗑 מחק</button>
          <div>
            <button className="btn-cancel" type="button" onClick={onClose}>ביטול</button>
            <button className="btn-save" type="button" onClick={handleSave} disabled={!title.trim()}>💾 שמור</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskModal;
