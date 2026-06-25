import { assetPath } from "../path";

export type Language = "zh" | "en";

export type LocalizedText = {
  zh: string;
  en: string;
};

export type Slide = {
  id: number;
  image: string;
  thumbnail: string;
  title: LocalizedText;
  chapter: LocalizedText;
  notes: LocalizedText;
  durationSec: number;
  links?: {
    id: string;
    label: LocalizedText;
    url: string;
  }[];
  backupVideo?: {
    label: LocalizedText;
    src: string;
  };
  demoPrompts?: {
    id: string;
    label: LocalizedText;
    content: LocalizedText;
  }[];
};

const data = [
  {
    title: "你的贾维斯，已经来了",
    chapter: "开场",
    durationSec: 150,
    notes: `# 开场
先不要讲工具，先讲感受：很多人都有想法，但过去总会卡在“谁来帮我写出来”。

**今天这场演讲本身就是案例。** 它不是一份普通 PPT，而是一个可以继续迭代的网页演讲系统。

[停顿] 2 秒，让大家看完整个画面。`,
  },
  {
    title: "你是不是也有很多想法，就差一个程序员？",
    chapter: "开场",
    durationSec: 120,
    notes: `# 共同痛点
问现场：是不是经常有一个产品、一个网站、一个自动化流程的想法，但最后停在执行环节。

过去这句话背后其实是资源门槛：时间、预算、工程沟通、排期。

今天我想讲的是，这个门槛正在被重新定义。`,
  },
  {
    title: "大家好，我是 AI 魔法师永歌",
    chapter: "开场",
    durationSec: 120,
    notes: `# 自我介绍
我是永歌，做过产品设计、品牌设计，也一直在用 AI 做创意和产品实验。

我不是传统意义上的程序员。我的优势是提出目标、设计体验、判断结果好不好。

这很重要，因为 Codex 放大的不是代码能力本身，而是你的判断力。`,
  },
  {
    title: "你现在看到的，不是一份普通 PPT",
    chapter: "开场",
    durationSec: 120,
    notes: `# 递归案例
现在大家看到的页面，就是我提出需求、设定边界，再让 Codex 帮我开发出来的。

它像 PPT 一样播放，但底层是一个网页产品：能适配屏幕、能加互动、能继续发布。

[互动] 可以提醒大家：这场演讲从第一分钟就已经在展示方法。`,
  },
  {
    title: "这些，都是我指挥 AI 做出来的",
    chapter: "成果案例",
    durationSec: 120,
    notes: `# 先看结果
先不讲理论，先看结果。

这些不是为了演讲临时做的 Demo，而是来自真实兴趣、真实工作和真实问题。

重点不是“AI 帮我生成了什么”，而是我如何把想法变成可访问、可迭代、可验证的东西。`,
  },
  {
    title: "从一个内容想法，到一个真实网站",
    chapter: "成果案例",
    durationSec: 180,
    notes: `# 虾子曰
虾子曰一开始只是一个内容想法：每天筛选全球最值得知道的 9 件事。

后来它变成了页面、数据结构、发布流程、线上网址。

**以前设计师交付的是稿子，现在可以交付别人真的能打开的产品。**

[演示] 后续阶段这里会放真实链接入口。`,
  },
  {
    title: "页面能打开，不等于产品在运行",
    chapter: "成果案例",
    durationSec: 150,
    notes: `# 产品运行
这是我踩过的坑：页面 200 OK，不代表内容是新的。

真正的产品要看定时任务、日志、缓存、发布链路和线上结果。

Codex 的价值不是只帮你写页面，而是帮你一起排查“为什么线上不是我以为的样子”。`,
  },
  {
    title: "文章、知识和想法，都可以变成互动产品",
    chapter: "成果案例",
    durationSec: 150,
    notes: `# 知识产品化
很多内容以前只是文章、笔记、观点。

当执行成本降低后，它们可以变成互动页面、工具、小游戏、知识库。

这里想传达一句话：产品不一定从代码开始，它可以从一个清晰的问题开始。`,
  },
  {
    title: "AI 不只做 Demo，也能进入真实工作",
    chapter: "成果案例",
    durationSec: 150,
    notes: `# OneLaser
OneLaser 是面向美国市场的激光雕刻机品牌。

AI 在这里不是玩具，而是进入产品页、广告文案、素材、展会设计、竞品研究这些真实工作。

关键变化是：创意生产从单点输出，变成了一条可复用的工作流。`,
  },
  {
    title: "把个人经验，变成可以重复调用的能力",
    chapter: "成果案例",
    durationSec: 120,
    notes: `# 经验沉淀
过去很多能力存在脑子里：品牌判断、文案标准、投放经验、创意方向。

现在这些可以逐渐沉淀成提示词、知识库、GPT 或 Agent。

**最难复制的不是工具，而是你长期积累的标准。**`,
  },
  {
    title: "设计稿不是终点",
    chapter: "成果案例",
    durationSec: 120,
    notes: `# 资产化
设计稿不是终点，能访问、能协作、能迭代，才更接近资产。

当方案变成一个链接，团队沟通会明显变简单。

这也是我对“交付物”的理解变化：从静态文件，走向持续可用的系统。`,
  },
  {
    title: "不要用 AI 替代一个岗位，要用 AI 重构整条生产线",
    chapter: "认知升级",
    durationSec: 180,
    notes: `# 生产线
很多人第一反应是：AI 会不会替代某个岗位。

我的体感是，更大的变化不是替代单点，而是重构整条生产线。

从情报、热点、创意、Brief、投放测试到反馈，每一环都可以重新组合。`,
  },
  {
    title: "我不会写代码，一看到 GitHub 就头大",
    chapter: "认知升级",
    durationSec: 120,
    notes: `# 工程门槛
我以前看到 GitHub、分支、部署、域名这些词会很头大。

每个词好像都认识，连在一起就变成工程门槛。

但 Codex 的意义就在这里：它不只是补语法，而是帮助你跨过完整工程流程。`,
  },
  {
    title: "写代码越来越容易，真正困难的是开发之后",
    chapter: "认知升级",
    durationSec: 150,
    notes: `# 开发之后
现在写出第一版代码越来越容易。

真正让想法死掉的，往往是开发之后：环境、权限、域名、缓存、线上错误、持续维护。

所以我们需要的不是一次生成，而是一位能继续排查和推进的协作者。`,
  },
  {
    title: "这已经不只是聊天机器人了",
    chapter: "认知升级",
    durationSec: 150,
    notes: `# Agent 感
聊天机器人回答问题，Codex 这类工具能读项目、改文件、执行命令、测试和发布。

这已经更接近早期贾维斯：它能行动，但关键权限、方向和验收仍然在人手里。

**人不应该放弃判断，只是把执行杠杆变长。**`,
  },
  {
    title: "不是把电脑交出去，而是把任务交清楚",
    chapter: "协作方法",
    durationSec: 150,
    notes: `# 任务交接
很多人担心把电脑交给 AI，会不会失控。

我的经验是：不是把电脑交出去，而是把任务交清楚。

目标、边界、验收标准越明确，Codex 的执行越稳定。`,
  },
  {
    title: "我负责目标与判断，Codex 负责执行与推进",
    chapter: "协作方法",
    durationSec: 150,
    notes: `# 分工
我负责用户、目标、审美、取舍、验收。

Codex 负责定位文件、修改代码、运行检查、修复问题。

这不是我学着替它写代码，而是我学习成为更好的产品负责人。`,
  },
  {
    title: "不要一上来就让它改，先让它理解",
    chapter: "协作方法",
    durationSec: 150,
    notes: `# 先理解
最重要的工作习惯：不要一上来就让它改。

先让它阅读项目、理解结构、输出计划，再决定是否执行。

这一步看起来慢，但能避免很多返工。`,
  },
  {
    title: "现在，我们现场指挥一次贾维斯",
    chapter: "现场演示",
    durationSec: 240,
    notes: `# 现场演示
这一页进入现场 Demo。

先告诉大家：我们不会表演魔法，而是展示一次真实的协作过程。

[互动] 让现场选择一个修改方向。

[演示] 本阶段只预留 Prompt 入口，后续再填入真实内容。`,
  },
  {
    title: "刚才改的不是一页 PPT，而是一个正在运行的产品",
    chapter: "现场演示",
    durationSec: 120,
    notes: `# Demo 回收
演示之后要把价值收回来：刚才不是改一页 PPT，而是在改一个正在运行的产品。

人负责目标、边界、审美和发布决定。

Codex 负责定位、修改、适配和检查。`,
  },
  {
    title: "当代码成本降低，溢价会回到审美与取舍",
    chapter: "价值升华",
    durationSec: 150,
    notes: `# 审美与取舍
当代码越来越便宜，真正稀缺的东西会变得更明显。

什么值得做，什么必须删除，什么符合品牌，什么创造价值。

AI 能生成很多方案，但不能替你决定哪一个值得留下。`,
  },
  {
    title: "不要先学完，先完成一个真实结果",
    chapter: "价值升华",
    durationSec: 120,
    notes: `# 行动建议
不要先学完所有概念。

先完成一个真实结果：一个页面、一个功能、一个真实网址。

完成一次之后，你会真正理解它和聊天 AI 的区别。`,
  },
  {
    title: "你的贾维斯已经来了，但你是托尼·斯塔克吗？",
    chapter: "价值升华",
    durationSec: 150,
    notes: `# 核心问题
工具已经越来越像贾维斯。

但更重要的问题是：你是不是那个能提出方向、定义问题、判断价值的人。

[停顿] 让这句话停一下，不要急着翻页。`,
  },
  {
    title: "AI 是后面的 0，你才是前面的 1",
    chapter: "收尾",
    durationSec: 120,
    notes: `# 1 和 0
AI、Codex、Claude Code、WorkBuddy、Agent，都是后面的 0。

它们能把你的能力放大很多倍。

但前面的 1 仍然是你自己的核心能力。没有 1，后面的 0 没有意义。`,
  },
  {
    title: "我的“1”到底是什么？",
    chapter: "收尾",
    durationSec: 120,
    notes: `# 结束
最后把问题交给每个人：我的 1 到底是什么？

先找到你的 1，再用 AI 放大它。

你的贾维斯已经来了。接下来，轮到你告诉它：我们要去哪里。`,
  },
] as const;

export const slides: Slide[] = data.map((slide, index) => {
  const id = index + 1;
  const fileId = String(id).padStart(2, "0");

  return {
    id,
    image: assetPath(`/slides/zh/${fileId}.webp`),
    thumbnail: assetPath(`/slides/zh-thumbs/${fileId}.webp`),
    title: { zh: slide.title, en: "" },
    chapter: { zh: slide.chapter, en: "" },
    notes: { zh: slide.notes, en: "" },
    durationSec: slide.durationSec,
    links: [],
    demoPrompts: id === 19 ? [
      { id: "jarvis-mode", label: { zh: "增加贾维斯模式", en: "" }, content: { zh: "", en: "" } },
      { id: "co-create-page", label: { zh: "增加现场共创页面", en: "" }, content: { zh: "", en: "" } },
      { id: "one-zero-ending", label: { zh: "优化 1 与 0 结束页", en: "" }, content: { zh: "", en: "" } },
    ] : [],
  };
});
