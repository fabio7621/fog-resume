// 小工具：建立元素
export function el(tag, attrs = {}, ...children) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") n.className = v;
    else if (k === "text") n.textContent = v;
    else n.setAttribute(k, v);
  }
  for (const c of children) if (c) n.append(c);
  return n;
}
export const extLink = (href, text) =>
  el("a", { href, target: "_blank", rel: "noopener noreferrer", text });
