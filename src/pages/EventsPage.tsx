import { useEffect, useState } from "react";
import { getEvents } from "../api/eventsApi";
import { EventList } from "../components/EventList";
import { SearchInput } from "../components/SearchInput";
import { Tabs } from "../components/Tabs";
import type { EventItem, Mode } from "../types";

export function EventsPage() {
  const [items, setItems] = useState<EventItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<Mode>("upcoming");

  async function loadFirstPage(nextQuery: string, nextMode: Mode) {
    const response = await getEvents({
      page: 1,
      limit: 20,
      q: nextQuery || undefined,
      archived: nextMode === "archived",
    });

    setItems(response.items);
    setPage(1);
    setHasMore(response.hasMore);
  }

  async function loadMore() {
    const nextPage = page + 1;
    const response = await getEvents({
      page: nextPage,
      limit: 20,
      q: query || undefined,
    });

    setItems((current) => [...current, ...response.items]);
    setPage(nextPage);
    setHasMore(response.hasMore);
  }

  useEffect(() => {
    void loadFirstPage("", "upcoming");
  }, []);

  return (
    <section className="events-shell">
      <header className="events-header">
        <p className="events-eyebrow">Organizer Workspace</p>
        <h1 className="events-title">Events (Before Fix)</h1>
        <p className="events-subtitle">
          This page intentionally keeps the bug: archived filter is lost after
          Load more.
        </p>
      </header>

      <SearchInput value={query} onChange={setQuery} />
      <Tabs
        value={mode}
        onValueChange={(nextMode) => {
          setMode(nextMode);
          void loadFirstPage(query, nextMode);
        }}
      />
      <section className="results-pane">
        <EventList items={items} />
      </section>
      <div className="load-more-slot">
        {hasMore ? (
          <button className="load-more-button" onClick={loadMore}>
            Load more
          </button>
        ) : null}
      </div>
    </section>
  );
}
