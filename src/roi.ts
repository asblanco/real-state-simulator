export function getRoiColorClass(roiAnualizado: number): string {
  if (roiAnualizado < 0.035) return "bg-red-600";
  if (roiAnualizado < 0.07) return "bg-sky-600";
  return "bg-emerald-600";
}
