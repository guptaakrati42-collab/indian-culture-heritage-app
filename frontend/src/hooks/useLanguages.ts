import { useQuery } from '@tanstack/react-query';
import { queryKeys, staleTimeConfig } from '../lib/queryClient';
import { apiClient, LanguagesResponse } from '../services/apiClient';

export interface Language {
  code: string;
  name: string;
  englishName: string;
}

export const useLanguages = () => {
  return useQuery({
    queryKey: queryKeys.languages.supported(),
    queryFn: () => apiClient.getLanguages(),
    staleTime: staleTimeConfig.languages,
    select: (data: LanguagesResponse) => data.languages,
  });
};