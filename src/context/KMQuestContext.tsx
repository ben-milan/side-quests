import React, {
  createContext, useContext, useReducer, useEffect, useState, useCallback,
} from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Entry {
  id: string;
  date: string;   // ISO yyyy-mm-dd
  km: number;
  cumulativeKm: number;
}

export interface Achievement {
  id: string;
  label: string;
  icon: string;
  description: string;
  unlocked: boolean;
}

export interface KMQuestState {
  goal: number;
  entries: Entry[];
  achievements: Achievement[];
  newAchievement: Achievement | null;  // currently-showing banner
}

type Action =
  | { type: 'ADD_ENTRY'; payload: { date: string; km: number } }
  | { type: 'DELETE_ENTRY'; payload: { id: string } }
  | { type: 'EDIT_ENTRY'; payload: { id: string; date: string; km: number } }
  | { type: 'SET_GOAL'; payload: { goal: number } }
  | { type: 'CLEAR_NEW_ACHIEVEMENT' };

// ─── Achievements definition ─────────────────────────────────────────────────

const ACHIEVEMENT_DEFS: Omit<Achievement, 'unlocked'>[] = [
  { id: 'first_log',    label: 'First Step',    icon: '👣', description: 'Log your first kilometers' },
  { id: 'km10',         label: 'Sprinter',      icon: '⚡', description: 'Reach 10 km total' },
  { id: 'km50',         label: 'Road Runner',   icon: '🏃', description: 'Reach 50 km total' },
  { id: 'km100',        label: 'Century Club',  icon: '💯', description: 'Reach 100 km total' },
  { id: 'km500',        label: 'Explorer',      icon: '🗺️', description: 'Reach 500 km total' },
  { id: 'km1000',       label: 'Odyssey',       icon: '🌍', description: 'Reach 1000 km total' },
  { id: 'streak3',      label: 'Hat-trick',     icon: '🔥', description: '3-day streak' },
  { id: 'streak7',      label: 'Week Warrior',  icon: '🗓️', description: '7-day streak' },
  { id: 'marathon',     label: 'Marathoner',    icon: '🏅', description: 'Log 42+ km in a single entry' },
  { id: 'goal_reached', label: 'Goal Crusher',  icon: '🏆', description: 'Reach your kilometer goal' },
];

function buildDefaultAchievements(): Achievement[] {
  return ACHIEVEMENT_DEFS.map(d => ({ ...d, unlocked: false }));
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function recalcCumulative(entries: Entry[]): Entry[] {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  let running = 0;
  return sorted.map(e => {
    running += e.km;
    return { ...e, cumulativeKm: running };
  });
}

function calcStreak(entries: Entry[]): number {
  if (entries.length === 0) return 0;
  const dates = Array.from(new Set(entries.map(e => e.date))).sort();
  let streak = 1;
  let max = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diff = (curr.getTime() - prev.getTime()) / 86400000;
    if (diff === 1) { streak++; max = Math.max(max, streak); }
    else { streak = 1; }
  }
  // current streak from today
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const lastDate = dates[dates.length - 1];
  if (lastDate !== today && lastDate !== yesterday) return 0;
  let cur = 1;
  for (let i = dates.length - 2; i >= 0; i--) {
    const a = new Date(dates[i + 1]);
    const b = new Date(dates[i]);
    if ((a.getTime() - b.getTime()) / 86400000 === 1) cur++;
    else break;
  }
  return cur;
}

function checkAchievements(
  state: KMQuestState,
  entries: Entry[],
  newEntry: Entry | null,
): { achievements: Achievement[]; newUnlock: Achievement | null } {
  const totalKm = entries.reduce((s, e) => s + e.km, 0);
  const streak = calcStreak(entries);
  const goals = {
    first_log:    entries.length >= 1,
    km10:         totalKm >= 10,
    km50:         totalKm >= 50,
    km100:        totalKm >= 100,
    km500:        totalKm >= 500,
    km1000:       totalKm >= 1000,
    streak3:      streak >= 3,
    streak7:      streak >= 7,
    marathon:     newEntry ? newEntry.km >= 42 : entries.some(e => e.km >= 42),
    goal_reached: totalKm >= state.goal,
  } as Record<string, boolean>;

  let newUnlock: Achievement | null = null;
  const achievements = state.achievements.map(a => {
    if (!a.unlocked && goals[a.id]) {
      if (!newUnlock) newUnlock = { ...a, unlocked: true };
      return { ...a, unlocked: true };
    }
    return a;
  });
  return { achievements, newUnlock };
}

