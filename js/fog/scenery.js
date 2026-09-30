// 街景素材：天空、遠近建築、人行道、路面、暗角（setup 時產生一次，之後只做捲動）
// view = { W, H, GY, CX }：畫布尺寸、地平線、人物位置
import { BAYER } from "./config.js";
import { clamp, lerp, mulberry32 } from "../utils/math.js";
import { mk } from "../utils/canvas.js";

export function makeSky({ W, H, GY }) {
  const c = mk(W, H),
    g = c.getContext("2d"),
    img = g.createImageData(W, H),
    d = img.data,
    top = [46, 45, 38],
    hor = [152, 142, 106];
  for (let y = 0; y < H; y++) {
    const t = Math.pow(clamp(y / (GY - 8), 0, 1), 1.4);
    for (let x = 0; x < W; x++) {
      const n = (BAYER[(x & 3) | ((y & 3) << 2)] - 0.5) * 7,
        q = (x + y * W) * 4;
      d[q] = lerp(top[0], hor[0], t) + n;
      d[q + 1] = lerp(top[1], hor[1], t) + n;
      d[q + 2] = lerp(top[2], hor[2], t) + n;
      d[q + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  return c;
}
export function makeLayer({ H, GY }, P, cfg, seed) {
  const c = mk(P, H),
    g = c.getContext("2d"),
    rnd = mulberry32(seed),
    base = GY + cfg.baseOff;
  let x = 0;
  for (;;) {
    const w = Math.round(cfg.w[0] + rnd() * (cfg.w[1] - cfg.w[0]));
    if (x + w > P - 2) break;
    const top =
      GY - Math.round(GY * (cfg.h[0] + rnd() * (cfg.h[1] - cfg.h[0])));
    g.fillStyle = cfg.color;
    g.fillRect(x, top, w, base - top);
    if (rnd() < 0.45) {
      const rh = Math.max(3, Math.round(w * 0.32));
      for (let r = 1; r <= rh; r++) {
        const ins = Math.round((r * (w / 2)) / rh);
        if (w - 2 * ins > 0) g.fillRect(x + ins, top - r, w - 2 * ins, 1);
      }
    } else {
      g.fillRect(x - 1, top, w + 2, 1);
      const n = 1 + ((rnd() * 3) | 0);
      for (let m = 0; m < n; m++) {
        const chx = x + 2 + Math.round(rnd() * (w - 7)),
          ch = 4 + ((rnd() * 6) | 0);
        g.fillRect(chx, top - ch, 5, ch);
        g.fillRect(chx - 1, top - ch, 7, 1);
        g.fillRect(chx + 1, top - ch - 2, 1, 2);
        g.fillRect(chx + 3, top - ch - 2, 1, 2);
      }
    }
    if (cfg.windows) {
      for (let wy = top + 5; wy < GY - 6; wy += 8)
        for (let wx = x + 3; wx < x + w - 3; wx += 6) {
          g.fillStyle = rnd() < cfg.lit ? cfg.litColor : cfg.winColor;
          g.fillRect(wx, wy, 2, 4);
        }
      g.fillStyle = cfg.color;
    }
    x += w + (rnd() < 0.35 ? 2 + ((rnd() * 10) | 0) : 0);
  }
  if (cfg.tower) {
    const tx = Math.round(P * 0.6),
      tw = 14,
      top = GY - Math.round(GY * 0.78);
    g.fillStyle = cfg.color;
    g.fillRect(tx, top, tw, base - top);
    for (let r = 1; r <= 14; r++) {
      const ins = Math.round((r * tw) / 28);
      g.fillRect(tx + ins, top - r, tw - 2 * ins, 1);
    }
    g.fillRect(tx + 6, top - 19, 2, 5);
    g.fillStyle = cfg.face;
    for (let dy = -4; dy <= 4; dy++)
      for (let dx = -4; dx <= 4; dx++)
        if (dx * dx + dy * dy <= 16)
          g.fillRect(tx + 7 + dx, top + 10 + dy, 1, 1);
    g.fillStyle = cfg.color;
    g.fillRect(tx + 7, top + 7, 1, 3);
    g.fillRect(tx + 7, top + 10, 2, 1);
  }
  return c;
}
export function makeSidewalk() {
  const c = mk(64, 9),
    g = c.getContext("2d"),
    r = mulberry32(7);
  g.fillStyle = "rgb(100,93,73)";
  g.fillRect(0, 0, 64, 9);
  g.fillStyle = "rgb(121,113,89)";
  g.fillRect(0, 0, 64, 1);
  g.fillStyle = "rgb(74,69,54)";
  for (let x = 15; x < 64; x += 16) g.fillRect(x, 1, 1, 8);
  for (let n = 0; n < 26; n++) {
    g.fillStyle = r() < 0.5 ? "rgb(86,80,62)" : "rgb(112,105,83)";
    g.fillRect((r() * 64) | 0, 1 + ((r() * 8) | 0), 1 + ((r() * 2) | 0), 1);
  }
  return c;
}
export function makeRoad({ H, GY }) {
  const h = Math.max(1, H - GY - 12),
    c = mk(60, h),
    g = c.getContext("2d"),
    r = mulberry32(11);
  g.fillStyle = "rgb(44,41,33)";
  g.fillRect(0, 0, 60, h);
  for (let row = 0; row * 3 < h; row++) {
    const off = (row & 1) * 3;
    for (let x = -off; x < 60; x += 6) {
      const b = 62 + r() * 18;
      g.fillStyle = `rgb(${(b + 6) | 0},${b | 0},${(b - 14) | 0})`;
      g.fillRect(x, row * 3, 5, 2);
      g.fillStyle = `rgb(${(b + 24) | 0},${(b + 18) | 0},${(b + 2) | 0})`;
      g.fillRect(x, row * 3, 2, 1);
    }
  }
  return c;
}
export function makeVignette({ W, H, CX }) {
  const c = mk(W, H),
    g = c.getContext("2d"),
    gr = g.createRadialGradient(
      CX,
      H * 0.6,
      H * 0.25,
      W * 0.5,
      H * 0.55,
      Math.max(W, H) * 0.78,
    );
  gr.addColorStop(0, "rgba(18,16,11,0)");
  gr.addColorStop(1, "rgba(18,16,11,0.62)");
  g.fillStyle = gr;
  g.fillRect(0, 0, W, H);
  return c;
}
