import { useEffect, useRef, useState } from "react";
import { getEvents } from "../api/eventsApi";
import { EventList } from "../components/EventList";
import { SearchInput } from "../components/SearchInput";
import { Tabs } from "../components/Tabs";
import type { EventItem, Mode } from "../types";

type ActiveFilters = {
  archived: boolean;
  q?: string;
};

export function EventsFixPage() {
  const [items, setItems] = useState<EventItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<Mode>("upcoming");


  async function loadFirstPage(nextQuery: string, nextMode: Mode) {
    const filters: ActiveFilters = {
      q: nextQuery || undefined,
      archived: nextMode === "archived",
    };

    const response = await getEvents({
      page: 1,
      limit: 20,
      ...filters,
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
      archived: mode === 'archived'
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
        <h1 className="events-title">Events (After Fix)</h1>
        <p className="events-subtitle">
          Load more uses the same filters as page 1, so Archived mode stays
          consistent.
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
