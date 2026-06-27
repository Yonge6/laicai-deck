import type { LocalizedText } from "./deck";

export type InteractionType =
  | "openLink"
  | "openCase"
  | "openInfo"
  | "spotlight"
  | "sequence"
  | "poll"
  | "beforeAfter"
  | "copyPrompt"
  | "openVideo"
  | "finale";

export type Hotspot = {
  id: string;
  slideId: number;
  x: number;
  y: number;
  width: number;
  height: number;
  label: LocalizedText;
  type: InteractionType;
  target?: string;
  payloadId?: string;
  visibleStyle?: "none" | "pulse" | "outline" | "icon";
  presenterOnly?: boolean;
};

export type SlideSequence = {
  slideId: number;
  steps: {
    id: string;
    label: string;
    targetHotspotIds: string[];
  }[];
};

export type CaseStudy = {
  id: string;
  title: string;
  description: string;
  url?: string;
  links?: { label: string; url: string }[];
  previewImage?: string;
  iframeAllowed?: boolean;
  fallbackMessage?: string;
};

export type PollOption = {
  id: "A" | "B" | "C";
  title: string;
  promptId: string;
};

export type PollState = {
  selectedOption: "A" | "B" | "C" | null;
  counts: Record<"A" | "B" | "C", number>;
  locked: boolean;
};

export const emptyPollState: PollState = {
  selectedOption: null,
  counts: { A: 0, B: 0, C: 0 },
  locked: false,
};

export const caseStudies: CaseStudy[] = [
  { id: "websites", title: "网站与内容产品", description: "从内容想法到真实网址，先让结果能被打开。", url: "https://yonge6.github.io/Elian/" },
  { id: "games", title: "小游戏", description: "把一个轻量想法快速变成可玩的互动体验。", url: "https://yonge6.github.io/xiazi-echo-realm-showcase/", links: [{ label: "查看 Showcase", url: "https://yonge6.github.io/xiazi-echo-realm-showcase/" }, { label: "点击查看", url: "./cases/catch-the-line-game/" }, { label: "查看 VileSaint", url: "https://vilesaint.com/" }] },
  { id: "english", title: "英语学习", description: "把每日英语输入沉淀成自动记录和复盘系统。", url: "https://yonge6.github.io/OneLaser/english-speaking-quest/#today-practice" },
  { id: "interactive", title: "互动页面", description: "把文章、知识和人物研究变成可探索页面。", url: "https://yonge6.github.io/zhaha2/" },
  { id: "booth", title: "展会方案", description: "传统设计稿变成可访问、可协作、可持续维护的线上项目资产。", url: "https://yonge6.github.io/OneLaser/august-trade-show-booth/" },
  { id: "ads", title: "广告素材", description: "广告文案、视觉素材和投放测试进入同一条工作流。", url: "https://yonge6.github.io/OneLaser/asset-sop.html", links: [{ label: "查看 SOP", url: "https://yonge6.github.io/OneLaser/asset-sop.html" }, { label: "查看 OneLaser", url: "https://yonge6.github.io/OneLaser/" }] },
  { id: "systems", title: "工作系统", description: "把重复工作整理成可交接、可检查、可持续运行的系统。", url: "https://yonge6.github.io/LVP/" },
  { id: "pluto", title: "虾子曰全球热点站", description: "每天筛选全球最值得关注的 9 件事，用短内容和海报讲清楚。", url: "https://pluto.hk" },
  { id: "quoteLog", title: "英语 Quote 自动记录", description: "自动记录英语金句，检查发布、日志、缓存和线上新鲜度。", url: "https://pluto.hk/english-quote-log/" },
  { id: "familyGrowthTree", title: "Family Growth Tree", description: "把家庭成长理念变成可探索的互动产品。", url: "https://yonge6.github.io/FamilyGrowthTree/" },
  { id: "zaha", title: "扎哈互动页面", description: "人物、设计和知识可以变成多入口互动页面。", url: "https://yonge6.github.io/zhaha2/" },
  { id: "worldCup", title: "世界杯比分预测", description: "用 AI 辅助分析比赛信息，生成可分享的比分预测体验。", url: "https://www.score-prophet.com/" },
  { id: "oneLaserBooth", title: "OneLaser 展会在线方案", description: "传统设计稿变成可访问、可协作、可持续维护的线上项目资产。", url: "https://yonge6.github.io/OneLaser/august-trade-show-booth/" },
];

