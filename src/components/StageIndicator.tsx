import type { Status } from "../types/task";
import type { GameLevel } from "../types/task";
import { STATUS_ORDER, COLUMN_CONFIG } from "../types/task";

interface Props {
  taskCounts: Record<Status, number>;
  totalPoints: number;
  currentLevel: GameLevel;
  nextLevel: GameLevel | null;
}

function StageIndicator({ taskCounts, totalPoints, currentLevel, nextLevel }: Props) {
  const total = Object.values(taskCounts).reduce((a, b) => a + b, 0);

  const progressPct = nextLevel
    ? Math.min(((totalPoints - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100, 100)
    : 100;

  return (
    <div className="stage-indicator">
      <div className="level-section">
        <div className="level-badge">
          <span className="level-icon">{currentLevel.icon}</span>
          <div className="level-info">
            <span className="level-name">{currentLevel.name}</span>
            <span className="level-num">שלב {currentLevel.level}</span>
          </div>
        </div>
        <div className="level-progress-wrap">
          <div className="level-progress-bar">
            <div className="level-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="level-progress-label">
            <span>{totalPoints} נק׳</span>
            {nextLevel ? (
              <span>עד "{nextLevel.name}": עוד {nextLevel.minPoints - totalPoints} נק׳</span>
            ) : (
              <span>רמה מקסימלית! 🎉</span>
            )}
          </div>
        </div>
      </div>

      <div className="stage-steps">
        {STATUS_ORDER.map((status, idx) => {
          const config = COLUMN_CONFIG[status];
          return (
            <div key={status} className="stage-step-wrapper">
              <div className="stage-step">
                <div className="stage-dot" style={{ background: config.accent, boxShadow: `0 4px 14px ${config.accent}55` }}>
                  <span className="stage-dot-icon">{config.icon}</span>
                  <span className="stage-dot-count">{taskCounts[status]}</span>
                </div>
                <span className="stage-label">{config.label}</span>
              </div>
              {idx < STATUS_ORDER.length - 1 && (
                <div className="stage-connector">
                  <div className="stage-line" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {total > 0 && (
        <div className="stage-total">
          <span className="stage-total-num">{total}</span>
          <span className="stage-total-label">משימות</span>
        </div>
      )}
    </div>
  );
}

export default StageIndicator;
