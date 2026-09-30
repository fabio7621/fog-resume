// 霧的參數（固定）
export const CELL = 2,
  STEP_L = 7;
export const params = {
  wind: 1,
  vort: 3.2,
  fog: 1,
  sink: 1.2,
  cadence: 1,
  quality: 180,
  paused: false,
};
export const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
if (reduceMotion) params.paused = true;

// 4×4 Bayer 抖色矩陣
export const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(
  (b) => (b + 0.5) / 16,
);
