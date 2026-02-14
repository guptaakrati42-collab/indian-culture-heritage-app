import React, { lazy, Suspense } from 'react';
import { RouteObject, useNavigate } from 'react-router-dom';
import { NotFound } from '../components/NotFound';

// Lazy load route components for code splitting
const CityListContainer = lazy(() => import('../components/CityListContainer'));
const CityView = lazy(() => import('../components/CityView'));
const ImageGalleryContainer = lazy(() => import('../components/ImageGalleryContainer'));

// Loading fallback component
const RouteLoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
  </div>
);

// Wrapper for CityListContainer with navigation
const CityListRoute: React.FC = () => {
  const navigate = useNavigate();
  
  const handleCitySelect = (cityId: string) => {
    navigate(`/city/${cityId}`);
  };
  
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <CityListContainer onCitySelect={handleCitySelect} />
    </Suspense>
  );
};

// Wrapper component to add Suspense boundary to lazy-loaded routes
const LazyRoute: React.FC<{ component: React.LazyExoticComponent<React.ComponentType<any>> }> = ({ component: Component }) => (
  <Suspense fallback={<RouteLoadingFallback />}>
    <Component />
  </Suspense>
);

// Route configuration
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <CityListRoute />,
  },
  {
    path: '/city/:cityId',
    element: <LazyRoute component={CityView} />,
  },
  {
    path: '/heritage/:heritageId/images',
    element: <LazyRoute component={ImageGalleryContainer} />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
];
