
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Point, Path, SyncMessage } from '../types';
import { COLORS, SYNC_CHANNEL_NAME } from '../constants';
import { Image as ImageIcon, Trash2, Undo2 } from 'lucide-react';

interface DrawingCanvasProps {
  isReadOnly?: boolean;
  initialPaths?: Path[];
  onPathsChange?: (paths: Path[]) => void;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ 
  isReadOnly = false, 
  initialPaths = [],
  onPathsChange 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [paths, setPaths] = useState<Path[]>(initialPaths);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState(COLORS[0]);
  const [lineWidth, setLineWidth] = useState(3);
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
  const [bgImageData, setBgImageData] = useState<string | null>(null);
  const syncChannel = useRef<BroadcastChannel | null>(null);

  // Initialize BroadcastChannel
  useEffect(() => {
    syncChannel.current = new BroadcastChannel(SYNC_CHANNEL_NAME);
    
    const handleMessage = (event: MessageEvent<SyncMessage>) => {
      if (isReadOnly) {
        if (event.data.type === 'DRAW') {
          setPaths(event.data.payload);
        } else if (event.data.type === 'CLEAR') {
          setPaths([]);
          setBgImageData(null);
          setBackgroundImage(null);
        } else if (event.data.type === 'UNDO') {
          setPaths(event.data.payload);
        } else if (event.data.type === 'SET_IMAGE') {
          setBgImageData(event.data.payload);
        }
      }
    };

    syncChannel.current.onmessage = handleMessage;
    return () => syncChannel.current?.close();
  }, [isReadOnly]);

  // Load background image when data changes
  useEffect(() => {
    if (bgImageData) {
      const img = new Image();
      img.onload = () => {
        setBackgroundImage(img);
      };
      img.src = bgImageData;
    } else {
      setBackgroundImage(null);
    }
  }, [bgImageData]);

  // Redraw canvas whenever paths or background image change
  const drawPaths = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background image if exists
    if (backgroundImage) {
      const hRatio = canvas.width / backgroundImage.width;
      const vRatio = canvas.height / backgroundImage.height;
      const ratio = Math.min(hRatio, vRatio);
      const centerShiftX = (canvas.width - backgroundImage.width * ratio) / 2;
      const centerShiftY = (canvas.height - backgroundImage.height * ratio) / 2;
      ctx.drawImage(backgroundImage, 0, 0, backgroundImage.width, backgroundImage.height,
        centerShiftX, centerShiftY, backgroundImage.width * ratio, backgroundImage.height * ratio);
    }

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    paths.forEach(path => {
      if (path.points.length === 0) return;
      ctx.beginPath();
      ctx.strokeStyle = path.color;
      ctx.lineWidth = path.width;
      ctx.moveTo(path.points[0].x, path.points[0].y);
      path.points.forEach(point => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
    });
  }, [paths, backgroundImage]);

  useEffect(() => {
    drawPaths();
    onPathsChange?.(paths);
  }, [paths, drawPaths, onPathsChange]);

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (isReadOnly) return;
    setIsDrawing(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    setPaths(prev => [...prev, { points: [{ x, y }], color: currentColor, width: lineWidth }]);
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || isReadOnly) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    setPaths(prev => {
      const newPaths = [...prev];
      const lastPath = newPaths[newPaths.length - 1];
      if (lastPath) {
        lastPath.points.push({ x, y });
      }
      
      // Sync with parent
      syncChannel.current?.postMessage({ type: 'DRAW', payload: newPaths });
      
      return newPaths;
    });
  };

  const handleEnd = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    setPaths([]);
    setBgImageData(null);
    setBackgroundImage(null);
    syncChannel.current?.postMessage({ type: 'CLEAR', payload: null });
  };

  const undo = () => {
    setPaths(prev => {
      const newPaths = prev.slice(0, -1);
      syncChannel.current?.postMessage({ type: 'UNDO', payload: newPaths });
      return newPaths;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setBgImageData(dataUrl);
        syncChannel.current?.postMessage({ type: 'SET_IMAGE', payload: dataUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-inner border border-slate-200 overflow-hidden">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />
      {!isReadOnly && (
        <div className="bg-slate-50 border-b border-slate-200 p-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2">
            {COLORS.map(color => (
              <button
                key={color}
                onClick={() => setCurrentColor(color)}
                className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${currentColor === color ? 'border-indigo-600 scale-110' : 'border-transparent'}`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div className="flex gap-2 items-center">
            <input 
              type="range" 
              min="1" 
              max="15" 
              value={lineWidth} 
              onChange={(e) => setLineWidth(Number(e.target.value))}
              className="w-24 accent-indigo-600"
            />
            <div className="h-6 w-[1px] bg-slate-200 mx-2" />
            <button 
              onClick={() => fileInputRef.current?.click()} 
              title="Upload Worksheet"
              className="p-2 bg-white border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors flex items-center gap-2"
            >
              <ImageIcon size={18} />
              <span className="text-xs font-medium hidden sm:inline">Image</span>
            </button>
            <button 
              onClick={undo} 
              title="Undo"
              className="p-2 bg-white border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Undo2 size={18} />
            </button>
            <button 
              onClick={clearCanvas} 
              title="Clear All"
              className="p-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      )}
      <div className="flex-1 relative canvas-container cursor-crosshair overflow-hidden">
        <canvas
          ref={canvasRef}
          width={1200}
          height={900}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
          className="w-full h-full object-contain"
        />
        {isReadOnly && !bgImageData && paths.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400 font-medium">
            Waiting for live input from student...
          </div>
        )}
      </div>
    </div>
  );
};

export default DrawingCanvas;
