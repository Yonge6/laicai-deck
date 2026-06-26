import { useEffect, useMemo, useRef, useState } from "react";
import { afterAsset, assetExists, beforeAsset, casePreviewAssets, videoAsset, videoPosterAsset } from "../assets";
import { assetPath } from "../path";
import type { Language } from "../data/deck";
import {
  caseById,
  hotspotsForSlide,
  pollOptions,
  sequenceForSlide,
  zahaLinks,
  type CaseStudy,
  type Hotspot,
  type PollState,
} from "../data/interactions";

type Rect = { x: number; y: number; width: number; height: number; scale: number };

export type ModalState =
  | { type: "case"; caseId: string }
  | { type: "beforeAfter" }
  | { type: "video" }
  | null;

function pctStyle(hotspot: Hotspot) {
  return {
    left: `${hotspot.x}%`,
    top: `${hotspot.y}%`,
    width: `${hotspot.width}%`,
    height: `${hotspot.height}%`,
  };
}

function hotspotConfig(hotspot: Hotspot) {
  return JSON.stringify(
    {
      id: hotspot.id,
      slideId: hotspot.slideId,
      x: Number(hotspot.x.toFixed(2)),
      y: Number(hotspot.y.toFixed(2)),
      width: Number(hotspot.width.toFixed(2)),
      height: Number(hotspot.height.toFixed(2)),
      label: hotspot.label,
      type: hotspot.type,
      payloadId: hotspot.payloadId,
      target: hotspot.target,
      visibleStyle: hotspot.visibleStyle,
    },
    null,
    2,
  );
}

function hotspotDetail(hotspot: Hotspot, language: Language) {
  if (hotspot.type === "openCase") return caseById(hotspot.payloadId)?.description || "点击查看案例详情";
  if (hotspot.type === "poll") return "点击选择这个现场 Demo";
  if (hotspot.type === "sequence") return "点击或按 Enter 推进当前步骤";
  if (hotspot.type === "beforeAfter") return "点击查看修改前后对比";
  if (hotspot.type === "openVideo") return "点击打开备用演示入口";
  if (hotspot.type === "finale") return "点击进入最终定格";
  return hotspot.label[language] || hotspot.label.zh;
}

export function InteractionOverlay({
  slideId,
  language,
  rect,
  step,
  poll,
  modal,
  hotspotDebug,
  finaleActive,
  controlsHidden,
  onHotspot,
  onModal,
  onStep,
  onVote,
  onPollLock,
  onPollReset,
  onHotspotDebug,
  onFinaleExit,
  safeDemoMode,
  online,
}: {
  slideId: number;
  language: Language;
  rect: Rect;
  step: number;
  poll: PollState;
  modal: ModalState;
  hotspotDebug: boolean;
  finaleActive: boolean;
  controlsHidden: boolean;
  onHotspot: (hotspot: Hotspot) => void;
  onModal: (modal: ModalState) => void;
  onStep: (step: number) => void;
  onVote: (option: "A" | "B" | "C") => void;
  onPollLock: (locked: boolean) => void;
  onPollReset: () => void;
  onHotspotDebug: (enabled: boolean) => void;
  onFinaleExit: () => void;
  safeDemoMode: boolean;
  online: boolean;
}) {
  const hotspots = hotspotsForSlide(slideId);
  const sequence = sequenceForSlide(slideId);
  const activeIds = new Set(sequence?.steps[Math.max(0, step - 1)]?.targetHotspotIds || []);
  const doneIds = new Set(sequence?.steps.slice(0, Math.max(0, step - 1)).flatMap((item) => item.targetHotspotIds) || []);

  return (
    <>
      <div
        className={[
          "hotspotLayer",
          hotspotDebug ? "showHotspots" : "",
          controlsHidden ? "controlsHidden" : "",
        ].join(" ")}
        style={{ left: rect.x, top: rect.y, width: rect.width, height: rect.height }}
      >
        {hotspots.map((hotspot) => (
          <button
            key={hotspot.id}
            className={[
              "hotspot",
              `style-${hotspot.visibleStyle || "none"}`,
              activeIds.has(hotspot.id) ? "active" : "",
              doneIds.has(hotspot.id) ? "done" : "",
              hotspot.type === "poll" && poll.selectedOption === hotspot.target ? "selected" : "",
            ].join(" ")}
            style={pctStyle(hotspot)}
            type="button"
            aria-label={hotspot.label[language] || hotspot.label.zh}
            onClick={() => onHotspot(hotspot)}
          >
            <span className="hotspotDot" aria-hidden="true" />
            <span className="hotspotTip">
              <strong>{hotspot.label[language] || hotspot.label.zh}</strong>
              <em>{hotspotDetail(hotspot, language)}</em>
            </span>
          </button>
        ))}
        {slideId === 19 && <PollPanel poll={poll} onVote={onVote} onLock={onPollLock} onReset={onPollReset} />}
        {slideId === 25 && finaleActive && (
          <div className="finaleOverlay">
            <div className="finaleGlow" />
            <p>我的“1”到底是什么？</p>
            <button type="button" onClick={onFinaleExit}>ESC 恢复</button>
          </div>
        )}
        {hotspotDebug && (
          <HotspotDebugPanel
            slideId={slideId}
            rect={rect}
            hotspots={hotspots}
            onClose={() => onHotspotDebug(false)}
          />
        )}
      </div>
      {modal?.type === "case" && <CaseModal item={caseById(modal.caseId)} safeDemoMode={safeDemoMode} online={online} onClose={() => onModal(null)} />}
      {modal?.type === "beforeAfter" && <BeforeAfterModal onClose={() => onModal(null)} />}
      {modal?.type === "video" && <VideoModal onClose={() => onModal(null)} />}
    </>
  );
}

