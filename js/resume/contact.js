// 聯絡：複製 email（剪貼簿不可用時改為選取文字）
export function bindCopyEmail() {
  document.getElementById("copy-email").addEventListener("click", (e) => {
    const btn = e.currentTarget,
      node = document.getElementById("email");
    const done = () => {
      btn.textContent = "已複製";
      setTimeout(() => (btn.textContent = "複製"), 1600);
    };
    const fallback = () => {
      const r = document.createRange();
      r.selectNodeContents(node);
      const s = getSelection();
      s.removeAllRanges();
      s.addRange(r);
      btn.textContent = "已選取";
    };
    try {
      navigator.clipboard.writeText(node.textContent).then(done, fallback);
    } catch {
      fallback();
    }
  });
}
