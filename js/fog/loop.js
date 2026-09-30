// 動畫主迴圈
import { params } from "./config.js";
import { state } from "./state.js";
import { update, render, showVisibility } from "./scene.js";
import { advanceLeaving, showResume } from "../transition.js";

let last = performance.now(),
  visT = 0;

function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;
  if (state.mode === "resume") return; // 履歷頁時不跑模擬，省電
  if (state.mode === "leaving") advanceLeaving(dt);
  if (!params.paused) update(dt);
  render();
  visT += dt;
  if (visT >= 0.5) {
    showVisibility();
    visT = 0;
  }
  if (state.mode === "leaving" && state.leaveT >= 1) showResume();
}

export function startLoop() {
  requestAnimationFrame((t) => {
    last = t;
    frame(t);
  });
}
