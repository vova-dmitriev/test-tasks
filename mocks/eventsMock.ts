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
