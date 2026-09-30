// 鐵人賽文章（iThome 已發表）
export const SERIES_DAYS = 30;
export const POSTS = [
  [1, "2026-09-15", "Vue 是怎麼來的？框架又是什麼？", "10410930"],
  [
    2,
    "2026-09-16",
    "Vue 可以只是一個 script 標籤：從 CDN 到 Vite，看懂 .vue 檔背後的轉換",
    "10411646",
  ],
  [
    3,
    "2026-09-17",
    "為什麼改資料畫面就會動？從 JS 的 Proxy 說起",
    "10412683",
  ],
  [
    4,
    "2026-09-18",
    "有了 reactive，為什麼還要 ref？從 .value 說起",
    "10413220",
  ],
  [
    5,
    "2026-09-19",
    "解構為什麼讓 reactive 失效？toRefs 到底在做什麼",
    "10413838",
  ],
  [6, "2026-09-20", "computed：不只是「快取」這麼簡單", "10414399"],
  [7, "2026-09-21", "watch 與 watchEffect：什麼時候該用哪一個", "10414857"],
  [
    8,
    "2026-09-22",
    "改完資料，DOM 為什麼還是舊的？認識 nextTick",
    "10415533",
  ],
  [
    9,
    "2026-09-23",
    "從 {{ }} 到 v-bind：動態綁定 class 與 style",
    "10416002",
  ],
  [
    10,
    "2026-09-24",
    "v-if 與 v-show：一個拆掉，一個只是藏起來",
    "10416006",
  ],
  [11, "2026-09-25", "v-for 與 key：為什麼不要用 index 當 key", "10417078"],
  [
    12,
    "2026-09-26",
    "v-on 與事件修飾符：.prevent、.stop 幫你省下的那幾行",
    "10417556",
  ],
  [
    13,
    "2026-09-27",
    "v-model 表單綁定：input、checkbox、select 與修飾符",
    "10417957",
  ],
  [
    14,
    "2026-09-28",
    "想直接操作 DOM 的時候：模板 ref 與 useTemplateRef",
    "10418397",
  ],
  [
    15,
    "2026-09-29",
    "組件拆分與生命週期：setup、onMounted、onUnmounted",
    "10418840",
  ],
  [16, "2026-09-30", "props：defineProps 與單向資料流的規矩", "10419275"],
].map(([day, date, title, id]) => ({
  day,
  date,
  title,
  url: `https://ithelp.ithome.com.tw/articles/${id}`,
}));
