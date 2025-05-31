import { api } from "./client";
import {
  CheckInStats,
  Event,
  EventDuplicatePayload,
  EventStats,
  GenericDataResponse,
  GenericPaginatedResponse,
  IdParam,
  Image,
  ImageType,
  QueryFilters,
} from "../types";
import { publicApi } from "./public-client.ts";
import { queryParamsHelper } from "../utilites/queryParamsHelper.ts";

export const eventsClient = {
  create: async (event: Partial<Event>) => {
    const response = await api.post<Event>('event', event);
    return response.data;
  },

  all: async () => {
    const response = await api.get<Event[]>('event');
    return response.data;
  },

  allFiltered: async (pagination: QueryFilters) => {
    const response = await api.get<GenericPaginatedResponse<Event>>(
      'event/withFilter' + queryParamsHelper.buildQueryString(pagination)
    );
    return response.data;
  },

  update: async (eventId: IdParam, event: Partial<Event>) => {
    const response = await api.patch<Event>('event/' + eventId, event);
    return response.data;
  },

  replace: async (eventId: IdParam, event: Event) => {
    const response = await api.put<Event>('event/' + eventId, event);
    return response.data;
  },

  findByID: async (eventId: IdParam) => {
    const response = await api.get<Event>('event/' + eventId);
    return response.data;
  },

  // Soft delete
  softDelete: async (eventId: IdParam) => {
    const response = await api.delete<void>('event/soft/' + eventId);
    return response.data;
  },

  // Restore
  restore: async (eventId: IdParam) => {
    const response = await api.post<void>('event/restore/' + eventId, {});
    return response.data;
  },

  // Hard delete
  delete: async (eventId: IdParam) => {
    const response = await api.delete<void>('event/' + eventId);
    return response.data;
  },

  //event byb organizer id 
  
  findByOrganizer: async (hostId: string, filters?: QueryFilters) => {
    console.log('Fetching organizer events for:', hostId);
    console.log('Using filters:', filters);

    try {
      const response = await api.get(`event/organizer/${hostId}`, {
        params: filters
      });
      
      console.log('Organizer events response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Organizer events fetch failed:',error);
   
      throw error;
    }
  }
,


  // Placeholder — if you re-add stats/images endpoints
  getEventStats: async (_eventId: IdParam) => {
    throw new Error("Not implemented in backend");
  },

  getEventCheckInStats: async (_eventId: IdParam) => {
    throw new Error("Not implemented in backend");
  },

  getEventImages: async (_eventId: IdParam) => {
    throw new Error("Not implemented in backend");
  },

  uploadEventImage: async (_eventId: IdParam, _image: File, _type: ImageType = 'EVENT_COVER') => {
    throw new Error("Not implemented in backend");
  },

  deleteEventImage: async (_eventId: IdParam, _imageId: IdParam) => {
    throw new Error("Not implemented in backend");
  },

  duplicate: async (_eventId: IdParam, _event: EventDuplicatePayload) => {
    throw new Error("Not implemented in backend");
  },

  updateEventStatus: async (_eventId: IdParam, _status: string) => {
    throw new Error("Not implemented in backend");
  },

  getEventReport: async (_eventId: IdParam, _reportType: IdParam, _startDate?: string, _endDate?: string) => {
    throw new Error("Not implemented in backend");
  }
}

export const eventsClientPublic = {
  all: async () => {
    const response = await publicApi.get<GenericPaginatedResponse<Event>>('event');
    return response.data;
  },

  findByID: async (eventId: IdParam, promoCode: null | string) => {
    const response = await publicApi.get<Event>(
      'event/' + eventId + (promoCode ? '?promo_code=' + promoCode : '')
    );
    return response.data;
  },
}

