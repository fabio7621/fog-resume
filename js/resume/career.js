// 經歷
import { TIMELINE } from "../data/timeline.js";
import { el } from "../utils/dom.js";

export function renderCareer() {
  document
    .getElementById("timeline")
    .append(
      ...TIMELINE.map((t) =>
        el(
          "li",
          {},
          el("span", { class: "when", text: t.when }),
          el("h3", { text: t.title }),
          el("p", { class: "org", text: t.org }),
          el("ul", {}, ...t.details.map((d) => el("li", { text: d }))),
        ),
      ),
    );
}
