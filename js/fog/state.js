// 跨模組共用的可變狀態

// 轉場狀態：walking → leaving（霧湧上）→ resume
export const state = {
  mode: "walking",
  leaveT: 0,
};

// 指標（滑鼠／手指）在畫布座標上的位置，用來攪動霧氣
export const ptr = { x: 0, y: 0, px: 0, py: 0, active: false, moved: false };
