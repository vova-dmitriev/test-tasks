import type { GetEventsParams, GetEventsResponse } from "../types";
import { api } from "./api";

export async function getEvents(params: GetEventsParams) {
  const response = await api.get<GetEventsResponse>("/api/events", { params });
  return response.data;
}
