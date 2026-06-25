const timerStorageKey = "jarvis-presentation.timer";

export type TimerState = {
  isRunning: boolean;
  totalStartedAt: number | null;
  totalElapsedMs: number;
  pageStartedAt: number | null;
  pageElapsedMs: number;
  currentIndex: number;
};

export type TimerSnapshot = {
  isRunning: boolean;
  startedAt: number | null;
  totalElapsedMs: number;
  pageStartedAt: number | null;
  pageElapsedMs: number;
};

export function readTimerState(currentIndex: number): TimerState {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(timerStorageKey) || "") as TimerState;
    if (typeof parsed?.isRunning === "boolean") return { ...parsed, currentIndex };
  } catch {
    // Empty or old timer state. Start clean.
  }
  return {
    isRunning: false,
    totalStartedAt: null,
    totalElapsedMs: 0,
    pageStartedAt: null,
    pageElapsedMs: 0,
    currentIndex,
  };
}

export function saveTimerState(state: TimerState) {
  sessionStorage.setItem(timerStorageKey, JSON.stringify(state));
}

export function getTimerSnapshot(state: TimerState): TimerSnapshot {
  return {
    isRunning: state.isRunning,
    startedAt: state.totalStartedAt,
    totalElapsedMs: state.totalElapsedMs,
    pageStartedAt: state.pageStartedAt,
    pageElapsedMs: state.pageElapsedMs,
  };
}

export function elapsedMs(state: TimerState, now: number) {
  const runningTotal = state.isRunning && state.totalStartedAt ? now - state.totalStartedAt : 0;
  const runningPage = state.isRunning && state.pageStartedAt ? now - state.pageStartedAt : 0;

  return {
    total: state.totalElapsedMs + runningTotal,
    page: state.pageElapsedMs + runningPage,
  };
}

export function startTimer(state: TimerState): TimerState {
  if (state.isRunning) return state;
  const now = Date.now();
  return {
    ...state,
    isRunning: true,
    totalStartedAt: now,
    pageStartedAt: now,
  };
}

export function pauseTimer(state: TimerState): TimerState {
  if (!state.isRunning) return state;
  const now = Date.now();
  const elapsed = elapsedMs(state, now);
  return {
    ...state,
    isRunning: false,
    totalStartedAt: null,
    pageStartedAt: null,
    totalElapsedMs: elapsed.total,
    pageElapsedMs: elapsed.page,
  };
}

export function resetTimer(currentIndex: number): TimerState {
  return {
    isRunning: false,
    totalStartedAt: null,
    totalElapsedMs: 0,
    pageStartedAt: null,
    pageElapsedMs: 0,
    currentIndex,
  };
}

export function resetPageTimer(state: TimerState, currentIndex: number): TimerState {
  if (state.currentIndex === currentIndex) return state;
  if (!state.isRunning) {
    return { ...state, currentIndex, pageElapsedMs: 0, pageStartedAt: null };
  }
  const now = Date.now();
  const elapsed = elapsedMs(state, now);
  return {
    ...state,
    currentIndex,
    totalElapsedMs: elapsed.total,
    totalStartedAt: now,
    pageElapsedMs: 0,
    pageStartedAt: now,
  };
}

export function applyTimerSnapshot(state: TimerState, snapshot: Partial<TimerSnapshot>): TimerState {
  return {
    ...state,
    isRunning: snapshot.isRunning ?? state.isRunning,
    totalStartedAt: snapshot.startedAt ?? null,
    totalElapsedMs: snapshot.totalElapsedMs ?? state.totalElapsedMs,
    pageStartedAt: snapshot.pageStartedAt ?? state.pageStartedAt,
    pageElapsedMs: snapshot.pageElapsedMs ?? state.pageElapsedMs,
  };
}

export function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function formatSeconds(seconds: number) {
  return formatDuration(seconds * 1000);
}
