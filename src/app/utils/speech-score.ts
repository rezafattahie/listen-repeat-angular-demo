export function normalize(text: string): string {
  return (text || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenF1(expected: string, spoken: string): number {
  const a = normalize(expected).split(" ").filter(Boolean);
  const b = normalize(spoken).split(" ").filter(Boolean);
  if (!a.length || !b.length) return 0;

  const count = (arr: string[]) => {
    const m = new Map<string, number>();
    for (const t of arr) m.set(t, (m.get(t) ?? 0) + 1);
    return m;
  };

  const ca = count(a);
  const cb = count(b);

  let common = 0;
  for (const [t, n] of ca.entries()) {
    const m = cb.get(t) ?? 0;
    common += Math.min(n, m);
  }

  const precision = common / b.length;
  const recall = common / a.length;
  if (precision + recall === 0) return 0;

  return (2 * precision * recall) / (precision + recall);
}