export const zahaLinks = [
  "https://yonge6.github.io/zhaha2/",
  "https://yonge6.github.io/ZHAHA/",
  "https://yonge6.github.io/ZHAHA/design/zaha2/",
];

const label = (zh: string): LocalizedText => ({ zh, en: "" });

export const hotspots: Hotspot[] = [
  { id: "s5-websites", slideId: 5, x: 51, y: 9, width: 8, height: 6, label: label("网站"), type: "openCase", payloadId: "websites", visibleStyle: "outline" },
  { id: "s5-games", slideId: 5, x: 65, y: 7, width: 8, height: 6, label: label("小游戏"), type: "openCase", payloadId: "games", visibleStyle: "outline" },
  { id: "s5-english", slideId: 5, x: 81, y: 9, width: 8, height: 6, label: label("英语学习"), type: "openCase", payloadId: "english", visibleStyle: "outline" },
  { id: "s5-interactive", slideId: 5, x: 39, y: 63, width: 8, height: 6, label: label("互动页面"), type: "openCase", payloadId: "interactive", visibleStyle: "outline" },
  { id: "s5-booth", slideId: 5, x: 50, y: 68, width: 8, height: 6, label: label("展会方案"), type: "openCase", payloadId: "booth", visibleStyle: "outline" },
  { id: "s5-ads", slideId: 5, x: 65, y: 72, width: 8, height: 6, label: label("广告素材"), type: "openCase", payloadId: "ads", visibleStyle: "outline" },
  { id: "s5-systems", slideId: 5, x: 82, y: 72, width: 8, height: 6, label: label("工作系统"), type: "openCase", payloadId: "systems", visibleStyle: "outline" },

  { id: "s6-phone", slideId: 6, x: 56, y: 20, width: 19, height: 54, label: label("打开虾子曰"), type: "openCase", payloadId: "pluto", visibleStyle: "pulse" },
  { id: "s6-pluto-text", slideId: 6, x: 8, y: 73, width: 20, height: 7, label: label("pluto.hk"), type: "openCase", payloadId: "pluto", visibleStyle: "outline" },

  { id: "s7-quote", slideId: 7, x: 38, y: 12, width: 30, height: 48, label: label("Quote Log"), type: "openCase", payloadId: "quoteLog", visibleStyle: "pulse" },
  { id: "s7-flow-1", slideId: 7, x: 36, y: 66, width: 8, height: 9, label: label("定时任务"), type: "sequence", visibleStyle: "outline" },
  { id: "s7-flow-2", slideId: 7, x: 47, y: 66, width: 8, height: 9, label: label("自动发布"), type: "sequence", visibleStyle: "outline" },
  { id: "s7-flow-3", slideId: 7, x: 58, y: 66, width: 8, height: 9, label: label("日志检查"), type: "sequence", visibleStyle: "outline" },
  { id: "s7-flow-4", slideId: 7, x: 69, y: 66, width: 8, height: 9, label: label("缓存排查"), type: "sequence", visibleStyle: "outline" },
  { id: "s7-flow-5", slideId: 7, x: 80, y: 66, width: 8, height: 9, label: label("线上验证"), type: "sequence", visibleStyle: "outline" },

  { id: "s8-family", slideId: 8, x: 50, y: 18, width: 14, height: 40, label: label("Family Growth Tree"), type: "openCase", payloadId: "familyGrowthTree", visibleStyle: "outline" },
  { id: "s8-zaha", slideId: 8, x: 59, y: 15, width: 15, height: 44, label: label("扎哈互动页面"), type: "openCase", payloadId: "zaha", visibleStyle: "outline" },
  { id: "s8-worldcup", slideId: 8, x: 76, y: 18, width: 15, height: 42, label: label("世界杯比分预测"), type: "openCase", payloadId: "worldCup", visibleStyle: "outline" },

  { id: "s10-onelaser-gpt", slideId: 10, x: 50, y: 14, width: 15, height: 36, label: label("OneLaser 创意策略 GPT"), type: "openLink", target: "https://docs.qq.com/pdf/DZGV4eWNuWVFpWktQ", visibleStyle: "outline" },

  { id: "s11-plan", slideId: 11, x: 41, y: 21, width: 18, height: 30, label: label("展位平面图"), type: "openCase", payloadId: "oneLaserBooth", visibleStyle: "outline" },
  { id: "s11-layout", slideId: 11, x: 62, y: 15, width: 18, height: 36, label: label("设备布局"), type: "openCase", payloadId: "oneLaserBooth", visibleStyle: "outline" },
  { id: "s11-phone", slideId: 11, x: 30, y: 48, width: 14, height: 26, label: label("手机预览"), type: "openCase", payloadId: "oneLaserBooth", visibleStyle: "outline" },
  { id: "s11-system", slideId: 11, x: 47, y: 55, width: 18, height: 24, label: label("在线协作系统"), type: "openCase", payloadId: "oneLaserBooth", visibleStyle: "outline" },
  { id: "s11-screen", slideId: 11, x: 70, y: 51, width: 18, height: 24, label: label("主展会方案大屏"), type: "openCase", payloadId: "oneLaserBooth", visibleStyle: "outline" },

  { id: "s12-step-1", slideId: 12, x: 50, y: 9, width: 10, height: 18, label: label("竞品情报"), type: "openLink", target: "https://docs.qq.com/pdf/DZGltZW5kdW54ZXF1", visibleStyle: "outline" },
  { id: "s12-step-2", slideId: 12, x: 67, y: 8, width: 10, height: 18, label: label("全球热点"), type: "sequence", visibleStyle: "outline" },
  { id: "s12-step-3", slideId: 12, x: 82, y: 12, width: 11, height: 18, label: label("产品资料"), type: "sequence", visibleStyle: "outline" },
  { id: "s12-step-4", slideId: 12, x: 88, y: 34, width: 10, height: 18, label: label("创意机会"), type: "sequence", visibleStyle: "outline" },
  { id: "s12-step-5", slideId: 12, x: 85, y: 56, width: 11, height: 18, label: label("广告 Brief"), type: "sequence", visibleStyle: "outline" },
  { id: "s12-step-6", slideId: 12, x: 63, y: 61, width: 11, height: 18, label: label("文案视觉"), type: "sequence", visibleStyle: "outline" },
  { id: "s12-step-7", slideId: 12, x: 45, y: 56, width: 11, height: 18, label: label("投放测试"), type: "sequence", visibleStyle: "outline" },
  { id: "s12-step-8", slideId: 12, x: 43, y: 34, width: 10, height: 18, label: label("数据反馈"), type: "sequence", visibleStyle: "outline" },
  { id: "s12-loop", slideId: 12, x: 52, y: 34, width: 13, height: 17, label: label("中央闭环"), type: "sequence", visibleStyle: "outline" },

  { id: "s16-confirm-1", slideId: 16, x: 44, y: 44, width: 8, height: 30, label: label("登录确认"), type: "sequence", visibleStyle: "outline" },
  { id: "s16-confirm-2", slideId: 16, x: 54, y: 44, width: 8, height: 30, label: label("授权确认"), type: "sequence", visibleStyle: "outline" },
  { id: "s16-confirm-3", slideId: 16, x: 63, y: 44, width: 8, height: 30, label: label("支付确认"), type: "sequence", visibleStyle: "outline" },
  { id: "s16-confirm-4", slideId: 16, x: 72, y: 44, width: 8, height: 30, label: label("删除确认"), type: "sequence", visibleStyle: "outline" },
  { id: "s16-confirm-5", slideId: 16, x: 82, y: 44, width: 8, height: 30, label: label("正式发布确认"), type: "sequence", visibleStyle: "outline" },

  { id: "s18-flow-1", slideId: 18, x: 45, y: 12, width: 12, height: 16, label: label("阅读项目"), type: "sequence", visibleStyle: "outline" },
  { id: "s18-flow-2", slideId: 18, x: 72, y: 13, width: 12, height: 16, label: label("输出计划"), type: "sequence", visibleStyle: "outline" },
  { id: "s18-flow-3", slideId: 18, x: 45, y: 34, width: 12, height: 16, label: label("确认文件"), type: "sequence", visibleStyle: "outline" },
  { id: "s18-flow-4", slideId: 18, x: 72, y: 36, width: 12, height: 16, label: label("执行修改"), type: "sequence", visibleStyle: "outline" },
  { id: "s18-flow-5", slideId: 18, x: 40, y: 56, width: 14, height: 17, label: label("本地预览"), type: "sequence", visibleStyle: "outline" },
  { id: "s18-flow-6", slideId: 18, x: 66, y: 57, width: 14, height: 17, label: label("反馈调整"), type: "sequence", visibleStyle: "outline" },
  { id: "s18-flow-7", slideId: 18, x: 49, y: 74, width: 14, height: 15, label: label("发布上线"), type: "sequence", visibleStyle: "outline" },

  { id: "s19-vote-a", slideId: 19, x: 4, y: 47, width: 24, height: 7, label: label("A 增加贾维斯模式"), type: "poll", target: "A", visibleStyle: "outline" },
  { id: "s19-vote-b", slideId: 19, x: 4, y: 57, width: 24, height: 7, label: label("B 增加现场共创页面"), type: "poll", target: "B", visibleStyle: "outline" },
  { id: "s19-vote-c", slideId: 19, x: 4, y: 67, width: 24, height: 7, label: label("C 优化 1 与 0 结束页"), type: "poll", target: "C", visibleStyle: "outline" },

  { id: "s20-video", slideId: 20, x: 34, y: 75, width: 14, height: 9, label: label("备用 Demo 视频"), type: "openVideo", visibleStyle: "outline" },
  { id: "s20-before-after", slideId: 20, x: 50, y: 75, width: 16, height: 9, label: label("查看修改前后"), type: "beforeAfter", visibleStyle: "outline" },

  { id: "s24-onezero-1", slideId: 24, x: 53, y: 17, width: 9, height: 50, label: label("1"), type: "sequence", visibleStyle: "outline" },
  { id: "s24-onezero-2", slideId: 24, x: 67, y: 28, width: 8, height: 33, label: label("Codex"), type: "sequence", visibleStyle: "outline" },
  { id: "s24-onezero-3", slideId: 24, x: 75, y: 31, width: 7, height: 29, label: label("Claude Code"), type: "sequence", visibleStyle: "outline" },
  { id: "s24-onezero-4", slideId: 24, x: 82, y: 34, width: 7, height: 27, label: label("WorkBuddy"), type: "sequence", visibleStyle: "outline" },
  { id: "s24-onezero-5", slideId: 24, x: 88, y: 36, width: 7, height: 25, label: label("AI Agent"), type: "sequence", visibleStyle: "outline" },

  { id: "s25-finale", slideId: 25, x: 62, y: 24, width: 23, height: 48, label: label("最终定格"), type: "finale", visibleStyle: "none" },
];

