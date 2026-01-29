/**
 * Convert epoch timestamp (seconds) to human-readable IST format
 */
export function formatLastSeen(epochSeconds: number): string {
  // Convert seconds to milliseconds
  const date = new Date(epochSeconds * 1000);
  
  // Format to IST (India Standard Time - UTC+5:30)
  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Get relative time string (e.g., "2 hours ago", "3 days ago")
 */
export function getRelativeTime(epochSeconds: number): string {
  const now = Date.now();
  const date = epochSeconds * 1000;
  const diffMs = now - date;
  
  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return formatLastSeen(epochSeconds);
}

/**
 * Format river race date string to readable format
 */
export function formatRaceDate(dateStr: string): string {
  // Format: "20260126T095506.000Z" -> "26 Jan 2026, 3:25 PM IST"
  const year = dateStr.slice(0, 4);
  const month = dateStr.slice(4, 6);
  const day = dateStr.slice(6, 8);
  const hour = dateStr.slice(9, 11);
  const minute = dateStr.slice(11, 13);
  
  const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:00.000Z`);
  
  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}
