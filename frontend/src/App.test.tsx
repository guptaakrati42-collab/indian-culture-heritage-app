import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import '../src/i18n';

// Mock the components to avoid complex dependencies
vi.mock('./components/CityListContainer', () => ({
  default: () => <div data-testid="city-list-page">City List Page</div>,
}));

vi.mock('./components/CityView', () => ({
  default: () => <div data-testid="city-view-page">City View Page</div>,
}));

vi.mock('./components/ImageGalleryContainer', () => ({
  default: () => <div data-testid="image-gallery-page">Image Gallery Page</div>,
}));

describe('App Routing Integration Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  it('should render home route at /', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('city-list-page')).toBeInTheDocument();
    });
  });

  it('should render city view route with cityId parameter', async () => {
    const cityId = 'test-city-123';
    
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[`/city/${cityId}`]}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('city-view-page')).toBeInTheDocument();
    });
  });

  it('should render image gallery route with heritageId parameter', async () => {
    const heritageId = 'test-heritage-456';
    
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[`/heritage/${heritageId}/images`]}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('image-gallery-page')).toBeInTheDocument();
    });
  });

  it('should render 404 page for invalid routes', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/invalid-route']}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('404')).toBeInTheDocument();
      expect(screen.getByText(/page not found/i)).toBeInTheDocument();
    });
  });

  it('should handle route parameters correctly', async () => {
    const TestComponent = () => {
      return (
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/city/mumbai']}>
            <App />
          </MemoryRouter>
        </QueryClientProvider>
      );
    };

    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('city-view-page')).toBeInTheDocument();
    });
  });

  it('should render app header with language selector', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Indian Culture App/i)).toBeInTheDocument();
    });
  });

  it('should wrap routes with ErrorBoundary', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock a component that throws an error
    vi.mock('./components/CityListContainer', () => ({
      default: () => {
        throw new Error('Test error');
      },
    }));

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/']}>
          <App />
        </MemoryRouter>
      </QueryClientProvider>
    );

    // The ErrorBoundary should catch the error
    // We just verify the app doesn't crash
    expect(consoleError).toHaveBeenCalled();
    
    consoleError.mockRestore();
  });
});
