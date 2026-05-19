import React, { useState } from 'react';
import { useKMQuest } from '../context/KMQuestContext';
import './Header.css';

export default function Header() {
  const { state, totalKm, level, xp, xpToNext, setGoal } = useKMQuest();
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(String(state.goal));

  function handleGoalSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = parseFloat(goalInput);
    if (!isNaN(v) && v > 0) { setGoal(v); }
    setEditingGoal(false);
  }

  const remaining = Math.max(0, state.goal - totalKm);

  return (
    <header className="header">
      <div className="header-brand">
        <span className="header-logo">⬡</span>
        <div>
          <h1 className="header-title">Side<span className="neon-text">Quest</span></h1>
          <p className="header-sub mono">Track · Achieve · Conquer</p>
        </div>
      </div>

      <div className="header-right">
        {/* Level + XP */}
        <div className="level-badge glass-card">
          <div className="level-num">LVL <span className="neon-text">{level}</span></div>
          <div className="xp-bar-wrap">
            <div className="xp-bar-track">
              <div
                className="xp-bar-fill"
                style={{ width: `${Math.max(0, 100 - (xpToNext / (level * level * 50)) * 100)}%` }}
              />
            </div>
            <span className="xp-label mono">{xp} XP</span>
          </div>
        </div>

        {/* Goal */}
        <div className="goal-widget glass-card">
          <span className="goal-label">GOAL</span>
          {editingGoal ? (
            <form onSubmit={handleGoalSubmit} className="goal-form">
              <input
                className="field-input goal-input"
                type="number"
                value={goalInput}
                onChange={e => setGoalInput(e.target.value)}
                autoFocus
                min={1}
              />
              <button type="submit" className="btn-primary goal-save">✓</button>
            </form>
          ) : (
            <button className="goal-value" onClick={() => { setGoalInput(String(state.goal)); setEditingGoal(true); }}>
              {state.goal.toLocaleString()} km <span className="edit-icon">✎</span>
            </button>
          )}
          <span className="goal-remaining mono">{remaining.toFixed(1)} km left</span>
        </div>
      </div>
    </header>
  );
}
