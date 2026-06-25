const zh = {
  brandTitle: "你的贾维斯，已经来了",
  brandSub: "YOUR JARVIS IS HERE",
  nav: ["开场", "成果", "认知", "方法", "演示", "收尾"],
};

const en = {
  brandTitle: "Your Jarvis Is Here",
  brandSub: "A CODEX TALK",
  nav: ["Open", "Cases", "Mindset", "Method", "Demo", "Close"],
};

const prompts = {
  A: "请在当前演讲网站中增加“贾维斯模式”：点击右上角按钮后切换深色 HUD 视觉、出现轻微扫描线和网格，文案与结构不变；再次点击恢复；动画不超过 500ms；不要增加第三方依赖。",
  B: "请增加一张现场共创页面：允许从“工作自动化 / 个人产品 / 内容创作”三个主题中选择一个，自动生成一句核心大文案、三条小文案和一个行动建议，并加入导航；保持当前视觉系统。",
  C: "请优化最后一页：保留“你的贾维斯已经来了，但你是托尼·斯塔克吗？”，强化巨大的“1”和后续多个“0”；0 对应 Codex、Claude Code、WorkBuddy、AI Agent；最终只留下“我的 1 到底是什么？”；不增加新依赖。"
};

const slides = [
  ["01", "开场", "OPENING", "你的贾维斯，\n已经来了", "一个设计师，如何用 Codex 把想法变成产品，把工作变成系统。", "Your Jarvis\nis here", "How a designer uses Codex to turn ideas into products and work into systems.", ["技术正在平权", "差距来自想法、审美和产品判断"], ["Technology is leveling access", "The edge is taste, judgment, and product sense"], "hero", "大家好。先问一个问题：有多少想法只是“就差一个程序员了”？今天先看结果。", "3 min"],
  ["02", "开场", "INTRO", "大家好，\n我是 AI 魔法师永歌", "产品设计师、品牌设计师、AI 创意实践者。", "Hi, I am Yongge,\nan AI magician", "Product designer, brand designer, and AI creative practitioner.", ["华中科技大学工业设计、建筑学背景", "曾在美团、闪送做产品与设计", "OneLaser 品牌与设计", "虾子曰与豆豆龙主理人"], ["Industrial design and architecture background", "Product and design experience at Meituan and FlashEx", "Brand and design at OneLaser", "Creator of Xiazi and Doudoulong"], "portrait", "我不是程序员。我擅长提出想法、设计体验、判断好坏，并把模糊概念整理成产品方案。", "2 min"],
  ["03", "开场", "THIS TALK", "你现在看到的，\n不是一份 PPT", "这是一个由我提出需求、设计体验，再指挥 Codex 开发和发布的演讲网站。", "This is not\na slide deck", "It is a live presentation website designed by me and built with Codex.", ["像 PPT 一样翻页", "适配电脑和手机", "嵌入真实案例", "现场继续迭代"], ["Slide-like navigation", "Desktop and mobile ready", "Real product links", "Live iteration ready"], "recursive", "这场演讲本身就是第一个案例：内容、产品、实验同时发生。", "2 min"],
  ["04", "成果案例", "RESULTS", "这些，都是我\n指挥 AI 做出来的", "真实兴趣、生活和工作，不是临时 Demo。", "These are products\nI directed AI to build", "They came from real interests, life, and work, not a one-night demo.", ["内容与学习", "互动产品", "真实工作"], ["Content and learning", "Interactive products", "Real work"], "map", "先展示代表性结果，再讲它们怎么发生。", "2 min"],
  ["05", "成果案例", "XIAZI", "从一个内容想法，\n到一个真实网站", "每天筛选全球最值得关注的 9 件事，用简短内容和海报呈现。", "From content idea\nto real website", "Nine globally important stories, curated and published daily.", ["页面开发", "内容结构", "手机端适配", "域名与发布", "线上排查"], ["Page development", "Content structure", "Mobile layout", "Domain and publishing", "Production debugging"], "site", "以前我能设计产品，现在别人可以直接打开和使用它。", "3 min", [["打开真实产品", "https://pluto.hk"]]],
  ["06", "成果案例", "QUOTE LOG", "页面能打开，\n不等于产品在运行", "静态页面只是开始，能持续更新才是产品。", "A page loading\nis not a product running", "A product must keep updating, syncing, and proving freshness.", ["定时任务", "日志检查", "GitHub 自动发布", "缓存排查"], ["Scheduled jobs", "Log checks", "GitHub publishing", "Cache debugging"], "pulse", "200 OK 不等于最新。要看日志、下一次触发和线上同步。", "3 min", [["Quote Log", "https://pluto.hk/english-quote-log/"]]],
  ["07", "成果案例", "MORE PRODUCTS", "文章、知识和想法\n都可以变成互动产品", "产品不一定从代码开始，它可以从一套理念开始。", "Ideas and knowledge\ncan become products", "A product can start from a concept, a document, or an experience.", ["Family Growth Tree", "扎哈·哈迪德互动页面", "世界杯比分预测产品"], ["Family Growth Tree", "Zaha Hadid interactive pages", "World Cup prediction product"], "cards", "定义产品的人，也可以成为产品的发起者。", "2 min", [["Family Growth Tree", "https://yonge6.github.io/FamilyGrowthTree/"], ["Zaha", "https://yonge6.github.io/zhaha2/"]]],
  ["08", "成果案例", "ONELASER", "AI 不只做 Demo\n也能进入真实工作", "OneLaser 面向美国激光雕刻机市场。", "AI is not just for demos\nIt enters real work", "OneLaser serves the US laser engraver market.", ["产品页面", "广告文案", "SEM 素材", "社交媒体", "展会设计", "竞品研究"], ["Product pages", "Ad copy", "SEM assets", "Social media", "Trade show design", "Competitor research"], "work", "真正的问题不是做一张图，而是重构创意生产流程。", "2 min"],
  ["09", "成果案例", "GPTS", "把个人经验\n变成可以重复调用的能力", "策略、文案、品牌规则和判断标准开始沉淀。", "Turn personal judgment\ninto reusable capability", "Strategy, copy, brand rules, and standards become repeatable.", ["创意策略 GPT", "广告文案 GPT", "品牌知识库"], ["Creative strategy GPT", "Advertising copy GPT", "Brand knowledge base"], "stack", "企业最难复制的常常是经验、判断和标准。", "2 min"],
  ["10", "成果案例", "TRADE SHOW", "设计稿不是终点", "能访问、能协作、能迭代，才是资产。", "Design files\nare not the finish line", "Accessible, collaborative, iterable work becomes an asset.", ["展会需求", "机器尺寸", "在线展示", "团队协作", "版本维护"], ["Trade show needs", "Machine dimensions", "Online presentation", "Team collaboration", "Versioning"], "site", "链接能被团队打开，方案就不再散落在聊天记录里。", "2 min", [["OneLaser 展会方案", "https://yonge6.github.io/OneLaser/august-trade-show-booth/"]]],
  ["11", "认知升级", "SYSTEM", "不要用 AI 替代一个岗位\n要用 AI 重构整条生产管线", "人负责方向、审美、取舍和验收。", "Do not replace a role\nRedesign the whole pipeline", "Humans own direction, taste, trade-offs, and acceptance.", ["竞品情报", "全球热点", "创意机会", "广告 Brief", "投放测试", "数据反馈"], ["Competitor signals", "Global trends", "Creative opportunities", "Ad briefs", "Testing", "Feedback"], "flow", "每个工具做最适合自己的事情，形成闭环。", "3 min"],
  ["12", "认知升级", "GITHUB", "我不会写代码\n一看到 GitHub 就头大", "仓库、分支、部署、域名，每个词都认识，放一起就难。", "I do not code\nGitHub used to scare me", "Repo, branch, deploy, domain: familiar words, hard system.", ["代码仓库", "分支", "服务器", "域名", "部署"], ["Repository", "Branches", "Servers", "Domains", "Deployment"], "terminal", "电脑里能打开，不等于别人能打开。", "2 min"],
  ["13", "认知升级", "SYSTEM GAP", "写代码越来越容易\n真正困难的是开发之后", "大量想法死在环境、权限、域名、缓存和线上错误。", "Coding gets easier\nThe hard part comes after", "Ideas die in environments, permissions, domains, caches, and production errors.", ["上传代码", "配置环境", "完成部署", "线上排查", "持续维护"], ["Upload code", "Configure environment", "Deploy", "Debug production", "Maintain"], "bridge", "Codex 跨越的不只是语法鸿沟，而是工程门槛。", "3 min"],
  ["14", "认知升级", "JARVIS", "这已经不只是\n聊天机器人了", "它能阅读项目、操作文件、执行命令、测试、排错和发布。", "This is no longer\njust a chatbot", "It reads projects, edits files, runs commands, tests, debugs, and ships.", ["Codex", "Claude Code", "WorkBuddy", "AI Agent"], ["Codex", "Claude Code", "WorkBuddy", "AI Agent"], "hero", "像初代贾维斯，但关键权限和付款仍由人确认。", "3 min"],
  ["15", "协作方法", "DIVISION", "我负责目标与判断\nCodex 负责执行与推进", "Idea → 产品文档 → 最小版本 → 上线 → 验证 → 迭代。", "I own the goal and judgment\nCodex drives execution", "Idea → PRD → MVP → launch → verify → iterate.", ["我：用户、标准、取舍、验收", "Codex：开发、测试、部署、排错"], ["Me: users, standards, trade-offs, acceptance", "Codex: development, tests, deployment, debugging"], "split", "我不是学着替 Codex 写代码，而是学习做更好的产品负责人。", "3 min"],
  ["16", "现场演示", "LIVE DEMO", "现在，我们现场修改\n这场演讲", "一起指挥一次“贾维斯”。", "Now we edit\nthis talk live", "Let us direct Jarvis together.", ["A. 增加贾维斯模式", "B. 增加现场共创页面", "C. 优化“1与0”结束页"], ["A. Add Jarvis mode", "B. Add co-creation slide", "C. Improve the 1-and-0 ending"], "demo", "三个选项都准备好 Prompt，票数最高的一项现场执行。", "4 min"],
  ["17", "现场演示", "PROCESS", "先让它理解\n再让它行动", "拥有执行能力，不等于应该立刻执行。", "Let it understand first\nThen let it act", "Execution power does not mean instant execution.", ["阅读项目", "输出计划", "执行修改", "本地预览", "反馈调整", "发布线上"], ["Read the project", "Make a plan", "Edit", "Preview locally", "Revise", "Publish"], "steps", "先确认理解，再决定是否让它修改。", "3 min"],
  ["18", "现场演示", "RECAP", "刚才改的不是一页 PPT\n而是一个正在运行的产品", "我们完成了一次真实产品迭代。", "We did not edit a slide\nWe changed a running product", "That was a real product iteration.", ["人：目标、边界、审美、发布决定", "Codex：定位、修改、适配、检查"], ["Human: goal, boundary, taste, release decision", "Codex: locate, edit, adapt, check"], "recap", "Codex 负责生成，人负责判断。", "2 min"],
  ["19", "价值升华", "TASTE", "当代码成本降低\n溢价会回到审美与取舍", "AI 能生成，但不能替你决定什么值得留下。", "As code gets cheaper\nvalue returns to taste", "AI can generate, but it cannot decide what deserves to stay.", ["什么值得做", "什么必须删除", "什么符合品牌", "什么创造价值"], ["What is worth doing", "What must be removed", "What fits the brand", "What creates value"], "lens", "人的价值不是生成第 101 个方案，而是知道哪一个值得留下。", "3 min"],
  ["20", "价值升华", "BEGINNER TIPS", "不要先学完\n先完成一个真实结果", "一个页面、一个功能、一个真实网址。", "Do not learn everything first\nFinish one real result", "One page, one feature, one real URL.", ["先做小结果", "写清验收标准", "一定验证线上结果"], ["Start small", "Define acceptance criteria", "Verify the live result"], "cards", "真正完成一次，才会理解它和聊天 AI 的区别。", "2 min"],
  ["21", "价值升华", "THE ONE", "你的贾维斯已经来了\n但你是托尼·斯塔克吗？", "离开这些工具，你还剩下什么？", "Your Jarvis is here\nBut are you Tony Stark?", "What remains when the tools are gone?", ["审美", "产品力", "行业经验", "用户洞察", "复杂问题解决能力"], ["Taste", "Product sense", "Domain experience", "User insight", "Complex problem solving"], "onezero", "你的“1”是核心能力，AI 是后面的“0”。", "3 min"],
  ["22", "收尾", "FINAL", "我的“1”\n到底是什么？", "先找到你的“1”，再用 AI 放大，补上后面的“0”。", "What is\nmy one?", "Find your one first. Then let AI amplify it with zeros.", ["去定义问题", "去创造价值", "去成为你那个领域的托尼·斯塔克"], ["Define the problem", "Create value", "Become the Tony Stark of your field"], "final", "你的贾维斯已经来了。接下来，轮到你告诉它：我们要去哪里。", "2 min"]
].map((s, i) => ({
  no: s[0], chapter: s[1], enChapter: s[2], zhTitle: s[3], zhSub: s[4], enTitle: s[5], enSub: s[6],
  zhBullets: s[7], enBullets: s[8], visual: s[9], notes: s[10], time: s[11], links: s[12] || [], index: i
}));

