import type { EventItem } from "../types";

type EventListProps = {
  items: EventItem[];
};

export function EventList({ items }: EventListProps) {
  if (items.length === 0) {
    return <p className="empty-state">No events found</p>;
  }

  return (
    <ul className="event-list" aria-label="Events list">
      {items.map((item) => (
        <li
          key={item.id}
          className="event-card"
          data-archived={String(item.archived)}
          data-mode={item.archived ? "archived" : "upcoming"}
        >
          <span className="event-title">{item.title}</span>
          <span className={`event-pill ${item.archived ? "pill-archived" : "pill-upcoming"}`}>
            {item.archived ? "Archived" : "Upcoming"}
          </span>
        </li>
      ))}
    </ul>
  );
}
