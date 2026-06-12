export function getRoiColorClass(roiAnualizado: number): string {
  if (roiAnualizado < 0.05) return "bg-red-600";
  if (roiAnualizado < 0.10) return "bg-sky-600";
  return "bg-emerald-600";
}

export function getRoiProyectoColorClass(roiAnualizado: number): string {
  if (roiAnualizado < 0.025) return "bg-red-600";
  if (roiAnualizado < 0.05) return "bg-sky-600";
  return "bg-emerald-600";
}
