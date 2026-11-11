/** SVG path for a sine-topped band: `width` long, filled down to `height`, crest at `base` ± `amp`, one wave per `period`. */
export function wavePath(width: number, height: number, base: number, amp: number, period: number) {
  let d = `M0 ${base}`;
  for (let x = 0; x <= width; x += 10) d += ` L${x} ${(base + amp * Math.sin((x / period) * Math.PI * 2)).toFixed(1)}`;
  return `${d} V${height} H0 Z`;
}
