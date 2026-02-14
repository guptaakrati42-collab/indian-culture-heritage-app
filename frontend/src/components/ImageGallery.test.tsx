import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ImageGallery from './ImageGallery';
import { Image } from '../hooks/useHeritage';

// Mock image data
const mockImages: Image[] = [
  {
    id: 'img-1',
    url: '/images/full-1.jpg',
    thumbnailUrl: '/images/thumb-1.jpg',
    caption: 'Taj Mahal at Sunrise',
    altText: 'The Taj Mahal illuminated by golden sunrise light',
    description: 'The iconic white marble mausoleum with its reflection in the water',
    culturalContext: 'Built by Mughal Emperor Shah Jahan in memory of his wife Mumtaz Mahal',
    location: 'Agra, Uttar Pradesh',
    period: '1632-1653 CE',
  },
  {
    id: 'img-2',
    url: '/images/full-2.jpg',
    thumbnailUrl: '/images/thumb-2.jpg',
    caption: 'Intricate Marble Inlay Work',
    altText: 'Close-up of pietra dura inlay work on marble',
    description: 'Detailed floral patterns created using semi-precious stones',
    culturalContext: 'Represents the pinnacle of Mughal craftsmanship and artistic excellence',
    location: 'Taj Mahal interior',
    period: '17th century',
  },
  {
    id: 'img-3',
    url: '/images/full-3.jpg',
    thumbnailUrl: '/images/thumb-3.jpg',
    caption: 'Calligraphy on the Main Gateway',
    altText: 'Arabic calligraphy inscribed on the entrance arch',
    description: 'Verses from the Quran written in elegant Thuluth script',
    culturalContext: 'Islamic calligraphy as a form of spiritual art and architectural decoration',
  },
];

