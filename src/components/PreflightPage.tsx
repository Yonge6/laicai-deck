import { useEffect, useMemo, useState } from "react";
import { afterAsset, assetExists, assetStatus, beforeAsset, casePreviewAssets, videoAsset, videoPosterAsset } from "../assets";
import { createPresentationChannel } from "../presentationChannel";

type CheckStatus = "pass" | "warn" | "fail";
type CheckItem = { label: string; status: CheckStatus; detail: string };

function statusLabel(status: CheckStatus) {
  return status === "pass" ? "通过" : status === "warn" ? "警告" : "失败";
}

function supportWebP() {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL("image/webp").startsWith("data:image/webp");
}

async function checkImageSet(prefix: string, ext: string) {
  const results = await Promise.all(
    Array.from({ length: 25 }, (_, index) => assetExists(`${prefix}/${String(index + 1).padStart(2, "0")}.${ext}`)),
  );
  return results.filter(Boolean).length;
}

export function PreflightPage({ onEnter }: { onEnter: () => void }) {
  const [items, setItems] = useState<CheckItem[]>([]);
  const [running, setRunning] = useState(false);
  const [comm, setComm] = useState<CheckItem | null>(null);
  const report = useMemo(() => JSON.stringify({ generatedAt: new Date().toISOString(), items, comm }, null, 2), [comm, items]);

  const run = async () => {
    setRunning(true);
    const [webp, png, thumbs, video, poster, before, after, ...previews] = await Promise.all([
      checkImageSet("/slides/zh", "webp"),
      checkImageSet("/slides/zh", "png"),
      checkImageSet("/slides/zh-thumbs", "webp"),
      assetStatus.backupVideo === "skipped" ? Promise.resolve(false) : assetExists(videoAsset),
      assetStatus.backupVideo === "skipped" ? Promise.resolve(false) : assetExists(videoPosterAsset),
      assetExists(beforeAsset),
      assetExists(afterAsset),
      ...Object.values(casePreviewAssets).map(assetExists),
    ]);

    const next: CheckItem[] = [
      { label: "25 张 WebP", status: webp === 25 ? "pass" : "fail", detail: `${webp}/25` },
      { label: "25 张 PNG 回退", status: png === 25 ? "pass" : "fail", detail: `${png}/25` },
      { label: "25 张缩略图", status: thumbs === 25 ? "pass" : "fail", detail: `${thumbs}/25` },
      { label: "备用视频", status: "pass", detail: video ? "已配置" : "已跳过" },
      { label: "视频海报", status: "pass", detail: poster ? "已配置" : "已跳过" },
      { label: "Before 图片", status: before ? "pass" : "warn", detail: before ? "已配置" : "public/demo/before.webp 缺失" },
      { label: "After 图片", status: after ? "pass" : "warn", detail: after ? "已配置" : "public/demo/after.webp 缺失" },
      { label: "案例本地预览图", status: previews.some(Boolean) ? "pass" : "warn", detail: `${previews.filter(Boolean).length}/${previews.length}` },
      { label: "Fullscreen API", status: document.fullscreenEnabled ? "pass" : "warn", detail: document.fullscreenEnabled ? "可用" : "不可用" },
      { label: "BroadcastChannel", status: "BroadcastChannel" in window ? "pass" : "warn", detail: "BroadcastChannel" in window ? "可用" : "将使用 localStorage 降级" },
      { label: "localStorage", status: "localStorage" in window ? "pass" : "fail", detail: "localStorage" in window ? "可用" : "不可用" },
      { label: "sessionStorage", status: "sessionStorage" in window ? "pass" : "fail", detail: "sessionStorage" in window ? "可用" : "不可用" },
      { label: "Pointer Events", status: "PointerEvent" in window ? "pass" : "warn", detail: "PointerEvent" in window ? "可用" : "不可用" },
      { label: "Touch Events", status: "ontouchstart" in window ? "pass" : "warn", detail: "ontouchstart" in window ? "可用" : "当前设备可能无触摸" },
      { label: "Picture-in-Picture", status: "pictureInPictureEnabled" in document ? "pass" : "warn", detail: "可选能力" },
      { label: "WebP 支持", status: supportWebP() ? "pass" : "fail", detail: supportWebP() ? "支持" : "不支持" },
      { label: "屏幕分辨率", status: "pass", detail: `${screen.width} × ${screen.height}` },
      { label: "视口比例", status: "pass", detail: `${innerWidth} × ${innerHeight} / ${(innerWidth / innerHeight).toFixed(2)}` },
      { label: "横屏", status: innerWidth >= innerHeight ? "pass" : "warn", detail: innerWidth >= innerHeight ? "当前横屏" : "当前竖屏" },
      { label: "在线状态", status: navigator.onLine ? "pass" : "warn", detail: navigator.onLine ? "在线" : "离线" },
      { label: "外部链接", status: "warn", detail: "浏览器跨域限制，建议人工确认真实打开" },
    ];
    setItems(next);
    setRunning(false);
  };

  useEffect(() => {
    run();
  }, []);

  const testPresenter = () => {
    const started = performance.now();
    let ping = 0;
    const channel = createPresentationChannel((message) => {
      if (message.type === "PREFLIGHT_PONG") {
        setComm({ label: "双窗口通信", status: "pass", detail: `${Math.round(performance.now() - started)}ms` });
        window.clearInterval(ping);
        channel.close();
      }
    });
    window.open(`${location.origin}${location.pathname}?presenter=1#slide=1`, "jarvis-presenter", "popup,width=1440,height=900")?.focus();
    ping = window.setInterval(() => channel.post({ type: "PREFLIGHT_PING" }), 300);
    window.setTimeout(() => {
      setComm((current) => current || { label: "双窗口通信", status: "fail", detail: "3 秒内未收到确认" });
      window.clearInterval(ping);
      channel.close();
    }, 3000);
  };

  return (
    <main className="preflight">
      <header>
        <h1>演讲前自检</h1>
        <div>
          <button type="button" onClick={run} disabled={running}>{running ? "检测中" : "重新检测"}</button>
          <button type="button" onClick={testPresenter}>测试演讲者窗口</button>
          <button type="button" onClick={() => navigator.clipboard?.writeText(report)}>导出检测结果</button>
          <button type="button" onClick={onEnter}>进入演讲</button>
          <button type="button" onClick={() => window.open(`${location.origin}${location.pathname}?presenter=1#slide=1`, "jarvis-presenter")}>打开演讲者模式</button>
        </div>
      </header>
      <section className="checkGrid">
        {[...items, ...(comm ? [comm] : [])].map((item) => (
          <article className={`checkItem ${item.status}`} key={item.label}>
            <strong>{item.label}</strong>
            <span>{statusLabel(item.status)}</span>
            <p>{item.detail}</p>
          </article>
        ))}
      </section>
      <pre>{report}</pre>
    </main>
  );
}