function PollPanel({
  poll,
  onVote,
  onLock,
  onReset,
}: {
  poll: PollState;
  onVote: (option: "A" | "B" | "C") => void;
  onLock: (locked: boolean) => void;
  onReset: () => void;
}) {
  const total = Math.max(1, poll.counts.A + poll.counts.B + poll.counts.C);
  const leader = pollOptions.reduce((best, item) => (poll.counts[item.id] > poll.counts[best] ? item.id : best), "A" as "A" | "B" | "C");

  return (
    <aside className="pollPanel">
      <strong>{poll.locked ? "最终结果" : "现场选择"}</strong>
      {pollOptions.map((option) => {
        const percent = Math.round((poll.counts[option.id] / total) * 100);
        return (
          <button
            type="button"
            key={option.id}
            className={leader === option.id ? "leader" : ""}
            disabled={poll.locked}
            onClick={() => onVote(option.id)}
          >
            <span>{option.id} {option.title}</span>
            <em>{poll.counts[option.id]} 票 · {percent}%</em>
          </button>
        );
      })}
      <div>
        <button type="button" onClick={() => onLock(!poll.locked)}>{poll.locked ? "解锁" : "锁定"}</button>
        <button type="button" onClick={onReset}>重置</button>
      </div>
    </aside>
  );
}

function CaseModal({ item, safeDemoMode, online, onClose }: { item?: CaseStudy; safeDemoMode: boolean; online: boolean; onClose: () => void }) {
  const firstButton = useRef<HTMLButtonElement | null>(null);
  const [previewReady, setPreviewReady] = useState(false);
  const links = item?.id === "zaha" ? zahaLinks : item?.url ? [item.url] : [];
  const previewImage = item ? (casePreviewAssets[item.id] || item.previewImage) : undefined;

  useEffect(() => {
    let alive = true;
    if (!previewImage) {
      setPreviewReady(false);
      return;
    }
    assetExists(previewImage).then((exists) => alive && setPreviewReady(exists));
    return () => {
      alive = false;
    };
  }, [previewImage]);

  return (
    <div className="modalShell" role="dialog" aria-modal="true" onKeyDown={(event) => event.key === "Escape" && onClose()}>
      <button className="modalBackdrop" type="button" aria-label="关闭" onClick={onClose} />
      <section className="caseModal">
        <button ref={firstButton} className="modalClose" type="button" onClick={onClose}>关闭</button>
        <h2>{item?.title || "案例"}</h2>
        <p>{item?.description || "当前案例暂时无法载入，可在新窗口中尝试打开。"}</p>
        <div className="casePreview">
          {previewReady && previewImage ? <img src={assetPath(previewImage)} alt="" /> : <span>{safeDemoMode ? "安全演示模式：优先使用本地预览图。" : item?.fallbackMessage || "当前案例暂时无法载入，可在新窗口中尝试打开。"}</span>}
        </div>
        <div className="caseActions">
          {links.length ? links.map((url) => (
            online ? <a key={url} href={url} target="_blank" rel="noopener noreferrer">打开真实产品</a> : <span key={url}>当前离线</span>
          )) : <span>正式产品链接待补充。</span>}
        </div>
      </section>
    </div>
  );
}

