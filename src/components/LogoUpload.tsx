'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';
import { compressImage } from '@/lib/compress-image';

interface LogoUploadProps {
  currentLogoUrl: string | null;
  userId: string;
  onUpload: (url: string) => void;
}

export function LogoUpload({ currentLogoUrl, userId, onUpload }: LogoUploadProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentLogoUrl);
  const [showPicker, setShowPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close picker when tapping outside
  useEffect(() => {
    if (!showPicker) return;
    function handleClick(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showPicker]);

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      toast({ message: 'Please select an image file.', type: 'error' });
      return;
    }
    setUploading(true);

    try {
      // Compress before uploading (logo doesn't need to be huge)
      const compressed = await compressImage(file, {
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.85,
      });

      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(compressed);

      const supabase = createClient();
      const ext = file.name.split('.').pop() || 'png';
      const path = `${userId}/logo.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(path, compressed, { upsert: true });

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

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    } catch (err) {
      console.error('File selection error:', err);
      toast({ message: 'Could not read the selected file. Please try again.', type: 'error' });
    }
    // Reset the input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  }

  function openCamera() {
    setShowPicker(false);
    try {
      cameraInputRef.current?.click();
    } catch (err) {
      console.error('Camera access error:', err);
      toast({ message: 'Could not open the camera. Please use "Choose from Library" instead.', type: 'error' });
    }
  }

  function openLibrary() {
    setShowPicker(false);
    try {
      fileInputRef.current?.click();
    } catch (err) {
      console.error('File picker error:', err);
      toast({ message: 'Could not open the photo library. Please try again.', type: 'error' });
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowPicker(true)}
          className="relative group"
          disabled={uploading}
        >
          <div className="h-24 w-24 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 overflow-hidden flex items-center justify-center transition-all group-hover:border-brand-400 group-hover:bg-brand-50 dark:group-hover:bg-brand-950/20">
            {preview ? (
              <img src={preview} alt="Logo" className="h-full w-full object-contain p-2" />
            ) : (
              <svg className="h-8 w-8 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            )}
          </div>
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/70 dark:bg-gray-900/70">
              <svg className="h-5 w-5 animate-spin text-brand-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-white shadow-md group-hover:bg-brand-700">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
            </svg>
          </div>
        </button>

        {/* iOS-style action sheet for photo source selection */}
        {showPicker && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowPicker(false)}
            />
            {/* Bottom sheet */}
            <div
              ref={pickerRef}
              className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-lg animate-in slide-in-from-bottom duration-200 px-3 pb-safe-area-inset-bottom"
              style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
            >
              <div className="overflow-hidden rounded-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl shadow-2xl">
                <button
                  type="button"
                  onClick={openCamera}
                  className="flex w-full items-center gap-3 px-5 py-4 text-left text-[17px] text-brand-600 dark:text-brand-400 font-medium active:bg-gray-100 dark:active:bg-gray-700/50 transition-colors"
                >
                  <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                  </svg>
                  Take Photo
                </button>
                <div className="mx-5 h-px bg-gray-200 dark:bg-gray-700" />
                <button
                  type="button"
                  onClick={openLibrary}
                  className="flex w-full items-center gap-3 px-5 py-4 text-left text-[17px] text-brand-600 dark:text-brand-400 font-medium active:bg-gray-100 dark:active:bg-gray-700/50 transition-colors"
                >
                  <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                  Choose from Library
                </button>
              </div>
              <button
                type="button"
                onClick={() => setShowPicker(false)}
                className="mt-2 w-full rounded-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl py-4 text-[17px] font-semibold text-brand-600 dark:text-brand-400 active:bg-gray-100 dark:active:bg-gray-700/50 shadow-2xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>

      <p className="text-xs text-gray-400 dark:text-gray-500">Tap to upload logo</p>

      {/* Camera input -- capture="user" opens front camera (good for profile photos) */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={handleInputChange}
      />
      {/* Library file picker -- no capture attribute so iOS shows photo library */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  );
}
