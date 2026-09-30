// 霧中街景：狀態、每幀更新、繪製、初始化
import { CELL, STEP_L, params, BAYER } from "./config.js";
import { state, ptr } from "./state.js";
import { Fluid } from "./fluid.js";
import { SW, SH, SCX, SGY, spriteCv, sMask, buildCharacter } from "./character.js";
import {
  makeSky,
  makeLayer,
  makeSidewalk,
  makeRoad,
  makeVignette,
} from "./scenery.js";
import { clamp, smooth, noise2, fbm } from "../utils/math.js";
import { mk } from "../utils/canvas.js";

export const cvs = document.getElementById("scene");
const ctx = cvs.getContext("2d");
const fogCv = mk(1, 1),
  fogCtx = fogCv.getContext("2d");
let fogImg,
  W,
  H,
  GY,
  FOOT,
  CX,
  nx,
  ny,
  fluid,
  cnt,
  LAMP_GAP = 190;
let skyCv, farLayer, midLayer, swTile, roadTile, vigCv;
let worldX = 0,
  tSim = 0,
  phase = 0,
  lamps = [];
const prevSolid = [];

function computeLamps() {
  lamps = [];
  const off = 90,
    base = FOOT - 2;
  for (let k = Math.floor((worldX - off - 40) / LAMP_GAP); ; k++) {
    const x = Math.round(off + k * LAMP_GAP - worldX);
    if (x > W + 40) break;
    if (x >= -40) lamps.push({ x, y: base - 49.5, base });
  }
}

// 注入、攪動、障礙物、更新
function splat(ci, cj, r, fu, fv, dd) {
  const f = fluid,
    FW = f.W,
    R = Math.ceil(r * 1.6),
    inv = 1 / (r * r);
  const i0 = Math.max(1, Math.floor(ci - R)),
    i1 = Math.min(nx, Math.ceil(ci + R)),
    j0 = Math.max(1, Math.floor(cj - R)),
    j1 = Math.min(ny, Math.ceil(cj + R));
  for (let j = j0; j <= j1; j++)
    for (let i = i0; i <= i1; i++) {
      const k = i + FW * j;
      if (f.solid[k]) continue;
      const dx = i - ci,
        dy = j - cj,
        w = Math.exp(-(dx * dx + dy * dy) * inv);
      if (w < 0.02) continue;
      f.u[k] += fu * w;
      f.v[k] += fv * w;
      f.d[k] += dd * w;
    }
}
function applyCharacterSolid() {
  const f = fluid,
    FW = f.W,
    x0 = CX - SCX,
    y0 = FOOT - SGY,
    touched = [];
  for (const k of prevSolid) f.solid[k] = 0;
  prevSolid.length = 0;
  for (let sy = 0; sy < SH; sy++)
    for (let sx = 0; sx < SW; sx++) {
      if (!sMask[sx + sy * SW]) continue;
      const px = x0 + sx,
        py = y0 + sy;
      if (px < 0 || py < 0 || px >= W || py >= H) continue;
      const k = ((px / CELL) | 0) + 1 + FW * (((py / CELL) | 0) + 1);
      if (cnt[k] === 0) touched.push(k);
      cnt[k]++;
    }
  for (const k of touched) {
    if (cnt[k] >= 2) {
      f.solid[k] = 1;
      f.u[k] = 0;
      f.v[k] = 0;
      prevSolid.push(k);
    }
    cnt[k] = 0;
  }
}

