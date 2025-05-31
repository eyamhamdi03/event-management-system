
import { useQuery } from "@tanstack/react-query";
import { eventsClient } from "../api/event.client";
import { QueryFilters } from "../types";

export const useGetOrganizerEvents = (
  hostId: string,
  filters?: Omit<QueryFilters, 'hostId'>
) => {
  return useQuery({
    queryKey: ['organizerEvents', hostId, filters],
    queryFn: () => eventsClient.findByOrganizer(hostId, filters),
    enabled: !!hostId
  });
};