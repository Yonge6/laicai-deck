import { useEffect, useMemo, useRef, useState } from "react";
import { slides, type Language } from "../data/deck";
import { caseStudies, pollOptions, sequenceForSlide, type PollState } from "../data/interactions";
import { afterAsset, assetExists, assetStatus, beforeAsset, videoAsset } from "../assets";
import { demoPrompts } from "../data/demoPrompts";
import type { ModalState } from "./InteractionOverlay";
import type { PresentationMessage } from "../presentationChannel";
import { elapsedMs, formatDuration, formatSeconds, type TimerState } from "../usePresentationTimer";
import { SlidePreview } from "./SlideImage";

const noteFontKey = "jarvis-presenter.noteFont";
const noteDraftKey = (slideId: number, language: Language) => `jarvis-presenter.notes.${language}.${slideId}`;

function padPage(index: number) {
  return String(index + 1).padStart(2, "0");
}

function cleanNoteText(text: string) {
  return text
    .replace(/^#\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/^\[(互动|停顿|演示)\]\s*/gm, "$1：");
}

function PresenterQuickNav({
  currentIndex,
  language,
  onClose,
  onJump,
}: {
  currentIndex: number;
  language: Language;
  onClose: () => void;
  onJump: (index: number) => void;
}) {
  const [activeIndex, setActiveIndex] = useState(currentIndex);
  const [pageInput, setPageInput] = useState("");
  const activeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const jumpToInput = () => {
    const page = Number(pageInput);
    if (!Number.isFinite(page)) return;
    onJump(Math.max(0, Math.min(slides.length - 1, page - 1)));
  };

  return (
    <div
      className="presenterQuickNav"
      role="dialog"
      aria-modal="true"
      aria-label="演讲者快速跳页"
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose();
        if (event.target instanceof HTMLInputElement) return;
        if (event.key === "ArrowDown") {
          event.preventDefault();
          setActiveIndex((value) => Math.min(slides.length - 1, value + 1));
        }
        if (event.key === "ArrowUp") {
          event.preventDefault();
          setActiveIndex((value) => Math.max(0, value - 1));
        }
        if (event.key === "Enter") onJump(activeIndex);
      }}
    >
      <button className="quickNavBackdrop" type="button" aria-label="关闭快速跳页" onClick={onClose} />
      <div className="presenterQuickPanel">
        <div className="quickNavHeader">
          <strong>快速跳页</strong>
          <label>
            页码
            <input
              value={pageInput}
              inputMode="numeric"
              onChange={(event) => setPageInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") jumpToInput();
                if (event.key === "Escape") onClose();
              }}
            />
          </label>
          <button type="button" onClick={jumpToInput}>跳转</button>
          <button type="button" onClick={onClose}>ESC</button>
        </div>
        <div className="presenterJumpList">
          {slides.map((slide, index) => (
            <button
              ref={index === activeIndex ? activeRef : null}
              className={[
                "presenterJumpItem",
                index === currentIndex ? "current" : "",
                index === activeIndex ? "active" : "",
              ].join(" ")}
              type="button"
              key={slide.id}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => onJump(index)}
            >
              <img src={slide.thumbnail} alt="" />
              <span>{padPage(index)}</span>
              <strong>{slide.title[language] || slide.title.zh}</strong>
              <small>{slide.chapter[language] || slide.chapter.zh} · {formatSeconds(slide.durationSec)}</small>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PresenterMode({
  currentIndex,
  language,
  timer,
  onNext,
  onPrev,
  onGoTo,
  onPost,
  onStartPauseTimer,
  onResetTimer,
  interactionStep,
  poll,
  modal,
  onInteractionNext,
  onInteractionPrev,
  onInteractionReset,
  onPollLock,
  onPollVote,
  onPollReset,
  onOpenCase,
  onCloseModal,
  safeDemoMode,
  online,
  onToggleSafeDemo,
  onEmergencyRecover,
}: {
  currentIndex: number;
  language: Language;
  timer: TimerState;
  onNext: () => void;
  onPrev: () => void;
  onGoTo: (index: number) => void;
  onPost: (message: PresentationMessage) => void;
  onStartPauseTimer: () => void;
  onResetTimer: () => void;
  interactionStep: number;
  poll: PollState;
  modal: ModalState;
  onInteractionNext: () => void;
  onInteractionPrev: () => void;
  onInteractionReset: () => void;
  onPollLock: (locked: boolean) => void;
  onPollVote: (option: "A" | "B" | "C") => void;
  onPollReset: () => void;
  onOpenCase: (caseId: string) => void;
  onCloseModal: () => void;
  safeDemoMode: boolean;
  online: boolean;
  onToggleSafeDemo: () => void;
  onEmergencyRecover: () => void;
}) {
  const [now, setNow] = useState(Date.now());
  const [quickNavOpen, setQuickNavOpen] = useState(false);
  const [noteFont, setNoteFont] = useState(() => Number(localStorage.getItem(noteFontKey) || 22));
  const [rehearsal, setRehearsal] = useState(() => readRehearsal());
  const [assetsReady, setAssetsReady] = useState({ video: false, beforeAfter: false });
  const [noteSaved, setNoteSaved] = useState(true);
  const notesRef = useRef<HTMLTextAreaElement | null>(null);
  const slide = slides[currentIndex];
  const nextSlide = slides[currentIndex + 1];
  const defaultNote = cleanNoteText(slide.notes[language] || slide.notes.zh);
  const [noteText, setNoteText] = useState(() => cleanNoteText(localStorage.getItem(noteDraftKey(slide.id, language)) || defaultNote));
  const sequence = sequenceForSlide(slide.id);
  const elapsed = elapsedMs(timer, now);
  const totalDurationSec = useMemo(() => slides.reduce((sum, item) => sum + item.durationSec, 0), []);
  const isOverTime = elapsed.page > slide.durationSec * 1000;

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    Promise.all([assetStatus.backupVideo === "skipped" ? Promise.resolve(false) : assetExists(videoAsset), assetExists(beforeAsset), assetExists(afterAsset)]).then(([video, before, after]) => {
      setAssetsReady({ video, beforeAfter: before && after });
    });
  }, []);

  useEffect(() => {
    setRehearsal((state) => recordSlideEntry(state, slide.id));
  }, [slide.id]);

  useEffect(() => {
    localStorage.setItem(noteFontKey, String(noteFont));
  }, [noteFont]);

  useEffect(() => {
    setNoteText(cleanNoteText(localStorage.getItem(noteDraftKey(slide.id, language)) || defaultNote));
    setNoteSaved(true);
  }, [defaultNote, language, slide.id]);

  useEffect(() => {
    onPost({ type: "REQUEST_STATE" });
  }, [onPost]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement && /input|textarea|select/i.test(event.target.tagName)) return;
      if (event.key === "Escape") {
        setQuickNavOpen(false);
        return;
      }
      if (event.key === "ArrowRight" || event.key === " ") {
        event.preventDefault();
        onNext();
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        onPrev();
      }
      if (event.key.toLowerCase() === "g") setQuickNavOpen((value) => !value);
      if (event.key.toLowerCase() === "t") onStartPauseTimer();
      if (event.key.toLowerCase() === "r" && window.confirm("确定重置本场计时吗？")) onResetTimer();
      if (event.key.toLowerCase() === "n") notesRef.current?.focus();
      if (event.key === "Escape" && event.shiftKey) onEmergencyRecover();
      if (event.key === "Enter") onInteractionNext();
      if (event.key === "Backspace") onInteractionPrev();
      if (event.key === "0") onInteractionReset();
      if (["a", "b", "c"].includes(event.key.toLowerCase()) && slide.id === 19) {
        const option = event.key.toUpperCase() as "A" | "B" | "C";
        onPollVote(option);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onEmergencyRecover, onInteractionNext, onInteractionPrev, onInteractionReset, onNext, onPollVote, onPrev, onResetTimer, onStartPauseTimer, slide.id]);

  return (
    <main className="presenter">
      <header className="presenterTop">
        <div>
          <strong>{padPage(currentIndex)} / {slides.length}</strong>
          <span>{slide.chapter[language] || slide.chapter.zh} · {online ? "在线" : "离线"} · {safeDemoMode ? "安全模式" : "标准模式"}</span>
        </div>
        <div className="timerStrip">
          <span className={isOverTime ? "overTime" : ""}>本页 {formatDuration(elapsed.page)} / {formatSeconds(slide.durationSec)}</span>
          <span>全场 {formatDuration(elapsed.total)} / {formatSeconds(totalDurationSec)}</span>
        </div>
        <div className="presenterControls">
          <button type="button" onClick={onPrev} disabled={currentIndex === 0}>上一页</button>
          <button type="button" onClick={onNext} disabled={currentIndex === slides.length - 1}>下一页</button>
          <button type="button" onClick={() => setQuickNavOpen(true)}>快速跳页</button>
          <button type="button" onClick={onStartPauseTimer}>{timer.isRunning ? "暂停" : "开始"}</button>
          <button type="button" onClick={() => window.confirm("确定重置本场计时吗？") && onResetTimer()}>重置</button>
          <button type="button" onClick={onToggleSafeDemo}>{safeDemoMode ? "关闭安全模式" : "安全演示模式"}</button>
          <button type="button" onClick={onEmergencyRecover}>紧急恢复</button>
        </div>
      </header>

      <section className="presenterGrid">
        <div className="panel currentPreview">
          <div className="panelTitle">当前页预览</div>
          <SlidePreview slide={slide} language={language} label="当前页" />
        </div>
        <div className="panel nextPreview">
          <div className="panelTitle">下一页预览</div>
          <SlidePreview slide={nextSlide} language={language} label="演讲结束" />
        </div>
        <div className="panel notePanel">
          <div className="panelTitle">
            <span>当前页口播稿</span>
            <span className="fontControls">
              <span className="saveState">{noteSaved ? "已自动保存" : "保存中"}</span>
              <button type="button" onClick={() => setNoteFont((value) => Math.max(18, value - 2))}>A-</button>
              <button type="button" onClick={() => setNoteFont((value) => Math.min(34, value + 2))}>A+</button>
            </span>
          </div>
          <div className="speakerNotesWrap">
            <textarea
              ref={notesRef}
              className="speakerNotes speakerNotesEditor"
              value={noteText}
              aria-label="当前页口播稿，可编辑，自动保存"
              spellCheck={false}
              style={{ fontSize: noteFont }}
              onChange={(event) => {
                const value = event.target.value;
                setNoteSaved(false);
                setNoteText(value);
                localStorage.setItem(noteDraftKey(slide.id, language), value);
                setNoteSaved(true);
              }}
            />
          </div>
        </div>
        <aside className="panel infoPanel">
          <div className="panelTitle">当前页信息</div>
          <h1>{slide.title[language] || slide.title.zh}</h1>
          <dl>
            <dt>章节</dt>
            <dd>{slide.chapter[language] || slide.chapter.zh}</dd>
            <dt>预计时间</dt>
            <dd>{formatSeconds(slide.durationSec)}</dd>
            <dt>演示链接</dt>
            <dd>{slide.links?.length ? "已配置" : "暂无"}</dd>
            <dt>备用视频</dt>
            <dd>{slide.backupVideo ? "已配置" : "暂无"}</dd>
            <dt>现场 Demo Prompt</dt>
            <dd>{slide.demoPrompts?.length ? "已配置" : "暂无"}</dd>
          </dl>
          <InteractionControl
            slideId={slide.id}
            step={interactionStep}
            sequenceLabel={sequence?.steps[Math.max(0, interactionStep - 1)]?.label}
            hasSequence={Boolean(sequence)}
            poll={poll}
            modal={modal}
            onNext={onInteractionNext}
            onPrev={onInteractionPrev}
            onReset={onInteractionReset}
            onPollLock={onPollLock}
            onPollReset={onPollReset}
            onOpenCase={onOpenCase}
            onCloseModal={onCloseModal}
            assetsReady={assetsReady}
            rehearsal={rehearsal}
            onRehearsalChange={setRehearsal}
          />
        </aside>
      </section>

      {quickNavOpen && (
        <PresenterQuickNav
          currentIndex={currentIndex}
          language={language}
          onClose={() => setQuickNavOpen(false)}
          onJump={(index) => {
            setQuickNavOpen(false);
            onGoTo(index);
          }}
        />
      )}
    </main>
  );
}

