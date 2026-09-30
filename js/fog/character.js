// 人物（兩節腿 IK）：每一幀重畫到 spriteCv，並輸出輪廓遮罩 sMask 給流體當障礙
import { STEP_L, params } from "./config.js";
import { clamp } from "../utils/math.js";
import { mk } from "../utils/canvas.js";

export const SW = 44,
  SH = 60,
  SCX = 20,
  SGY = 57;
export const spriteCv = mk(SW, SH);
const sctx = spriteCv.getContext("2d"),
  sImg = sctx.createImageData(SW, SH);
export const sMask = new Uint8Array(SW * SH);
const sId = new Int8Array(SW * SH);
const COL = {
  hat: [28, 25, 20],
  band: [96, 80, 56],
  skin: [150, 126, 98],
  hair: [40, 34, 27],
  coat: [56, 49, 39],
  coatDark: [40, 35, 28],
  cape: [66, 58, 45],
  glove: [34, 29, 24],
  cane: [58, 44, 30],
  trouser: [36, 32, 26],
  trouserFar: [26, 23, 19],
  shoe: [18, 16, 13],
  shoeFar: [14, 12, 10],
  rim: [222, 182, 112],
};
function footAt(ph) {
  if (ph < 0.5) return { x: STEP_L * (1 - 4 * ph), y: 0, stance: true };
  const q = (ph - 0.5) * 2;
  return {
    x: -STEP_L + 2 * STEP_L * (0.5 - 0.5 * Math.cos(Math.PI * q)),
    y: -3.2 * Math.sin(Math.PI * q),
    stance: false,
  };
}
function ik(h, a, l1, l2) {
  let dx = a.x - h.x,
    dy = a.y - h.y,
    dist = Math.hypot(dx, dy);
  const maxd = l1 + l2 - 0.01;
  if (dist > maxd) {
    dx *= maxd / dist;
    dy *= maxd / dist;
    dist = maxd;
    a = { x: h.x + dx, y: h.y + dy };
  }
  const base = Math.atan2(dy, dx),
    A = Math.acos(
      clamp((l1 * l1 + dist * dist - l2 * l2) / (2 * l1 * dist), -1, 1),
    );
  const k1 = {
      x: h.x + l1 * Math.cos(base - A),
      y: h.y + l1 * Math.sin(base - A),
    },
    k2 = {
      x: h.x + l1 * Math.cos(base + A),
      y: h.y + l1 * Math.sin(base + A),
    };
  return { knee: k1.x > k2.x ? k1 : k2, ank: a };
}
function inPoly(pts, x, y) {
  let c = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const xi = pts[i][0],
      yi = pts[i][1],
      xj = pts[j][0],
      yj = pts[j][1];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)
      c = !c;
  }
  return c;
}
function segDist2(px, py, ax, ay, bx, by) {
  const vx = bx - ax,
    vy = by - ay,
    t = clamp(
      ((px - ax) * vx + (py - ay) * vy) / (vx * vx + vy * vy || 1),
      0,
      1,
    ),
    dx = ax + vx * t - px,
    dy = ay + vy * t - py;
  return dx * dx + dy * dy;
}
function hit(s, x, y) {
  switch (s.t) {
    case "r":
      return x >= s.x0 && x < s.x1 && y >= s.y0 && y < s.y1;
    case "c": {
      const dx = x - s.x,
        dy = y - s.y;
      return dx * dx + dy * dy <= s.r * s.r;
    }
    case "k":
      return segDist2(x, y, s.ax, s.ay, s.bx, s.by) <= s.r * s.r;
    case "p":
      return inPoly(s.pts, x, y);
  }
  return false;
}
export function buildCharacter(p, rimL, rimR) {
  const fa = footAt(p),
    fb = footAt((p + 0.5) % 1),
    st = fa.stance ? fa : fb;
  const hipH = Math.sqrt(Math.max(0, (20 * 0.97) ** 2 - st.x * st.x));
  const hipY = Math.round(SGY - 1 - hipH),
    hip = { x: SCX, y: hipY },
    shY = hipY - 15;
  const A = ik(hip, { x: SCX + fa.x, y: SGY - 1 + fa.y }, 10, 10),
    B = ik(hip, { x: SCX + fb.x, y: SGY - 1 + fb.y }, 10, 10);
  const sway = Math.sin(p * 4 * Math.PI) * 0.8,
    trail = -1.3 - params.wind * 0.6;
  const hx = SCX + 2.5,
    hy = shY - 4.5,
    hand = { x: SCX + 6.5, y: hipY + 1 };
  const ca = 0.12 + 0.28 * Math.sin(p * 2 * Math.PI);
  const tip = {
    x: hand.x + 17 * Math.sin(ca),
    y: Math.min(SGY - 0.5, hand.y + 17 * Math.cos(ca)),
  };
  const S = [
    {
      t: "r",
      x0: hx - 6,
      x1: hx + 6.5,
      y0: hy - 5,
      y1: hy - 4,
      c: COL.hat,
      g: 1,
    },
    {
      t: "r",
      x0: hx - 3.5,
      x1: hx + 4,
      y0: hy - 6,
      y1: hy - 5,
      c: COL.band,
    },
    {
      t: "p",
      pts: [
        [hx - 3.5, hy - 6],
        [hx - 3, hy - 9.2],
        [hx + 3.5, hy - 9.2],
        [hx + 4, hy - 6],
      ],
      c: COL.hat,
      g: 1,
    },
    { t: "c", x: hx, y: hy, r: 3.3, c: COL.skin, hair: true },
    {
      t: "p",
      pts: [
        [SCX - 4, shY - 3],
        [SCX - 0.5, shY - 1],
        [SCX - 0.5, shY + 1.5],
        [SCX - 4.5, shY + 1.5],
      ],
      c: COL.coatDark,
    },
    {
      t: "p",
      pts: [
        [SCX - 4.5, shY - 1],
        [SCX + 5, shY - 1],
        [SCX + 8, shY + 10],
        [SCX - 8.5 + trail + sway, shY + 11.5],
      ],
      c: COL.cape,
      g: 1,
    },
    { t: "c", x: hand.x, y: hand.y, r: 1.4, c: COL.glove },
    {
      t: "k",
      ax: hand.x,
      ay: hand.y,
      bx: tip.x,
      by: tip.y,
      r: 0.6,
      c: COL.cane,
    },
    {
      t: "k",
      ax: SCX + 3,
      ay: shY + 3,
      bx: hand.x,
      by: hand.y,
      r: 1.7,
      c: COL.coat,
      g: 1,
    },
    {
      t: "p",
      pts: [
        [SCX - 4, shY],
        [SCX + 4.5, shY],
        [SCX + 6.5 + sway * 0.4, hipY + 8],
        [SCX - 7 + trail + sway, hipY + 9.5],
      ],
      c: COL.coat,
      g: 1,
    },
    {
      t: "r",
      x0: A.ank.x - 1.5,
      x1: A.ank.x + 3,
      y0: A.ank.y - 1,
      y1: A.ank.y + 1,
      c: COL.shoe,
    },
    {
      t: "k",
      ax: A.knee.x,
      ay: A.knee.y,
      bx: A.ank.x,
      by: A.ank.y,
      r: 1.5,
      c: COL.trouser,
    },
    {
      t: "k",
      ax: hip.x,
      ay: hip.y,
      bx: A.knee.x,
      by: A.knee.y,
      r: 1.8,
      c: COL.trouser,
    },
    {
      t: "r",
      x0: B.ank.x - 1.5,
      x1: B.ank.x + 3,
      y0: B.ank.y - 1,
      y1: B.ank.y + 1,
      c: COL.shoeFar,
    },
    {
      t: "k",
      ax: B.knee.x,
      ay: B.knee.y,
      bx: B.ank.x,
      by: B.ank.y,
      r: 1.5,
      c: COL.trouserFar,
    },
    {
      t: "k",
      ax: hip.x,
      ay: hip.y,
      bx: B.knee.x,
      by: B.knee.y,
      r: 1.8,
      c: COL.trouserFar,
    },
  ];
  for (let y = 0; y < SH; y++)
    for (let x = 0; x < SW; x++) {
      const px = x + 0.5,
        py = y + 0.5;
      let id = -1;
      for (let s = 0; s < S.length; s++)
        if (hit(S[s], px, py)) {
          id = s;
          break;
        }
      const o = x + y * SW;
      sId[o] = id;
      sMask[o] = id >= 0 ? 1 : 0;
    }
  const data = sImg.data;
  for (let y = 0; y < SH; y++)
    for (let x = 0; x < SW; x++) {
      const o = x + y * SW,
        q = o * 4,
        id = sId[o];
      if (id < 0) {
        data[q + 3] = 0;
        continue;
      }
      const s = S[id],
        c = s.hair && x + 0.5 < s.x - 0.8 ? COL.hair : s.c;
      let r = c[0],
        g = c[1],
        b = c[2];
      if (s.g) {
        const right = x + 1 >= SW || sId[o + 1] < 0,
          left = x === 0 || sId[o - 1] < 0,
          top = y === 0 || sId[o - SW] < 0;
        const k = right
          ? 0.2 + 0.65 * rimR
          : left
            ? 0.1 + 0.65 * rimL
            : top
              ? 0.08 + 0.3 * Math.max(rimL, rimR)
              : 0;
        if (k) {
          r += (COL.rim[0] - r) * k;
          g += (COL.rim[1] - g) * k;
          b += (COL.rim[2] - b) * k;
        }
      }
      data[q] = r;
      data[q + 1] = g;
      data[q + 2] = b;
      data[q + 3] = 255;
    }
  sctx.putImageData(sImg, 0, 0);
}
