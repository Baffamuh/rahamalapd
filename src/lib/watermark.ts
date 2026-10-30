
let logoP: Promise<HTMLImageElement | null> | null = null;
function loadLogo() {
  logoP ??= new Promise((res) => {
    const im = new Image();
    im.crossOrigin = "anonymous";
    im.onload = () => res(im);
    im.onerror = () => res(null);
    im.src = "/rahama-emblem.png";
  });
  return logoP;
}

/** Resize a photo, stamp the Rahama logo in the bottom-right corner, return a compact JPEG data URL. */
export async function watermarkPhoto(file: File, maxW = 1000): Promise<string> {
  const src = await new Promise<string>((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result as string); r.onerror = rej; r.readAsDataURL(file); });
  const im = await new Promise<HTMLImageElement>((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
  const s = Math.min(1, maxW / im.width);
  const c = document.createElement("canvas");
  c.width = Math.round(im.width * s); c.height = Math.round(im.height * s);
  const ctx = c.getContext("2d")!;
  ctx.drawImage(im, 0, 0, c.width, c.height);
  const logo = await loadLogo();
  const pad = Math.round(c.width * 0.025);
  const lw = Math.round(c.width * 0.16);
  if (logo) {
    const lh = Math.round((logo.height / logo.width) * lw);
    const x = c.width - lw - pad, y = c.height - lh - pad;
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath(); ctx.roundRect(x - pad / 2, y - pad / 2, lw + pad, lh + pad, pad / 2); ctx.fill();
    ctx.globalAlpha = 0.95;
    ctx.drawImage(logo, x, y, lw, lh);
    ctx.globalAlpha = 1;
  }
  ctx.font = `600 ${Math.max(12, Math.round(c.width * 0.022))}px Sora, sans-serif`;
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.shadowColor = "rgba(0,0,0,0.6)"; ctx.shadowBlur = 4;
  ctx.fillText("Rahama Property · RC 9871926", pad, c.height - pad);
  try { return c.toDataURL("image/jpeg", 0.62); } catch { return src; }
}
