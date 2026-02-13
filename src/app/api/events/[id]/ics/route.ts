import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

function icsEscape(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

function toIcsDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = getSessionFromRequest(request);
  if (!session) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await params;

  const event = await prisma.event.findFirst({
    where: { id, isPublished: true },
    select: { id: true, title: true, description: true, location: true, startAt: true, endAt: true },
  });

  if (!event) return Response.json({ error: "Event not found" }, { status: 404 });

  const dtStart = toIcsDate(event.startAt);
  const dtEnd = toIcsDate(event.endAt ?? new Date(event.startAt.getTime() + 60 * 60 * 1000));
  const dtStamp = toIcsDate(new Date());

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//MSU Life//EN",
    "BEGIN:VEVENT",
    `UID:${event.id}@msu-life`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${icsEscape(event.title)}`,
  ];

  if (event.description) {
    lines.push(`DESCRIPTION:${icsEscape(event.description)}`);
  }
  if (event.location) {
    lines.push(`LOCATION:${icsEscape(event.location)}`);
  }

  lines.push("END:VEVENT", "END:VCALENDAR");

  const icsBody = lines.join("\r\n");

  return new Response(icsBody, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="msu-life-event.ics"',
    },
  });
}