let current = Number(localStorage.jarvisSlide || 0);
let lang = localStorage.jarvisLang || "zh";
let keyBuffer = "";
let wheelLock = false;

const $ = (id) => document.getElementById(id);
const els = {
  nav: $("nav"), kicker: $("kicker"), headline: $("headline"), subline: $("subline"), body: $("body"),
  links: $("links"), visual: $("visual"), progress: $("progress"), counter: $("counter"), notes: $("notes"),
  time: $("time"), speakerTitle: $("speakerTitle"), nextPreview: $("nextPreview"), promptBox: $("promptBox")
};

function t(slide, field) {
  return slide[(lang === "zh" ? "zh" : "en") + field];
}

function renderNav() {
  const labels = (lang === "zh" ? zh : en).nav;
  els.nav.innerHTML = labels.map((label, i) => `<button data-jump="${Math.min(i * 4, slides.length - 1)}">${String(i + 1).padStart(2, "0")} ${label}</button>`).join("");
}

function cardList(items) {
  return items.map(item => `<div class="card"><strong>${item}</strong></div>`).join("");
}

function renderVisual(slide) {
  if (slide.visual === "hero") return `<div class="orb"></div><div class="hero-characters"><img src="assets/xiazi.png" alt=""><img src="assets/doudoulong.png" alt=""></div>`;
  if (slide.visual === "portrait") return `<div class="mock"><img src="assets/reference.jpeg" alt=""></div>`;
  if (slide.visual === "onezero") return `<div class="number-lockup"><span>1</span><span>0</span><span>0</span><span>0</span></div>`;
  if (slide.visual === "demo") return `<div class="demo-grid">${["A","B","C"].map(k => `<button class="demo-choice" data-prompt="${k}"><strong>${k}</strong><p>${prompts[k]}</p></button>`).join("")}</div>`;
  if (["flow", "steps", "map"].includes(slide.visual)) return `<div class="diagram">${t(slide, "Bullets").map(x => `<div class="node">${x}</div>`).join("")}</div>`;
  if (slide.visual === "site" || slide.visual === "recursive") return `<div class="orb"></div><div class="mock"><img src="assets/reference.jpeg" alt=""></div>`;
  return `<div class="orb"></div><div class="diagram">${t(slide, "Bullets").slice(0, 4).map(x => `<div class="node">${x}</div>`).join("")}</div>`;
}

