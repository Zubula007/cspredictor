export function isFixtureLocked(
  matchDate: string,
  kickOff?: string
): boolean {
  if (!kickOff) return false;

  const kickOffDate = new Date(`${matchDate}T${kickOff}:00`);

  // Lock 30 minutes before kick-off
  kickOffDate.setMinutes(kickOffDate.getMinutes() - 30);

  return new Date() >= kickOffDate;
}

export function getLockTime(
  matchDate: string,
  kickOff?: string
): Date | null {
  if (!kickOff) return null;

  const lockTime = new Date(`${matchDate}T${kickOff}:00`);
  lockTime.setMinutes(lockTime.getMinutes() - 30);

  return lockTime;
}