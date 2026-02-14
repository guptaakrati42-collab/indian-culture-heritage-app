import { QueryClient } from '@tanstack/react-query';

// Create a client with optimized configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time configuration as per requirements
      staleTime: 5 * 60 * 1000, // 5 minutes for cities (default)
      gcTime: 10 * 60 * 1000, // 10 minutes garbage collection time
      retry: 3,
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

// Query keys factory for consistent key management
export const queryKeys = {
  // Cities queries
  cities: {
    all: ['cities'] as const,
    lists: () => [...queryKeys.cities.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.cities.lists(), filters] as const,
    details: () => [...queryKeys.cities.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.cities.details(), id] as const,
    heritage: (cityId: string, filters?: Record<string, any>) => 
      [...queryKeys.cities.detail(cityId), 'heritage', filters] as const,
  },
  
  // Heritage queries
  heritage: {
    all: ['heritage'] as const,
    lists: () => [...queryKeys.heritage.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.heritage.lists(), filters] as const,
    details: () => [...queryKeys.heritage.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.heritage.details(), id] as const,
    images: (heritageId: string) => [...queryKeys.heritage.detail(heritageId), 'images'] as const,
  },
  
  // Languages queries
  languages: {
    all: ['languages'] as const,
    supported: () => [...queryKeys.languages.all, 'supported'] as const,
  },
} as const;

// Stale time configurations for different data types
export const staleTimeConfig = {
  cities: 5 * 60 * 1000,      // 5 minutes for city lists
  heritage: 10 * 60 * 1000,   // 10 minutes for heritage content
  languages: 60 * 60 * 1000,  // 1 hour for language list (rarely changes)
  images: 30 * 60 * 1000,     // 30 minutes for image data
} as const;

// Error handling utilities
export const isNetworkError = (error: unknown): boolean => {
  return error instanceof Error && 
    (error.message.includes('Network Error') || 
     error.message.includes('fetch'));
};

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};