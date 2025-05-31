import {useQuery} from "@tanstack/react-query";
import {eventsClient} from "../api/event.client.ts";
import {QueryFilters} from "../types.ts";

export const GET_EVENTS_QUERY_KEY = 'getEvents';

export const useGetEvents = (filters: QueryFilters & { hostId?: string }) => {
  return useQuery({
    queryKey: ['events', filters],
    queryFn: () => eventsClient.allFiltered(filters)  });
};