'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { compressImage } from '@/lib/compress-image';

interface PhotoUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  maxPhotos?: number;
  /** Already-uploaded photo URLs (used for draft recovery when File objects are gone) */
  photoUrls?: string[];
  /** Whether photos are currently being uploaded to storage */
  uploading?: boolean;
}

// Grip dots drag handle icon
function DragHandle() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <circle cx="5" cy="3" r="1.5" />
      <circle cx="11" cy="3" r="1.5" />
      <circle cx="5" cy="8" r="1.5" />
      <circle cx="11" cy="8" r="1.5" />
      <circle cx="5" cy="13" r="1.5" />
      <circle cx="11" cy="13" r="1.5" />
    </svg>
  );
}

export default function PhotoUpload({
  files,
  onFilesChange,
  maxPhotos = 10,
  photoUrls = [],
  uploading = false,
}: PhotoUploadProps) {
  const [previews, setPreviews] = useState<string[]>([]);
  const [compressing, setCompressing] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Drag state (reorder)
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  // Touch drag state
  const touchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchDraggingRef = useRef(false);
  const touchStartPos = useRef({ x: 0, y: 0 });
  const touchCloneRef = useRef<HTMLElement | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const itemRectsRef = useRef<DOMRect[]>([]);

  // Generate previews: use object URLs for File objects, fall back to photoUrls for draft recovery
  useEffect(() => {
    if (files.length > 0) {
      const urls = files.map((f) => URL.createObjectURL(f));
      setPreviews(urls);
      return () => urls.forEach((url) => URL.revokeObjectURL(url));
    } else if (photoUrls.length > 0) {
      // No File objects (draft recovery) -- use persisted URLs directly
      setPreviews(photoUrls);
    } else {
      setPreviews([]);
    }
  }, [files, photoUrls]);

  const reorder = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const next = [...files];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    onFilesChange(next);
  }, [files, onFilesChange]);

  // --- Desktop Drag & Drop (reorder) ---
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

  // --- Drop zone for adding new files ---
  function handleDropZoneDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    setIsDraggingOver(true);
  }

  function handleDropZoneDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  }

  async function handleDropZoneDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    const droppedFiles = e.dataTransfer.files;
    if (!droppedFiles || droppedFiles.length === 0) return;

    const imageFiles: File[] = [];
    for (let i = 0; i < droppedFiles.length; i++) {
      if (droppedFiles[i].type.startsWith('image/') && files.length + imageFiles.length < maxPhotos) {
        imageFiles.push(droppedFiles[i]);
      }
    }
    if (imageFiles.length === 0) return;

    setCompressing(true);
    try {
      const compressed = await Promise.all(imageFiles.map((file) => compressImage(file)));
      onFilesChange([...files, ...compressed]);
    } catch {
      onFilesChange([...files, ...imageFiles]);
    } finally {
      setCompressing(false);
    }
  }

  // --- Touch Drag (reorder) ---
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

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    };
  }, []);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files;
    if (!selected || selected.length === 0) return;

    const raw: File[] = [];
    for (let i = 0; i < selected.length; i++) {
      if (files.length + raw.length >= maxPhotos) break;
      raw.push(selected[i]);
    }

    setCompressing(true);
    try {
      const compressed = await Promise.all(
        raw.map(async (file) => {
          return compressImage(file);
        }),
      );
      onFilesChange([...files, ...compressed]);
    } catch {
      onFilesChange([...files, ...raw]);
    } finally {
      setCompressing(false);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  }

  function removeFile(index: number) {
    onFilesChange(files.filter((_, i) => i !== index));
  }

  const photoCount = Math.max(files.length, photoUrls.length);
  const hasPhotos = photoCount > 0;

  return (
    <div
      ref={dropZoneRef}
      onDragOver={handleDropZoneDragOver}
      onDragLeave={handleDropZoneDragLeave}
      onDrop={handleDropZoneDrop}
    >
      {/* Empty state: large drop zone / camera prompt */}
      {!hasPhotos && !compressing && (
        <div
          className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-all ${
            isDraggingOver
              ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30 scale-[1.02]'
              : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50'
          }`}
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 mb-4">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
            </svg>
          </div>
          <p className="text-[15px] font-semibold text-gray-900 dark:text-gray-100 mb-1">Add job site photos</p>
          <p className="text-[13px] text-gray-500 mb-5 text-center">Take photos or drag and drop images here</p>
          <div className="flex gap-3">
            {/* Camera button -- opens camera directly on mobile */}
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="flex h-11 items-center gap-2 rounded-xl bg-brand-600 px-5 text-[15px] font-semibold text-white active:scale-95 transition-transform"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>
              Take Photo
            </button>
            {/* Gallery button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-11 items-center gap-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-5 text-[15px] font-semibold text-gray-700 dark:text-gray-200 active:scale-95 transition-transform"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
              </svg>
              Gallery
            </button>
          </div>
        </div>
      )}

      {/* Photo grid with thumbnails */}
      {hasPhotos && (
        <>
          <div
            ref={gridRef}
            className={`grid grid-cols-3 sm:grid-cols-4 gap-2 rounded-2xl p-2 transition-all ${
              isDraggingOver ? 'bg-brand-50 dark:bg-brand-950/20 ring-2 ring-brand-300' : ''
            }`}
          >
            {previews.map((src, i) => {
              const isUploading = uploading && i >= (photoUrls.length);
              return (
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
                  className={`relative aspect-square overflow-hidden rounded-xl bg-gray-100 transition-all duration-200 select-none ${
                    dragIndex === i ? 'opacity-40 scale-95' : ''
                  } ${
                    overIndex === i && dragIndex !== null && dragIndex !== i
                      ? 'ring-2 ring-brand-500 ring-offset-2 scale-105'
                      : ''
                  }`}
                  style={{ cursor: 'grab' }}
                >
                  <img src={src} alt={`Job photo ${i + 1}`} className="h-full w-full object-cover pointer-events-none" />

                  {/* Upload progress overlay */}
                  {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
                      <svg className="h-8 w-8 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    </div>
                  )}

                  {/* Drag handle */}
                  <div className="absolute left-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white/90 shadow-sm">
                    <DragHandle />
                  </div>

                  {/* Remove button -- 44px touch target */}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                    aria-label={`Remove photo ${i + 1}`}
                    className="absolute right-0.5 top-0.5 flex h-11 w-11 items-center justify-center rounded-full text-white focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black/60">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </span>
                  </button>

                  {/* Position indicator */}
                  <div className="absolute bottom-1 left-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-black/50 px-1.5 text-[10px] font-bold text-white">
                    {i + 1}
                  </div>
                </div>
              );
            })}

            {/* Add more photos button -- always visible within grid */}
            {photoCount < maxPhotos && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Add a photo of the job site"
                className="flex aspect-square min-h-[88px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500 transition-colors hover:border-brand-400 hover:text-brand-500 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span className="mt-1 text-xs font-medium">Add More</span>
              </button>
            )}
          </div>

          {/* Take another photo -- persistent action below the grid, 44px min height */}
          {photoCount < maxPhotos && (
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-50 dark:bg-brand-950/30 text-[14px] font-semibold text-brand-700 dark:text-brand-400 active:bg-brand-100 dark:active:bg-brand-900/40 transition-colors"
            >
              <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>
              Take Another Photo
            </button>
          )}
        </>
      )}

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleChange}
        className="hidden"
      />
      {/* Camera input -- capture="environment" opens rear camera on mobile */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleChange}
        className="hidden"
      />

      {compressing ? (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-brand-600">
          <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Compressing...
        </p>
      ) : hasPhotos ? (
        <p className="mt-2 text-xs text-gray-500">
          {photoCount}/{maxPhotos} photos{previews.length >= 1 ? ' -- hold any photo to drag and reorder' : ''}
          {uploading && (
            <span className="ml-2 inline-flex items-center gap-1 text-brand-600">
              <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Uploading...
            </span>
          )}
        </p>
      ) : null}
    </div>
  );
}
