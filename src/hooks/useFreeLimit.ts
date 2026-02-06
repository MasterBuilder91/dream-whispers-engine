import { useState, useEffect } from "react";

const STORAGE_KEY = "dream_companion_free_usage";
const WEEKLY_LIMIT = 1;
const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

interface FreeUsage {
  count: number;
  weekStart: number;
}

export function useFreeLimit() {
  const [usage, setUsage] = useState<FreeUsage | null>(null);
  const [canInterpret, setCanInterpret] = useState(true);
  const [remainingCount, setRemainingCount] = useState(WEEKLY_LIMIT);
  const [nextResetDate, setNextResetDate] = useState<Date | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const now = Date.now();

    if (stored) {
      const parsed: FreeUsage = JSON.parse(stored);
      
      // Check if week has reset
      if (now - parsed.weekStart >= MS_PER_WEEK) {
        // New week, reset counter
        const newUsage = { count: 0, weekStart: now };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newUsage));
        setUsage(newUsage);
        setCanInterpret(true);
        setRemainingCount(WEEKLY_LIMIT);
        setNextResetDate(new Date(now + MS_PER_WEEK));
      } else {
        setUsage(parsed);
        const remaining = Math.max(0, WEEKLY_LIMIT - parsed.count);
        setCanInterpret(remaining > 0);
        setRemainingCount(remaining);
        setNextResetDate(new Date(parsed.weekStart + MS_PER_WEEK));
      }
    } else {
      // First time user
      const newUsage = { count: 0, weekStart: now };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUsage));
      setUsage(newUsage);
      setCanInterpret(true);
      setRemainingCount(WEEKLY_LIMIT);
      setNextResetDate(new Date(now + MS_PER_WEEK));
    }
  }, []);

  const recordUsage = () => {
    if (!usage) return;
    
    const newUsage = { ...usage, count: usage.count + 1 };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUsage));
    setUsage(newUsage);
    
    const remaining = Math.max(0, WEEKLY_LIMIT - newUsage.count);
    setCanInterpret(remaining > 0);
    setRemainingCount(remaining);
  };

  return {
    canInterpret,
    remainingCount,
    nextResetDate,
    recordUsage,
    weeklyLimit: WEEKLY_LIMIT,
  };
}
