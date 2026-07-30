export function getCountdownToLock(
  matchDate: string,
  kickOff?: string
): string {
  if (!kickOff) return "No kick-off time";

  const lockTime = new Date(`${matchDate}T${kickOff}:00`);
  lockTime.setMinutes(lockTime.getMinutes() - 30);

  const now = new Date();

  const diff = lockTime.getTime() - now.getTime();

  if (diff <= 0) {
    return "Locked";
  }

  const totalMinutes = Math.floor(diff / 60000);

  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}