import React from 'react';
import { KMQuestProvider } from './context/KMQuestContext';
import Header from './components/Header';
import HeroProgress from './components/HeroProgress';
import LogForm from './components/LogForm';
import StatsRow from './components/StatsRow';
import AchievementBanner from './components/AchievementBanner';
import HistoryList from './components/HistoryList';
import './App.css';

export default function App() {
  return (
    <KMQuestProvider>
      <div className="app-root">
        <div className="bg-grid" />
        <div className="bg-glow bg-glow-1" />
        <div className="bg-glow bg-glow-2" />
        <div className="content-wrapper">
          <Header />
          <AchievementBanner />
          <HeroProgress />
          <LogForm />
          <StatsRow />
          <HistoryList />
        </div>
      </div>
    </KMQuestProvider>
  );
}
