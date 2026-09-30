// 連載：集點卡＋最新文章
import { SERIES_DAYS, POSTS } from "../data/posts.js";
import { el } from "../utils/dom.js";

const LATEST_COUNT = 5;

function postRow(p) {
  return el(
    "li",
    {},
    el(
      "a",
      { href: p.url, target: "_blank", rel: "noopener noreferrer" },
      el("span", {
        class: "day",
        text: "Day" + String(p.day).padStart(2, "0"),
      }),
      el("span", { class: "t", text: p.title }),
      el("span", { class: "d", text: p.date }),
    ),
  );
}

export function renderSerial() {
  const done = POSTS.length;
  document
    .getElementById("stampcard")
    .append(
      ...Array.from({ length: SERIES_DAYS }, (_, i) =>
        el("i", { class: i < done ? "on" : "" }),
      ),
    );
  document.getElementById("progress").textContent =
    `已連載 ${done}／${SERIES_DAYS} 天`;

  const newest = [...POSTS].reverse();
  document
    .getElementById("posts-latest")
    .append(...newest.slice(0, LATEST_COUNT).map(postRow));
  document
    .getElementById("posts-older")
    .append(...newest.slice(LATEST_COUNT).map(postRow));
  document.getElementById("more-summary").textContent =
    `看更早的 ${newest.length - LATEST_COUNT} 篇`;
}
