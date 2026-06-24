import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '../config/config';

export function useSearchHistory(limit = 20, options = {}) {
  return useQuery({
    queryKey: ['searchHistory', limit],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE_URL}/ai/search-history`, { params: { limit } });
      return response.data;
    },
    staleTime: 60000,
    ...options,
  });
}
