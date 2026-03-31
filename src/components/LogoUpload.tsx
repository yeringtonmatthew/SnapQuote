'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';

interface LogoUploadProps {
  currentLogoUrl: string | null;
  userId: string;
  onUpload: (url: string) => void;
}

export function LogoUpload({ currentLogoUrl, userId, onUpload }: LogoUploadProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentLogoUrl);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) return;
    setUploading(true);

    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    try {
      const supabase = createClient();
      const ext = file.name.split('.').pop() || 'png';
      const path = `${userId}/logo.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('logos').getPublicUrl(path);
      const url = `${data.publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from('users')
        .update({ logo_url: data.publicUrl })
        .eq('id', userId);

      if (updateError) throw updateError;

      onUpload(url);
    } catch (err) {
      console.error('Logo upload failed:', err);
      toast({ message: 'Upload failed. Please try again.', type: 'error' });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative group"
        disabled={uploading}
      >
        <div className="h-24 w-24 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center transition-all group-hover:border-brand-400 group-hover:bg-brand-50">
          {preview ? (
            <img src={preview} alt="Logo" className="h-full w-full object-contain p-2" />
          ) : (
            <svg className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          )}
        </div>
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/70">
            <svg className="h-5 w-5 animate-spin text-brand-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          </div>
        )}
        <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-white shadow-md group-hover:bg-brand-700">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
          </svg>
        </div>
      </button>
      <p className="text-xs text-gray-400">Tap to upload logo</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
      />
    </div>
  );
}
