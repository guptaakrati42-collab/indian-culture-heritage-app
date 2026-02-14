import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ImageGallery, { ImageGalleryProps } from './ImageGallery';
import { Image } from '../hooks/useHeritage';

// Property-based test data generator
const generateImageTestCases = () => {
  const testCases = [];

  // Test with different gallery sizes
  const gallerySizes = [1, 2, 3, 5, 10, 20];

  for (const size of gallerySizes) {
    const images: Image[] = [];
    for (let i = 0; i < size; i++) {
      images.push({
        id: `image-${i}`,
        url: `/images/full-${i}.jpg`,
        thumbnailUrl: `/images/thumb-${i}.jpg`,
        caption: `Image ${i} caption`,
        altText: `Image ${i} alt text`,
        description: `This is what image ${i} depicts`,
        culturalContext: `Cultural context for image ${i}`,
        location: i % 2 === 0 ? `Location ${i}` : undefined,
        period: i % 3 === 0 ? `Period ${i}` : undefined,
      });
    }

    testCases.push({
      images,
      size,
      description: `Gallery with ${size} image${size !== 1 ? 's' : ''}`,
    });
  }

  return testCases;
};

describe('ImageGallery - Property-Based Tests', () => {
  /**
   * Property 11: Image navigation correctness
   * 
   * For any image gallery with N images:
   * 1. Clicking "next" from image at index i should navigate to image at index (i+1) % N
   * 2. Clicking "previous" from image at index i should navigate to image at index (i-1+N) % N
   * 3. Navigation should wrap around (last -> first, first -> last)
   * 4. Current image index should always be valid (0 <= index < N)
   * 5. Navigation should work consistently regardless of gallery size
   * 
   * Validates: Requirements 4.4
   */
  describe('Property 11: Image navigation correctness', () => {
    it('should navigate forward correctly with wrap-around for any gallery size', async () => {
      const testCases = generateImageTestCases();

      for (const testCase of testCases) {
        const user = userEvent.setup();

        const { unmount } = render(
          <ImageGallery images={testCase.images} initialIndex={0} />
        );

        // Open lightbox by clicking first thumbnail
        const firstThumbnail = screen.getAllByRole('img')[0];
        await user.click(firstThumbnail);

        // Wait for lightbox to open
        await waitFor(() => {
          expect(screen.getByText(`1 / ${testCase.size}`)).toBeInTheDocument();
        });

        // Navigate forward through all images
        for (let i = 0; i < testCase.size; i++) {
          const expectedIndex = i + 1;
          const expectedCaption = testCase.images[i].caption;

          // Verify current image counter
          expect(screen.getByText(`${expectedIndex} / ${testCase.size}`)).toBeInTheDocument();

          // Verify current image caption is displayed
          expect(screen.getByText(expectedCaption)).toBeInTheDocument();

          // Click next button (if not on last iteration)
          if (i < testCase.size - 1) {
            const nextButton = screen.getByLabelText('Next image');
            await user.click(nextButton);
          }
        }

        // Test wrap-around: clicking next on last image should go to first
        if (testCase.size > 1) {
          const nextButton = screen.getByLabelText('Next image');
          await user.click(nextButton);

          await waitFor(() => {
            expect(screen.getByText(`1 / ${testCase.size}`)).toBeInTheDocument();
          });

          // Verify we're back at the first image
          expect(screen.getByText(testCase.images[0].caption)).toBeInTheDocument();
        }

        unmount();
      }
    });

    it('should navigate backward correctly with wrap-around for any gallery size', async () => {
      const testCases = generateImageTestCases();

      for (const testCase of testCases) {
        const user = userEvent.setup();

        const { unmount } = render(
          <ImageGallery images={testCase.images} initialIndex={0} />
        );

        // Open lightbox
        const firstThumbnail = screen.getAllByRole('img')[0];
        await user.click(firstThumbnail);

        await waitFor(() => {
          expect(screen.getByText(`1 / ${testCase.size}`)).toBeInTheDocument();
        });

        // Test wrap-around: clicking previous on first image should go to last
        if (testCase.size > 1) {
          const previousButton = screen.getByLabelText('Previous image');
          await user.click(previousButton);

          await waitFor(() => {
            expect(screen.getByText(`${testCase.size} / ${testCase.size}`)).toBeInTheDocument();
          });

          // Verify we're at the last image
          expect(screen.getByText(testCase.images[testCase.size - 1].caption)).toBeInTheDocument();

          // Navigate backward through all images
          for (let i = testCase.size - 1; i > 0; i--) {
            const expectedIndex = i;
            const expectedCaption = testCase.images[i - 1].caption;

            await user.click(previousButton);

            await waitFor(() => {
              expect(screen.getByText(`${expectedIndex} / ${testCase.size}`)).toBeInTheDocument();
            });

            expect(screen.getByText(expectedCaption)).toBeInTheDocument();
          }
        }

        unmount();
      }
    });

    it('should maintain valid index bounds during navigation for any gallery size', async () => {
      const testCases = generateImageTestCases();

      for (const testCase of testCases) {
        const user = userEvent.setup();

        // Test with different starting indices
        const startIndices = [0, Math.floor(testCase.size / 2), testCase.size - 1];

        for (const startIndex of startIndices) {
          if (startIndex >= testCase.size) continue;

          const { unmount } = render(
            <ImageGallery images={testCase.images} initialIndex={startIndex} />
          );

          // Open lightbox
          const thumbnails = screen.getAllByRole('img');
          await user.click(thumbnails[0]);

          await waitFor(() => {
            expect(screen.getByText(new RegExp(`\\d+ / ${testCase.size}`))).toBeInTheDocument();
          });

          // Perform random navigation operations
          const operations = ['next', 'previous', 'next', 'next', 'previous'];

          for (const operation of operations) {
            if (testCase.size === 1) break; // Skip navigation for single image

            const button =
              operation === 'next'
                ? screen.getByLabelText('Next image')
                : screen.getByLabelText('Previous image');

            await user.click(button);

            // Verify counter shows valid index
            const counterText = screen.getByText(new RegExp(`(\\d+) / ${testCase.size}`)).textContent;
            const currentIndex = parseInt(counterText?.split('/')[0].trim() || '0');

            // Index should always be between 1 and size (inclusive)
            expect(currentIndex).toBeGreaterThanOrEqual(1);
            expect(currentIndex).toBeLessThanOrEqual(testCase.size);
          }

          unmount();
        }
      }
    });

    it('should support keyboard navigation (arrow keys) for any gallery size', async () => {
      const testCases = generateImageTestCases().slice(0, 5); // Test with first 5 cases

      for (const testCase of testCases) {
        const user = userEvent.setup();

        const { unmount } = render(
          <ImageGallery images={testCase.images} initialIndex={0} />
        );

        // Open lightbox
        const firstThumbnail = screen.getAllByRole('img')[0];
        await user.click(firstThumbnail);

        await waitFor(() => {
          expect(screen.getByText(`1 / ${testCase.size}`)).toBeInTheDocument();
        });

        if (testCase.size > 1) {
          // Test right arrow key (next)
          await user.keyboard('{ArrowRight}');

          await waitFor(() => {
            expect(screen.getByText(`2 / ${testCase.size}`)).toBeInTheDocument();
          });

          // Test left arrow key (previous)
          await user.keyboard('{ArrowLeft}');

          await waitFor(() => {
            expect(screen.getByText(`1 / ${testCase.size}`)).toBeInTheDocument();
          });

          // Test wrap-around with keyboard
          await user.keyboard('{ArrowLeft}');

          await waitFor(() => {
            expect(screen.getByText(`${testCase.size} / ${testCase.size}`)).toBeInTheDocument();
          });
        }

        unmount();
      }
    });

    it('should display correct image information during navigation', async () => {
      const testCases = generateImageTestCases().slice(0, 8); // Test with first 8 cases

      for (const testCase of testCases) {
        const user = userEvent.setup();

        const { unmount } = render(
          <ImageGallery images={testCase.images} initialIndex={0} />
        );

        // Open lightbox
        const firstThumbnail = screen.getAllByRole('img')[0];
        await user.click(firstThumbnail);

        await waitFor(() => {
          expect(screen.getByText(`1 / ${testCase.size}`)).toBeInTheDocument();
        });

        // Navigate through images and verify information
        for (let i = 0; i < Math.min(testCase.size, 5); i++) {
          const currentImage = testCase.images[i];

          // Verify caption
          expect(screen.getByText(currentImage.caption)).toBeInTheDocument();

          // Verify description
          expect(screen.getByText(currentImage.description)).toBeInTheDocument();

          // Verify cultural context
          expect(screen.getByText(currentImage.culturalContext)).toBeInTheDocument();

          // Verify location if present
          if (currentImage.location) {
            expect(screen.getByText(currentImage.location)).toBeInTheDocument();
          }

          // Verify period if present
          if (currentImage.period) {
            expect(screen.getByText(currentImage.period)).toBeInTheDocument();
          }

          // Navigate to next image (if not last)
          if (i < Math.min(testCase.size, 5) - 1 && testCase.size > 1) {
            const nextButton = screen.getByLabelText('Next image');
            await user.click(nextButton);
          }
        }

        unmount();
      }
    });

    it('should handle single-image galleries correctly (no navigation buttons)', async () => {
      const singleImageCase = generateImageTestCases().find((tc) => tc.size === 1);

      if (singleImageCase) {
        const user = userEvent.setup();

        const { unmount } = render(
          <ImageGallery images={singleImageCase.images} initialIndex={0} />
        );

        // Open lightbox
        const thumbnail = screen.getByRole('img');
        await user.click(thumbnail);

        await waitFor(() => {
          expect(screen.getByText('1 / 1')).toBeInTheDocument();
        });

        // Navigation buttons should not be present for single image
        expect(screen.queryByLabelText('Next image')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('Previous image')).not.toBeInTheDocument();

        // Image information should still be displayed
        expect(screen.getByText(singleImageCase.images[0].caption)).toBeInTheDocument();

        unmount();
      }
    });
  });
});
