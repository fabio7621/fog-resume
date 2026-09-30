// 技能
import { SKILLS } from "../data/skills.js";
import { el } from "../utils/dom.js";

export function renderSkills() {
  document
    .getElementById("skill-grid")
    .append(
      ...SKILLS.map((g) =>
        el(
          "div",
          {},
          el("h3", {}, g.title, el("span", { text: g.desc })),
          el("ul", {}, ...g.items.map((i) => el("li", { text: i }))),
        ),
      ),
    );
}