export function update(dt) {
  const period = 1.15 / params.cadence,
    speed = (4 * STEP_L) / period;
  worldX += speed * dt;
  tSim += dt;
  const p0 = phase;
  phase = (phase + dt / period) % 1;
  const stepA = p0 > phase,
    stepB = (p0 + 0.5) % 1 > (phase + 0.5) % 1;
  const f = fluid,
    FW = f.W,
    cellSpeed = speed / CELL;
  f.windU = -cellSpeed * params.wind;
  f.roadU = -cellSpeed;

  const s = worldX * 0.009,
    surge = state.mode === "leaving" ? 1 + state.leaveT * 5 : 1;
  for (let j = 1; j <= ny; j++) {
    const y = j / ny,
      bank = smooth(0.4, 0.78, fbm(s, j * 0.06));
    f.inflowD[j] =
      params.fog *
      surge *
      (0.2 + 0.6 * y * y + 1.4 * bank * (0.3 + 0.7 * y));
    f.inflowV[j] = (fbm(tSim * 0.5 + 40, j * 0.1) - 0.5) * 6 * surge;
  }
  const off = worldX / CELL;
  for (let j = ny - 3; j <= ny; j++)
    for (let i = 1; i <= nx; i++) {
      const k = i + FW * j;
      if (!f.solid[k])
        f.d[k] +=
          dt *
          params.fog *
          0.9 *
          noise2((i + off) * 0.07, tSim * 0.25 + j * 0.3);
    }

  computeLamps();
  for (const L of lamps)
    splat(L.x / CELL + 0.5, L.y / CELL - 0.5, 2.2, 0, -40 * dt, 0);

  // 轉場：四面八方灌進濃霧，並用亂流把它攪開
  if (state.mode === "leaving") {
    const amt = 6 * dt * (0.4 + state.leaveT * 1.6);
    for (let n = 0; n < 7; n++) {
      const ci = 1 + Math.random() * nx,
        cj = 1 + Math.random() * ny,
        a = Math.random() * Math.PI * 2,
        sp = 25 + 30 * state.leaveT;
      splat(
        ci,
        cj,
        4 + Math.random() * 5,
        Math.cos(a) * sp,
        Math.sin(a) * sp,
        amt,
      );
    }
  }

  let rimL = 0,
    rimR = 0;
  for (const L of lamps) {
    const w = Math.exp(-((L.x - CX) ** 2) / (2 * 45 * 45));
    if (L.x < CX) rimL = Math.max(rimL, w);
    else rimR = Math.max(rimR, w);
  }
  buildCharacter(phase, rimL, rimR);
  applyCharacterSolid();

  if (stepA || stepB) {
    const ci = (CX + STEP_L) / CELL + 0.5,
      cj = (FOOT - 1) / CELL + 0.5;
    splat(ci - 2, cj, 2.5, -9, -3, 0.08 * params.fog);
    splat(ci + 2, cj, 2.5, 9, -3, 0.08 * params.fog);
  }
  if (ptr.active && ptr.moved) {
    const dx = (ptr.x - ptr.px) / CELL,
      dy = (ptr.y - ptr.py) / CELL;
    splat(
      ptr.x / CELL + 0.5,
      ptr.y / CELL + 0.5,
      3.5,
      clamp(dx / dt, -80, 80) * 0.35,
      clamp(dy / dt, -80, 80) * 0.35,
      Math.min(0.4, Math.hypot(dx, dy) * 0.05) * params.fog,
    );
    ptr.px = ptr.x;
    ptr.py = ptr.y;
    ptr.moved = false;
  }
  f.step(dt, {
    vort: params.vort,
    sink: state.mode === "leaving" ? 0.2 : params.sink,
    iter: 18,
    decay: state.mode === "leaving" ? 0 : 0.035,
    cap: state.mode === "leaving" ? 8 : 4,
  });
}

// 繪製
function drawLayer(c, par) {
  const P = c.width,
    o = Math.round((((worldX * par) % P) + P) % P);
  for (let x = -o; x < W; x += P) ctx.drawImage(c, x, 0);
}
function drawLamps() {
  for (const L of lamps) {
    const x = L.x,
      b = L.base;
    ctx.fillStyle = "rgb(34,30,24)";
    ctx.fillRect(x - 1, b - 46, 2, 46);
    ctx.fillRect(x - 2, b - 4, 4, 4);
    ctx.fillRect(x - 3, b - 1, 6, 1);
    ctx.fillRect(x - 3, b - 38, 6, 1);
    ctx.fillRect(x - 3, b - 53, 6, 7);
    ctx.fillRect(x - 3, b - 54, 6, 1);
    ctx.fillRect(x - 2, b - 55, 4, 1);
    ctx.fillRect(x - 1, b - 56, 2, 1);
    ctx.fillStyle = "rgb(246,210,130)";
    ctx.fillRect(x - 2, b - 52, 4, 5);
  }
  ctx.globalCompositeOperation = "lighter";
  for (const L of lamps) {
    const gr = ctx.createRadialGradient(L.x, L.y, 1, L.x, L.y, 34);
    gr.addColorStop(0, "rgba(255,200,110,0.3)");
    gr.addColorStop(1, "rgba(255,200,110,0)");
    ctx.fillStyle = gr;
    ctx.fillRect(L.x - 34, L.y - 34, 68, 68);
  }
  ctx.globalCompositeOperation = "source-over";
}
function drawRoad() {
  const o1 = Math.round(worldX) % 64;
  for (let x = -o1; x < W; x += 64) ctx.drawImage(swTile, x, GY);
  ctx.fillStyle = "rgb(128,120,95)";
  ctx.fillRect(0, GY + 9, W, 2);
  ctx.fillStyle = "rgb(40,37,30)";
  ctx.fillRect(0, GY + 11, W, 1);
  const o2 = Math.round(worldX * 1.3) % 60;
  for (let x = -o2; x < W; x += 60) ctx.drawImage(roadTile, x, GY + 12);
  ctx.fillStyle = "rgba(240,200,120,0.16)";
  for (const L of lamps) {
    const rx = Math.round(L.x + (L.x - CX) * 0.05);
    for (let y = GY + 13; y < H; y += 2)
      ctx.fillRect(rx - 1 + ((y >> 1) & 1), y, 2, 1);
  }
}
function renderFog() {
  const f = fluid,
    FW = f.W,
    d = f.d,
    sol = f.solid,
    data = fogImg.data,
    inv = 1 / (2 * 30 * 30);
  let p = 0;
  for (let j = 1; j <= ny; j++) {
    const py = (j - 0.5) * CELL;
    for (let i = 1; i <= nx; i++, p += 4) {
      const k = i + FW * j;
      let L = 0;
      const px = (i - 0.5) * CELL;
      for (let n = 0; n < lamps.length; n++) {
        const dx = px - lamps[n].x,
          dy = py - lamps[n].y;
        L += Math.exp(-(dx * dx + dy * dy) * inv);
      }
      if (L > 1) L = 1;
      let a = (1 - Math.exp(-d[k] * 1.1)) * 0.94; // Beer–Lambert
      a = Math.min(0.97, a + L * 0.25 * (1 - Math.exp(-d[k] * 2)));
      if (sol[k]) a *= 0.32;
      const lv = a * 9;
      let q = lv | 0;
      if (lv - q > BAYER[(i & 3) | ((j & 3) << 2)]) q++;
      data[p] = 188 + 58 * L;
      data[p + 1] = 178 + 36 * L;
      data[p + 2] = 142 - 4 * L;
      data[p + 3] = (q / 9) * 255;
    }
  }
  fogCtx.putImageData(fogImg, 0, 0);
  ctx.drawImage(fogCv, 0, 0, nx * CELL, ny * CELL);
}
export function render() {
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(skyCv, 0, 0);
  drawLayer(farLayer, 0.12);
  ctx.fillStyle = "rgba(150,141,106,0.32)";
  ctx.fillRect(0, 0, W, GY + 6);
  drawLayer(midLayer, 0.38);
  ctx.fillStyle = "rgba(150,141,106,0.16)";
  ctx.fillRect(0, 0, W, GY + 6);
  drawLamps();
  drawRoad();
  ctx.fillStyle = "rgba(20,18,13,0.35)";
  ctx.fillRect(CX - 7, FOOT - 1, 15, 2);
  ctx.fillRect(CX - 5, FOOT + 1, 11, 1);
  ctx.drawImage(spriteCv, CX - SCX, FOOT - SGY);
  renderFog();
  ctx.drawImage(vigCv, 0, 0);
}
function visibility() {
  const f = fluid,
    FW = f.W,
    ci = Math.round(CX / CELL);
  let s = 0,
    n = 0;
  for (let j = Math.round(ny * 0.35); j <= ny; j++)
    for (let i = Math.max(1, ci - 30); i <= Math.min(nx, ci + 30); i++) {
      s += f.d[i + FW * j];
      n++;
    }
  return 3.912 / (0.16 * (s / Math.max(1, n)) + 0.008); // Koschmieder
}

