'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { JobPhoto } from '@/types/database';

interface Props {
  beforePhotos: JobPhoto[];
  afterPhotos: JobPhoto[];
  jobDescription: string;
  businessName: string;
}

const CANVAS_W = 1200;
const CANVAS_H = 630;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

function drawCoverFit(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
) {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const scale = Math.max(dw / iw, dh / ih);
  const sw = dw / scale;
  const sh = dh / scale;
  const sx = (iw - sw) / 2;
  const sy = (ih - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
}

export function BeforeAfterGenerator({
  beforePhotos,
  afterPhotos,
  jobDescription,
  businessName,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedBefore, setSelectedBefore] = useState<number>(
    beforePhotos.length === 1 ? 0 : -1,
  );
  const [selectedAfter, setSelectedAfter] = useState<number>(
    afterPhotos.length === 1 ? 0 : -1,
  );
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Auto-select when there's exactly one photo in each category
  useEffect(() => {
    if (beforePhotos.length === 1) setSelectedBefore(0);
    if (afterPhotos.length === 1) setSelectedAfter(0);
  }, [beforePhotos.length, afterPhotos.length]);

  // Cleanup blob URL
  useEffect(() => {
    return () => {
      if (generatedUrl) URL.revokeObjectURL(generatedUrl);
    };
  }, [generatedUrl]);

  const generate = useCallback(async () => {
    if (selectedBefore < 0 || selectedAfter < 0) return;
    setIsGenerating(true);
    try {
      const [beforeImg, afterImg] = await Promise.all([
        loadImage(beforePhotos[selectedBefore].url),
        loadImage(afterPhotos[selectedAfter].url),
      ]);

      const canvas = canvasRef.current!;
      canvas.width = CANVAS_W;
      canvas.height = CANVAS_H;
      const ctx = canvas.getContext('2d')!;

      // Clear
      ctx.fillStyle = '#111';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      const halfW = CANVAS_W / 2;

      // Draw before (left half)
      drawCoverFit(ctx, beforeImg, 0, 0, halfW, CANVAS_H);

      // Draw after (right half)
      drawCoverFit(ctx, afterImg, halfW, 0, halfW, CANVAS_H);

      // Center divider line
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(halfW - 2, 0, 4, CANVAS_H);

      // Labels — BEFORE / AFTER
      ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'center';

      // BEFORE label (left side, top area)
      const labelY = 36;
      const beforeTextW = ctx.measureText('BEFORE').width + 24;
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      roundRect(ctx, halfW / 2 - beforeTextW / 2, labelY - 14, beforeTextW, 28, 6);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillText('BEFORE', halfW / 2, labelY + 5);

      // AFTER label (right side, top area)
      const afterTextW = ctx.measureText('AFTER').width + 24;
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      roundRect(ctx, halfW + halfW / 2 - afterTextW / 2, labelY - 14, afterTextW, 28, 6);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillText('AFTER', halfW + halfW / 2, labelY + 5);

      // Bottom bar gradient
      const grad = ctx.createLinearGradient(0, CANVAS_H - 64, 0, CANVAS_H);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, 'rgba(0,0,0,0.7)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, CANVAS_H - 64, CANVAS_W, 64);

      // Job description (bottom left)
      ctx.textAlign = 'left';
      ctx.font = '500 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#ffffff';
      const descTruncated =
        jobDescription.length > 60
          ? jobDescription.slice(0, 57) + '...'
          : jobDescription;
      ctx.fillText(descTruncated, 20, CANVAS_H - 18);

      // Business name (bottom right)
      if (businessName) {
        ctx.textAlign = 'right';
        ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.75)';
        ctx.fillText(businessName, CANVAS_W - 20, CANVAS_H - 18);
      }

      // Export
      canvas.toBlob((blob) => {
        if (blob) {
          if (generatedUrl) URL.revokeObjectURL(generatedUrl);
          setGeneratedUrl(URL.createObjectURL(blob));
        }
        setIsGenerating(false);
      }, 'image/png');
    } catch {
      setIsGenerating(false);
    }
  }, [selectedBefore, selectedAfter, beforePhotos, afterPhotos, jobDescription, businessName, generatedUrl]);

  const handleDownload = useCallback(() => {
    if (!generatedUrl) return;
    const a = document.createElement('a');
    a.href = generatedUrl;
    a.download = 'before-after.png';
    a.click();
  }, [generatedUrl]);

  const handleCopy = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvasRef.current!.toBlob(resolve, 'image/png'),
      );
      if (blob) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Copy to clipboard failed silently
    }
  }, []);

  const handleRegenerate = useCallback(() => {
    if (generatedUrl) URL.revokeObjectURL(generatedUrl);
    setGeneratedUrl(null);
  }, [generatedUrl]);

  // Empty state
  if (beforePhotos.length === 0 || afterPhotos.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-6 text-center">
        <svg
          className="h-8 w-8 text-gray-300"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
          />
        </svg>
        <p className="text-[13px] text-gray-400">
          Add before and after photos to generate a comparison
        </p>
      </div>
    );
  }

  // If we have a generated image, show result view
  if (generatedUrl) {
    return (
      <div className="space-y-3">
        {/* Preview */}
        <div className="overflow-hidden rounded-xl ring-1 ring-black/[0.06]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={generatedUrl}
            alt="Before and after comparison"
            className="w-full"
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-[14px] font-semibold text-white active:scale-[0.98] transition-all"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
              />
            </svg>
            Download
          </button>

          <button
            onClick={handleCopy}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-100 px-4 py-3 text-[14px] font-semibold text-gray-700 ring-1 ring-black/[0.04] active:scale-[0.98] transition-all"
          >
            {copied ? (
              <>
                <svg
                  className="h-4 w-4 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
                Copied
              </>
            ) : (
              <>
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                  />
                </svg>
                Copy
              </>
            )}
          </button>
        </div>

        {/* Regenerate */}
        <button
          onClick={handleRegenerate}
          className="w-full rounded-xl bg-gray-50 px-4 py-2.5 text-[13px] font-medium text-gray-500 ring-1 ring-black/[0.04] active:scale-[0.98] transition-all"
        >
          Choose Different Photos
        </button>

        {/* Hidden canvas */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

  // Selection UI
  return (
    <div className="space-y-4">
      {/* Before photo selection */}
      <div>
        <p className="mb-2 text-[12px] font-semibold text-gray-500">
          Select Before Photo
        </p>
        <div
          className={
            beforePhotos.length <= 3
              ? 'grid grid-cols-3 gap-2'
              : 'flex gap-2 overflow-x-auto pb-1 -mx-1 px-1'
          }
        >
          {beforePhotos.map((photo, i) => (
            <button
              key={photo.url}
              onClick={() => setSelectedBefore(i)}
              className={`relative aspect-square shrink-0 overflow-hidden rounded-xl transition-all active:scale-95 ${
                beforePhotos.length > 3 ? 'w-24' : ''
              } ${
                selectedBefore === i
                  ? 'ring-2 ring-brand-500 ring-offset-2'
                  : 'ring-1 ring-black/[0.06]'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt={photo.caption || 'Before photo'}
                className="h-full w-full object-cover"
              />
              {selectedBefore === i && (
                <div className="absolute inset-0 flex items-center justify-center bg-brand-500/20">
                  <svg
                    className="h-6 w-6 text-white drop-shadow-md"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12.75l6 6 9-13.5"
                    />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* After photo selection */}
      <div>
        <p className="mb-2 text-[12px] font-semibold text-gray-500">
          Select After Photo
        </p>
        <div
          className={
            afterPhotos.length <= 3
              ? 'grid grid-cols-3 gap-2'
              : 'flex gap-2 overflow-x-auto pb-1 -mx-1 px-1'
          }
        >
          {afterPhotos.map((photo, i) => (
            <button
              key={photo.url}
              onClick={() => setSelectedAfter(i)}
              className={`relative aspect-square shrink-0 overflow-hidden rounded-xl transition-all active:scale-95 ${
                afterPhotos.length > 3 ? 'w-24' : ''
              } ${
                selectedAfter === i
                  ? 'ring-2 ring-brand-500 ring-offset-2'
                  : 'ring-1 ring-black/[0.06]'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt={photo.caption || 'After photo'}
                className="h-full w-full object-cover"
              />
              {selectedAfter === i && (
                <div className="absolute inset-0 flex items-center justify-center bg-brand-500/20">
                  <svg
                    className="h-6 w-6 text-white drop-shadow-md"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12.75l6 6 9-13.5"
                    />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Generate button */}
      <button
        onClick={generate}
        disabled={selectedBefore < 0 || selectedAfter < 0 || isGenerating}
        className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-[15px] font-semibold transition-all active:scale-[0.98] ${
          selectedBefore >= 0 && selectedAfter >= 0
            ? 'bg-brand-600 text-white shadow-sm'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        {isGenerating ? (
          <>
            <svg
              className="h-4 w-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Generating...
          </>
        ) : (
          <>
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
              />
            </svg>
            Generate Comparison
          </>
        )}
      </button>

      {/* Hidden canvas for rendering */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

/** Helper: draw a rounded rectangle path */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
