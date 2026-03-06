import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";
import { getMockEvents } from "../../mocks/eventsMock";

type RequestWithOriginalUrl = IncomingMessage & {
  originalUrl?: string;
};

function handleEventsApi(
  req: RequestWithOriginalUrl,
  res: ServerResponse,
  next: () => void
): void {
  if (req.method !== "GET") {
    next();
    return;
  }

  const originalUrl = req.originalUrl ?? req.url ?? "";
  const requestUrl = new URL(originalUrl, "http://localhost");

  if (!requestUrl.searchParams.has("page") || !requestUrl.searchParams.has("limit")) {
    next();
    return;
  }

  const page = Number(requestUrl.searchParams.get("page") ?? "1");
  const limit = Number(requestUrl.searchParams.get("limit") ?? "20");
  const q = requestUrl.searchParams.get("q") ?? undefined;
  const archivedParam = requestUrl.searchParams.get("archived");
  const archived = archivedParam === null ? undefined : archivedParam === "true";

  const payload = getMockEvents({
    page,
    limit,
    q,
    archived
  });

  setTimeout(() => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(payload));
  }, 120);
}

export function eventsApiPlugin(): Plugin {
  return {
    name: "events-mock-api",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/api/events", handleEventsApi);
    }
  };
}
