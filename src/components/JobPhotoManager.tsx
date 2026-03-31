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
    <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Job Photos</h3>

      {/* Tab selector */}
      <div className="flex rounded-full bg-gray-100 p-1 mb-4 dark:bg-gray-800">
        {TABS.map((tab) => {
          const count = countForCategory(tab.value);
          const isActive = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium transition-all ${
                isActive
                  ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span
                  className={`inline-flex h-4.5 min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold ${
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
      {filteredPhotos.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 mb-3">
          {filteredPhotos.map((photo, i) => (
            <div key={`${photo.url}-${i}`} className="relative group">
              <div className="aspect-square overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
                <img
                  src={photo.url}
                  alt={`${activeTab} photo ${i + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Delete button */}
              <button
                type="button"
                onClick={() => handleDelete(photo)}
                className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                aria-label="Delete photo"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Caption */}
              {photo.caption && (
                <p className="mt-1 text-[12px] text-gray-500 dark:text-gray-400 truncate px-0.5">
                  {photo.caption}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center mb-3">
          <svg className="h-8 w-8 text-gray-300 dark:text-gray-600 mb-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
          </svg>
          <p className="text-[13px] text-gray-400 dark:text-gray-500">
            No {activeTab} photos yet
          </p>
        </div>
      )}

      {/* Upload button */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-[13px] font-medium text-gray-500 transition-all hover:border-brand-400 hover:text-brand-600 hover:bg-brand-50/50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-400 dark:hover:border-brand-500 dark:hover:text-brand-400"
      >
        {uploading ? (
          <>
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Uploading...
          </>
        ) : (
          <>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
            </svg>
            Add Photo
          </>
        )}
      </button>

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
        <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
          <p className="text-[12px] font-medium text-gray-400 dark:text-gray-500 mb-2">
            Original Quote Photos
          </p>
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
            {quotePhotos.map((url, i) => (
              <div
                key={`quote-${i}`}
                className="h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800"
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
