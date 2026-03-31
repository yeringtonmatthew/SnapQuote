export interface CalendarEvent {
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  duration?: number; // hours, default 2
  location?: string;
}

/**
 * Format a date + optional time into Google Calendar's date format.
 * Google Calendar uses: YYYYMMDDTHHmmSSZ (all-day) or YYYYMMDD (date only).
 */
function toGoogleDatePair(date: string, time?: string, duration = 2): { start: string; end: string } {
  if (time) {
    // Time-specific event
    const [hours, minutes] = time.split(':').map(Number);
    const start = new Date(`${date}T${time}:00`);
    const end = new Date(start.getTime() + duration * 60 * 60 * 1000);

    const fmt = (d: Date) =>
      d.getFullYear().toString() +
      String(d.getMonth() + 1).padStart(2, '0') +
      String(d.getDate()).padStart(2, '0') +
      'T' +
      String(d.getHours()).padStart(2, '0') +
      String(d.getMinutes()).padStart(2, '0') +
      '00';

    return { start: fmt(start), end: fmt(end) };
  }

  // All-day event
  const startDate = date.replace(/-/g, '');
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  const endDate =
    nextDay.getFullYear().toString() +
    String(nextDay.getMonth() + 1).padStart(2, '0') +
    String(nextDay.getDate()).padStart(2, '0');

  return { start: startDate, end: endDate };
}

/**
 * Generate a Google Calendar "add event" URL.
 * Opens Google Calendar with the event pre-filled for the user to confirm.
 */
export function generateGoogleCalendarUrl(event: CalendarEvent): string {
  const { start, end } = toGoogleDatePair(event.date, event.time, event.duration);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${start}/${end}`,
    details: event.description,
  });

  if (event.location) {
    params.set('location', event.location);
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate an .ics (iCalendar) file content for Apple Calendar / Outlook.
 */
export function generateICalEvent(event: CalendarEvent): string {
  const { start, end } = toGoogleDatePair(event.date, event.time, event.duration);
  const uid = `snapquote-${Date.now()}@snapquote.dev`;
  const now = new Date();
  const stamp =
    now.getUTCFullYear().toString() +
    String(now.getUTCMonth() + 1).padStart(2, '0') +
    String(now.getUTCDate()).padStart(2, '0') +
    'T' +
    String(now.getUTCHours()).padStart(2, '0') +
    String(now.getUTCMinutes()).padStart(2, '0') +
    String(now.getUTCSeconds()).padStart(2, '0') +
    'Z';

  // Escape special characters in iCal text fields
  const escapeIcal = (text: string) =>
    text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

  const isAllDay = !event.time;

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SnapQuote//Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    ...(isAllDay
      ? [`DTSTART;VALUE=DATE:${start}`, `DTEND;VALUE=DATE:${end}`]
      : [`DTSTART:${start}`, `DTEND:${end}`]),
    `SUMMARY:${escapeIcal(event.title)}`,
    `DESCRIPTION:${escapeIcal(event.description)}`,
    ...(event.location ? [`LOCATION:${escapeIcal(event.location)}`] : []),
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  return lines.join('\r\n');
}
