// 報頭日期：西元＋民國＋星期
export function renderDate() {
  const d = new Date();
  document.getElementById("today").textContent =
    `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  document.getElementById("weekday").textContent =
    `星期${"日一二三四五六"[d.getDay()]}`;
  document.getElementById("roc").textContent = d.getFullYear() - 1911;
}
