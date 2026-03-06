export type Mode = "upcoming" | "archived";

export type EventItem = {
  id: string;
  title: string;
  archived: boolean;
};

export type GetEventsParams = {
  page: number;
  limit: number;
  q?: string;
  archived?: boolean;
};

export type GetEventsResponse = {
  items: EventItem[];
  hasMore: boolean;
};
