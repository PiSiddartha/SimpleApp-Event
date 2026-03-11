const IST_TIMEZONE = 'Asia/Kolkata';

function parseApiDate(dateString?: string): Date | null {
  if (!dateString) return null;
  if (/([zZ]|[+-]\d{2}:\d{2})$/.test(dateString)) {
    return new Date(dateString);
  }

  const [datePart = '', timePart = '00:00'] = dateString.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute] = timePart.slice(0, 5).split(':').map(Number);
  if (!year || !month || !day) return null;

  return new Date(Date.UTC(year, month - 1, day, (hour || 0) - 5, (minute || 0) - 30));
}

export function formatDateTimeInIst(dateString?: string): string {
  const date = parseApiDate(dateString);
  if (!date) return 'TBD';

  return new Intl.DateTimeFormat('en-IN', {
    timeZone: IST_TIMEZONE,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export function formatCompactDateTimeInIst(dateString?: string): string {
  const date = parseApiDate(dateString);
  if (!date) return 'TBD';

  return new Intl.DateTimeFormat('en-IN', {
    timeZone: IST_TIMEZONE,
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}
