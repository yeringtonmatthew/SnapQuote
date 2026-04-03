'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import PhotoAnnotator from './PhotoAnnotator';
import ImageLightbox from './ImageLightbox';

interface PhotoGalleryProps {
  photos: string[];
  quoteId: string;
}

// Grip dots drag handle icon
function DragHandle() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <circle cx="5" cy="3" r="1.5" />
      <circle cx="11" cy="3" r="1.5" />
      <circle cx="5" cy="8" r="1.5" />
      <circle cx="11" cy="8" r="1.5" />
      <circle cx="5" cy="13" r="1.5" />
      <circle cx="11" cy="13" r="1.5" />
    </svg>
  );
}

export default function PhotoGallery({ photos, quoteId }: PhotoGalleryProps) {
  const [photoUrls, setPhotoUrls] = useState<string[]>(photos);
  const [annotatingIndex, setAnnotatingIndex] = useState<number | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [reorderSaving, setReorderSaving] = useState(false);

  // Drag state
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  // Touch drag state
  const touchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchDraggingRef = useRef(false);
  const touchStartPos = useRef({ x: 0, y: 0 });
  const touchCloneRef = useRef<HTMLElement | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const itemRectsRef = useRef<DOMRect[]>([]);

  const savePhotoOrder = useCallback(async (newPhotos: string[]) => {
    setReorderSaving(true);
    try {
      const res = await fetch(`/api/quotes/${quoteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photos: newPhotos }),
      });
      if (!res.ok) {
        // Order save failed silently — visual order is already updated
      }
    } catch {
      // Network error — visual order is already updated
    } finally {
      setReorderSaving(false);
    }
  }, [quoteId]);

  const reorder = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const next = [...photoUrls];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    setPhotoUrls(next);
    savePhotoOrder(next);
  }, [photoUrls, savePhotoOrder]);

  // --- Desktop Drag & Drop ---
  function handleDragStart(e: React.DragEvent, index: number) {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    const el = e.currentTarget as HTMLElement;
    e.dataTransfer.setDragImage(el, el.offsetWidth / 2, el.offsetHeight / 2);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragIndex !== null && index !== overIndex) {
      setOverIndex(index);
    }
  }

  function handleDrop(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (dragIndex !== null) {
      reorder(dragIndex, index);
    }
    setDragIndex(null);
    setOverIndex(null);
  }

  function handleDragEnd() {
    setDragIndex(null);
    setOverIndex(null);
  }

  // --- Touch Drag ---
  function cacheItemRects() {
    if (!gridRef.current) return;
    const items = gridRef.current.querySelectorAll('[data-photo-index]');
    itemRectsRef.current = Array.from(items).map((el) => el.getBoundingClientRect());
  }

  function findOverIndex(x: number, y: number): number | null {
    for (let i = 0; i < itemRectsRef.current.length; i++) {
      const r = itemRectsRef.current[i];
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
        return i;
      }
    }
    return null;
  }

  function handleTouchStart(e: React.TouchEvent, index: number) {
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };

    touchTimerRef.current = setTimeout(() => {
      touchDraggingRef.current = true;
      setDragIndex(index);
      cacheItemRects();

      const el = (e.target as HTMLElement).closest('[data-photo-index]') as HTMLElement;
      if (el) {
        const rect = el.getBoundingClientRect();
        const clone = el.cloneNode(true) as HTMLElement;
        clone.style.position = 'fixed';
        clone.style.left = `${rect.left}px`;
        clone.style.top = `${rect.top}px`;
        clone.style.width = `${rect.width}px`;
        clone.style.height = `${rect.height}px`;
        clone.style.zIndex = '9999';
        clone.style.pointerEvents = 'none';
        clone.style.transform = 'scale(1.08)';
        clone.style.boxShadow = '0 8px 32px rgba(0,0,0,0.25)';
        clone.style.borderRadius = '12px';
        clone.style.opacity = '0.92';
        clone.style.transition = 'transform 0.15s, box-shadow 0.15s';
        document.body.appendChild(clone);
        touchCloneRef.current = clone;
      }
    }, 300);
  }

  function handleTouchMove(e: React.TouchEvent) {
    const touch = e.touches[0];

    if (!touchDraggingRef.current) {
      const dx = touch.clientX - touchStartPos.current.x;
      const dy = touch.clientY - touchStartPos.current.y;
      if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
        if (touchTimerRef.current) {
          clearTimeout(touchTimerRef.current);
          touchTimerRef.current = null;
        }
      }
      return;
    }

    e.preventDefault();

    if (touchCloneRef.current) {
      const rect = touchCloneRef.current.getBoundingClientRect();
      const offsetX = touch.clientX - (rect.left + rect.width / 2);
      const offsetY = touch.clientY - (rect.top + rect.height / 2);
      touchCloneRef.current.style.left = `${parseFloat(touchCloneRef.current.style.left) + offsetX}px`;
      touchCloneRef.current.style.top = `${parseFloat(touchCloneRef.current.style.top) + offsetY}px`;
    }

    const idx = findOverIndex(touch.clientX, touch.clientY);
    if (idx !== null) {
      setOverIndex(idx);
    }
  }

  function handleTouchEnd() {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }

    if (touchDraggingRef.current && dragIndex !== null && overIndex !== null) {
      reorder(dragIndex, overIndex);
    }

    if (touchCloneRef.current) {
      touchCloneRef.current.remove();
      touchCloneRef.current = null;
    }

    touchDraggingRef.current = false;
    setDragIndex(null);
    setOverIndex(null);
  }

  useEffect(() => {
    return () => {
      if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    };
  }, []);

  async function handleAnnotationDone(dataUrl: string) {
    if (annotatingIndex === null) return;
    setSaving(true);

    try {
      const res = await fetch('/api/photos/annotate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quote_id: quoteId,
          photo_index: annotatingIndex,
          annotated_image: dataUrl,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save annotation');
      }

      const { url } = await res.json();

      setPhotoUrls((prev) => {
        const next = [...prev];
        next[annotatingIndex] = url;
        return next;
      });
    } catch {
      alert('Failed to save annotation. Please try again.');
    } finally {
      setSaving(false);
      setAnnotatingIndex(null);
    }
  }

  return (
    <>
      <div ref={gridRef} className="grid grid-cols-3 gap-2">
        {photoUrls.map((url, i) => (
          <div
            key={i}
            data-photo-index={i}
            draggable
            onDragStart={(e) => handleDragStart(e, i)}
            onDragOver={(e) => handleDragOver(e, i)}
            onDrop={(e) => handleDrop(e, i)}
            onDragEnd={handleDragEnd}
            onTouchStart={(e) => handleTouchStart(e, i)}
            onTouchMove={(e) => handleTouchMove(e)}
            onTouchEnd={handleTouchEnd}
            className={`relative group transition-all duration-200 select-none ${
              dragIndex === i ? 'opacity-40 scale-95' : ''
            } ${
              overIndex === i && dragIndex !== null && dragIndex !== i
                ? 'ring-2 ring-brand-500 ring-offset-2 scale-105'
                : ''
            }`}
            style={{ cursor: 'grab' }}
          >
            <button
              type="button"
              onClick={() => { if (dragIndex === null) setLightboxIndex(i); }}
              className="w-full cursor-zoom-in"
              aria-label={`View photo ${i + 1} fullscreen`}
            >
              <img
                src={url}
                alt={`Job photo ${i + 1}`}
                loading="lazy"
                draggable={false}
                className="aspect-[4/3] w-full rounded-xl object-cover bg-gray-100 pointer-events-none"
              />
            </button>

            {/* Drag handle */}
            <div className="absolute left-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white/80">
              <DragHandle />
            </div>

            {/* Position indicator */}
            <div className="absolute bottom-1.5 left-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-black/50 px-1.5 text-[10px] font-bold text-white">
              {i + 1}
            </div>

            {/* Annotate button */}
            <button
              type="button"
              onClick={() => setAnnotatingIndex(i)}
              aria-label={`Annotate photo ${i + 1}`}
              className="absolute bottom-1.5 right-1.5 flex h-8 w-8 items-center justify-center rounded-lg bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 active:opacity-100 sm:opacity-0 max-sm:opacity-100"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Reorder hint */}
      {photoUrls.length > 1 && (
        <p className="mt-2 text-xs text-gray-400">
          {reorderSaving ? 'Saving order...' : 'Hold and drag to reorder photos'}
        </p>
      )}

      {/* Full-screen lightbox */}
      {lightboxIndex !== null && (
        <ImageLightbox
          images={photoUrls}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      {/* Full-screen annotator modal */}
      {annotatingIndex !== null && !saving && (
        <PhotoAnnotator
          imageUrl={photoUrls[annotatingIndex]}
          onDone={handleAnnotationDone}
          onCancel={() => setAnnotatingIndex(null)}
        />
      )}

      {/* Saving overlay */}
      {saving && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-white/20 border-t-white" />
          <p className="mt-3 text-sm text-white/80">Saving annotation...</p>
        </div>
      )}
    </>
  );
}