type RehearsalState = {
  startedAt: number | null;
  slideStartedAt: number | null;
  slideDurations: Record<number, number>;
  interactionsUsed: string[];
  demoOption?: "A" | "B" | "C";
  backupVideoUsed: boolean;
  errors: string[];
  reportOpen: boolean;
};

function readRehearsal(): RehearsalState {
  try {
    const parsed = JSON.parse(sessionStorage.getItem("jarvis-rehearsal") || "");
    return parsed.startedAt !== undefined ? parsed : emptyRehearsal();
  } catch {
    return emptyRehearsal();
  }
}

function emptyRehearsal(): RehearsalState {
  return { startedAt: null, slideStartedAt: null, slideDurations: {}, interactionsUsed: [], backupVideoUsed: false, errors: [], reportOpen: false };
}

function saveRehearsal(state: RehearsalState) {
  sessionStorage.setItem("jarvis-rehearsal", JSON.stringify(state));
  return state;
}

function recordSlideEntry(state: RehearsalState, slideId: number) {
  if (!state.startedAt) return state;
  const now = Date.now();
  const prevSlide = Number(sessionStorage.getItem("jarvis-rehearsal-slide") || slideId);
  const next = {
    ...state,
    slideStartedAt: now,
    slideDurations: state.slideStartedAt ? {
      ...state.slideDurations,
      [prevSlide]: (state.slideDurations[prevSlide] || 0) + Math.round((now - state.slideStartedAt) / 1000),
    } : state.slideDurations,
  };
  sessionStorage.setItem("jarvis-rehearsal-slide", String(slideId));
  return saveRehearsal(next);
}

