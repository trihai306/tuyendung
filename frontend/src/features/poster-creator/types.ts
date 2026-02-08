// ===== Canvas Element Types =====

export type ElementType = 'text' | 'shape' | 'image';
export type ShapeKind = 'rect' | 'circle' | 'line';
export type TextAlign = 'left' | 'center' | 'right';
export type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';
export type EditorTool = 'select' | 'text' | 'shape' | 'image';

// Base element all canvas objects share
export interface BaseElement {
    id: string;
    type: ElementType;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    zIndex: number;
    opacity: number;
    locked: boolean;
}

export interface TextElement extends BaseElement {
    type: 'text';
    text: string;
    fontSize: number;
    fontWeight: number;
    fontFamily: string;
    color: string;
    align: TextAlign;
    lineHeight: number;
    bgColor: string;
    padding: number;
    borderRadius: number;
    letterSpacing: number;
    textShadow?: string;       // CSS text-shadow
    textTransform?: string;    // uppercase, capitalize, none
}

export interface ShapeElement extends BaseElement {
    type: 'shape';
    shape: ShapeKind;
    fill: string;
    stroke: string;
    strokeWidth: number;
    borderRadius: number;
}

export interface ImageElement extends BaseElement {
    type: 'image';
    src: string;
    objectFit: 'cover' | 'contain' | 'fill';
    borderRadius: number;
}

export type CanvasElement = TextElement | ShapeElement | ImageElement;

// ===== Editor State =====

export interface CanvasState {
    width: number;
    height: number;
    bgColor: string;
    bgGradient: string; // CSS gradient string or empty
    bgImage?: string;   // Background image URL
    elements: CanvasElement[];
    selectedId: string | null;
}

// ===== Templates =====

export interface DesignTemplate {
    id: string;
    name: string;
    description: string;
    bgColor: string;
    bgGradient: string;
    bgImage?: string;
    elements: CanvasElement[];
}

// ===== Drag/Resize State =====

export interface DragState {
    isDragging: boolean;
    startX: number;
    startY: number;
    elementStartX: number;
    elementStartY: number;
}

export interface ResizeState {
    isResizing: boolean;
    handle: ResizeHandle;
    startX: number;
    startY: number;
    elementStartX: number;
    elementStartY: number;
    elementStartW: number;
    elementStartH: number;
}

// ===== Helpers =====

let _idCounter = 0;
export function generateId(): string {
    return `el_${Date.now()}_${_idCounter++}`;
}

export function createTextElement(overrides: Partial<TextElement> = {}): TextElement {
    return {
        id: generateId(),
        type: 'text',
        x: 40,
        y: 100,
        width: 360,
        height: 60,
        rotation: 0,
        zIndex: 0,
        opacity: 1,
        locked: false,
        text: 'Văn bản mới',
        fontSize: 24,
        fontWeight: 700,
        fontFamily: 'Inter, sans-serif',
        color: '#ffffff',
        align: 'left',
        lineHeight: 1.3,
        bgColor: 'transparent',
        padding: 0,
        borderRadius: 0,
        letterSpacing: 0,
        textShadow: undefined,
        textTransform: undefined,
        ...overrides,
    };
}

export function createShapeElement(overrides: Partial<ShapeElement> = {}): ShapeElement {
    return {
        id: generateId(),
        type: 'shape',
        x: 40,
        y: 200,
        width: 120,
        height: 120,
        rotation: 0,
        zIndex: 0,
        opacity: 1,
        locked: false,
        shape: 'rect',
        fill: '#6366F1',
        stroke: 'transparent',
        strokeWidth: 0,
        borderRadius: 12,
        ...overrides,
    };
}

export function createImageElement(src: string, overrides: Partial<ImageElement> = {}): ImageElement {
    return {
        id: generateId(),
        type: 'image',
        x: 40,
        y: 200,
        width: 200,
        height: 200,
        rotation: 0,
        zIndex: 0,
        opacity: 1,
        locked: false,
        src,
        objectFit: 'cover',
        borderRadius: 12,
        ...overrides,
    };
}
