import { useQuery } from '@tanstack/react-query';
import { queryKeys, staleTimeConfig } from '../lib/queryClient';
import { apiClient, CitiesResponse } from '../services/apiClient';

export interface City {
  id: string;
  name: string;
  state: string;
  region: string;
  previewImage: string;
  heritageCount: number;
}

export interface CityFilters {
  language?: string;
  state?: string;
  region?: string;
  searchTerm?: string;
}

export const useCities = (filters: CityFilters = {}) => {
  return useQuery({
    queryKey: queryKeys.cities.list(filters),
    queryFn: () => apiClient.getCities(filters),
    staleTime: staleTimeConfig.cities,
    select: (data: CitiesResponse) => data.cities,
  });
};