describe('ImageGallery Component', () => {
  describe('Thumbnail Rendering', () => {
    it('should render all thumbnail images', () => {
      render(<ImageGallery images={mockImages} />);

      const thumbnails = screen.getAllByRole('img');
      expect(thumbnails).toHaveLength(mockImages.length);
    });

    it('should display thumbnails with correct alt text', () => {
      render(<ImageGallery images={mockImages} />);

      mockImages.forEach((image) => {
        expect(screen.getByAltText(image.altText)).toBeInTheDocument();
      });
    });

    it('should use lazy loading for thumbnail images', () => {
      render(<ImageGallery images={mockImages} />);

      const thumbnails = screen.getAllByRole('img');
      thumbnails.forEach((thumbnail: HTMLElement) => {
        expect(thumbnail).toHaveAttribute('loading', 'lazy');
      });
    });

    it('should display location and period badges when available', () => {
      render(<ImageGallery images={mockImages} />);

      // First image has both location and period
      expect(screen.getByText('Agra, Uttar Pradesh')).toBeInTheDocument();
      expect(screen.getByText('1632-1653 CE')).toBeInTheDocument();

      // Second image has both
      expect(screen.getByText('Taj Mahal interior')).toBeInTheDocument();
      expect(screen.getByText('17th century')).toBeInTheDocument();
    });
  });

  describe('Lightbox Opening', () => {
    it('should open lightbox when thumbnail is clicked', async () => {
      const user = userEvent.setup();
      render(<ImageGallery images={mockImages} />);

      const firstThumbnail = screen.getAllByRole('img')[0];
      await user.click(firstThumbnail);

      // Lightbox should be open - check for close button
      await waitFor(() => {
        expect(screen.getByLabelText('Close lightbox')).toBeInTheDocument();
      });
    });

    it('should display correct initial image in lightbox', async () => {
      const user = userEvent.setup();
      render(<ImageGallery images={mockImages} initialIndex={1} />);

      const secondThumbnail = screen.getAllByRole('img')[1];
      await user.click(secondThumbnail);

      await waitFor(() => {
        expect(screen.getByText(mockImages[1].caption)).toBeInTheDocument();
      });
    });

    it('should show image counter in lightbox', async () => {
      const user = userEvent.setup();
      render(<ImageGallery images={mockImages} />);

      const firstThumbnail = screen.getAllByRole('img')[0];
      await user.click(firstThumbnail);

      await waitFor(() => {
        expect(screen.getByText(`1 / ${mockImages.length}`)).toBeInTheDocument();
      });
    });
  });

  describe('Lightbox Closing', () => {
    it('should close lightbox when close button is clicked', async () => {
      const user = userEvent.setup();
      render(<ImageGallery images={mockImages} />);

      // Open lightbox
      const firstThumbnail = screen.getAllByRole('img')[0];
      await user.click(firstThumbnail);

      await waitFor(() => {
        expect(screen.getByLabelText('Close lightbox')).toBeInTheDocument();
      });

      // Close lightbox
      const closeButton = screen.getByLabelText('Close lightbox');
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByLabelText('Close lightbox')).not.toBeInTheDocument();
      });
    });

    it('should close lightbox when Escape key is pressed', async () => {
      const user = userEvent.setup();
      render(<ImageGallery images={mockImages} />);

      // Open lightbox
      const firstThumbnail = screen.getAllByRole('img')[0];
      await user.click(firstThumbnail);

      await waitFor(() => {
        expect(screen.getByLabelText('Close lightbox')).toBeInTheDocument();
      });

      // Press Escape
      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByLabelText('Close lightbox')).not.toBeInTheDocument();
      });
    });
  });

  describe('Image Navigation', () => {
    it('should navigate to next image when next button is clicked', async () => {
      const user = userEvent.setup();
      render(<ImageGallery images={mockImages} />);

      // Open lightbox
      const firstThumbnail = screen.getAllByRole('img')[0];
      await user.click(firstThumbnail);

      await waitFor(() => {
        expect(screen.getByText('1 / 3')).toBeInTheDocument();
      });

      // Click next
      const nextButton = screen.getByLabelText('Next image');
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('2 / 3')).toBeInTheDocument();
      });

      expect(screen.getByText(mockImages[1].caption)).toBeInTheDocument();
    });

    it('should navigate to previous image when previous button is clicked', async () => {
      const user = userEvent.setup();
      render(<ImageGallery images={mockImages} initialIndex={1} />);

      // Open lightbox at second image
      const secondThumbnail = screen.getAllByRole('img')[1];
      await user.click(secondThumbnail);

      await waitFor(() => {
        expect(screen.getByText('2 / 3')).toBeInTheDocument();
      });

      // Click previous
      const previousButton = screen.getByLabelText('Previous image');
      await user.click(previousButton);

      await waitFor(() => {
        expect(screen.getByText('1 / 3')).toBeInTheDocument();
      });

      expect(screen.getByText(mockImages[0].caption)).toBeInTheDocument();
    });

    it('should wrap to first image when clicking next on last image', async () => {
      const user = userEvent.setup();
      render(<ImageGallery images={mockImages} initialIndex={2} />);

      // Open lightbox at last image
      const lastThumbnail = screen.getAllByRole('img')[2];
      await user.click(lastThumbnail);

      await waitFor(() => {
        expect(screen.getByText('3 / 3')).toBeInTheDocument();
      });

      // Click next - should wrap to first
      const nextButton = screen.getByLabelText('Next image');
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('1 / 3')).toBeInTheDocument();
      });

      expect(screen.getByText(mockImages[0].caption)).toBeInTheDocument();
    });

    it('should wrap to last image when clicking previous on first image', async () => {
      const user = userEvent.setup();
      render(<ImageGallery images={mockImages} />);

      // Open lightbox at first image
      const firstThumbnail = screen.getAllByRole('img')[0];
      await user.click(firstThumbnail);

      await waitFor(() => {
        expect(screen.getByText('1 / 3')).toBeInTheDocument();
      });

      // Click previous - should wrap to last
      const previousButton = screen.getByLabelText('Previous image');
      await user.click(previousButton);

      await waitFor(() => {
        expect(screen.getByText('3 / 3')).toBeInTheDocument();
      });

      expect(screen.getByText(mockImages[2].caption)).toBeInTheDocument();
    });
  });

  describe('Placeholder Display on Error', () => {
    it('should display placeholder when thumbnail image fails to load', async () => {
      render(<ImageGallery images={mockImages} />);

      const thumbnails = screen.getAllByRole('img');
      const firstThumbnail = thumbnails[0] as HTMLImageElement;

      // Simulate image load error
      const errorEvent = new Event('error');
      firstThumbnail.dispatchEvent(errorEvent);

      // Check that src was changed to placeholder
      await waitFor(() => {
        expect(firstThumbnail.src).toContain('data:image/svg+xml');
      });
    });
  });

  describe('Empty State', () => {
    it('should display message when no images are provided', () => {
      render(<ImageGallery images={[]} />);

      expect(screen.getByText('No images available')).toBeInTheDocument();
    });

    it('should not render thumbnails when images array is empty', () => {
      render(<ImageGallery images={[]} />);

      const images = screen.queryAllByRole('img');
      expect(images).toHaveLength(0);
    });
  });

  describe('Cultural Theme Styling', () => {
    it('should apply temple theme styling by default', () => {
      const { container } = render(<ImageGallery images={mockImages} />);

      const thumbnailContainers = container.querySelectorAll('.border-saffron-400');
      expect(thumbnailContainers.length).toBeGreaterThan(0);
    });

    it('should apply palace theme styling when specified', () => {
      const { container } = render(
        <ImageGallery images={mockImages} culturalTheme="palace" />
      );

      const thumbnailContainers = container.querySelectorAll('.border-rajasthani-400');
      expect(thumbnailContainers.length).toBeGreaterThan(0);
    });
  });

  describe('Single Image Gallery', () => {
    it('should not show navigation buttons for single image', async () => {
      const user = userEvent.setup();
      const singleImage = [mockImages[0]];

      render(<ImageGallery images={singleImage} />);

      // Open lightbox
      const thumbnail = screen.getByRole('img');
      await user.click(thumbnail);

      await waitFor(() => {
        expect(screen.getByText('1 / 1')).toBeInTheDocument();
      });

      // Navigation buttons should not be present
      expect(screen.queryByLabelText('Next image')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Previous image')).not.toBeInTheDocument();
    });
  });
});
