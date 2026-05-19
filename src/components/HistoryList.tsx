import React, { useState } from 'react';
import { useKMQuest, Entry } from '../context/KMQuestContext';
import './HistoryList.css';

function EntryRow({ entry, onDelete, onEdit }: {
  entry: Entry;
  onDelete: (id: string) => void;
  onEdit: (id: string, date: string, km: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [kmVal, setKmVal] = useState(String(entry.km));
  const [dateVal, setDateVal] = useState(entry.date);

  function save() {
    const k = parseFloat(kmVal);
    if (!isNaN(k) && k > 0 && dateVal) {
      onEdit(entry.id, dateVal, k);
      setEditing(false);
    }
  }

  function cancel() {
    setKmVal(String(entry.km));
    setDateVal(entry.date);
    setEditing(false);
  }

  return (
    <div className={`entry-row glass-card ${editing ? 'editing' : ''}`}>
      {editing ? (
        <div className="entry-edit-form">
          <input
            className="field-input entry-edit-input"
            type="number"
            value={kmVal}
            min={0.1}
            step={0.1}
            onChange={e => setKmVal(e.target.value)}
          />
          <span className="entry-edit-unit">km</span>
          <input
            className="field-input entry-edit-date"
            type="date"
            value={dateVal}
            onChange={e => setDateVal(e.target.value)}
          />
          <button className="btn-primary entry-save-btn" onClick={save}>Save</button>
          <button className="btn-ghost" onClick={cancel}>Cancel</button>
        </div>
      ) : (
        <>
          <div className="entry-dot" />
          <div className="entry-km mono">{entry.km} <span className="entry-km-unit">km</span></div>
          <div className="entry-date">{entry.date}</div>
          <div className="entry-cumulative">
            Total: <span className="mono">{entry.cumulativeKm.toFixed(1)} km</span>
          </div>
          <div className="entry-actions">
            <button className="btn-ghost" onClick={() => setEditing(true)}>Edit</button>
            <button className="btn-ghost danger" onClick={() => onDelete(entry.id)}>✕</button>
          </div>
        </>
      )}
    </div>
  );
}

function ResetButton() {

    useKMQuest(); // won't work yet — see context change below
  const [confirming, setConfirming] = useState(false);

  function handleReset() {
    localStorage.removeItem('kmquest_state_v1');
    window.location.reload();
  }

  if (confirming) {
    return (
        <div className="reset-confirm glass-card">
          <p className="reset-warn">⚠️ This will permanently delete all your entries, XP, and achievements. Are you sure?</p>
          <div className="reset-confirm-btns">
            <button className="btn-primary reset-yes" onClick={handleReset}>Yes, reset everything</button>
            <button className="btn-ghost" onClick={() => setConfirming(false)}>Cancel</button>
          </div>
        </div>
    );
  }

  return (
      <button className="btn-ghost reset-trigger" onClick={() => setConfirming(true)}>
        🗑 Reset all data
      </button>
  );
}

export default function HistoryList() {
  const { state, deleteEntry, editEntry } = useKMQuest();
  const sorted = [...state.entries].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="history-section">
      {/* ── Achievements Grid ── */}
      <section className="achievements-section glass-card">
        <h2 className="section-title">🏅 Achievements</h2>
        <div className="achievements-grid">
          {state.achievements.map(a => (
            <div
              key={a.id}
              className={`achievement-chip ${a.unlocked ? 'unlocked' : 'locked'}`}
              title={a.description}
            >
              <span className="achiev-icon">{a.icon}</span>
              <span className="achiev-label">{a.label}</span>
              {!a.unlocked && <div className="lock-overlay">🔒</div>}
            </div>
          ))}
        </div>
      </section>

      {/* ── Entry History ── */}
      <section className="entries-section">
        <h2 className="section-title">📋 History</h2>
        {sorted.length === 0 ? (
          <div className="empty-state glass-card">
            <p className="empty-icon">🗺️</p>
            <p className="empty-text">No entries yet. Log your first kilometers above!</p>
          </div>
        ) : (
          <div className="entry-list">
            {sorted.map(entry => (
              <EntryRow
                key={entry.id}
                entry={entry}
                onDelete={deleteEntry}
                onEdit={editEntry}
              />
            ))}
          </div>
        )}
      </section>
      <section className="reset-section">
        <ResetButton />
      </section>
    </div>
  );
}
