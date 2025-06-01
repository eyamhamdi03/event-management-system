// api.ts
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true, 
})



export async function fetchEventsByOrganizer(organizerId: string, token?: string) {
  return api.get(`/event/withFilter?hostId=${organizerId}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }).then(res => res.data)
}


export const createEvent = async (eventData: any, token?: string) => {
  const { data } = await api.post('/event', eventData, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
  return data
}


export const deleteEvent = async (id: string, token?: string) => {
  await api.delete(`/event/soft/${id}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
}
export async function fetchCategories(token?: string) {
  return api.get('/category', {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }).then(res => res.data)
}
