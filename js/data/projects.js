// 精選專案：實務性質在前，課程作業型往後
export const PROJECTS_MAIN = [
  {
    name: "衛生局稽查流程優化（提案專案）",
    image: "img/tabacoco.jpg",
    feature: true,
    role: "需求訪談 / 流程設計 / 原型製作",
    description:
      "實地訪談台南市衛生局菸酒業務單位，釐清現行紙本派案流程的痛點，產出流程圖與可操作 prototype 並參與提案，將使用者需求轉譯為系統設計方向。",
    highlight:
      "使用單位講的是「表單很難填」，實際卡點是派案與回報分屬兩套流程；先畫流程圖對齊認知，再用 prototype 讓對方在畫面上確認，需求才收斂得下來。",
    tags: ["需求訪談", "流程設計", "Prototype", "Vue 3"],
    link: "https://fabio7621.github.io/tabacoco/#/",
  },
  {
    name: "大東洋（企業官網切版）",
    image: "img/don.jpg",
    role: "獨立負責前端切版",
    description: "服務案例 — 企業官網靜態切版，著重 RWD 與版面細節處理。",
    highlight:
      "首頁的鮮活報報不使用 JS，利用 CSS position 與 z-index 的前後圖層關係，讓每個選單在 hover 時顯示各自對應的圖片。",
    tags: ["HTML", "CSS", "RWD"],
    link: "https://www.freshlife.com.tw/",
  },
  {
    name: "蔡教練",
    image: "img/ten.jpg",
    role: "獨立負責前端切版",
    description: "服務案例 — 教練個人形象網站靜態切版，含 RWD 排版。",
    highlight:
      "以形象頁為主的單頁結構，把版面拆成可重複套用的區塊，讓後續增減段落不用重寫樣式。",
    tags: ["HTML", "CSS", "RWD"],
    repo: "https://github.com/fabio7621/tsai-coach",
    link: "https://fabio7621.github.io/tsai-coach/",
  },
  {
    name: "HelmentShop",
    image: "img/helment.jpg",
    role: "獨立開發",
    description:
      "安全帽電商網站前後台，Vue 3 Options API + Vite + Pinia + Router，串接 RESTful API。",
    highlight:
      "購物車狀態要在商品頁、結帳頁與後台之間同步，用 props 傳遞會讓路由層層耦合，改以 Pinia 集中管理並統一處理 API 失敗時的回滾。",
    tags: ["Vue 3", "Vite", "Pinia", "RESTful API"],
    repo: "https://github.com/fabio7621/HelmentShop",
    link: "https://fabio7621.github.io/HelmentShop/#/",
  },
  {
    name: "MusicShop",
    image: "img/music.jpg",
    role: "獨立開發",
    description:
      "React.js + Vite + chart.js 打造的音樂商店與儀錶板，練習資料視覺化與商品列表互動。",
    highlight:
      "chart.js 在資料更新時會整張重繪，改為只更新 dataset 並控制重新渲染的時機，避免切換分類時畫面卡頓。",
    tags: ["React", "Vite", "chart.js"],
    repo: "https://github.com/fabio7621/musicstore-react",
    link: "https://fabio7621.github.io/musicstore-react/",
  },
];

// AI 協作開發
export const PROJECTS_AI = [
  {
    name: "霧中行者 The Fog Walker",
    fog: true,
    feature: true,
    role: "AI 協作開發 · 本報開場",
    description:
      "Canvas 2D + 原生 JavaScript，單檔零依賴。人物原地行走、街景視差捲動，周圍濃霧即時做流體模擬。",
    highlight:
      "霧用 Stable Fluids 在 2D 格點上解不可壓縮 Navier–Stokes：半拉格朗日平流、壓力投影、渦度侷限；人物輪廓每一幀轉成障礙格，霧會繞過身體、在身後捲出尾流。",
    tags: ["JavaScript (ES6+)", "Canvas 2D", "流體模擬"],
  },
  {
    name: "F-16 OVER TAIPEI",
    image: "img/jet.jpg",
    role: "AI 協作開發",
    description:
      "HTML5 + CSS3 + Vanilla JavaScript（ES6+）— 單檔架構，零建置工具、零框架依賴。",
    highlight:
      "點陣風格飛行模擬，使用飛行模擬物理結合協調轉彎：轉彎率 ω = g·tanφ / V，必須壓坡度（bank）才會轉彎；能量管理：爬升損失空速；升力分量：大坡度轉彎時垂直升力減少，會自然掉高度等等。",
    tags: ["HTML5", "CSS3", "JavaScript (ES6+)", "Three.js 渲染技術"],
    repo: "https://github.com/fabio7621/voxel-f16-taipei",
    link: "https://fabio7621.github.io/voxel-f16-taipei/",
  },
  {
    name: "浮水染工坊 · Suminagashi Lab",
    image: "img/water.jpg",
    role: "AI 協作開發",
    description: "Vue 3（組合式 API）· Vite · Pinia · WebGL2 / GLSL",
    highlight:
      "A4 水盤上的即時 GPU 流體墨流模擬 —— 滴墨、排水、梳針，蓋下朱印做成拓印帖。以 WebGL2 在著色器中求解 Navier–Stokes（Stable Fluids）與 Marangoni 界面張力，重現日本浮水染（墨流し / suminagashi）的同心圓與羽狀紋路。",
    tags: ["HTML5", "CSS3", "JavaScript (ES6+)", "Three.js 渲染技術"],
    repo: "https://github.com/fabio7621/suminagashi",
    link: "https://fabio7621.github.io/suminagashi/",
  },
  {
    name: "擲筊 God did",
    image: "img/goddid.jpg",
    role: "AI 協作開發",
    description:
      "Vue 3（組合式 API）· Vite · Pinia · Three.js / WebGL · TypeScript",
    highlight:
      "長按抓起筊杯、向上甩出的 3D 擲筊 —— 聖筊、笑筊、陰筊、立筊即時判定，落定後顯示筊象與解說。自寫剛體解算器以半隱式尤拉積分推進位置、四元數一階近似積分姿態，取凸包最低點做地面穿透修正並分離法向與切向（庫倫摩擦）衝量，對近乎側立的姿態施加傾倒力矩，讓立筊維持應有的罕見程度。",
    tags: ["Vue 3", "TypeScript", "Three.js 渲染技術", "剛體物理模擬"],
    link: "https://fabio7621.github.io/goddid/",
  },
  {
    name: "小遊艇港灣",
    image: "img/boat.jpg",
    role: "AI 協作開發 · 2026.08",
    description:
      "原生 JavaScript（ES Modules）· Three.js / WebGL · Canvas 2D · 零建置（importmap + CDN）",
    highlight:
      "開著小遊艇在港灣航行的互動作品集 —— 靠上碼頭光圈自動停靠、上岸瀏覽履歷／作品／部落格／聯絡。海面波高由單一純函式供給，海浪、船身浮沉與浮標共用同一組浪；碰撞為不依賴 Three.js 的純幾何解算，碼頭與小島擋得住，船會靠上去而不是穿過去；小地圖用 Canvas 2D 手繪，不額外開第二顆相機。",
    tags: ["JavaScript", "Three.js 渲染技術", "物理運動模擬", "Canvas 2D"],
    repo: "https://github.com/fabio7621/harbor-portfolio",
    link: "https://fabio7621.github.io/harbor-portfolio/",
  },
];
