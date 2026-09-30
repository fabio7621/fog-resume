// 作品：每一則是一篇報導
import { PROJECTS_MAIN, PROJECTS_AI } from "../data/projects.js";
import { el, extLink } from "../utils/dom.js";

// onReplay：「霧中行者」那則的「再走一次」按鈕要做的事（回到開場）
function article(p, isAi, onReplay) {
  const top = p.fog
    ? el(
        "div",
        { class: "fogshot" },
        el("b", { text: "霧中行者" }),
        el("span", { text: "你剛剛走過的那段霧" }),
      )
    : el("img", {
        class: "shot",
        src: p.image,
        alt: p.name + " 畫面",
        loading: "lazy",
        width: "800",
        height: "500",
      });
  const links = el("div", { class: "links" });
  if (p.fog) {
    const b = el("button", { type: "button", text: "再走一次 ↺" });
    b.addEventListener("click", onReplay);
    links.append(b);
  }
  if (p.link) links.append(extLink(p.link, "Demo ↗"));
  if (p.repo) links.append(extLink(p.repo, "GitHub ↗"));
  return el(
    "article",
    {
      class: "article" + (isAi ? " ai" : "") + (p.feature ? " feature" : ""),
    },
    top,
    el("p", { class: "role", text: p.role }),
    el("h3", { text: p.name }),
    el("p", { class: "lead", text: p.description }),
    el("p", { class: "point" }, el("b", { text: "技術重點　" }), p.highlight),
    el(
      "ul",
      { class: "tags" },
      ...p.tags.map((t) => el("li", { class: "chip", text: t })),
    ),
    links,
  );
}

export function renderWorks({ onReplay }) {
  document
    .getElementById("works-main")
    .append(...PROJECTS_MAIN.map((p) => article(p, false, onReplay)));
  document
    .getElementById("works-ai")
    .append(...PROJECTS_AI.map((p) => article(p, true, onReplay)));
}
