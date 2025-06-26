import { useQuery, useMutation, UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { AxiosError, AxiosResponse } from 'axios';
import { useAppSelector } from '../store/hooks';

export type ApiError = {
  message: string;
  status: number;
  code?: string;
};

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

// Generic API Query Hook
export const useApiQuery = <T>(
  key: string[],
  endpoint: string,
  options?: Omit<UseQueryOptions<T, AxiosError<ApiError>>, 'queryKey' | 'queryFn'>
) => {
  let isAuthenticated = false;
  
  try {
    const authState = useAppSelector((state) => state.auth);
    isAuthenticated = authState?.isAuthenticated || false;
  } catch (error) {
    // Redux store not yet initialized
    console.warn('Redux store not yet initialized');
    isAuthenticated = false;
  }
  
  return useQuery<T, AxiosError<ApiError>>({
    queryKey: key,
    queryFn: async () => {
      const { data }: AxiosResponse<ApiResponse<T>> = await api.get(endpoint);
      return data.data;
    },
    enabled: isAuthenticated && (options?.enabled !== false),
    ...options,
  });
};

// Generic API Mutation Hook
export const useApiMutation = <TData, TVariables = void>(
  endpoint: string,
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'POST',
  options?: Omit<UseMutationOptions<TData, AxiosError<ApiError>, TVariables>, 'mutationFn'>
) => {
  return useMutation<TData, AxiosError<ApiError>, TVariables>({
    mutationFn: async (variables) => {
      let response: AxiosResponse<ApiResponse<TData>>;
      
      switch (method) {
        case 'POST':
          response = await api.post(endpoint, variables);
          break;
        case 'PUT':
          response = await api.put(endpoint, variables);
          break;
        case 'PATCH':
          response = await api.patch(endpoint, variables);
          break;
        case 'DELETE':
          response = await api.delete(endpoint, { data: variables });
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }
      
      return response.data.data;
    },
    ...options,
  });
};

// Restaurant-specific hooks
export const useRestaurantProfile = () => {
  let user = null;
  
  try {
    const authState = useAppSelector((state) => state.auth);
    user = authState?.user || null;
  } catch (error) {
    console.warn('Redux store not yet initialized');
  }
  
  return useApiQuery(
    ['restaurant', 'profile', user?.id || ''],
    `/restaurants/${user?.id}`,
    {
      enabled: !!user?.id && user.type === 'restaurant',
    }
  );
};

export const useUpdateRestaurant = () => {
  let user = null;
  
  try {
    const authState = useAppSelector((state) => state.auth);
    user = authState?.user || null;
  } catch (error) {
    console.warn('Redux store not yet initialized');
  }
  
  return useApiMutation<any, any>(
    `/restaurants/${user?.id}`,
    'PUT'
  );
};

// Driver-specific hooks
export const useDriverProfile = () => {
  let user = null;
  
  try {
    const authState = useAppSelector((state) => state.auth);
    user = authState?.user || null;
  } catch (error) {
    console.warn('Redux store not yet initialized');
  }
  
  return useApiQuery(
    ['driver', 'profile', user?.id || ''],
    `/drivers/${user?.id}`,
    {
      enabled: !!user?.id && user.type === 'driver',
    }
  );
};

export const useUpdateDriver = () => {
  let user = null;
  
  try {
    const authState = useAppSelector((state) => state.auth);
    user = authState?.user || null;
  } catch (error) {
    console.warn('Redux store not yet initialized');
  }
  
  return useApiMutation<any, any>(
    `/drivers/${user?.id}`,
    'PUT'
  );
};

// Dashboard-specific hooks
export const useDashboardStats = () => {
  let user = null;
  
  try {
    const authState = useAppSelector((state) => state.auth);
    user = authState?.user || null;
  } catch (error) {
    console.warn('Redux store not yet initialized');
  }
  
  const userType = user?.type;
  
  return useApiQuery<{
    ordersToday: number;
    totalRevenue: number;
    activeMenuItems: number;
    rating: number;
  }>(
    ['dashboard', 'stats', user?.id || ''],
    `/${userType}s/${user?.id}/stats`,
    {
      enabled: !!user?.id && !!userType,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
};

// Orders hooks
export const useOrders = (status?: string) => {
  let user = null;
  
  try {
    const authState = useAppSelector((state) => state.auth);
    user = authState?.user || null;
  } catch (error) {
    console.warn('Redux store not yet initialized');
  }
  
  const userType = user?.type;
  
  const endpoint = status 
    ? `/${userType}s/${user?.id}/orders?status=${status}`
    : `/${userType}s/${user?.id}/orders`;
  
  return useApiQuery(
    ['orders', user?.id || '', status || ''],
    endpoint,
    {
      enabled: !!user?.id && !!userType,
    }
  );
};

export const useUpdateOrderStatus = () => {
  return useApiMutation<
    any,
    { orderId: string; status: string; note?: string }
  >('/orders/status', 'PATCH');
};

// Registration stage hooks
export const useUpdateRegistrationStage = () => {
  let user = null;
  
  try {
    const authState = useAppSelector((state) => state.auth);
    user = authState?.user || null;
  } catch (error) {
    console.warn('Redux store not yet initialized');
  }
  
  const userType = user?.type;
  
  return useApiMutation(
    `/${userType}s-staged/${user?.id}/stage`,
    'PATCH'
  );
};

// Custom hook for checking authentication status
export const useAuthStatus = () => {
  let authState = {
    isAuthenticated: false,
    user: null,
    token: null,
    isLoading: false,
  };
  
  try {
    authState = useAppSelector((state) => state.auth);
  } catch (error) {
    console.warn('Redux store not yet initialized');
  }
  
  const { isAuthenticated, user, token, isLoading } = authState;
  
  return {
    isAuthenticated,
    user,
    token,
    isLoading,
    isRestaurant: user?.type === 'restaurant',
    isDriver: user?.type === 'driver',
  };
}; 