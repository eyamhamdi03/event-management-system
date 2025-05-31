import {useQuery} from "@tanstack/react-query";
import {User} from "../types.ts";
import {userClient} from "../api/user.client.ts";

export const GET_ME_QUERY_KEY = 'getGetMe';

// src/queries/useGetMe.ts
export const useGetMe = () => {
  return useQuery<User>({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data } = await userClient.me();
      if (!data || !data.role) {
        throw new Error('Invalid user data');
      }
      console.log(data)
      return data;
    }
  });
};