import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";
import { PresenterMode } from "./components/PresenterMode";
import { InteractionOverlay, type ModalState } from "./components/InteractionOverlay";
import { PreflightPage } from "./components/PreflightPage";
import { SlideImage } from "./components/SlideImage";
import { slides, type Language } from "./data/deck";
import { emptyPollState, sequenceForSlide, type Hotspot, type PollState } from "./data/interactions";
import { createPresentationChannel, type PresentationMessage } from "./presentationChannel";
import {
  applyTimerSnapshot,
  getTimerSnapshot,
  pauseTimer,
  readTimerState,
  resetPageTimer,
  resetTimer,
  saveTimerState,
  startTimer,
  type TimerState,
} from "./usePresentationTimer";

const SLIDE_WIDTH = 1672;
const SLIDE_HEIGHT = 941;
const TRANSITION_MS = 400;
const WHEEL_LOCK_MS = 560;
const TOUCH_THRESHOLD = 48;
const storageKey = "laicai.currentIndex";
const languageStorageKey = "laicai.language";
const interactionStorageKey = "jarvis-presentation.interactions";
const safeModeStorageKey = "jarvis.safeDemoMode";

type ImageDisplayRect = {
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
};

function pageFromHash() {
  const match = location.hash.match(/slide=(\d+)/i);
  if (!match) return null;
  const page = Number(match[1]);
  return Number.isFinite(page) ? page - 1 : null;
}

function clampIndex(index: number) {
  return Math.max(0, Math.min(slides.length - 1, index));
}

function initialIndex() {
  const hashIndex = pageFromHash();
  if (hashIndex !== null) return clampIndex(hashIndex);
  return clampIndex(Number(localStorage.getItem(storageKey) || 0));
}

function readInteractionState(): { steps: Record<number, number>; poll: PollState; finaleActive: boolean } {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(interactionStorageKey) || "");
    return {
      steps: parsed.steps || {},
      poll: parsed.poll || emptyPollState,
      finaleActive: Boolean(parsed.finaleActive),
    };
  } catch {
    return { steps: {}, poll: emptyPollState, finaleActive: false };
  }
}

function isPresenterRoute() {
  const params = new URLSearchParams(location.search);
  return params.get("presenter") === "1" || location.pathname.replace(/\/$/, "").endsWith("/presenter");
}

function isPreflightRoute() {
  const params = new URLSearchParams(location.search);
  return params.get("preflight") === "1" || location.pathname.replace(/\/$/, "").endsWith("/preflight");
}

function getImageDisplayRect(stage: HTMLElement): ImageDisplayRect {
  const box = stage.getBoundingClientRect();
  const imageRatio = SLIDE_WIDTH / SLIDE_HEIGHT;
  const stageRatio = box.width / box.height;
  const width = stageRatio > imageRatio ? box.height * imageRatio : box.width;
  const height = stageRatio > imageRatio ? box.height : box.width / imageRatio;

  return {
    x: (box.width - width) / 2,
    y: (box.height - height) / 2,
    width,
    height,
    scale: width / SLIDE_WIDTH,
  };
}

function useImageDisplayRect(stageRef: RefObject<HTMLDivElement | null>) {
  const [rect, setRect] = useState<ImageDisplayRect>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    scale: 1,
  });

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const update = () => setRect(getImageDisplayRect(stage));
    update();

    const observer = new ResizeObserver(update);
    observer.observe(stage);
    window.visualViewport?.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);

    return () => {
      observer.disconnect();
      window.visualViewport?.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, [stageRef]);

  return rect;
}

function InteractionLayer({ rect }: { rect: ImageDisplayRect }) {
  return (
    <div
      className="interactionLayer"
      aria-hidden="true"
      data-scale={rect.scale}
      style={{
        left: rect.x,
        top: rect.y,
        width: rect.width,
        height: rect.height,
      }}
    />
  );
}

