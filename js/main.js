// 進入點：先把履歷內容填好，再啟動開場的霧中街景
import { renderDate } from "./resume/date.js";
import { renderCareer } from "./resume/career.js";
import { renderSkills } from "./resume/skills.js";
import { renderWorks } from "./resume/works.js";
import { renderSerial } from "./resume/serial.js";
import { bindCopyEmail } from "./resume/contact.js";
import { setup } from "./fog/scene.js";
import { bindSceneInput } from "./fog/input.js";
import { startLoop } from "./fog/loop.js";
import { enterResume, showResume, backToFog } from "./transition.js";

// 履歷頁
renderDate();
renderCareer();
renderSkills();
renderWorks({ onReplay: backToFog });
renderSerial();
bindCopyEmail();

// 開場
document.getElementById("enter").addEventListener("click", enterResume);
document.getElementById("back").addEventListener("click", backToFog);
bindSceneInput();
setup();

// 帶錨點進站（例如 #works）就直接跳過開場
if (location.hash && location.hash !== "#top") {
  showResume();
  const t = document.getElementById(location.hash.slice(1));
  if (t) t.scrollIntoView();
}

startLoop();