function render() {
  current = Math.max(0, Math.min(current, slides.length - 1));
  const slide = slides[current];
  document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  document.querySelectorAll("[data-i18n]").forEach(el => el.textContent = (lang === "zh" ? zh : en)[el.dataset.i18n]);
  renderNav();
  els.nav.querySelectorAll("button").forEach(btn => btn.classList.toggle("active", Number(btn.dataset.jump) <= current && current < Number(btn.dataset.jump) + 4));
  els.kicker.textContent = `${slide.no} · ${lang === "zh" ? slide.chapter : slide.enChapter}`;
  els.headline.textContent = t(slide, "Title");
  els.subline.textContent = t(slide, "Sub");
  els.body.innerHTML = cardList(t(slide, "Bullets"));
  els.links.innerHTML = slide.links.map(([label, url]) => `<a href="${url}" target="_blank" rel="noreferrer">${label} ↗</a>`).join("");
  els.visual.innerHTML = renderVisual(slide);
  els.progress.style.width = `${((current + 1) / slides.length) * 100}%`;
  els.counter.textContent = `${String(current + 1).padStart(2, "0")} / ${slides.length}`;
  els.speakerTitle.textContent = t(slide, "Title").replace(/\n/g, " ");
  els.notes.textContent = slide.notes;
  els.time.textContent = slide.time;
  els.nextPreview.textContent = slides[current + 1] ? t(slides[current + 1], "Title").replace(/\n/g, " ") : "End";
  localStorage.jarvisSlide = current;
  localStorage.jarvisLang = lang;
  location.hash = current + 1;
}