function QuickNav({
  currentIndex,
  language,
  open,
  onClose,
  onJump,
}: {
  currentIndex: number;
  language: Language;
  open: boolean;
  onClose: () => void;
  onJump: (index: number) => void;
}) {
  if (!open) return null;

  return (
    <div className="quickNav" role="dialog" aria-modal="true" aria-label="快速跳页">
      <button className="quickNavBackdrop" type="button" aria-label="关闭快速跳页" onClick={onClose} />
      <div className="quickNavPanel">
        <div className="quickNavHeader">
          <strong>快速跳页</strong>
          <button type="button" onClick={onClose}>ESC</button>
        </div>
        <div className="thumbGrid">
          {slides.map((slide, index) => (
            <button
              className={index === currentIndex ? "thumb active" : "thumb"}
              type="button"
              key={slide.id}
              data-jump={String(slide.id).padStart(2, "0")}
              aria-label={`跳到第 ${index + 1} 页`}
              onClick={() => onJump(index)}
            >
              <img src={slide.thumbnail} alt="" loading="lazy" />
              <span>{String(slide.id).padStart(2, "0")}</span>
              <small>{slide.title[language] || slide.title.zh}</small>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const presenterMode = isPresenterRoute();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [language] = useState<Language>(() => (localStorage.getItem(languageStorageKey) === "en" ? "en" : "zh"));
  const [direction, setDirection] = useState(1);
  const [quickNavOpen, setQuickNavOpen] = useState(false);
  const [timer, setTimer] = useState<TimerState>(() => readTimerState(initialIndex()));
  const [interactionSteps, setInteractionSteps] = useState<Record<number, number>>(() => readInteractionState().steps);
  const [poll, setPoll] = useState<PollState>(() => readInteractionState().poll);
  const [modal, setModal] = useState<ModalState>(null);
  const [hotspotDebug, setHotspotDebug] = useState(() => new URLSearchParams(location.search).get("hotspotDebug") === "1");
  const [finaleActive, setFinaleActive] = useState(() => readInteractionState().finaleActive);
  const [safeDemoMode, setSafeDemoMode] = useState(() => new URLSearchParams(location.search).get("safeDemo") === "1" || sessionStorage.getItem(safeModeStorageKey) === "1");
  const [online, setOnline] = useState(navigator.onLine);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const currentIndexRef = useRef(currentIndex);
  const timerRef = useRef(timer);
  const interactionRef = useRef({ steps: interactionSteps, poll, finaleActive });
  const channelRef = useRef<ReturnType<typeof createPresentationChannel> | null>(null);
  const presenterWindowRef = useRef<Window | null>(null);
  const animatingRef = useRef(false);
  const queuedIndexRef = useRef<number | null>(null);
  const wheelLockRef = useRef(false);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const rect = useImageDisplayRect(stageRef);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  useEffect(() => {
    sessionStorage.setItem(safeModeStorageKey, safeDemoMode ? "1" : "0");
  }, [safeDemoMode]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    timerRef.current = timer;
    saveTimerState(timer);
  }, [timer]);

  useEffect(() => {
    interactionRef.current = { steps: interactionSteps, poll, finaleActive };
    sessionStorage.setItem(interactionStorageKey, JSON.stringify(interactionRef.current));
  }, [finaleActive, interactionSteps, poll]);

  useEffect(() => {
    setTimer((state) => resetPageTimer(state, currentIndex));
  }, [currentIndex]);

  const goTo = useCallback((index: number, options?: { queue?: boolean }) => {
    const nextIndex = clampIndex(index);
    const fromIndex = currentIndexRef.current;
    if (nextIndex === fromIndex) return;
    if (animatingRef.current) {
      if (options?.queue) queuedIndexRef.current = nextIndex;
      return;
    }

    animatingRef.current = true;
    currentIndexRef.current = nextIndex;
    setDirection(nextIndex > fromIndex ? 1 : -1);
    setCurrentIndex(nextIndex);
    window.setTimeout(() => {
      animatingRef.current = false;
      const queuedIndex = queuedIndexRef.current;
      queuedIndexRef.current = null;
      if (queuedIndex !== null) goTo(queuedIndex);
    }, TRANSITION_MS);
  }, []);

  const startTimerIfNeeded = useCallback(() => {
    setTimer((state) => {
      if (state.isRunning || state.totalElapsedMs > 0 || state.totalStartedAt) return state;
      return startTimer(state);
    });
  }, []);

  const next = useCallback(() => {
    startTimerIfNeeded();
    goTo(currentIndexRef.current + 1);
  }, [goTo, startTimerIfNeeded]);
  const prev = useCallback(() => goTo(currentIndexRef.current - 1), [goTo]);

  const post = useCallback((message: PresentationMessage) => {
    channelRef.current?.post(message);
  }, []);

  const syncState = useCallback(() => {
    const snapshot = getTimerSnapshot(timerRef.current);
    post({
      type: "STATE_SYNC",
      currentIndex: currentIndexRef.current,
      language,
      isRunning: snapshot.isRunning,
      startedAt: snapshot.startedAt,
      totalElapsedMs: snapshot.totalElapsedMs,
      pageStartedAt: snapshot.pageStartedAt,
      pageElapsedMs: snapshot.pageElapsedMs,
    });
    post({
      type: "INTERACTION_STATE_SYNC",
      steps: interactionRef.current.steps,
      poll: interactionRef.current.poll,
      finaleActive: interactionRef.current.finaleActive,
    });
  }, [language, post]);

  const updateTimer = useCallback((updater: (state: TimerState) => TimerState, message?: PresentationMessage) => {
    setTimer(updater);
    if (message) post(message);
  }, [post]);

  const applyRemoteTimer = useCallback((message: Extract<PresentationMessage, { type: "STATE_SYNC" }>) => {
    setTimer((state) => {
      const nextState = applyTimerSnapshot(state, message);
      if (
        nextState.isRunning === state.isRunning &&
        nextState.totalStartedAt === state.totalStartedAt &&
        nextState.totalElapsedMs === state.totalElapsedMs &&
        nextState.pageStartedAt === state.pageStartedAt &&
        nextState.pageElapsedMs === state.pageElapsedMs
      ) {
        return state;
      }
      return nextState;
    });
  }, []);

  const startPauseTimer = useCallback(() => {
    const isRunning = timerRef.current.isRunning;
    updateTimer(isRunning ? pauseTimer : startTimer, { type: isRunning ? "TIMER_PAUSE" : "TIMER_START" });
  }, [updateTimer]);

  const resetCurrentTimer = useCallback(() => {
    updateTimer(() => resetTimer(currentIndexRef.current), { type: "TIMER_RESET" });
  }, [updateTimer]);

  useEffect(() => {
    localStorage.setItem(storageKey, String(currentIndex));
    history.replaceState(null, "", `#slide=${currentIndex + 1}`);
    syncState();
  }, [currentIndex]);

  useEffect(() => {
    syncState();
  }, [timer, syncState]);

  useEffect(() => {
    channelRef.current = createPresentationChannel((message) => {
      if (message.type === "REQUEST_STATE") {
        syncState();
        return;
      }
      if (message.type === "STATE_SYNC") {
        if (message.currentIndex !== currentIndexRef.current) goTo(message.currentIndex, { queue: true });
        applyRemoteTimer(message);
        return;
      }
      if (message.type === "GO_TO") goTo(message.index, { queue: true });
      if (message.type === "NEXT") next();
      if (message.type === "PREV") prev();
      if (message.type === "TIMER_START") setTimer(startTimer);
      if (message.type === "TIMER_PAUSE") setTimer(pauseTimer);
      if (message.type === "TIMER_RESET") setTimer(() => resetTimer(currentIndexRef.current));
      if (message.type === "INTERACTION_STEP") setInteractionSteps((state) => ({ ...state, [message.slideId]: message.step }));
      if (message.type === "INTERACTION_RESET") {
        setInteractionSteps((state) => ({ ...state, [message.slideId]: 0 }));
        if (message.slideId === 25) setFinaleActive(false);
      }
      if (message.type === "POLL_UPDATE") setPoll(message.poll);
      if (message.type === "POLL_RESET") setPoll(emptyPollState);
      if (message.type === "OPEN_CASE") setModal({ type: "case", caseId: message.caseId });
      if (message.type === "CLOSE_MODAL") setModal(null);
      if (message.type === "INTERACTION_STATE_SYNC") {
        setInteractionSteps(message.steps);
        setPoll(message.poll);
        setFinaleActive(message.finaleActive);
      }
      if (message.type === "SAFE_MODE") setSafeDemoMode(message.enabled);
      if (message.type === "PREFLIGHT_PING") post({ type: "PREFLIGHT_PONG" });
    });

    channelRef.current.post({ type: "REQUEST_STATE" });

    return () => {
      channelRef.current?.close();
      channelRef.current = null;
    };
  }, [applyRemoteTimer, goTo, next, prev, syncState]);

  const setSlideStep = useCallback((slideId: number, step: number, broadcast = true) => {
    const sequence = sequenceForSlide(slideId);
    const clamped = Math.max(0, Math.min(sequence?.steps.length || 0, step));
    setInteractionSteps((state) => ({ ...state, [slideId]: clamped }));
    if (broadcast) post({ type: "INTERACTION_STEP", slideId, step: clamped });
  }, [post]);

  const resetSlideInteraction = useCallback((slideId: number, broadcast = true) => {
    setInteractionSteps((state) => ({ ...state, [slideId]: 0 }));
    if (slideId === 25) setFinaleActive(false);
    if (broadcast) post({ type: "INTERACTION_RESET", slideId });
  }, [post]);

  const vote = useCallback((option: "A" | "B" | "C") => {
    setPoll((state) => {
      if (state.locked) return state;
      const nextPoll = {
        ...state,
        selectedOption: option,
        counts: { ...state.counts, [option]: state.counts[option] + 1 },
      };
      post({ type: "POLL_UPDATE", poll: nextPoll });
      return nextPoll;
    });
  }, [post]);

  const setPollLocked = useCallback((locked: boolean) => {
    setPoll((state) => {
      const nextPoll = { ...state, locked };
      post({ type: "POLL_UPDATE", poll: nextPoll });
      return nextPoll;
    });
  }, [post]);

  const resetPoll = useCallback(() => {
    setPoll(emptyPollState);
    post({ type: "POLL_RESET" });
  }, [post]);

  const emergencyRecover = useCallback(() => {
    setModal(null);
    setHotspotDebug(false);
    setFinaleActive(false);
    resetSlideInteraction(currentIndexRef.current + 1);
  }, [resetSlideInteraction]);

  const toggleSafeDemo = useCallback(() => {
    setSafeDemoMode((value) => {
      const nextValue = !value;
      post({ type: "SAFE_MODE", enabled: nextValue });
      return nextValue;
    });
  }, [post]);

  const handleHotspot = useCallback((hotspot: Hotspot) => {
    if (hotspot.type === "openCase" && hotspot.payloadId) {
      setModal({ type: "case", caseId: hotspot.payloadId });
      post({ type: "OPEN_CASE", caseId: hotspot.payloadId });
    }
    if (hotspot.type === "sequence") {
      const sequence = sequenceForSlide(hotspot.slideId);
      const index = sequence?.steps.findIndex((item) => item.targetHotspotIds.includes(hotspot.id)) ?? -1;
      if (index >= 0) setSlideStep(hotspot.slideId, index + 1);
    }
    if (hotspot.type === "poll" && ["A", "B", "C"].includes(hotspot.target || "")) vote(hotspot.target as "A" | "B" | "C");
    if (hotspot.type === "beforeAfter") setModal({ type: "beforeAfter" });
    if (hotspot.type === "openVideo") setModal({ type: "video" });
    if (hotspot.type === "finale") {
      setFinaleActive(true);
      post({ type: "INTERACTION_STATE_SYNC", steps: interactionRef.current.steps, poll: interactionRef.current.poll, finaleActive: true });
    }
  }, [post, setSlideStep, vote]);

  const nextInteraction = useCallback(() => {
    const slideId = currentIndexRef.current + 1;
    if (slideId === 25) {
      setFinaleActive(true);
      post({ type: "INTERACTION_STATE_SYNC", steps: interactionRef.current.steps, poll: interactionRef.current.poll, finaleActive: true });
      return;
    }
    const sequence = sequenceForSlide(slideId);
    if (!sequence) return;
    setSlideStep(slideId, (interactionRef.current.steps[slideId] || 0) + 1);
  }, [setSlideStep]);

  const prevInteraction = useCallback(() => {
    const slideId = currentIndexRef.current + 1;
    const sequence = sequenceForSlide(slideId);
    if (!sequence) return;
    setSlideStep(slideId, (interactionRef.current.steps[slideId] || 0) - 1);
  }, [setSlideStep]);

  useEffect(() => {
    const onHashChange = () => {
      const hashIndex = pageFromHash();
      if (hashIndex !== null) goTo(hashIndex);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [goTo]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (presenterMode) return;
      if (event.target instanceof HTMLElement && (/input|textarea|select/i.test(event.target.tagName) || event.target.isContentEditable)) return;
      if (event.key === "Escape" && event.shiftKey) {
        emergencyRecover();
        return;
      }
      if (event.key === "Escape") {
        if (modal) {
          setModal(null);
          post({ type: "CLOSE_MODAL" });
          return;
        }
        if (finaleActive) {
          setFinaleActive(false);
          return;
        }
        if (hotspotDebug) {
          setHotspotDebug(false);
          return;
        }
        setQuickNavOpen(false);
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        nextInteraction();
      }
      if (event.key === "Backspace") {
        event.preventDefault();
        prevInteraction();
      }
      if (event.key === "0") resetSlideInteraction(currentIndexRef.current + 1);
      if (["a", "b", "c"].includes(event.key.toLowerCase()) && currentIndexRef.current + 1 === 19) vote(event.key.toUpperCase() as "A" | "B" | "C");
      if (event.key === "ArrowRight" || event.key === " ") {
        event.preventDefault();
        next();
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        prev();
      }
      if (event.key.toLowerCase() === "p") openPresenterWindow();
      if (event.key.toLowerCase() === "g") setQuickNavOpen((value: boolean) => !value);
      if (event.key.toLowerCase() === "h") setHotspotDebug((value) => !value);
      if (event.key.toLowerCase() === "s") toggleSafeDemo();
      if (event.key.toLowerCase() === "v" && [19, 20].includes(currentIndexRef.current + 1)) setModal({ type: "video" });
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [emergencyRecover, finaleActive, hotspotDebug, modal, next, nextInteraction, post, presenterMode, prev, prevInteraction, resetSlideInteraction, toggleSafeDemo, vote]);

  useEffect(() => {
    const onWheel = (event: WheelEvent) => {
      if (quickNavOpen || wheelLockRef.current || Math.abs(event.deltaY) < 24) return;
      wheelLockRef.current = true;
      event.deltaY > 0 ? next() : prev();
      window.setTimeout(() => {
        wheelLockRef.current = false;
      }, WHEEL_LOCK_MS);
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);
  }, [next, prev, quickNavOpen]);

  useEffect(() => {
    const onTouchStart = (event: TouchEvent) => {
      const touch = event.changedTouches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    };
    const onTouchEnd = (event: TouchEvent) => {
      if (quickNavOpen) return;
      const touch = event.changedTouches[0];
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;
      const primary = Math.abs(dx) > Math.abs(dy) ? dx : dy;
      if (Math.abs(primary) < TOUCH_THRESHOLD) return;
      primary < 0 ? next() : prev();
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [next, prev, quickNavOpen]);

  useEffect(() => {
    for (let offset = -2; offset <= 2; offset += 1) {
      const slide = slides[currentIndex + offset];
      if (!slide) continue;
      const img = new Image();
      img.src = slide.image;
    }
  }, [currentIndex]);

  const progress = useMemo(() => `${((currentIndex + 1) / slides.length) * 100}%`, [currentIndex]);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.();
  };

  if (isPreflightRoute()) {
    return <PreflightPage onEnter={() => location.assign(`${location.origin}${location.pathname}#slide=1`)} />;
  }

  const openPresenterWindow = () => {
    if (presenterWindowRef.current && !presenterWindowRef.current.closed) {
      presenterWindowRef.current.focus();
      return;
    }
    const url = new URL(window.location.href);
    url.searchParams.set("presenter", "1");
    url.hash = `slide=${currentIndexRef.current + 1}`;
    presenterWindowRef.current = window.open(url.toString(), "jarvis-presenter", "popup,width=1440,height=900");
    presenterWindowRef.current?.focus();
  };

  const presenterGoTo = (index: number) => {
    goTo(index, { queue: true });
    post({ type: "GO_TO", index });
  };

  const presenterNext = () => {
    next();
    post({ type: "NEXT" });
  };

  const presenterPrev = () => {
    prev();
    post({ type: "PREV" });
  };

  if (presenterMode) {
    return (
      <PresenterMode
        currentIndex={currentIndex}
        language={language}
        timer={timer}
        onNext={presenterNext}
        onPrev={presenterPrev}
        onGoTo={presenterGoTo}
        onPost={post}
        onStartPauseTimer={startPauseTimer}
        onResetTimer={resetCurrentTimer}
        interactionStep={interactionSteps[currentIndex + 1] || 0}
        poll={poll}
        modal={modal}
        onInteractionNext={nextInteraction}
        onInteractionPrev={prevInteraction}
        onInteractionReset={() => resetSlideInteraction(currentIndex + 1)}
        onPollLock={setPollLocked}
        onPollVote={vote}
        onPollReset={resetPoll}
        onOpenCase={(caseId) => {
          setModal({ type: "case", caseId });
          post({ type: "OPEN_CASE", caseId });
        }}
        onCloseModal={() => {
          setModal(null);
          post({ type: "CLOSE_MODAL" });
        }}
        safeDemoMode={safeDemoMode}
        online={online}
        onToggleSafeDemo={toggleSafeDemo}
        onEmergencyRecover={emergencyRecover}
      />
    );
  }

  return (
    <main className="deck" aria-label="来财有方演讲系统">
      <div className="stage" ref={stageRef}>
        <SlideImage slide={slides[currentIndex]} direction={direction} language={language} />
        <InteractionLayer rect={rect} />
        <InteractionOverlay
          slideId={currentIndex + 1}
          language={language}
          rect={rect}
          step={interactionSteps[currentIndex + 1] || 0}
          poll={poll}
          modal={modal}
          hotspotDebug={hotspotDebug}
          finaleActive={finaleActive}
          controlsHidden={finaleActive}
          onHotspot={handleHotspot}
          onModal={(nextModal) => {
            setModal(nextModal);
            if (!nextModal) post({ type: "CLOSE_MODAL" });
          }}
          onStep={(step) => setSlideStep(currentIndex + 1, step)}
          onVote={vote}
          onPollLock={setPollLocked}
          onPollReset={resetPoll}
          onHotspotDebug={setHotspotDebug}
          onFinaleExit={() => setFinaleActive(false)}
          safeDemoMode={safeDemoMode}
          online={online}
        />
      </div>

      <div className={finaleActive ? "topControls controlsHidden" : "topControls"}>
        <button type="button" onClick={() => setQuickNavOpen(true)}>跳页</button>
        <button type="button" onClick={toggleFullscreen}>全屏</button>
        {safeDemoMode && <span className="safeBadge">SAFE</span>}
      </div>

      <footer className={finaleActive ? "deckFooter controlsHidden" : "deckFooter"}>
        <div className="progress" aria-hidden="true">
          <span style={{ width: progress }} />
        </div>
        <div className="counter" aria-live="polite">
          {String(currentIndex + 1).padStart(2, "0")} / {slides.length}
        </div>
      </footer>

      <QuickNav
        currentIndex={currentIndex}
        language={language}
        open={quickNavOpen}
        onClose={() => setQuickNavOpen(false)}
        onJump={(index) => {
          setQuickNavOpen(false);
          goTo(index, { queue: true });
        }}
      />
    </main>
  );
}
