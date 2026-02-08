import { useState, useRef, useEffect } from 'react';
import type { CanvasElement, TextElement, ResizeHandle } from '../types';
import SelectionHandles from './SelectionHandles';

interface CanvasElementRendererProps {
    element: CanvasElement;
    isSelected: boolean;
    isEditing: boolean;
    onSelect: (id: string) => void;
    onDoubleClick: (id: string) => void;
    onDragStart: (id: string, e: React.MouseEvent) => void;
    onResizeStart: (id: string, handle: ResizeHandle, e: React.MouseEvent) => void;
    onTextChange: (id: string, text: string) => void;
    onTextBlur: () => void;
}

export function CanvasElementRenderer({
    element,
    isSelected,
    isEditing,
    onSelect,
    onDoubleClick,
    onDragStart,
    onResizeStart,
    onTextChange,
    onTextBlur,
}: CanvasElementRendererProps) {
    const el = element;
    const editRef = useRef<HTMLDivElement>(null);
    const [localText, setLocalText] = useState('');

    useEffect(() => {
        if (isEditing && el.type === 'text') {
            setLocalText((el as TextElement).text);
            setTimeout(() => {
                if (editRef.current) {
                    editRef.current.focus();
                    // Select all text
                    const range = document.createRange();
                    range.selectNodeContents(editRef.current);
                    const sel = window.getSelection();
                    sel?.removeAllRanges();
                    sel?.addRange(range);
                }
            }, 10);
        }
    }, [isEditing, el]);

    const containerStyle: React.CSSProperties = {
        position: 'absolute',
        left: el.x,
        top: el.y,
        width: el.width,
        height: el.height,
        opacity: el.opacity,
        transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
        zIndex: el.zIndex,
        cursor: el.locked ? 'default' : (isSelected ? 'move' : 'pointer'),
        userSelect: 'none',
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (el.locked) return;
        e.stopPropagation();
        onSelect(el.id);
        if (!isEditing) {
            onDragStart(el.id, e);
        }
    };

    const handleDoubleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (el.type === 'text') {
            onDoubleClick(el.id);
        }
    };

    const handleResizeStart = (handle: ResizeHandle, e: React.MouseEvent) => {
        onResizeStart(el.id, handle, e);
    };

    // Render based on type
    const renderContent = () => {
        switch (el.type) {
            case 'text': {
                const t = el as TextElement;
                if (isEditing) {
                    return (
                        <div
                            ref={editRef}
                            contentEditable
                            suppressContentEditableWarning
                            className="outline-none w-full h-full"
                            style={{
                                fontSize: t.fontSize,
                                fontWeight: t.fontWeight,
                                fontFamily: t.fontFamily,
                                color: t.color,
                                textAlign: t.align,
                                lineHeight: t.lineHeight,
                                letterSpacing: t.letterSpacing,
                                backgroundColor: t.bgColor,
                                padding: t.padding,
                                borderRadius: t.borderRadius,
                                textShadow: t.textShadow || undefined,
                                textTransform: (t.textTransform as React.CSSProperties['textTransform']) || undefined,
                                wordBreak: 'break-word',
                                whiteSpace: 'pre-wrap',
                                cursor: 'text',
                            }}
                            onInput={(e) => {
                                const text = (e.target as HTMLDivElement).innerText;
                                setLocalText(text);
                            }}
                            onBlur={() => {
                                onTextChange(el.id, localText);
                                onTextBlur();
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Escape') {
                                    onTextChange(el.id, localText);
                                    onTextBlur();
                                }
                                e.stopPropagation(); // Don't trigger delete
                            }}
                            onMouseDown={(e) => e.stopPropagation()} // Don't trigger drag
                        >
                            {t.text}
                        </div>
                    );
                }
                return (
                    <div
                        className="w-full h-full overflow-hidden"
                        style={{
                            fontSize: t.fontSize,
                            fontWeight: t.fontWeight,
                            fontFamily: t.fontFamily,
                            color: t.color,
                            textAlign: t.align,
                            lineHeight: t.lineHeight,
                            letterSpacing: t.letterSpacing,
                            backgroundColor: t.bgColor,
                            padding: t.padding,
                            borderRadius: t.borderRadius,
                            textShadow: t.textShadow || undefined,
                            textTransform: (t.textTransform as React.CSSProperties['textTransform']) || undefined,
                            wordBreak: 'break-word',
                            whiteSpace: 'pre-wrap',
                        }}
                    >
                        {t.text}
                    </div>
                );
            }

            case 'shape': {
                const s = el;
                if (s.shape === 'circle') {
                    return (
                        <div
                            className="w-full h-full"
                            style={{
                                borderRadius: '50%',
                                background: s.fill,
                                border: s.strokeWidth ? `${s.strokeWidth}px solid ${s.stroke}` : undefined,
                            }}
                        />
                    );
                }
                if (s.shape === 'line') {
                    return (
                        <div
                            className="w-full"
                            style={{
                                height: Math.max(s.strokeWidth || 2, 1),
                                marginTop: (el.height - (s.strokeWidth || 2)) / 2,
                                background: s.fill || s.stroke,
                                borderRadius: s.borderRadius,
                            }}
                        />
                    );
                }
                // rect
                return (
                    <div
                        className="w-full h-full"
                        style={{
                            background: s.fill,
                            border: s.strokeWidth ? `${s.strokeWidth}px solid ${s.stroke}` : undefined,
                            borderRadius: s.borderRadius,
                        }}
                    />
                );
            }

            case 'image': {
                const img = el;
                return (
                    <img
                        src={img.src}
                        alt=""
                        className="w-full h-full pointer-events-none"
                        style={{
                            objectFit: img.objectFit,
                            borderRadius: img.borderRadius,
                        }}
                        draggable={false}
                    />
                );
            }

            default:
                return null;
        }
    };

    return (
        <div
            style={containerStyle}
            onMouseDown={handleMouseDown}
            onDoubleClick={handleDoubleClick}
        >
            {renderContent()}
            {isSelected && !el.locked && (
                <SelectionHandles
                    width={el.width}
                    height={el.height}
                    onResizeStart={handleResizeStart}
                />
            )}
        </div>
    );
}

export default CanvasElementRenderer;
