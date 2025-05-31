import {useQuery} from "@tanstack/react-query";
import {User} from "../types.ts";
import {userClient} from "../api/user.client.ts";

export const GET_ME_QUERY_KEY = 'getGetMe';

// useGetMe.ts
export const useGetMe = () => {
  return useQuery<User | null>({  // Explicitly include null in return type
    queryKey: [GET_ME_QUERY_KEY],
    queryFn: async () => {
      try {
        const { data } = await userClient.me();
        return data || null;  // Ensure never undefined
      } catch (error) {
        console.error('Failed to fetch user:', error);
        return null;  // Return null on error
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000
  });
};