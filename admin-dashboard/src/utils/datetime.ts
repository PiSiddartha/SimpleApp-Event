const IST_TIMEZONE = 'Asia/Kolkata';
const IST_OFFSET_MINUTES = 5 * 60 + 30;

function pad(value: number) {
  return String(value).padStart(2, '0');
}

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

export function toIstInputValue(dateString?: string): string {
  const date = parseApiDate(dateString);
  if (!date) return '';

  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: IST_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });

  const parts = Object.fromEntries(
    formatter.formatToParts(date).map((part) => [part.type, part.value])
  );

  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

export function fromIstInputToUtcIso(value?: string): string | undefined {
  if (!value) return undefined;
  const [datePart = '', timePart = '00:00'] = value.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute] = timePart.split(':').map(Number);
  if (!year || !month || !day) return undefined;

  const utcMillis = Date.UTC(year, month - 1, day, hour || 0, minute || 0) - IST_OFFSET_MINUTES * 60 * 1000;
  return new Date(utcMillis).toISOString();
}

export function formatDateTimeInIst(dateString?: string): string {
  const date = parseApiDate(dateString);
  if (!date) return 'TBD';

  return new Intl.DateTimeFormat('en-IN', {
    timeZone: IST_TIMEZONE,
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}
