export function estimateTokensFromText(text: string): number {
  // Rough heuristic: ~4 chars per token average in English
  return Math.ceil((text || "").length / 4);
}

export function trimMessagesToTokenLimit(
  messages: { role: string; content: string }[],
  maxTokens: number
) {
  const reversed = [...messages].reverse();
  let total = 0;
  const kept: typeof messages = [];
  for (const m of reversed) {
    total += estimateTokensFromText(m.content);
    if (total > maxTokens) break;
    kept.push(m);
  }
  return kept.reverse();
}


