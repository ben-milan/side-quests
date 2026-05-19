import React from 'react';
import { useKMQuest } from '../context/KMQuestContext';
import './StatsRow.css';

export default function StatsRow() {
  const { state, totalKm, streak, level, xp } = useKMQuest();
  const unlockedCount = state.achievements.filter(a => a.unlocked).length;

  const stats = [
    { icon: '🔥', label: 'Streak',       value: `${streak}d`,             sub: 'consecutive days' },
    { icon: '⚡', label: 'Total XP',     value: xp.toLocaleString(),      sub: `level ${level}` },
    { icon: '📍', label: 'Entries',      value: state.entries.length,     sub: 'km sessions logged' },
    { icon: '🏅', label: 'Achievements', value: `${unlockedCount}/${state.achievements.length}`, sub: 'badges earned' },
  ];

  return (
    <div className="stats-row">
      {stats.map(s => (
        <div key={s.label} className="stat-card glass-card">
          <span className="stat-icon">{s.icon}</span>
          <div className="stat-value mono">{s.value}</div>
          <div className="stat-label">{s.label}</div>
          <div className="stat-sub">{s.sub}</div>
        </div>
      ))}
    </div>
  );
}
