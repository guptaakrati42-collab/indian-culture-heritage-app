import React from 'react';
import { useHeritageImages } from '../hooks/useHeritage';
import ImageGallery from './ImageGallery';

export interface ImageGalleryContainerProps {
  heritageId: string;
  culturalTheme?: 'temple' | 'palace' | 'folk' | 'modern';
  initialIndex?: number;
}

const ImageGalleryContainer: React.FC<ImageGalleryContainerProps> = ({
  heritageId,
  culturalTheme = 'temple',
  initialIndex = 0,
}) => {
  const { data: images, isLoading, error } = useHeritageImages(heritageId);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-sacred-lg">
        <div className="loading-mandala" />
        <p className="ml-4 text-charcoal-600">Loading images...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-sacred-lg">
        <div className="inline-block p-sacred-md bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 font-medium mb-2">Failed to load images</p>
          <p className="text-red-500 text-sm">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
        </div>
      </div>
    );
  }

  // No images state
  if (!images || images.length === 0) {
    return (
      <div className="text-center py-sacred-lg">
        <div className="inline-block p-sacred-md bg-charcoal-50 border border-charcoal-200 rounded-lg">
          <p className="text-charcoal-600">No images available for this heritage item</p>
        </div>
      </div>
    );
  }

  // Render gallery with images
  return (
    <ImageGallery
      images={images}
      initialIndex={initialIndex}
      culturalTheme={culturalTheme}
    />
  );
};

export default ImageGalleryContainer;