export const sequences: SlideSequence[] = [
  { slideId: 7, steps: ["定时任务", "自动发布", "日志检查", "缓存排查", "线上验证"].map((label, i) => ({ id: `s7-${i + 1}`, label, targetHotspotIds: [`s7-flow-${i + 1}`] })) },
  { slideId: 12, steps: ["竞品情报", "全球热点", "产品资料", "创意机会", "广告 Brief", "文案视觉", "投放测试", "数据反馈", "中央闭环"].map((label, i) => ({ id: `s12-${i + 1}`, label, targetHotspotIds: [i < 8 ? `s12-step-${i + 1}` : "s12-loop"] })) },
  { slideId: 16, steps: ["登录确认", "授权确认", "支付确认", "删除确认", "正式发布确认"].map((label, i) => ({ id: `s16-${i + 1}`, label, targetHotspotIds: [`s16-confirm-${i + 1}`] })) },
  { slideId: 18, steps: ["阅读项目", "输出计划", "确认文件", "执行修改", "本地预览", "反馈调整", "发布上线"].map((label, i) => ({ id: `s18-${i + 1}`, label, targetHotspotIds: [`s18-flow-${i + 1}`] })) },
  { slideId: 24, steps: ["高亮 1", "Codex", "Claude Code", "WorkBuddy", "AI Agent", "工具变暗", "只保留 1"].map((label, i) => ({ id: `s24-${i + 1}`, label, targetHotspotIds: i < 5 ? [`s24-onezero-${i + 1}`] : ["s24-onezero-1"] })) },
];

export const pollOptions: PollOption[] = [
  { id: "A", title: "增加贾维斯模式", promptId: "jarvis-mode" },
  { id: "B", title: "增加现场共创页面", promptId: "co-create-page" },
  { id: "C", title: "优化“1 与 0”结束页", promptId: "one-zero-ending" },
];

export function hotspotsForSlide(slideId: number) {
  return hotspots.filter((hotspot) => hotspot.slideId === slideId);
}

export function sequenceForSlide(slideId: number) {
  return sequences.find((sequence) => sequence.slideId === slideId);
}

export function caseById(id?: string) {
  return caseStudies.find((item) => item.id === id);
}
