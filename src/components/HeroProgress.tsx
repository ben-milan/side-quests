import React, { useRef, useState, useEffect } from 'react';
import { useKMQuest } from '../context/KMQuestContext';
import './HeroProgress.css';

interface FloatingKm { id: number; km: number; x: number }

export default function HeroProgress() {
  const { state, totalKm, progressPct } = useKMQuest();
  const [floaters, setFloaters] = useState<FloatingKm[]>([]);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; color: string }[]>([]);
  const prevTotalRef = useRef(totalKm);
  const barRef = useRef<HTMLDivElement>(null);
  const floaterIdRef = useRef(0);

  // Detect new km added → trigger animations
  useEffect(() => {
    const delta = totalKm - prevTotalRef.current;
    if (delta > 0 && barRef.current) {
      const bar = barRef.current;
      const pct = Math.min(100, (prevTotalRef.current / state.goal) * 100);
      const xPx = (pct / 100) * bar.offsetWidth;
      const id = floaterIdRef.current++;
      setFloaters(f => [...f, { id, km: delta, x: xPx }]);
      setTimeout(() => setFloaters(f => f.filter(fl => fl.id !== id)), 1800);

      // Particles burst
      const COLORS = ['#00d4ff', '#a855f7', '#39ff14', '#ff6b35', '#fff'];
      const newParticles = Array.from({ length: 18 }, (_, i) => ({
        id: id * 100 + i,
        x: xPx + (Math.random() - 0.5) * 60,
        y: Math.random() * 60,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      }));
      setParticles(p => [...p, ...newParticles]);
      setTimeout(() => setParticles(p => p.filter(pt => !newParticles.find(np => np.id === pt.id))), 1200);
    }
    prevTotalRef.current = totalKm;
  }, [totalKm, state.goal]);

  const motMessage = () => {
    if (progressPct >= 100) return '🏆 Goal Crushed! Legendary!';
    if (progressPct >= 75)  return `🔥 ${(100 - progressPct).toFixed(1)}% to go — Almost there!`;
    if (progressPct >= 50)  return `⚡ Past the halfway mark — ${(state.goal - totalKm).toFixed(1)} km left!`;
    if (progressPct >= 25)  return `🚀 Great momentum! ${progressPct.toFixed(1)}% complete`;
    if (totalKm > 0)        return `👣 ${totalKm.toFixed(1)} km logged — keep going!`;
    return '🎯 Log your first kilometers to begin your quest!';
  };

  // Sort entries for milestone markers
  const sorted = [...state.entries].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <section className="hero-section glass-card">
      {/* Header row */}
      <div className="hero-header">
        <div>
          <div className="hero-km-big mono">{totalKm.toFixed(1)} <span className="hero-km-unit">km</span></div>
          <div className="hero-goal-label">of {state.goal.toLocaleString()} km goal</div>
        </div>
        <div className="hero-pct-badge">{progressPct.toFixed(1)}%</div>
      </div>

      {/* Motivational message */}
      <p className="hero-mot-msg">{motMessage()}</p>

      {/* The Bar */}
      <div className="progress-bar-area" ref={barRef}>
        {/* Track */}
        <div className="progress-track">
          {/* Animated fill */}
          <div
            className="progress-fill"
            style={{ width: `${progressPct}%` }}
          >
            <div className="progress-shimmer" />
          </div>

          {/* Glow pulse on tip */}
          {progressPct > 0 && (
            <div className="progress-tip" style={{ left: `${progressPct}%` }} />
          )}

          {/* Milestone markers */}
          {sorted.map((entry, idx) => {
            const pct = Math.min(100, (entry.cumulativeKm / state.goal) * 100);
            return (
              <div key={entry.id} className="milestone-marker" style={{ left: `${pct}%` }}>
                <div className="milestone-line" />
                <div className={`milestone-label ${idx % 2 === 0 ? 'above' : 'below'}`}>
                  <span className="milestone-date">{entry.date.slice(5)}</span>
                  <span className="milestone-km mono">+{entry.km}</span>
                </div>
                <div className="milestone-tooltip">
                  <strong>{entry.date}</strong><br />
                  +{entry.km} km &nbsp;·&nbsp; Total: {entry.cumulativeKm.toFixed(1)} km
                </div>
              </div>
            );
          })}
        </div>

        {/* Floating +km labels */}
        {floaters.map(fl => (
          <div key={fl.id} className="floater" style={{ left: fl.x }}>
            +{fl.km} km
          </div>
        ))}

        {/* Particles */}
        {particles.map(pt => (
          <div
            key={pt.id}
            className="particle"
            style={{
              left: pt.x,
              top: pt.y,
              background: pt.color,
              '--drift': `${(Math.random() - 0.5) * 100}px`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Tick marks */}
      <div className="progress-ticks">
        {[0, 25, 50, 75, 100].map(t => (
          <div key={t} className="tick" style={{ left: `${t}%` }}>
            <span>{(state.goal * t / 100).toFixed(0)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