function go(delta) { current += delta; render(); }

document.addEventListener("click", (e) => {
  const jump = e.target.closest("[data-jump]");
  const prompt = e.target.closest("[data-prompt]");
  if (jump) { current = Number(jump.dataset.jump); render(); }
  if (prompt) {
    els.promptBox.textContent = prompts[prompt.dataset.prompt];
    document.body.classList.add("speaker");
  }
});

document.addEventListener("keydown", (e) => {
  if (e.target.matches("input, textarea")) return;
  keyBuffer = (keyBuffer + e.key).slice(-6).toUpperCase();
  if (keyBuffer === "JARVIS") flashJarvis();
  if (["ArrowRight", "PageDown", " "].includes(e.key)) { e.preventDefault(); go(1); }
  if (["ArrowLeft", "PageUp"].includes(e.key)) { e.preventDefault(); go(-1); }
  if (e.key.toLowerCase() === "s") document.body.classList.toggle("speaker");
  if (e.key.toLowerCase() === "f") toggleFull();
});

document.addEventListener("wheel", (e) => {
  if (wheelLock || Math.abs(e.deltaY) < 12) return;
  wheelLock = true;
  go(e.deltaY > 0 ? 1 : -1);
  setTimeout(() => wheelLock = false, 520);
}, { passive: true });

let touchY = 0;
document.addEventListener("touchstart", e => touchY = e.changedTouches[0].clientY, { passive: true });
document.addEventListener("touchend", e => {
  const dy = touchY - e.changedTouches[0].clientY;
  if (Math.abs(dy) > 42) go(dy > 0 ? 1 : -1);
}, { passive: true });

document.addEventListener("mousemove", (e) => {
  document.body.style.setProperty("--mx", `${e.clientX}px`);
  document.body.style.setProperty("--my", `${e.clientY}px`);
});

$("langBtn").onclick = () => { lang = lang === "zh" ? "en" : "zh"; render(); };
$("speakerBtn").onclick = () => document.body.classList.toggle("speaker");
$("jarvisBtn").onclick = flashJarvis;
$("fullBtn").onclick = toggleFull;

function flashJarvis() {
  document.body.classList.add("jarvis-mode");
  setTimeout(() => document.body.classList.remove("jarvis-mode"), 1800);
}

function toggleFull() {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen?.();
}

if (location.hash) current = Number(location.hash.slice(1)) - 1 || 0;
render();