// 開場左上角的「能見度」讀數
const $vis = document.getElementById("vis");
export function showVisibility() {
  $vis.textContent = Math.round(visibility());
}

// 初始化（手機直式另外配置）
export function setup() {
  const vw = Math.max(1, innerWidth),
    vh = Math.max(1, innerHeight),
    ar = vw / vh;
  const portrait = ar < 0.85;
  // 直式：解析度拉高一點，人物不會被放得太大；人物置中、路燈間距縮短
  H = portrait ? 230 : params.quality;
  W = Math.max(96, Math.round(H * ar));
  cvs.width = W;
  cvs.height = H;
  GY = Math.round(H * (portrait ? 0.78 : 0.8));
  FOOT = GY + 3;
  CX = Math.round(W * (portrait ? 0.5 : 0.44));
  LAMP_GAP = W < 220 ? 140 : 190;
  nx = Math.ceil(W / CELL);
  ny = Math.ceil(H / CELL);
  fluid = new Fluid(nx, ny);
  cnt = new Uint8Array(fluid.u.length);
  prevSolid.length = 0;
  fogCv.width = nx;
  fogCv.height = ny;
  fogImg = fogCtx.createImageData(nx, ny);
  const view = { W, H, GY, CX };
  skyCv = makeSky(view);
  farLayer = makeLayer(
    view,
    520,
    {
      w: [18, 44],
      h: [0.22, 0.5],
      baseOff: 6,
      color: "rgb(118,111,86)",
      tower: true,
      face: "rgb(196,184,140)",
    },
    3,
  );
  midLayer = makeLayer(
    view,
    460,
    {
      w: [22, 48],
      h: [0.16, 0.38],
      baseOff: 6,
      color: "rgb(84,78,61)",
      windows: true,
      lit: 0.14,
      litColor: "rgb(206,170,98)",
      winColor: "rgb(66,61,48)",
    },
    5,
  );
  swTile = makeSidewalk();
  roadTile = makeRoad(view);
  vigCv = makeVignette(view);
  const FW = fluid.W;
  for (let j = 1; j <= ny; j++)
    for (let i = 1; i <= nx; i++)
      fluid.d[i + FW * j] =
        params.fog *
        (0.35 + fbm(i * 0.05, j * 0.07)) *
        (0.45 + (0.55 * j) / ny);
  const savedMode = state.mode;
  state.mode = "walking";
  for (let s = 0; s < 90; s++) update(1 / 30);
  state.mode = savedMode;
  render();
  showVisibility();
}

// 視窗座標 → 畫布座標（畫布以 object-fit: cover 鋪滿視窗）
export function toScene(cx, cy) {
  const s = Math.max(innerWidth / W, innerHeight / H);
  return {
    x: (cx - (innerWidth - W * s) / 2) / s,
    y: (cy - (innerHeight - H * s) / 2) / s,
  };
}
