import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Lightbox from './Lightbox';
import { Image } from '../hooks/useHeritage';

// Mock image data
const mockImage: Image = {
  id: 'img-1',
  url: '/images/full-1.jpg',
  thumbnailUrl: '/images/thumb-1.jpg',
  caption: 'Taj Mahal at Sunrise',
  altText: 'The Taj Mahal illuminated by golden sunrise light',
  description: 'The iconic white marble mausoleum with its reflection in the water',
  culturalContext: 'Built by Mughal Emperor Shah Jahan in memory of his wife Mumtaz Mahal',
  location: 'Agra, Uttar Pradesh',
  period: '1632-1653 CE',
};

describe('Lightbox Component', () => {
  describe('Image Display', () => {
    it('should render the full-size image', () => {
      const onClose = vi.fn();
      const onNext = vi.fn();
      const onPrevious = vi.fn();

      render(
        <Lightbox
          image={mockImage}
          currentIndex={0}
          totalImages={3}
          onClose={onClose}
          onNext={onNext}
          onPrevious={onPrevious}
        />
      );

      const image = screen.getByAltText(mockImage.altText);
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', mockImage.url);
    });

    it('should display image counter', () => {
      const onClose = vi.fn();
      const onNext = vi.fn();
      const onPrevious = vi.fn();

      render(
        <Lightbox
          image={mockImage}
          currentIndex={2}
          totalImages={5}
          onClose={onClose}
          onNext={onNext}
          onPrevious={onPrevious}
        />
      );

      expect(screen.getByText('3 / 5')).toBeInTheDocument();
    });

    it('should show loading spinner before image loads', () => {
      const onClose = vi.fn();
      const onNext = vi.fn();
      const onPrevious = vi.fn();

      const { container } = render(
        <Lightbox
          image={mockImage}
          currentIndex={0}
          totalImages={1}
          onClose={onClose}
          onNext={onNext}
          onPrevious={onPrevious}
        />
      );

      // Loading mandala should be present initially
      const loadingElement = container.querySelector('.loading-mandala');
      expect(loadingElement).toBeInTheDocument();
    });
  });

  describe('Image Information', () => {
    it('should display image caption', () => {
      const onClose = vi.fn();
      const onNext = vi.fn();
      const onPrevious = vi.fn();

      render(
        <Lightbox
          image={mockImage}
          currentIndex={0}
          totalImages={1}
          onClose={onClose}
          onNext={onNext}
          onPrevious={onPrevious}
        />
      );

      expect(screen.getByText(mockImage.caption)).toBeInTheDocument();
    });

    it('should display image description', () => {
      const onClose = vi.fn();
      const onNext = vi.fn();
      const onPrevious = vi.fn();

      render(
        <Lightbox
          image={mockImage}
          currentIndex={0}
          totalImages={1}
          onClose={onClose}
          onNext={onNext}
          onPrevious={onPrevious}
        />
      );

      expect(screen.getByText(mockImage.description)).toBeInTheDocument();
    });

    it('should display cultural context', () => {
      const onClose = vi.fn();
      const onNext = vi.fn();
      const onPrevious = vi.fn();

      render(
        <Lightbox
          image={mockImage}
          currentIndex={0}
          totalImages={1}
          onClose={onClose}
          onNext={onNext}
          onPrevious={onPrevious}
        />
      );

      expect(screen.getByText(mockImage.culturalContext)).toBeInTheDocument();
    });

    it('should display location when available', () => {
      const onClose = vi.fn();
      const onNext = vi.fn();
      const onPrevious = vi.fn();

      render(
        <Lightbox
          image={mockImage}
          currentIndex={0}
          totalImages={1}
          onClose={onClose}
          onNext={onNext}
          onPrevious={onPrevious}
        />
      );

      expect(screen.getByText(mockImage.location!)).toBeInTheDocument();
    });

    it('should display period when available', () => {
      const onClose = vi.fn();
      const onNext = vi.fn();
      const onPrevious = vi.fn();

      render(
        <Lightbox
          image={mockImage}
          currentIndex={0}
          totalImages={1}
          onClose={onClose}
          onNext={onNext}
          onPrevious={onPrevious}
        />
      );

      expect(screen.getByText(mockImage.period!)).toBeInTheDocument();
    });

    it('should not display location when not available', () => {
      const imageWithoutLocation = { ...mockImage, location: undefined };
      const onClose = vi.fn();
      const onNext = vi.fn();
      const onPrevious = vi.fn();

      render(
        <Lightbox
          image={imageWithoutLocation}
          currentIndex={0}
          totalImages={1}
          onClose={onClose}
          onNext={onNext}
          onPrevious={onPrevious}
        />
      );

      expect(screen.queryByText(/📍 Location:/)).not.toBeInTheDocument();
    });
  });

  describe('Close Functionality', () => {
    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const onNext = vi.fn();
      const onPrevious = vi.fn();

      render(
        <Lightbox
          image={mockImage}
          currentIndex={0}
          totalImages={1}
          onClose={onClose}
          onNext={onNext}
          onPrevious={onPrevious}
        />
      );

      const closeButton = screen.getByLabelText('Close lightbox');
      await user.click(closeButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when Escape key is pressed', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const onNext = vi.fn();
      const onPrevious = vi.fn();

      render(
        <Lightbox
          image={mockImage}
          currentIndex={0}
          totalImages={1}
          onClose={onClose}
          onNext={onNext}
          onPrevious={onPrevious}
        />
      );

      await user.keyboard('{Escape}');

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Navigation Controls', () => {
    it('should display navigation buttons when there are multiple images', () => {
      const onClose = vi.fn();
      const onNext = vi.fn();
      const onPrevious = vi.fn();

      render(
        <Lightbox
          image={mockImage}
          currentIndex={0}
          totalImages={3}
          onClose={onClose}
          onNext={onNext}
          onPrevious={onPrevious}
        />
      );

      expect(screen.getByLabelText('Next image')).toBeInTheDocument();
      expect(screen.getByLabelText('Previous image')).toBeInTheDocument();
    });

    it('should not display navigation buttons for single image', () => {
      const onClose = vi.fn();
      const onNext = vi.fn();
      const onPrevious = vi.fn();

      render(
        <Lightbox
          image={mockImage}
          currentIndex={0}
          totalImages={1}
          onClose={onClose}
          onNext={onNext}
          onPrevious={onPrevious}
        />
      );

      expect(screen.queryByLabelText('Next image')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Previous image')).not.toBeInTheDocument();
    });

    it('should call onNext when next button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const onNext = vi.fn();
      const onPrevious = vi.fn();

      render(
        <Lightbox
          image={mockImage}
          currentIndex={0}
          totalImages={3}
          onClose={onClose}
          onNext={onNext}
          onPrevious={onPrevious}
        />
      );

      const nextButton = screen.getByLabelText('Next image');
      await user.click(nextButton);

      expect(onNext).toHaveBeenCalledTimes(1);
    });

    it('should call onPrevious when previous button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const onNext = vi.fn();
      const onPrevious = vi.fn();

      render(
        <Lightbox
          image={mockImage}
          currentIndex={1}
          totalImages={3}
          onClose={onClose}
          onNext={onNext}
          onPrevious={onPrevious}
        />
      );

      const previousButton = screen.getByLabelText('Previous image');
      await user.click(previousButton);

      expect(onPrevious).toHaveBeenCalledTimes(1);
    });
  });

  describe('Keyboard Navigation', () => {
    it('should call onNext when right arrow key is pressed', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const onNext = vi.fn();
      const onPrevious = vi.fn();

      render(
        <Lightbox
          image={mockImage}
          currentIndex={0}
          totalImages={3}
          onClose={onClose}
          onNext={onNext}
          onPrevious={onPrevious}
        />
      );

      await user.keyboard('{ArrowRight}');

      expect(onNext).toHaveBeenCalledTimes(1);
    });

    it('should call onPrevious when left arrow key is pressed', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const onNext = vi.fn();
      const onPrevious = vi.fn();

      render(
        <Lightbox
          image={mockImage}
          currentIndex={1}
          totalImages={3}
          onClose={onClose}
          onNext={onNext}
          onPrevious={onPrevious}
        />
      );

      await user.keyboard('{ArrowLeft}');

      expect(onPrevious).toHaveBeenCalledTimes(1);
    });
  });

  describe('Info Toggle', () => {
    it('should toggle info panel when info button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const onNext = vi.fn();
      const onPrevious = vi.fn();

      render(
        <Lightbox
          image={mockImage}
          currentIndex={0}
          totalImages={1}
          onClose={onClose}
          onNext={onNext}
          onPrevious={onPrevious}
        />
      );

      // Info should be visible initially
      expect(screen.getByText(mockImage.caption)).toBeInTheDocument();

      // Click info toggle button
      const infoButton = screen.getByLabelText('Toggle image information');
      await user.click(infoButton);

      // Info should be hidden
      await waitFor(() => {
        expect(screen.queryByText(mockImage.description)).not.toBeInTheDocument();
      });

      // Click again to show
      await user.click(infoButton);

      // Info should be visible again
      await waitFor(() => {
        expect(screen.getByText(mockImage.description)).toBeInTheDocument();
      });
    });

    it('should toggle info panel when I key is pressed', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const onNext = vi.fn();
      const onPrevious = vi.fn();

      render(
        <Lightbox
          image={mockImage}
          currentIndex={0}
          totalImages={1}
          onClose={onClose}
          onNext={onNext}
          onPrevious={onPrevious}
        />
      );

      // Info should be visible initially
      expect(screen.getByText(mockImage.caption)).toBeInTheDocument();

      // Press I key
      await user.keyboard('i');

      // Info should be hidden
      await waitFor(() => {
        expect(screen.queryByText(mockImage.description)).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display placeholder when image fails to load', async () => {
      const onClose = vi.fn();
      const onNext = vi.fn();
      const onPrevious = vi.fn();

      render(
        <Lightbox
          image={mockImage}
          currentIndex={0}
          totalImages={1}
          onClose={onClose}
          onNext={onNext}
          onPrevious={onPrevious}
        />
      );

      const image = screen.getByAltText(mockImage.altText) as HTMLImageElement;

      // Simulate image load error
      const errorEvent = new Event('error');
      image.dispatchEvent(errorEvent);

      // Check that src was changed to placeholder
      await waitFor(() => {
        expect(image.src).toContain('data:image/svg+xml');
      });
    });
  });

  describe('Cultural Theme Styling', () => {
    it('should apply temple theme styling by default', () => {
      const onClose = vi.fn();
      const onNext = vi.fn();
      const onPrevious = vi.fn();

      const { container } = render(
        <Lightbox
          image={mockImage}
          currentIndex={0}
          totalImages={1}
          onClose={onClose}
          onNext={onNext}
          onPrevious={onPrevious}
        />
      );

      const frameElement = container.querySelector('.border-saffron-500');
      expect(frameElement).toBeInTheDocument();
    });

    it('should apply palace theme styling when specified', () => {
      const onClose = vi.fn();
      const onNext = vi.fn();
      const onPrevious = vi.fn();

      const { container } = render(
        <Lightbox
          image={mockImage}
          currentIndex={0}
          totalImages={1}
          onClose={onClose}
          onNext={onNext}
          onPrevious={onPrevious}
          culturalTheme="palace"
        />
      );

      const frameElement = container.querySelector('.border-rajasthani-500');
      expect(frameElement).toBeInTheDocument();
    });
  });
});
