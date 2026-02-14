import axios, { AxiosInstance, AxiosResponse, AxiosError, AxiosRequestConfig } from 'axios';
import { City, CityFilters } from '../hooks/useCities';
import { HeritageItem, HeritageDetail, Image, HeritageFilters } from '../hooks/useHeritage';
import { Language } from '../hooks/useLanguages';

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface CitiesResponse {
  cities: City[];
}

export interface CityHeritageResponse {
  city: {
    id: string;
    name: string;
    state: string;
    region: string;
  };
  heritageItems: HeritageItem[];
}

export interface HeritageDetailResponse extends HeritageDetail {}

export interface HeritageImagesResponse {
  images: {
    id: string;
    url: string;
    thumbnailUrl: string;
    caption: string;
    altText: string;
    description: string;        // What the image depicts
    culturalContext: string;    // Cultural significance of what's shown
    location?: string;          // Where the image was taken
    period?: string;            // Historical period if relevant
  }[];
}

export interface LanguagesResponse {
  languages: Language[];
}

// Error types
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

class ApiClient {
  private client: AxiosInstance;
  private currentLanguage: string = 'en';

  constructor() {
    this.client = axios.create({
      baseURL: (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add language header
    this.client.interceptors.request.use(
      (config: AxiosRequestConfig) => {
        // Add language parameter to all requests
        if (this.currentLanguage) {
          config.params = {
            ...config.params,
            language: this.currentLanguage,
          };
        }

        // Add Accept-Language header
        if (config.headers) {
          config.headers['Accept-Language'] = this.currentLanguage;
        }

        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(this.formatError(error));
      }
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error: AxiosError) => {
        return Promise.reject(this.formatError(error));
      }
    );
  }

  private formatError(error: AxiosError): ApiError {
    if (error.response) {
      // Server responded with error status
      const data = error.response.data as any;
      return {
        message: data?.message || data?.error || 'Server error occurred',
        status: error.response.status,
        code: data?.code,
      };
    } else if (error.request) {
      // Network error
      return {
        message: 'Network error. Please check your connection.',
        code: 'NETWORK_ERROR',
      };
    } else {
      // Request setup error
      return {
        message: error.message || 'An unexpected error occurred',
        code: 'REQUEST_ERROR',
      };
    }
  }

  // Language management
  setLanguage(language: string) {
    this.currentLanguage = language;
  }

  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  // API Methods

  // Cities endpoints
  async getCities(filters: CityFilters = {}): Promise<CitiesResponse> {
    const params = new URLSearchParams();
    
    if (filters.state) params.append('state', filters.state);
    if (filters.region) params.append('region', filters.region);
    if (filters.searchTerm) params.append('search', filters.searchTerm);

    const response = await this.client.get<CitiesResponse>(`/cities?${params.toString()}`);
    return response.data;
  }

  async getCityHeritage(cityId: string, filters: HeritageFilters = {}): Promise<CityHeritageResponse> {
    const params = new URLSearchParams();
    
    if (filters.category) params.append('category', filters.category);

    const response = await this.client.get<CityHeritageResponse>(
      `/cities/${cityId}/heritage?${params.toString()}`
    );
    return response.data;
  }

  // Heritage endpoints
  async getHeritageDetail(heritageId: string, language?: string): Promise<HeritageDetailResponse> {
    const params = new URLSearchParams();
    if (language) params.append('language', language);

    const response = await this.client.get<HeritageDetailResponse>(
      `/heritage/${heritageId}?${params.toString()}`
    );
    return response.data;
  }

  async getHeritageImages(heritageId: string): Promise<HeritageImagesResponse> {
    const response = await this.client.get<HeritageImagesResponse>(`/heritage/${heritageId}/images`);
    return response.data;
  }

  // Languages endpoint
  async getLanguages(): Promise<LanguagesResponse> {
    const response = await this.client.get<LanguagesResponse>('/languages');
    return response.data;
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await this.client.get('/health');
    return response.data;
  }
}

// Create and export singleton instance
export const apiClient = new ApiClient();

// Export error handling utilities
export const isApiError = (error: unknown): error is ApiError => {
  return typeof error === 'object' && error !== null && 'message' in error;
};

export const getApiErrorMessage = (error: unknown): string => {
  if (isApiError(error)) {
    return error.message;
  }
  return 'An unexpected error occurred';
};