function buildReport(state: RehearsalState) {
  const endedAt = Date.now();
  return {
    startedAt: state.startedAt || endedAt,
    endedAt,
    totalDurationSec: state.startedAt ? Math.round((endedAt - state.startedAt) / 1000) : 0,
    slideDurations: slides.map((slide) => {
      const actualSec = state.slideDurations[slide.id] || 0;
      return { slideId: slide.id, expectedSec: slide.durationSec, actualSec, overtimeSec: Math.max(0, actualSec - slide.durationSec) };
    }),
    interactionsUsed: state.interactionsUsed,
    demoOption: state.demoOption,
    backupVideoUsed: state.backupVideoUsed,
    errors: state.errors,
  };
}

function InteractionControl({
  slideId,
  step,
  sequenceLabel,
  hasSequence,
  poll,
  modal,
  onNext,
  onPrev,
  onReset,
  onPollLock,
  onPollReset,
  onOpenCase,
  onCloseModal,
  assetsReady,
  rehearsal,
  onRehearsalChange,
}: {
  slideId: number;
  step: number;
  sequenceLabel?: string;
  hasSequence: boolean;
  poll: PollState;
  modal: ModalState;
  onNext: () => void;
  onPrev: () => void;
  onReset: () => void;
  onPollLock: (locked: boolean) => void;
  onPollReset: () => void;
  onOpenCase: (caseId: string) => void;
  onCloseModal: () => void;
  assetsReady: { video: boolean; beforeAfter: boolean };
  rehearsal: RehearsalState;
  onRehearsalChange: (state: RehearsalState) => void;
}) {
  const caseIds = slideId === 6 ? ["pluto"] : slideId === 7 ? ["quoteLog"] : slideId === 8 ? ["familyGrowthTree", "zaha", "worldCup"] : slideId === 11 ? ["oneLaserBooth"] : [];

  return (
    <section className="interactionControl">
      <h2>本页互动</h2>
      {!hasSequence && slideId !== 19 && !caseIds.length && slideId !== 20 && slideId !== 25 && <p>本页无互动，直接讲解即可。</p>}
      {hasSequence && (
        <>
          <p>当前步骤：{step || 0}{sequenceLabel ? ` · ${sequenceLabel}` : ""}</p>
          <div className="interactionButtons">
            <button type="button" onClick={onPrev}>上一步</button>
            <button type="button" onClick={onNext}>下一步</button>
            <button type="button" onClick={onReset}>重置</button>
          </div>
        </>
      )}
      {caseIds.length > 0 && (
        <div className="caseShortcutList">
          <strong>案例链接</strong>
          {caseIds.map((id) => {
            const item = caseStudies.find((caseItem) => caseItem.id === id);
            return <button key={id} type="button" onClick={() => onOpenCase(id)}>{item?.title || id}</button>;
          })}
        </div>
      )}
      {slideId === 19 && (
        <div className="pollControls">
          <strong>投票控制</strong>
          {pollOptions.map((option) => <span key={option.id}>{option.id}: {poll.counts[option.id]} 票</span>)}
          <button type="button" onClick={() => onPollLock(!poll.locked)}>{poll.locked ? "解锁投票" : "锁定投票"}</button>
          <button type="button" onClick={onPollReset}>重置投票</button>
          <PromptPanel />
          <button type="button" disabled>打开 Codex（占位）</button>
        </div>
      )}
      {slideId === 20 && <p>备用视频已跳过；{assetsReady.beforeAfter ? "Before / After 已准备" : "Before / After 素材尚未准备"}</p>}
      {slideId === 25 && (
        <div className="interactionButtons">
          <button type="button" onClick={onNext}>最终定格</button>
          <button type="button" onClick={onReset}>恢复</button>
        </div>
      )}
      {modal && <button type="button" onClick={onCloseModal}>关闭当前弹层</button>}
      <RehearsalPanel rehearsal={rehearsal} onChange={onRehearsalChange} />
    </section>
  );
}