function BeforeAfterModal({ onClose }: { onClose: () => void }) {
  const [beforeReady, setBeforeReady] = useState(false);
  const [afterReady, setAfterReady] = useState(false);
  const [pos, setPos] = useState(50);

  useEffect(() => {
    assetExists(beforeAsset).then(setBeforeReady);
    assetExists(afterAsset).then(setAfterReady);
  }, []);

  const drag = (clientX: number, target: HTMLDivElement) => {
    const box = target.getBoundingClientRect();
    setPos(Math.max(0, Math.min(100, ((clientX - box.left) / box.width) * 100)));
  };

  return (
    <div className="modalShell" role="dialog" aria-modal="true" onKeyDown={(event) => event.key === "Escape" && onClose()}>
      <button className="modalBackdrop" type="button" aria-label="关闭" onClick={onClose} />
      <section className="caseModal beforeAfterModal">
        <button className="modalClose" type="button" onClick={onClose}>关闭</button>
        <h2>修改前后对比</h2>
        {beforeReady && afterReady ? (
          <div
            className="compareBox"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "ArrowLeft") setPos((value) => Math.max(0, value - 3));
              if (event.key === "ArrowRight") setPos((value) => Math.min(100, value + 3));
            }}
            onPointerMove={(event) => event.buttons === 1 && drag(event.clientX, event.currentTarget)}
            onPointerDown={(event) => drag(event.clientX, event.currentTarget)}
          >
            <img src={assetPath(afterAsset)} alt="After" />
            <div className="compareBefore" style={{ width: `${pos}%` }}><img src={assetPath(beforeAsset)} alt="Before" /></div>
            <span className="beforeLabel">Before</span>
            <span className="afterLabel">After</span>
            <i style={{ left: `${pos}%` }} />
          </div>
        ) : (
          <div className="beforeAfterGrid">
            <div><strong>Before</strong><span>素材尚未配置</span></div>
            <div><strong>After</strong><span>素材尚未配置</span></div>
          </div>
        )}
      </section>
    </div>
  );
}

function VideoModal({ onClose }: { onClose: () => void }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    assetExists(videoAsset).then(setReady);
  }, []);

  return (
    <div className="modalShell" role="dialog" aria-modal="true" onKeyDown={(event) => event.key === "Escape" && onClose()}>
      <button className="modalBackdrop" type="button" aria-label="关闭" onClick={onClose} />
      <section className="caseModal">
        <button className="modalClose" type="button" onClick={onClose}>关闭</button>
        <h2>备用 Demo 视频</h2>
        <div className="casePreview">
          {ready ? (
            <video src={assetPath(videoAsset)} poster={assetPath(videoPosterAsset)} controls playsInline preload="metadata" />
          ) : (
            <span>视频已跳过，现场使用图片和案例弹层继续。</span>
          )}
        </div>
      </section>
    </div>
  );
}

function HotspotDebugPanel({
  slideId,
  rect,
  hotspots,
  onClose,
}: {
  slideId: number;
  rect: Rect;
  hotspots: Hotspot[];
  onClose: () => void;
}) {
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [draft, setDraft] = useState<Hotspot | null>(null);
  const [start, setStart] = useState<{ x: number; y: number } | null>(null);
  const [selected, setSelected] = useState<Hotspot | null>(null);
  const [hidden, setHidden] = useState(false);

  const draftText = useMemo(() => draft ? hotspotConfig(draft) : selected ? hotspotConfig(selected) : "拖拽图片区域创建热区", [draft, selected]);

  const toPct = (clientX: number, clientY: number) => ({
    x: Math.max(0, Math.min(100, ((clientX - rect.x) / rect.width) * 100)),
    y: Math.max(0, Math.min(100, ((clientY - rect.y) / rect.height) * 100)),
  });

  return (
    <div
      className="hotspotDebug"
      onMouseMove={(event) => setCursor(toPct(event.clientX, event.clientY))}
      onMouseDown={(event) => {
        const point = toPct(event.clientX, event.clientY);
        setStart(point);
        setDraft(null);
      }}
      onMouseUp={(event) => {
        if (!start) return;
        const end = toPct(event.clientX, event.clientY);
        const next = {
          id: `s${slideId}-new`,
          slideId,
          x: Math.min(start.x, end.x),
          y: Math.min(start.y, end.y),
          width: Math.abs(end.x - start.x),
          height: Math.abs(end.y - start.y),
          label: { zh: "新热区", en: "" },
          type: "openInfo" as const,
          visibleStyle: "outline" as const,
        };
        setDraft(next);
        setStart(null);
      }}
    >
      <div className="debugFrame" />
      {!hidden && hotspots.map((hotspot) => (
        <button
          key={hotspot.id}
          type="button"
          className="debugHotspot"
          style={pctStyle(hotspot)}
          onClick={(event) => {
            event.stopPropagation();
            setSelected(hotspot);
          }}
        >
          {hotspot.id}
        </button>
      ))}
      {draft && <div className="debugDraft" style={pctStyle(draft)} />}
      <aside className="debugReadout">
        <strong>热区校准 · Slide {slideId}</strong>
        <span>x {cursor.x.toFixed(2)} / y {cursor.y.toFixed(2)}</span>
        <button type="button" onClick={() => navigator.clipboard?.writeText(draftText)}>复制 TypeScript 配置</button>
        <button type="button" onClick={() => setHidden((value) => !value)}>{hidden ? "显示热区" : "隐藏热区"}</button>
        <button type="button" onClick={onClose}>关闭 H</button>
        <pre>{draftText}</pre>
      </aside>
    </div>
  );
}
