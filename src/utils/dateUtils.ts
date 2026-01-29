/**
 * Convert epoch timestamp or date string to IST formatted date/time
 */
export function formatLastSeen(lastSeen: string | number): string {
  let date: Date;

  if (typeof lastSeen === 'number') {
    // Handle epoch timestamp (milliseconds)
    date = new Date(lastSeen);
  } else if (!isNaN(Number(lastSeen))) {
    // Handle epoch as string
    date = new Date(Number(lastSeen));
  } else {
    // Already formatted string, return as-is or try to parse
    return lastSeen;
  }

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
 * Get epoch value for sorting (handles both epoch and string dates)
 */
export function getLastSeenEpoch(lastSeen: string | number): number {
  if (typeof lastSeen === 'number') {
    return lastSeen;
  }
  
  if (!isNaN(Number(lastSeen))) {
    return Number(lastSeen);
  }
  
  // Try to parse string date
  const parsed = Date.parse(lastSeen);
  return isNaN(parsed) ? 0 : parsed;
}
