import React, { useEffect, useState } from 'react';
import { useKMQuest } from '../context/KMQuestContext';
import { playAchievementSound } from "../utils/sounds";
import './AchievementBanner.css';

export default function AchievementBanner() {
  const { state, clearNewAchievement } = useKMQuest();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (state.newAchievement) {
      playAchievementSound()
      setVisible(true);
      const t = setTimeout(() => {
        setVisible(false);
        setTimeout(clearNewAchievement, 400); // wait for fade-out
      }, 3500);
      return () => clearTimeout(t);
    }
  }, [state.newAchievement, clearNewAchievement]);

  if (!state.newAchievement) return null;

  const a = state.newAchievement;

  return (
    <div className={`achievement-banner ${visible ? 'show' : 'hide'}`} onClick={() => setVisible(false)}>
      <div className="ab-icon">{a.icon}</div>
      <div className="ab-body">
        <div className="ab-title">Achievement Unlocked!</div>
        <div className="ab-name">{a.label}</div>
        <div className="ab-desc">{a.description}</div>
      </div>
      <div className="ab-glow" />
    </div>
  );
}
