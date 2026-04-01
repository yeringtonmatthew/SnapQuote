'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { JobPhoto } from '@/types/database';
import { createClient } from '@/lib/supabase/client';
import { compressImage } from '@/lib/compress-image';

interface JobPhotoManagerProps {
  quoteId: string;
  jobPhotos: JobPhoto[];
  quotePhotos: string[];
}

type PhotoCategory = 'before' | 'during' | 'after';

const TABS: { label: string; value: PhotoCategory }[] = [
  { label: 'Before', value: 'before' },
  { label: 'During', value: 'during' },
  { label: 'After', value: 'after' },
];

export function JobPhotoManager({ quoteId, jobPhotos: initialPhotos, quotePhotos }: JobPhotoManagerProps) {
  const router = useRouter();
  const [photos, setPhotos] = useState<JobPhoto[]>(initialPhotos);
  const [activeTab, setActiveTab] = useState<PhotoCategory>('before');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredPhotos = photos.filter((p) => p.category === activeTab);

  function countForCategory(cat: PhotoCategory) {
    return photos.filter((p) => p.category === cat).length;
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files;
    if (!selected || selected.length === 0) return;

    setUploading(true);
    const supabase = createClient();

    try {
      for (let i = 0; i < selected.length; i++) {
        const file = selected[i];

        // Compress image
        const compressed = await compressImage(file);

        // Upload to Supabase Storage
        const ext = 'jpg';
        const fileName = `${quoteId}/${activeTab}-${Date.now()}-${i}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(fileName, compressed, {
            contentType: 'image/jpeg',
            upsert: false,
          });

        if (uploadError) {
          console.error('[JobPhotoManager] Upload failed:', uploadError);
          continue;
        }

        // Get public URL
        const { data: urlData } = supabase.storage.from('photos').getPublicUrl(fileName);
        const url = urlData.publicUrl;

        // Save to database
        const res = await fetch(`/api/quotes/${quoteId}/job-photos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, category: activeTab }),
        });

        if (res.ok) {
          const newPhoto: JobPhoto = {
            url,
            category: activeTab,
            caption: null,
            created_at: new Date().toISOString(),
          };
          setPhotos((prev) => [...prev, newPhoto]);
        }
      }

      router.refresh();
    } catch (err) {
      console.error('[JobPhotoManager] Error uploading:', err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleDelete(photo: JobPhoto) {
    const prev = [...photos];
    setPhotos((p) => p.filter((ph) => ph.url !== photo.url));

    try {
      const res = await fetch(`/api/quotes/${quoteId}/job-photos`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: photo.url }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        setPhotos(prev);
      }
    } catch {
      setPhotos(prev);
    }
  }

  return (
    <div>
      {/* Tab selector */}
      <div className="flex rounded-xl bg-gray-100 p-0.5 mb-4 dark:bg-gray-800">
        {TABS.map((tab) => {
          const count = countForCategory(tab.value);
          const isActive = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-[10px] px-2.5 py-1.5 text-[13px] font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span
                  className={`inline-flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-bold tabular-nums ${
                    isActive
                      ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300'
                      : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Photo grid */}
      <div className="grid grid-cols-3 gap-1.5">
        {filteredPhotos.map((photo, i) => (
          <div key={`${photo.url}-${i}`} className="relative group">
            <div className="aspect-[4/3] overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
              <img
                src={photo.url}
                alt={`${activeTab} photo ${i + 1}`}
                className="h-full w-full object-cover"
              />
            </div>

            {/* Delete button - always visible on mobile, hover on desktop */}
            <button
              type="button"
              onClick={() => handleDelete(photo)}
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-white opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-black/70"
              aria-label="Delete photo"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Caption */}
            {photo.caption && (
              <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400 truncate">
                {photo.caption}
              </p>
            )}
          </div>
        ))}

        {/* Upload tile - always present in grid */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="aspect-[4/3] flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/50 transition-all hover:border-brand-400 hover:bg-brand-50/30 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800/30 dark:hover:border-brand-500"
        >
          {uploading ? (
            <svg className="h-5 w-5 text-gray-400 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          )}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Original quote photos */}
      {quotePhotos.length > 0 && (
        <div className="mt-5 pt-4 border-t border-gray-100/80 dark:border-gray-800/60">
          <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
            Quote Photos
          </p>
          <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1">
            {quotePhotos.map((url, i) => (
              <div
                key={`quote-${i}`}
                className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800"
              >
                <img
                  src={url}
                  alt={`Quote photo ${i + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
