import React, { useState } from 'react';
import { useKMQuest } from '../context/KMQuestContext';
import { playLogSound } from "../utils/sounds";
import './LogForm.css';

export default function LogForm() {
  const { addEntry, state } = useKMQuest();
  const today = new Date().toISOString().split('T')[0];
  const [km, setKm] = useState('');
  const [date, setDate] = useState(today);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const kmVal = parseFloat(km);
    if (!km || isNaN(kmVal) || kmVal <= 0) {
      setError('Enter a valid km amount!');
      return;
    }
    if (!date) {
      setError('Pick a date!');
      return;
    }

    addEntry(date, kmVal);

    // Wait a tick for state to update, then only play log sound
    // if no achievement was unlocked (achievement has its own sound)
    setTimeout(() => {
      if (!state.newAchievement) {
        playLogSound();
      }
    }, 50);

    setKm('');
    setDate(today);
    setError('');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  }

  return (
    <section className="log-form-section glass-card">
      <div className="log-form-header">
        <span className="log-icon">➕</span>
        <div>
          <h2 className="log-title">Log Kilometers</h2>
          <p className="log-sub">Every km counts toward your quest</p>
        </div>
      </div>

      <form className="log-form" onSubmit={handleSubmit}>
        <div className="log-field">
          <label className="log-label">DISTANCE</label>
          <div className="km-input-wrap">
            <input
              className="field-input km-input"
              type="number"
              placeholder="0.0"
              value={km}
              min={0.01}
              step={0.01}
              onChange={e => setKm(e.target.value)}
            />
            <span className="km-unit">km</span>
          </div>
        </div>

        <div className="log-field">
          <label className="log-label">DATE</label>
          <input
            className="field-input"
            type="date"
            value={date}
            max={today}
            onChange={e => setDate(e.target.value)}
          />
        </div>

        <button type="submit" className={`btn-primary log-btn ${success ? 'success-flash' : ''}`}>
          {success ? '✓ Added!' : '🚀 Add Entry'}
        </button>
      </form>

      {error && <p className="log-error">{error}</p>}
    </section>
  );
}
