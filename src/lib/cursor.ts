export function emojiCursorDataUrl(emoji: string, size = 32): string {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
  <svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'>
    <style>text { font-family: system-ui, -apple-system, 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif; }</style>
    <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='${Math.floor(
      size * 0.75
    )}'>${emoji}</text>
  </svg>`
  // Percent-encode the SVG
  const encoded = encodeURIComponent(svg).replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29')
  return `url("data:image/svg+xml;utf8,${encoded}") ${Math.floor(size / 2)} ${Math.floor(size / 2)}, auto`
}
