'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

type Tool = 'pen' | 'arrow' | 'text';

interface Annotation {
  type: 'pen' | 'arrow' | 'text';
  // pen: array of {x,y} points
  // arrow: {startX, startY, endX, endY}
  // text: {x, y, text}
  data: any;
}

interface PhotoAnnotatorProps {
  imageUrl: string;
  onDone: (dataUrl: string) => void;
  onCancel: () => void;
}

export default function PhotoAnnotator({ imageUrl, onDone, onCancel }: PhotoAnnotatorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const [tool, setTool] = useState<Tool>('pen');
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);
  const [arrowStart, setArrowStart] = useState<{ x: number; y: number } | null>(null);
  const [arrowPreview, setArrowPreview] = useState<{ x: number; y: number } | null>(null);
  const [textInput, setTextInput] = useState<{ x: number; y: number; value: string } | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // Load image and set up canvas sizing
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Resize canvas to fit container while maintaining aspect ratio
  const updateCanvasSize = useCallback(() => {
    if (!imageRef.current || !containerRef.current) return;
    const container = containerRef.current;
    const img = imageRef.current;

    const maxW = container.clientWidth;
    const maxH = container.clientHeight;
    const imgRatio = img.width / img.height;
    const containerRatio = maxW / maxH;

    let w: number, h: number;
    if (imgRatio > containerRatio) {
      w = maxW;
      h = maxW / imgRatio;
    } else {
      h = maxH;
      w = maxH * imgRatio;
    }

    setCanvasSize({ width: Math.round(w), height: Math.round(h) });
  }, []);

  useEffect(() => {
    if (imageLoaded) updateCanvasSize();
  }, [imageLoaded, updateCanvasSize]);

  useEffect(() => {
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [updateCanvasSize]);

  // Redraw everything whenever annotations change or canvas resizes
  useEffect(() => {
    redraw();
  }, [annotations, canvasSize, imageLoaded]);

  function getCanvasPoint(e: React.MouseEvent | React.TouchEvent): { x: number; y: number } {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    let clientX: number, clientY: number;
    if ('touches' in e) {
      clientX = e.touches[0]?.clientX ?? e.changedTouches[0]?.clientX ?? 0;
      clientY = e.touches[0]?.clientY ?? e.changedTouches[0]?.clientY ?? 0;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }

  function redraw(ctx?: CanvasRenderingContext2D) {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;
    const context = ctx || canvas.getContext('2d');
    if (!context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(img, 0, 0, canvas.width, canvas.height);

    for (const ann of annotations) {
      drawAnnotation(context, ann);
    }
  }

  function drawAnnotation(ctx: CanvasRenderingContext2D, ann: Annotation) {
    ctx.strokeStyle = '#ef4444';
    ctx.fillStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (ann.type === 'pen') {
      const points = ann.data as { x: number; y: number }[];
      if (points.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();
    } else if (ann.type === 'arrow') {
      const { startX, startY, endX, endY } = ann.data;
      drawArrow(ctx, startX, startY, endX, endY);
    } else if (ann.type === 'text') {
      const { x, y, text } = ann.data;
      const fontSize = Math.max(16, canvasSize.width * 0.04);
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.fillStyle = '#ef4444';
      // Draw text shadow/outline for readability
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.strokeText(text, x, y);
      ctx.fillText(text, x, y);
      // Reset
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
    }
  }

  function drawArrow(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
    const headLen = 15;
    const angle = Math.atan2(y2 - y1, x2 - x1);

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Arrowhead
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
  }

  // --- Pen handlers ---
  function handlePointerDown(e: React.MouseEvent | React.TouchEvent) {
    if (textInput) return; // don't start drawing while text input is open
    const pt = getCanvasPoint(e);

    if (tool === 'pen') {
      setIsDrawing(true);
      setCurrentPath([pt]);
    } else if (tool === 'arrow') {
      setArrowStart(pt);
      setArrowPreview(null);
    } else if (tool === 'text') {
      setTextInput({ x: pt.x, y: pt.y, value: '' });
    }
  }

  function handlePointerMove(e: React.MouseEvent | React.TouchEvent) {
    if (tool === 'pen' && isDrawing) {
      e.preventDefault();
      const pt = getCanvasPoint(e);
      setCurrentPath((prev) => {
        const next = [...prev, pt];
        // Live draw on canvas
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx && next.length >= 2) {
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.beginPath();
            ctx.moveTo(next[next.length - 2].x, next[next.length - 2].y);
            ctx.lineTo(pt.x, pt.y);
            ctx.stroke();
          }
        }
        return next;
      });
    } else if (tool === 'arrow' && arrowStart) {
      e.preventDefault();
      const pt = getCanvasPoint(e);
      setArrowPreview(pt);
      // Live preview arrow
      redraw();
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.strokeStyle = '#ef4444';
          ctx.fillStyle = '#ef4444';
          ctx.lineWidth = 3;
          drawArrow(ctx, arrowStart.x, arrowStart.y, pt.x, pt.y);
        }
      }
    }
  }

  function handlePointerUp(e: React.MouseEvent | React.TouchEvent) {
    if (tool === 'pen' && isDrawing) {
      setIsDrawing(false);
      if (currentPath.length >= 2) {
        setAnnotations((prev) => [...prev, { type: 'pen', data: currentPath }]);
      }
      setCurrentPath([]);
    } else if (tool === 'arrow' && arrowStart) {
      const pt = getCanvasPoint(e);
      const dx = pt.x - arrowStart.x;
      const dy = pt.y - arrowStart.y;
      if (Math.sqrt(dx * dx + dy * dy) > 10) {
        setAnnotations((prev) => [
          ...prev,
          { type: 'arrow', data: { startX: arrowStart.x, startY: arrowStart.y, endX: pt.x, endY: pt.y } },
        ]);
      }
      setArrowStart(null);
      setArrowPreview(null);
    }
  }

  function handleTextSubmit() {
    if (!textInput || !textInput.value.trim()) {
      setTextInput(null);
      return;
    }
    setAnnotations((prev) => [
      ...prev,
      { type: 'text', data: { x: textInput.x, y: textInput.y, text: textInput.value.trim() } },
    ]);
    setTextInput(null);
  }

  function handleUndo() {
    setAnnotations((prev) => prev.slice(0, -1));
  }

  function handleDone() {
    // Composite at full image resolution
    const img = imageRef.current;
    if (!img) return;

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = img.width;
    exportCanvas.height = img.height;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(img, 0, 0, img.width, img.height);

    // Scale factor from display canvas to full image
    const scaleX = img.width / canvasSize.width;
    const scaleY = img.height / canvasSize.height;

    ctx.strokeStyle = '#ef4444';
    ctx.fillStyle = '#ef4444';
    ctx.lineWidth = 3 * scaleX;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (const ann of annotations) {
      if (ann.type === 'pen') {
        const points = ann.data as { x: number; y: number }[];
        if (points.length < 2) continue;
        ctx.beginPath();
        ctx.moveTo(points[0].x * scaleX, points[0].y * scaleY);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x * scaleX, points[i].y * scaleY);
        }
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3 * scaleX;
        ctx.stroke();
      } else if (ann.type === 'arrow') {
        const { startX, startY, endX, endY } = ann.data;
        ctx.strokeStyle = '#ef4444';
        ctx.fillStyle = '#ef4444';
        ctx.lineWidth = 3 * scaleX;
        const headLen = 15 * scaleX;
        const angle = Math.atan2(endY * scaleY - startY * scaleY, endX * scaleX - startX * scaleX);

        ctx.beginPath();
        ctx.moveTo(startX * scaleX, startY * scaleY);
        ctx.lineTo(endX * scaleX, endY * scaleY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(endX * scaleX, endY * scaleY);
        ctx.lineTo(endX * scaleX - headLen * Math.cos(angle - Math.PI / 6), endY * scaleY - headLen * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(endX * scaleX - headLen * Math.cos(angle + Math.PI / 6), endY * scaleY - headLen * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();
      } else if (ann.type === 'text') {
        const { x, y, text } = ann.data;
        const fontSize = Math.max(16, img.width * 0.04);
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.fillStyle = '#ef4444';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3 * scaleX;
        ctx.strokeText(text, x * scaleX, y * scaleY);
        ctx.fillText(text, x * scaleX, y * scaleY);
      }
    }

    const dataUrl = exportCanvas.toDataURL('image/jpeg', 0.85);
    onDone(dataUrl);
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Canvas area */}
      <div ref={containerRef} className="flex flex-1 items-center justify-center overflow-hidden p-2">
        {canvasSize.width > 0 && (
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={canvasSize.width}
              height={canvasSize.height}
              className="touch-none rounded"
              style={{ width: canvasSize.width, height: canvasSize.height }}
              onMouseDown={handlePointerDown}
              onMouseMove={handlePointerMove}
              onMouseUp={handlePointerUp}
              onMouseLeave={handlePointerUp}
              onTouchStart={handlePointerDown}
              onTouchMove={handlePointerMove}
              onTouchEnd={handlePointerUp}
            />
            {/* Floating text input */}
            {textInput && (
              <div
                className="absolute"
                style={{ left: textInput.x, top: textInput.y - 36 }}
              >
                <form
                  onSubmit={(e) => { e.preventDefault(); handleTextSubmit(); }}
                  className="flex items-center gap-1"
                >
                  <input
                    autoFocus
                    type="text"
                    value={textInput.value}
                    onChange={(e) => setTextInput({ ...textInput, value: e.target.value })}
                    onBlur={handleTextSubmit}
                    placeholder="Type label..."
                    className="w-40 rounded-lg border border-red-400 bg-black/80 px-2 py-1 text-sm text-white placeholder-gray-400 outline-none focus:ring-1 focus:ring-red-400"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-red-500 px-2 py-1 text-xs font-medium text-white"
                  >
                    OK
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
        {!imageLoaded && (
          <div className="flex items-center gap-2 text-white/60">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
            Loading image...
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="safe-area-bottom flex items-center justify-center gap-2 bg-gray-900/95 px-4 py-3 backdrop-blur">
        <button
          onClick={() => setTool('pen')}
          className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors ${
            tool === 'pen' ? 'bg-red-500 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
          aria-label="Pen tool"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
          </svg>
        </button>

        <button
          onClick={() => setTool('arrow')}
          className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors ${
            tool === 'arrow' ? 'bg-red-500 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
          aria-label="Arrow tool"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
          </svg>
        </button>

        <button
          onClick={() => setTool('text')}
          className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors ${
            tool === 'text' ? 'bg-red-500 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
          aria-label="Text tool"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M5 5h14v3h-2V7H13v10h2v2H9v-2h2V7H7v1H5V5z" />
          </svg>
        </button>

        <div className="mx-1 h-6 w-px bg-gray-700" />

        <button
          onClick={handleUndo}
          disabled={annotations.length === 0}
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-800 text-gray-300 transition-colors hover:bg-gray-700 disabled:opacity-30"
          aria-label="Undo"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
          </svg>
        </button>

        <div className="mx-1 h-6 w-px bg-gray-700" />

        <button
          onClick={onCancel}
          className="flex h-11 items-center justify-center rounded-xl bg-gray-800 px-4 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-700"
        >
          Cancel
        </button>

        <button
          onClick={handleDone}
          className="flex h-11 items-center justify-center rounded-xl bg-red-500 px-4 text-sm font-bold text-white transition-colors hover:bg-red-600"
        >
          Done
        </button>
      </div>
    </div>
  );
}
