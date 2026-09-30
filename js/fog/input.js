// 開場互動：點一下＝進入；拖曳＝攪霧（手機上靠移動距離分辨）；空白鍵暫停；視窗縮放重建
import { params } from "./config.js";
import { state, ptr } from "./state.js";
import { cvs, setup, toScene } from "./scene.js";
import { enterResume } from "../transition.js";

export function bindSceneInput() {
  let down = null;
  cvs.addEventListener("pointerdown", (e) => {
    down = { x: e.clientX, y: e.clientY, t: performance.now() };
    const r = toScene(e.clientX, e.clientY);
    ptr.x = ptr.px = r.x;
    ptr.y = ptr.py = r.y;
    ptr.active = true;
  });
  cvs.addEventListener("pointermove", (e) => {
    const r = toScene(e.clientX, e.clientY);
    ptr.x = r.x;
    ptr.y = r.y;
    if (!ptr.active) {
      ptr.px = r.x;
      ptr.py = r.y;
      ptr.active = true;
    }
    ptr.moved = true;
  });
  cvs.addEventListener("pointerup", (e) => {
    if (
      down &&
      Math.hypot(e.clientX - down.x, e.clientY - down.y) < 10 &&
      performance.now() - down.t < 450
    )
      enterResume();
    down = null;
    if (e.pointerType !== "mouse") ptr.active = false;
  });
  cvs.addEventListener("pointerleave", () => {
    ptr.active = false;
  });

  document.addEventListener("keydown", (e) => {
    if (state.mode !== "walking") return;
    const tag = document.activeElement && document.activeElement.tagName;
    if (
      e.code === "Space" &&
      !["INPUT", "SELECT", "BUTTON", "TEXTAREA", "A"].includes(tag)
    ) {
      e.preventDefault();
      params.paused = !params.paused;
    }
  });

  let rt;
  addEventListener("resize", () => {
    if (state.mode === "resume") return;
    clearTimeout(rt);
    rt = setTimeout(setup, 200);
  });
}
