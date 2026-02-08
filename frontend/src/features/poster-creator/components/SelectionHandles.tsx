import type { ResizeHandle } from '../types';

interface SelectionHandlesProps {
    width: number;
    height: number;
    onResizeStart: (handle: ResizeHandle, e: React.MouseEvent) => void;
}

const HANDLE_SIZE = 9;

const handlePositions: { handle: ResizeHandle; x: string; y: string; cursor: string }[] = [
    { handle: 'nw', x: '0%', y: '0%', cursor: 'nw-resize' },
    { handle: 'n', x: '50%', y: '0%', cursor: 'n-resize' },
    { handle: 'ne', x: '100%', y: '0%', cursor: 'ne-resize' },
    { handle: 'e', x: '100%', y: '50%', cursor: 'e-resize' },
    { handle: 'se', x: '100%', y: '100%', cursor: 'se-resize' },
    { handle: 's', x: '50%', y: '100%', cursor: 's-resize' },
    { handle: 'sw', x: '0%', y: '100%', cursor: 'sw-resize' },
    { handle: 'w', x: '0%', y: '50%', cursor: 'w-resize' },
];

export function SelectionHandles({ onResizeStart }: SelectionHandlesProps) {
    return (
        <>
            {/* Selection border */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    border: '1.5px solid #10b981',
                    borderRadius: 2,
                    boxShadow: '0 0 0 1px rgba(16,185,129,0.15), inset 0 0 0 1px rgba(16,185,129,0.08)',
                }}
            />

            {/* Resize handles */}
            {handlePositions.map(({ handle, x, y, cursor }) => (
                <div
                    key={handle}
                    className="absolute transition-transform hover:scale-125"
                    style={{
                        left: x,
                        top: y,
                        width: HANDLE_SIZE,
                        height: HANDLE_SIZE,
                        marginLeft: -HANDLE_SIZE / 2,
                        marginTop: -HANDLE_SIZE / 2,
                        backgroundColor: '#10b981',
                        border: '2px solid #fff',
                        borderRadius: 3,
                        cursor,
                        zIndex: 9999,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2), 0 0 6px rgba(16,185,129,0.2)',
                    }}
                    onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        onResizeStart(handle, e);
                    }}
                />
            ))}
        </>
    );
}

export default SelectionHandles;
