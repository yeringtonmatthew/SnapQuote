'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

interface SignaturePadProps {
  onChange: (dataUrl: string | null) => void;
  onTypedName?: (name: string) => void;
}

export function SignaturePad({ onChange, onTypedName }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const isDrawingRef = useRef(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const isEmptyRef = useRef(true);
  const [typedName, setTypedName] = useState('');
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const getPos = (e: MouseEvent | Touch, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = useCallback((x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    isDrawingRef.current = true;
    lastPos.current = { x, y };
    ctx.beginPath();
    ctx.arc(x, y, 1, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  const draw = useCallback((x: number, y: number) => {
    if (!isDrawingRef.current || !lastPos.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    lastPos.current = { x, y };

    if (isEmptyRef.current) {
      setIsEmpty(false);
      isEmptyRef.current = false;
    }
  }, []);

  const stopDrawing = useCallback(() => {
    if (isDrawingRef.current) {
      const canvas = canvasRef.current;
      if (canvas) {
        onChangeRef.current(canvas.toDataURL('image/png'));
      }
    }
    setIsDrawing(false);
    isDrawingRef.current = false;
    lastPos.current = null;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.strokeStyle = '#1c1c1e';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.fillStyle = '#1c1c1e';

    // Mouse events
    const onMouseDown = (e: MouseEvent) => {
      const pos = getPos(e, canvas);
      startDrawing(pos.x / dpr, pos.y / dpr);
    };
    const onMouseMove = (e: MouseEvent) => {
      const pos = getPos(e, canvas);
      draw(pos.x / dpr, pos.y / dpr);
    };
    const onMouseUp = () => stopDrawing();

    // Touch events
    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const pos = getPos(e.touches[0], canvas);
      startDrawing(pos.x / dpr, pos.y / dpr);
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const pos = getPos(e.touches[0], canvas);
      draw(pos.x / dpr, pos.y / dpr);
    };
    const onTouchEnd = () => stopDrawing();

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mouseleave', onMouseUp);
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);

    return () => {
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('mouseleave', onMouseUp);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function clear() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
    onChange(null);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold text-gray-700" id="signature-label">Signature</span>
        {!isEmpty && (
          <button
            type="button"
            onClick={clear}
            className="text-[12px] text-brand-600 font-medium focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 rounded"
          >
            Clear
          </button>
        )}
      </div>
      <div className="relative rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 overflow-hidden">
        <canvas
          ref={canvasRef}
          aria-label="Draw your signature here"
          aria-describedby="signature-label"
          role="img"
          className="h-32 w-full touch-none cursor-crosshair"
          style={{ display: 'block' }}
        />
        {isEmpty && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1">
            <svg className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
            </svg>
            <p className="text-[12px] text-gray-400">Draw your signature here</p>
          </div>
        )}
        {/* Signature baseline */}
        <div className="pointer-events-none absolute bottom-8 left-8 right-8 border-b border-gray-200" />
      </div>
      {/* Keyboard-accessible alternative */}
      <div>
        <label htmlFor="typed-signature" className="text-[12px] text-gray-500">
          Or type your name to sign
        </label>
        <input
          id="typed-signature"
          type="text"
          value={typedName}
          onChange={(e) => {
            setTypedName(e.target.value);
            onTypedName?.(e.target.value);
          }}
          placeholder="Type your full name"
          className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm placeholder:text-gray-500 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>
    </div>
  );
}