// ─── Reducer ─────────────────────────────────────────────────────────────────

function reducer(state: KMQuestState, action: Action): KMQuestState {
  switch (action.type) {
    case 'ADD_ENTRY': {
      const newEntry: Entry = {
        id: crypto.randomUUID(),
        date: action.payload.date,
        km: action.payload.km,
        cumulativeKm: 0,
      };
      const raw = [...state.entries, newEntry];
      const entries = recalcCumulative(raw);
      const addedFinal = entries.find(e => e.id === newEntry.id)!;
      const { achievements, newUnlock } = checkAchievements(state, entries, addedFinal);
      return { ...state, entries, achievements, newAchievement: newUnlock };
    }
    case 'DELETE_ENTRY': {
      const raw = state.entries.filter(e => e.id !== action.payload.id);
      const entries = recalcCumulative(raw);
      return { ...state, entries };
    }
    case 'EDIT_ENTRY': {
      const raw = state.entries.map(e =>
        e.id === action.payload.id
          ? { ...e, date: action.payload.date, km: action.payload.km }
          : e
      );
      const entries = recalcCumulative(raw);
      return { ...state, entries };
    }
    case 'SET_GOAL':
      return { ...state, goal: action.payload.goal };
    case 'CLEAR_NEW_ACHIEVEMENT':
      return { ...state, newAchievement: null };
    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface KMQuestContextValue {
  state: KMQuestState;
  totalKm: number;
  progressPct: number;
  streak: number;
  level: number;
  xp: number;
  xpToNext: number;
  addEntry: (date: string, km: number) => void;
  deleteEntry: (id: string) => void;
  editEntry: (id: string, date: string, km: number) => void;
  setGoal: (goal: number) => void;
  clearNewAchievement: () => void;
}

const KMQuestContext = createContext<KMQuestContextValue | null>(null);

const STORAGE_KEY = 'kmquest_state_v1';

function loadState(): KMQuestState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as KMQuestState;
  } catch { return null; }
}

function getInitialState(): KMQuestState {
  const saved = loadState();
  if (saved) return { ...saved, newAchievement: null };
  return {
    goal: 100,
    entries: [],
    achievements: buildDefaultAchievements(),
    newAchievement: null,
  };
}

export function KMQuestProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, getInitialState);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const totalKm = state.entries.reduce((s, e) => s + e.km, 0);
  const progressPct = Math.min(100, (totalKm / state.goal) * 100);
  const streak = calcStreak(state.entries);
  const xp = Math.floor(totalKm * 10);
  const level = Math.floor(Math.sqrt(xp / 50)) + 1;
  const xpForLevel = (l: number) => l * l * 50;
  const xpToNext = xpForLevel(level) - xp;

  const addEntry = useCallback((date: string, km: number) =>
    dispatch({ type: 'ADD_ENTRY', payload: { date, km } }), []);
  const deleteEntry = useCallback((id: string) =>
    dispatch({ type: 'DELETE_ENTRY', payload: { id } }), []);
  const editEntry = useCallback((id: string, date: string, km: number) =>
    dispatch({ type: 'EDIT_ENTRY', payload: { id, date, km } }), []);
  const setGoal = useCallback((goal: number) =>
    dispatch({ type: 'SET_GOAL', payload: { goal } }), []);
  const clearNewAchievement = useCallback(() =>
    dispatch({ type: 'CLEAR_NEW_ACHIEVEMENT' }), []);

  return (
    <KMQuestContext.Provider value={{
      state, totalKm, progressPct, streak, level, xp, xpToNext,
      addEntry, deleteEntry, editEntry, setGoal, clearNewAchievement,
    }}>
      {children}
    </KMQuestContext.Provider>
  );
}

export function useKMQuest() {
  const ctx = useContext(KMQuestContext);
  if (!ctx) throw new Error('useKMQuest must be used inside KMQuestProvider');
  return ctx;
}
