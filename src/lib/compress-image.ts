/**
 * Client-side image compression using Canvas APIs.
 * Resizes large photos (e.g. 5-10 MB phone camera shots) down to a
 * max dimension while converting to JPEG at a configurable quality.
 * No external dependencies — pure browser APIs.
 */

export interface CompressImageOptions {
  /** Maximum width in pixels (default 1920) */
  maxWidth?: number;
  /** Maximum height in pixels (default 1920) */
  maxHeight?: number;
  /** JPEG quality 0-1 (default 0.8) */
  quality?: number;
}

/**
 * Compress and resize an image File using the browser canvas.
 *
 * - Preserves aspect ratio
 * - Skips compression if the image is already within the target dimensions
 *   and the resulting blob would be larger than the original
 * - Returns a new File with the same name and image/jpeg MIME type
 */
export async function compressImage(
  file: File,
  options: CompressImageOptions = {},
): Promise<File> {
  const { maxWidth = 1920, maxHeight = 1920, quality = 0.8 } = options;

  // Decode the image — createImageBitmap is non-blocking and widely supported
  const bitmap = await createImageBitmap(file);

  const { width: origW, height: origH } = bitmap;

  // Determine whether we need to resize
  let targetW = origW;
  let targetH = origH;

  if (origW > maxWidth || origH > maxHeight) {
    const scale = Math.min(maxWidth / origW, maxHeight / origH);
    targetW = Math.round(origW * scale);
    targetH = Math.round(origH * scale);
  }

  // Draw onto an OffscreenCanvas (or regular canvas as fallback)
  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    // If canvas is unsupported somehow, return the original file untouched
    return file;
  }

  ctx.drawImage(bitmap, 0, 0, targetW, targetH);
  bitmap.close();

  // Convert to JPEG blob
  const blob: Blob = await new Promise((resolve) => {
    canvas.toBlob(
      (b) => resolve(b ?? new Blob()),
      'image/jpeg',
      quality,
    );
  });

  // If the compressed version is somehow larger (e.g. small PNG -> JPEG),
  // and we didn't resize, return the original
  if (targetW === origW && targetH === origH && blob.size >= file.size) {
    return file;
  }

  return new File([blob], file.name, {
    type: 'image/jpeg',
    lastModified: Date.now(),
  });
}
