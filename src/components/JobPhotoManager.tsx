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
    } catch {
      // Upload failed silently — user can retry
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
    <div className="rounded-2xl bg-white dark:bg-gray-900 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06] overflow-hidden">
      {/* Category pill tabs */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-3">
        {TABS.map((tab) => {
          const count = countForCategory(tab.value);
          const isActive = activeTab === tab.value;
          const colorMap: Record<string, { active: string; dot: string }> = {
            before: { active: 'bg-amber-500 text-white', dot: 'bg-amber-400' },
            during: { active: 'bg-blue-500 text-white', dot: 'bg-blue-400' },
            after: { active: 'bg-emerald-500 text-white', dot: 'bg-emerald-400' },
          };
          const colors = colorMap[tab.value] || colorMap.before;

          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-all duration-200 press-scale ${
                isActive
                  ? colors.active
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span
                  className={`inline-flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-bold tabular-nums ${
                    isActive
                      ? 'bg-white/25 text-white'
                      : 'bg-gray-200/80 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}

        {/* Upload button - prominent */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="ml-auto flex items-center gap-1.5 rounded-full bg-brand-600 px-3 py-1.5 text-[12px] font-semibold text-white shadow-sm transition-all hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed press-scale"
        >
          {uploading ? (
            <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
            </svg>
          )}
          {uploading ? 'Uploading...' : 'Add'}
        </button>
      </div>

      {/* Photo grid */}
      <div className="px-4 pb-4">
        {filteredPhotos.length === 0 ? (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 py-10 text-gray-400 dark:text-gray-500 hover:border-brand-300 hover:text-brand-500 dark:hover:border-brand-700 dark:hover:text-brand-400 transition-colors"
          >
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
            </svg>
            <span className="text-[13px] font-medium">
              Tap to add {activeTab} photos
            </span>
          </button>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {filteredPhotos.map((photo, i) => (
              <div key={`${photo.url}-${i}`} className="relative group animate-card-enter" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="aspect-[4/3] overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 ring-1 ring-black/[0.04]">
                  <img
                    src={photo.url}
                    alt={`${activeTab} photo ${i + 1}`}
                    className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => handleDelete(photo)}
                  className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all hover:bg-red-600 backdrop-blur-sm"
                  aria-label="Delete photo"
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Caption */}
                {photo.caption && (
                  <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400 truncate px-0.5">
                    {photo.caption}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
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
        <div className="px-4 pb-4 pt-2 border-t border-gray-100/80 dark:border-gray-800/60">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
            Quote Photos
          </p>
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
            {quotePhotos.map((url, i) => (
              <div
                key={`quote-${i}`}
                className="h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 ring-1 ring-black/[0.04]"
              >
                <img
                  src={url}
                  alt={`Quote photo ${i + 1}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
