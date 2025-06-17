import { useQuery, useMutation, UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { AxiosError } from 'axios';

export type ApiError = {
  message: string;
  status: number;
};

export const useApiQuery = <T>(
  key: string[],
  endpoint: string,
  options?: Omit<UseQueryOptions<T, AxiosError<ApiError>>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<T, AxiosError<ApiError>>({
    queryKey: key,
    queryFn: async () => {
      const { data } = await api.get<T>(endpoint);
      return data;
    },
    ...options,
  });
};

export const useApiMutation = <T, V>(
  endpoint: string,
  options?: Omit<UseMutationOptions<T, AxiosError<ApiError>, V>, 'mutationFn'>
) => {
  return useMutation<T, AxiosError<ApiError>, V>({
    mutationFn: async (variables) => {
      const { data } = await api.post<T>(endpoint, variables);
      return data;
    },
    ...options,
  });
}; 