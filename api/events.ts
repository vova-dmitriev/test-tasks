import type { IncomingMessage, ServerResponse } from "node:http";

function toPositiveInt(value: string | null, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.floor(parsed);
}

type EventItem = {
  id: string;
  title: string;
  archived: boolean;
};

type GetEventsParams = {
  page: number;
  limit: number;
  q?: string;
  archived?: boolean;
};

type GetEventsResponse = {
  items: EventItem[];
  hasMore: boolean;
};

function createMockEvents(): EventItem[] {
  const events: EventItem[] = [];

  for (let i = 1; i <= 15; i += 1) {
    events.push({
      id: `u-general-${i}`,
      title: `Upcoming Event ${i}`,
      archived: false
    });
  }

  for (let i = 1; i <= 22; i += 1) {
    events.push({
      id: `a-design-${i}`,
      title: `Design Archive ${i}`,
      archived: true
    });
  }

  for (let i = 1; i <= 8; i += 1) {
    events.push({
      id: `u-design-${i}`,
      title: `Design Upcoming ${i}`,
      archived: false
    });
  }

  for (let i = 1; i <= 15; i += 1) {
    events.push({
      id: `a-general-${i}`,
      title: `Archived Event ${i}`,
      archived: true
    });
  }

  return events;
}

const MOCK_EVENTS = createMockEvents();

export function getMockEvents(params: GetEventsParams): GetEventsResponse {
  const q = params.q?.trim().toLowerCase();

  const filtered = MOCK_EVENTS.filter((item) => {
    if (typeof params.archived === "boolean" && item.archived !== params.archived) {
      return false;
    }

    if (q && !item.title.toLowerCase().includes(q)) {
      return false;
    }

    return true;
  });

  const start = (params.page - 1) * params.limit;
  const end = start + params.limit;

  return {
    items: filtered.slice(start, end),
    hasMore: end < filtered.length
  };
}

export default function handler(req: IncomingMessage, res: ServerResponse): void {
  try {
    if (req.method !== "GET") {
      res.statusCode = 405;
      res.setHeader("Allow", "GET");
      res.end("Method Not Allowed");
      return;
    }

    const requestUrl = new URL(req.url ?? "/api/events", "http://localhost");

    const page = toPositiveInt(requestUrl.searchParams.get("page"), 1);
    const limit = toPositiveInt(requestUrl.searchParams.get("limit"), 20);
    const q = requestUrl.searchParams.get("q") ?? undefined;

    const archivedParam = requestUrl.searchParams.get("archived");
    const archived = archivedParam === null ? undefined : archivedParam === "true";

    const payload = getMockEvents({
      page,
      limit,
      q,
      archived
    });

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify(payload));
  } catch (error) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(
      JSON.stringify({
        message: "Failed to build events response",
        error: error instanceof Error ? error.message : "Unknown error"
      })
    );
  }
}
