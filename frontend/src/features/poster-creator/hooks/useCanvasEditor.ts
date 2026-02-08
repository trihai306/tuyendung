import { useState, useCallback, useRef } from 'react';
import type { CanvasElement, TextElement, ShapeElement, ImageElement, CanvasState } from '../types';
import { createTextElement, createShapeElement, createImageElement, generateId } from '../types';
import type { DesignTemplate } from '../types';
import { designTemplates } from '../templates/templateData';

const CANVAS_W = 440;
const CANVAS_H = 620;

// Deep clone elements to avoid mutation
function cloneElements(elements: CanvasElement[]): CanvasElement[] {
    return JSON.parse(JSON.stringify(elements));
}

export function useCanvasEditor() {
    // Canvas state
    const [elements, setElements] = useState<CanvasElement[]>(() => {
        // Load first template by default
        const t = designTemplates[0];
        return cloneElements(t.elements).map((el, i) => ({ ...el, id: generateId(), zIndex: i }));
    });
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [bgColor, setBgColor] = useState(designTemplates[0].bgColor);
    const [bgGradient, setBgGradient] = useState(designTemplates[0].bgGradient);
    const [bgImage, setBgImage] = useState<string | undefined>(undefined);
    const [editingTextId, setEditingTextId] = useState<string | null>(null);

    // Undo/redo
    const historyRef = useRef<CanvasState[]>([]);
    const historyIndexRef = useRef(-1);

    const pushHistory = useCallback(() => {
        const state: CanvasState = {
            width: CANVAS_W,
            height: CANVAS_H,
            bgColor,
            bgGradient,
            bgImage,
            elements: cloneElements(elements),
            selectedId,
        };
        historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
        historyRef.current.push(state);
        historyIndexRef.current = historyRef.current.length - 1;
        // Keep max 30 history
        if (historyRef.current.length > 30) {
            historyRef.current.shift();
            historyIndexRef.current--;
        }
    }, [elements, bgColor, bgGradient, bgImage, selectedId]);

    const undo = useCallback(() => {
        if (historyIndexRef.current > 0) {
            historyIndexRef.current--;
            const s = historyRef.current[historyIndexRef.current];
            setElements(cloneElements(s.elements));
            setBgColor(s.bgColor);
            setBgGradient(s.bgGradient);
            setBgImage(s.bgImage);
        }
    }, []);

    const redo = useCallback(() => {
        if (historyIndexRef.current < historyRef.current.length - 1) {
            historyIndexRef.current++;
            const s = historyRef.current[historyIndexRef.current];
            setElements(cloneElements(s.elements));
            setBgColor(s.bgColor);
            setBgGradient(s.bgGradient);
            setBgImage(s.bgImage);
        }
    }, []);

    // Get max zIndex
    const nextZIndex = useCallback(() => {
        return elements.length > 0 ? Math.max(...elements.map(e => e.zIndex)) + 1 : 1;
    }, [elements]);

    // Get selected element
    const selectedElement = elements.find(e => e.id === selectedId) || null;

    // ===== Element CRUD =====

    const addElement = useCallback((el: CanvasElement) => {
        pushHistory();
        setElements(prev => [...prev, { ...el, zIndex: nextZIndex() }]);
        setSelectedId(el.id);
    }, [nextZIndex, pushHistory]);

    const addText = useCallback((overrides: Partial<TextElement> = {}) => {
        const el = createTextElement({ ...overrides, zIndex: nextZIndex() });
        pushHistory();
        setElements(prev => [...prev, el]);
        setSelectedId(el.id);
    }, [nextZIndex, pushHistory]);

    const addShape = useCallback((shape: ShapeElement['shape'] = 'rect', overrides: Partial<ShapeElement> = {}) => {
        const el = createShapeElement({ shape, ...overrides, zIndex: nextZIndex() });
        pushHistory();
        setElements(prev => [...prev, el]);
        setSelectedId(el.id);
    }, [nextZIndex, pushHistory]);

    const addImage = useCallback((src: string, overrides: Partial<ImageElement> = {}) => {
        const el = createImageElement(src, { ...overrides, zIndex: nextZIndex() });
        pushHistory();
        setElements(prev => [...prev, el]);
        setSelectedId(el.id);
    }, [nextZIndex, pushHistory]);

    const updateElement = useCallback((id: string, updates: Partial<CanvasElement>) => {
        setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } as CanvasElement : el));
    }, []);

    const updateElementWithHistory = useCallback((id: string, updates: Partial<CanvasElement>) => {
        pushHistory();
        setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } as CanvasElement : el));
    }, [pushHistory]);

    const deleteElement = useCallback((id: string) => {
        pushHistory();
        setElements(prev => prev.filter(el => el.id !== id));
        if (selectedId === id) setSelectedId(null);
    }, [selectedId, pushHistory]);

    const deleteSelected = useCallback(() => {
        if (selectedId) deleteElement(selectedId);
    }, [selectedId, deleteElement]);

    const duplicateElement = useCallback((id: string) => {
        const el = elements.find(e => e.id === id);
        if (!el) return;
        pushHistory();
        const newEl = { ...el, id: generateId(), x: el.x + 15, y: el.y + 15, zIndex: nextZIndex() };
        setElements(prev => [...prev, newEl as CanvasElement]);
        setSelectedId(newEl.id);
    }, [elements, nextZIndex, pushHistory]);

    // ===== Selection =====

    const selectElement = useCallback((id: string | null) => {
        setSelectedId(id);
        if (id !== editingTextId) setEditingTextId(null);
    }, [editingTextId]);

    const deselectAll = useCallback(() => {
        setSelectedId(null);
        setEditingTextId(null);
    }, []);

    // ===== Z-Index (Layers) =====

    const bringForward = useCallback((id: string) => {
        setElements(prev => {
            const sorted = [...prev].sort((a, b) => a.zIndex - b.zIndex);
            const idx = sorted.findIndex(e => e.id === id);
            if (idx < sorted.length - 1) {
                const tmp = sorted[idx].zIndex;
                sorted[idx] = { ...sorted[idx], zIndex: sorted[idx + 1].zIndex } as CanvasElement;
                sorted[idx + 1] = { ...sorted[idx + 1], zIndex: tmp } as CanvasElement;
            }
            return sorted;
        });
    }, []);

    const sendBackward = useCallback((id: string) => {
        setElements(prev => {
            const sorted = [...prev].sort((a, b) => a.zIndex - b.zIndex);
            const idx = sorted.findIndex(e => e.id === id);
            if (idx > 0) {
                const tmp = sorted[idx].zIndex;
                sorted[idx] = { ...sorted[idx], zIndex: sorted[idx - 1].zIndex } as CanvasElement;
                sorted[idx - 1] = { ...sorted[idx - 1], zIndex: tmp } as CanvasElement;
            }
            return sorted;
        });
    }, []);

    // ===== Template =====

    const loadTemplate = useCallback((template: DesignTemplate) => {
        pushHistory();
        const newElements = cloneElements(template.elements).map((el, i) => ({
            ...el,
            id: generateId(),
            zIndex: i,
        }));
        setElements(newElements);
        setBgColor(template.bgColor);
        setBgGradient(template.bgGradient);
        setBgImage(template.bgImage);
        setSelectedId(null);
        setEditingTextId(null);
    }, [pushHistory]);

    // Load raw elements (used by AI generator)
    const loadElements = useCallback((newElements: CanvasElement[]) => {
        pushHistory();
        const mapped = cloneElements(newElements).map((el, i) => ({
            ...el,
            id: el.id || generateId(),
            zIndex: el.zIndex ?? i,
        }));
        setElements(mapped);
        setSelectedId(null);
        setEditingTextId(null);
    }, [pushHistory]);

    // ===== Canvas BG =====

    const updateBackground = useCallback((color: string, gradient?: string, image?: string) => {
        pushHistory();
        setBgColor(color);
        if (gradient !== undefined) setBgGradient(gradient);
        if (image !== undefined) setBgImage(image);
    }, [pushHistory]);

    return {
        // State
        elements,
        selectedId,
        selectedElement,
        bgColor,
        bgGradient,
        bgImage,
        editingTextId,
        canvasWidth: CANVAS_W,
        canvasHeight: CANVAS_H,

        // Element actions
        addElement,
        addText,
        addShape,
        addImage,
        updateElement,
        updateElementWithHistory,
        deleteElement,
        deleteSelected,
        duplicateElement,

        // Selection
        selectElement,
        deselectAll,
        setEditingTextId,

        // Layers
        bringForward,
        sendBackward,

        // Template
        loadTemplate,
        loadElements,

        // Background
        updateBackground,
        setBgImage,

        // History
        undo,
        redo,
        pushHistory,
    };
}
