import { useRef, useCallback, useEffect, useState } from 'react';
import type { CanvasElement, ResizeHandle, DragState, ResizeState } from '../types';
import CanvasElementRenderer from './CanvasElementRenderer';

interface EditorCanvasProps {
    elements: CanvasElement[];
    selectedId: string | null;
    editingTextId: string | null;
    bgColor: string;
    bgGradient: string;
    bgImage?: string;
    canvasWidth: number;
    canvasHeight: number;
    onSelect: (id: string | null) => void;
    onDoubleClick: (id: string) => void;
    onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
    onUpdateElementWithHistory: (id: string, updates: Partial<CanvasElement>) => void;
    onTextChange: (id: string, text: string) => void;
    onTextBlur: () => void;
    onPushHistory: () => void;
}

export function EditorCanvas({
    elements, selectedId, editingTextId, bgColor, bgGradient, bgImage,
    canvasWidth, canvasHeight, onSelect, onDoubleClick,
    onUpdateElement, onUpdateElementWithHistory,
    onTextChange, onTextBlur, onPushHistory,
}: EditorCanvasProps) {
    const canvasRef = useRef<HTMLDivElement>(null);
    const [dragState, setDragState] = useState<DragState | null>(null);
    const [resizeState, setResizeState] = useState<ResizeState | null>(null);
    const dragElementIdRef = useRef<string | null>(null);
    const hasMovedRef = useRef(false);

    const handleDragStart = useCallback((id: string, e: React.MouseEvent) => {
        if (editingTextId === id) return;
        const el = elements.find(el => el.id === id);
        if (!el) return;
        dragElementIdRef.current = id;
        hasMovedRef.current = false;
        setDragState({ isDragging: true, startX: e.clientX, startY: e.clientY, elementStartX: el.x, elementStartY: el.y });
    }, [elements, editingTextId]);

    const handleResizeStart = useCallback((id: string, handle: ResizeHandle, e: React.MouseEvent) => {
        const el = elements.find(el => el.id === id);
        if (!el) return;
        dragElementIdRef.current = id;
        hasMovedRef.current = false;
        setResizeState({ isResizing: true, handle, startX: e.clientX, startY: e.clientY, elementStartX: el.x, elementStartY: el.y, elementStartW: el.width, elementStartH: el.height });
    }, [elements]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (dragState?.isDragging && dragElementIdRef.current) {
                const dx = e.clientX - dragState.startX;
                const dy = e.clientY - dragState.startY;
                if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
                    if (!hasMovedRef.current) { hasMovedRef.current = true; onPushHistory(); }
                    onUpdateElement(dragElementIdRef.current, { x: Math.round(dragState.elementStartX + dx), y: Math.round(dragState.elementStartY + dy) });
                }
            }
            if (resizeState?.isResizing && dragElementIdRef.current) {
                const dx = e.clientX - resizeState.startX;
                const dy = e.clientY - resizeState.startY;
                if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
                    if (!hasMovedRef.current) { hasMovedRef.current = true; onPushHistory(); }
                    const h = resizeState.handle;
                    let newX = resizeState.elementStartX, newY = resizeState.elementStartY;
                    let newW = resizeState.elementStartW, newH = resizeState.elementStartH;
                    if (h.includes('e')) newW = Math.max(20, resizeState.elementStartW + dx);
                    if (h.includes('w')) { newW = Math.max(20, resizeState.elementStartW - dx); newX = resizeState.elementStartX + dx; }
                    if (h.includes('s')) newH = Math.max(10, resizeState.elementStartH + dy);
                    if (h.includes('n')) { newH = Math.max(10, resizeState.elementStartH - dy); newY = resizeState.elementStartY + dy; }
                    onUpdateElement(dragElementIdRef.current, { x: Math.round(newX), y: Math.round(newY), width: Math.round(newW), height: Math.round(newH) });
                }
            }
        };
        const handleMouseUp = () => { setDragState(null); setResizeState(null); dragElementIdRef.current = null; hasMovedRef.current = false; };
        if (dragState?.isDragging || resizeState?.isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
        }
    }, [dragState, resizeState, onUpdateElement, onPushHistory]);

    const handleCanvasClick = (e: React.MouseEvent) => { if (e.target === canvasRef.current) onSelect(null); };
    const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex);

    return (
        <div className="relative flex flex-col items-center">
            {/* Canvas with shadow */}
            <div
                ref={canvasRef}
                id="poster-canvas"
                className="relative overflow-hidden"
                style={{
                    width: canvasWidth,
                    height: canvasHeight,
                    background: bgGradient || bgColor,
                    borderRadius: 8,
                    cursor: dragState?.isDragging ? 'grabbing' : resizeState?.isResizing ? resizeState.handle + '-resize' : 'default',
                    boxShadow: '0 4px 40px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.08)',
                }}
                onMouseDown={handleCanvasClick}
            >
                {/* Background image */}
                {bgImage && (
                    <img
                        src={bgImage}
                        alt=""
                        style={{
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            pointerEvents: 'none',
                            zIndex: 0,
                        }}
                    />
                )}
                {sortedElements.map(el => (
                    <CanvasElementRenderer
                        key={el.id}
                        element={el}
                        isSelected={el.id === selectedId}
                        isEditing={el.id === editingTextId}
                        onSelect={onSelect}
                        onDoubleClick={onDoubleClick}
                        onDragStart={handleDragStart}
                        onResizeStart={handleResizeStart}
                        onTextChange={onTextChange}
                        onTextBlur={onTextBlur}
                    />
                ))}
            </div>

            {/* Canvas size label */}
            <div className="mt-3 text-[10px] text-slate-400 font-medium tracking-wide">{canvasWidth} × {canvasHeight} px</div>
        </div>
    );
}

export default EditorCanvas;