function PromptPanel() {
  const [selected, setSelected] = useState<keyof typeof demoPrompts>("jarvis-mode");
  const [copied, setCopied] = useState(false);
  const prompt = demoPrompts[selected];
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt.content);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="promptPanel">
      <select value={selected} onChange={(event) => setSelected(event.target.value as keyof typeof demoPrompts)}>
        {Object.values(demoPrompts).map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
      </select>
      <small>当前选择：{prompt.label} · {prompt.content.length} 字</small>
      <textarea readOnly value={prompt.content} />
      <button type="button" onClick={copy}>{copied ? "已复制" : "复制 Prompt"}</button>
    </div>
  );
}

function RehearsalPanel({ rehearsal, onChange }: { rehearsal: RehearsalState; onChange: (state: RehearsalState) => void }) {
  const report = buildReport(rehearsal);
  const text = JSON.stringify(report, null, 2);
  return (
    <div className="rehearsalPanel">
      <strong>彩排模式</strong>
      <button type="button" onClick={() => onChange(saveRehearsal({ ...emptyRehearsal(), startedAt: Date.now(), slideStartedAt: Date.now() }))}>开始完整彩排</button>
      <button type="button" onClick={() => onChange(saveRehearsal({ ...rehearsal, reportOpen: !rehearsal.reportOpen }))}>查看报告</button>
      <button type="button" onClick={() => navigator.clipboard?.writeText(text)}>复制报告</button>
      <a href={`data:application/json;charset=utf-8,${encodeURIComponent(text)}`} download="rehearsal-report.json">下载 JSON</a>
      <button type="button" onClick={() => onChange(saveRehearsal(emptyRehearsal()))}>重置彩排</button>
      {rehearsal.reportOpen && <pre>{text}</pre>}
    </div>
  );
}
