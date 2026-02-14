import { useQuery } from '@tanstack/react-query';
import { queryKeys, staleTimeConfig } from '../lib/queryClient';
import { apiClient, CityHeritageResponse, HeritageImagesResponse } from '../services/apiClient';

export interface HeritageItem {
  id: string;
  name: string;
  category: string;
  summary: string;
  thumbnailImage: string;
}

export interface HeritageDetail extends HeritageItem {
  detailedDescription: string;
  historicalPeriod: string;
  significance: string;
  images: Image[];
}

export interface Image {
  id: string;
  url: string;
  thumbnailUrl: string;
  caption: string;
  altText: string;
  description: string;        // What the image depicts
  culturalContext: string;    // Cultural significance of what's shown
  location?: string;          // Where the image was taken
  period?: string;            // Historical period if relevant
}

export interface HeritageFilters {
  language?: string;
  category?: string;
}

export const useCityHeritage = (cityId: string, filters: HeritageFilters = {}) => {
  return useQuery({
    queryKey: queryKeys.cities.heritage(cityId, filters),
    queryFn: () => apiClient.getCityHeritage(cityId, filters),
    staleTime: staleTimeConfig.heritage,
    enabled: !!cityId,
    select: (data: CityHeritageResponse) => data.heritageItems,
  });
};

export const useHeritageDetail = (heritageId: string, language?: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.heritage.detail(heritageId),
    queryFn: () => apiClient.getHeritageDetail(heritageId, language),
    staleTime: staleTimeConfig.heritage,
    enabled: !!heritageId && enabled,
  });
};

export const useHeritageImages = (heritageId: string) => {
  return useQuery({
    queryKey: queryKeys.heritage.images(heritageId),
    queryFn: () => apiClient.getHeritageImages(heritageId),
    staleTime: staleTimeConfig.images,
    enabled: !!heritageId,
    select: (data: HeritageImagesResponse) => data.images,
  });
};