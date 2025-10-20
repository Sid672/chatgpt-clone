export function estimateTokensFromText(text: string): number {
  if (!text) return 0;
  
  // More accurate token estimation
  // English: ~4 chars per token, but varies by content
  // Code: ~3 chars per token
  // Special characters: ~1-2 chars per token
  
  const codePattern = /[{}[\]();]/g;
  const specialChars = /[^\w\s]/g;
  
  const codeMatches = (text.match(codePattern) || []).length;
  const specialMatches = (text.match(specialChars) || []).length;
  
  // Base estimation with adjustments for code and special characters
  let estimate = Math.ceil(text.length / 4);
  
  // Adjust for code (more tokens per character)
  if (codeMatches > 0) {
    estimate += Math.ceil(codeMatches * 0.5);
  }
  
  // Adjust for special characters (fewer tokens per character)
  if (specialMatches > 0) {
    estimate -= Math.ceil(specialMatches * 0.2);
  }
  
  return Math.max(1, estimate);
}

export function trimMessagesToTokenLimit(
  messages: { role: string; content: string }[],
  maxTokens: number
) {
  if (!messages.length) return messages;
  
  // Always keep system messages and the last user message
  const systemMessages = messages.filter(m => m.role === "system");
  const nonSystemMessages = messages.filter(m => m.role !== "system");
  
  if (nonSystemMessages.length === 0) return messages;
  
  // Start with system messages
  let total = systemMessages.reduce((sum, m) => sum + estimateTokensFromText(m.content), 0);
  const kept: typeof messages = [...systemMessages];
  
  // Add messages from the end (most recent first) until we hit the limit
  const reversed = [...nonSystemMessages].reverse();
  
  for (const m of reversed) {
    const messageTokens = estimateTokensFromText(m.content);
    if (total + messageTokens > maxTokens) {
      // If this is the last user message, try to fit it anyway
      if (m.role === "user" && kept.filter(k => k.role === "user").length === 0) {
        // Truncate the message if it's too long
        const truncatedContent = truncateTextToTokens(m.content, maxTokens - total);
        kept.push({ ...m, content: truncatedContent });
      }
      break;
    }
    total += messageTokens;
    kept.push(m);
  }
  
  return kept.reverse();
}

function truncateTextToTokens(text: string, maxTokens: number): string {
  if (estimateTokensFromText(text) <= maxTokens) return text;
  
  // Binary search for the right length
  let left = 0;
  let right = text.length;
  let bestLength = 0;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const truncated = text.substring(0, mid);
    const tokens = estimateTokensFromText(truncated);
    
    if (tokens <= maxTokens) {
      bestLength = mid;
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  return text.substring(0, bestLength) + "...";
}


