'use client';

import { useState } from 'react';
import ImageLightbox from './ImageLightbox';

interface CustomerPhotoGalleryProps {
  photos: string[];
  businessName: string;
}

export default function CustomerPhotoGallery({ photos, businessName }: CustomerPhotoGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      <div className="flex gap-2.5 overflow-x-auto scrollbar-none -mx-4 px-4 pb-1">
        {photos.map((url, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setLightboxIndex(i)}
            className="shrink-0 cursor-zoom-in"
            aria-label={`View photo ${i + 1} of ${photos.length} fullscreen`}
          >
            <img
              src={url}
              alt={`Job site photo ${i + 1} of ${photos.length}`}
              loading="lazy"
              className="h-36 w-52 rounded-2xl object-cover shadow-sm bg-gray-200"
              style={{ aspectRatio: '4/3' }}
            />
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <ImageLightbox
          images={photos}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}
