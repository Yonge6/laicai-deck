import { assetPath } from "./path";

export const videoAsset = "/videos/live-demo.mp4";
export const videoPosterAsset = "/videos/live-demo-poster.webp";
export const beforeAsset = "/demo/before.webp";
export const afterAsset = "/demo/after.webp";

export const casePreviewAssets: Record<string, string> = {
  pluto: "/case-previews/pluto.webp",
  quoteLog: "/case-previews/quote-log.webp",
  familyGrowthTree: "/case-previews/family-growth-tree.webp",
  zaha: "/case-previews/zaha.webp",
  oneLaserBooth: "/case-previews/onelaser-booth.webp",
  worldCup: "/case-previews/world-cup.webp",
};

export const assetStatus = {
  backupVideo: "skipped",
  worldCupPreview: "placeholder",
  beforeAfter: "temporary-demo-assets",
} as const;

export async function assetExists(path: string) {
  try {
    const response = await fetch(assetPath(path), { method: "GET", cache: "no-store" });
    const contentType = response.headers.get("content-type") || "";
    return response.ok && !contentType.includes("text/html");
  } catch {
    return false;
  }
}
