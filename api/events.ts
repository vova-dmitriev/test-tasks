import type { IncomingMessage, ServerResponse } from "node:http";
import { getMockEvents } from "../mocks/eventsMock";

function toPositiveInt(value: string | null, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.floor(parsed);
}

export default function handler(req: IncomingMessage, res: ServerResponse): void {
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
}
