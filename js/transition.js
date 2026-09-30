// 轉場：開場（霧中）⇄ 履歷頁
import { params, reduceMotion } from "./fog/config.js";
import { state } from "./fog/state.js";
import { setup } from "./fog/scene.js";
import { smooth } from "./utils/math.js";

const intro = document.getElementById("intro"),
  veil = document.getElementById("veil"),
  resume = document.getElementById("resume");
const LEAVE_SEC = 1.7;

export function enterResume() {
  if (state.mode !== "walking") return;
  if (reduceMotion) {
    showResume();
    return;
  }
  state.mode = "leaving";
  state.leaveT = 0;
  params.paused = false;
  intro.classList.add("leaving");
}

// 每幀推進「霧湧上」的進度
export function advanceLeaving(dt) {
  state.leaveT = Math.min(1, state.leaveT + dt / LEAVE_SEC);
  veil.style.transition = "none";
  veil.style.opacity = String(Math.pow(smooth(0.35, 1, state.leaveT), 1.4)); // 後半段霧色蓋滿
}

export function showResume() {
  state.mode = "resume";
  intro.hidden = true;
  document.body.classList.remove("is-intro");
  resume.hidden = false;
  resume.classList.remove("arrive");
  void resume.offsetWidth;
  resume.classList.add("arrive");
  scrollTo(0, 0);
  document.getElementById("resume-title").focus({ preventScroll: true });
}

export function backToFog() {
  resume.hidden = true;
  intro.hidden = false;
  intro.classList.remove("leaving");
  document.body.classList.add("is-intro");
  state.mode = "walking";
  setup();
  // 從滿版霧色慢慢散開
  veil.style.transition = "none";
  veil.style.opacity = "1";
  requestAnimationFrame(() => {
    veil.style.transition = "opacity 1.2s ease";
    veil.style.opacity = "0";
  });
  document.getElementById("enter").focus({ preventScroll: true });
}
