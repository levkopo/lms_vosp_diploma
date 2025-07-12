import { h, ComponentChildren } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import { ElementPositioning } from '../../models';
import {JSX} from "preact/compat";
import {parseCssValue} from "../../utils/styleUtils.ts";
import useElementSize from "../../utils/useElementSize.tsx";

interface DraggableResizableElementProps {
    elementId: string;
    initialPositioning: ElementPositioning;
    isSelected: boolean;
    onSelect: () => void;
    onUpdate: (elementId: string, newPositioning: ElementPositioning) => void;
    children: ComponentChildren;
    canvasScale: number; // Масштаб отображения холста (для коррекции координат мыши)
    // Размеры родительского контейнера (SlideCanvas's content area) в ПИКСЕЛЯХ,
    // относительно которых будут рассчитываться проценты.
    parentWidth: number;
    parentHeight: number;
    boundary: { width: number, height: number }; // Границы холста в "дизайнерских" пикселях (как parentWidth/Height)
}

const convertToPixels = (value: string | undefined, parentDimension: number, computedDimension?: number): number | undefined => {
    if (value === 'auto') return computedDimension; // Если 'auto', берем вычисленный размер
    if (value === undefined) return undefined; // Или computedDimension, если есть

    const parsed = parseCssValue(value);
    if (parsed) {
        if (parsed.unit === 'px') return parsed.numeric;
        if (parsed.unit === '%') return (parsed.numeric / 100) * parentDimension;
    }
    return computedDimension; // Фоллбэк на вычисленный, если не смогли распарсить
};

const convertFromPixels = (
    pixelValue: number,
    originalValue: string | undefined, // Оригинальное значение из initialPositioning
    parentDimension: number,
    // isBeingResized: boolean // Флаг, что размер менялся пользователем
): string => {
    // Если оригинальное значение было 'auto' и размер не менялся пользователем, пытаемся сохранить 'auto'
    // if (originalValue === 'auto' && !isBeingResized) {
    //   return 'auto';
    // }
    // Эта логика сложна, т.к. 'isBeingResized' нужно сбрасывать.
    // Проще: если originalValue было 'auto', при любом обновлении (даже простом drag)
    // оно превратится в px или %, если originalUnitsRef так говорит.
    // Или, если originalValue было 'auto', то всегда конвертируем в px.

    const parsedOriginal = parseCssValue(originalValue);
    // Если исходное значение было в %, конвертируем обратно в %
    if (parsedOriginal && parsedOriginal.unit === '%') {
        if (parentDimension === 0) return '0%';
        return `${((pixelValue / parentDimension) * 100).toFixed(2)}%`;
    }
    // Во всех остальных случаях (включая 'auto' или нераспознанные единицы), конвертируем в px
    return `${pixelValue.toFixed(0)}px`;
};



export const DraggableResizableElement = ({
                                              elementId,
                                              initialPositioning,
                                              isSelected,
                                              onSelect,
                                              onUpdate,
                                              children,
                                              canvasScale,
                                              parentWidth,
                                              parentHeight,
                                              boundary,
                                          }: DraggableResizableElementProps) => {
    const [currentPxPos, setCurrentPxPos] = useState({ x: 0, y: 0 });
    const [currentPxSize, setCurrentPxSize] = useState({ width: 100, height: 50 }); // Дефолтные пиксельные размеры

    const [elementRefCallback, actualRenderedSize] = useElementSize<HTMLDivElement>();

    const hasBeenResizedByUser = useRef(false);

    useEffect(() => {
        // actualRenderedSize содержит РЕАЛЬНЫЕ размеры отмасштабированного элемента на экране.
        // Нам нужны "дизайнерские" пиксельные размеры, поэтому делим на canvasScale.
        const designerPxWidthFromAuto = actualRenderedSize.width > 0 ? actualRenderedSize.width / canvasScale : undefined;
        const designerPxHeightFromAuto = actualRenderedSize.height > 0 ? actualRenderedSize.height / canvasScale : undefined;

        const newPxX = convertToPixels(initialPositioning.left, parentWidth) ?? currentPxPos.x;
        const newPxY = convertToPixels(initialPositioning.top, parentHeight) ?? currentPxPos.y;

        let newPxWidth = convertToPixels(initialPositioning.width, parentWidth, designerPxWidthFromAuto);
        let newPxHeight = convertToPixels(initialPositioning.height, parentHeight, designerPxHeightFromAuto);

        if (newPxWidth === undefined && initialPositioning.width !== 'auto') newPxWidth = currentPxSize.width;
        if (newPxHeight === undefined && initialPositioning.height !== 'auto') newPxHeight = currentPxSize.height;

        if (newPxWidth === undefined || newPxWidth <=0) newPxWidth = 100; // Фоллбэк на дефолт
        if (newPxHeight === undefined || newPxHeight <=0) newPxHeight = 50;

        setCurrentPxPos({ x: newPxX, y: newPxY });
        setCurrentPxSize({ width: newPxWidth, height: newPxHeight });

        if(initialPositioning.width === 'auto' || initialPositioning.height === 'auto') {
            hasBeenResizedByUser.current = false;
        }
    }, [
        initialPositioning, parentWidth, parentHeight,
        actualRenderedSize.width, actualRenderedSize.height,
        canvasScale,
        currentPxPos.x, currentPxPos.y, // Добавил эти, чтобы избежать гонки при инициализации
        currentPxSize.width, currentPxSize.height
    ]);

    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState<string | null>(null); // e.g., 'br' for bottom-right
    const dragStartRef = useRef({ mouseX: 0, mouseY: 0, elX: 0, elY: 0 });
    const resizeStartRef = useRef({ mouseX: 0, mouseY: 0, elW: 0, elH: 0, elX: 0, elY: 0 });

    const handleMouseDownDrag = (e: MouseEvent) => { /* ... как раньше ... */
        e.preventDefault(); e.stopPropagation(); onSelect(); setIsDragging(true);
        dragStartRef.current = { mouseX: e.clientX / canvasScale, mouseY: e.clientY / canvasScale, elX: currentPxPos.x, elY: currentPxPos.y };
    };

    const handleMouseDownResize = (e: MouseEvent, handleName: string) => { /* ... как раньше ... */
        e.preventDefault(); e.stopPropagation(); onSelect(); setIsResizing(handleName);
        hasBeenResizedByUser.current = true; // Пользователь начал изменять размер
        resizeStartRef.current = { mouseX: e.clientX / canvasScale, mouseY: e.clientY / canvasScale, elW: currentPxSize.width, elH: currentPxSize.height, elX: currentPxPos.x, elY: currentPxPos.y };
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => { /* ... как раньше ... */ };
        const handleMouseUp = () => {
            if (isDragging || isResizing) {
                let finalWidthValue = initialPositioning.width;
                let finalHeightValue = initialPositioning.height;

                if (hasBeenResizedByUser.current || initialPositioning.width !== 'auto') {
                    finalWidthValue = convertFromPixels(currentPxSize.width, initialPositioning.width, parentWidth);
                } else if (initialPositioning.width === 'auto') {
                    finalWidthValue = 'auto';
                }

                if (hasBeenResizedByUser.current || initialPositioning.height !== 'auto') {
                    finalHeightValue = convertFromPixels(currentPxSize.height, initialPositioning.height, parentHeight);
                } else if (initialPositioning.height === 'auto') {
                    finalHeightValue = 'auto';
                }

                const finalPositioning: ElementPositioning = {
                    ...initialPositioning,
                    top: convertFromPixels(currentPxPos.y, initialPositioning.top, parentHeight),
                    left: convertFromPixels(currentPxPos.x, initialPositioning.left, parentWidth),
                    width: finalWidthValue,
                    height: finalHeightValue,
                };
                onUpdate(elementId, finalPositioning);
            }
            setIsDragging(false);
            setIsResizing(null);
        };

        if (isDragging || isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, isResizing, canvasScale, onUpdate, elementId, initialPositioning, parentWidth, parentHeight, boundary, currentPxPos, currentPxSize, hasBeenResizedByUser]); // Добавил hasBeenResizedByUser в зависимости


    const displayStyle: JSX.CSSProperties = {
        position: 'absolute',
        top: `${currentPxPos.y * canvasScale}px`,
        left: `${currentPxPos.x * canvasScale}px`,
        width: (initialPositioning.width === 'auto' && !hasBeenResizedByUser.current)
            ? 'auto'
            : `${currentPxSize.width * canvasScale}px`,
        height: (initialPositioning.height === 'auto' && !hasBeenResizedByUser.current)
            ? 'auto'
            : `${currentPxSize.height * canvasScale}px`,
        border: isSelected ? '2px solid blue' : '1px dashed #aaa',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        boxSizing: 'border-box',
        zIndex: initialPositioning.zIndex || 'auto',
        // Для отладки, если 'auto' не работает как ожидалось:
        // outline: initialPositioning.width === 'auto' && !hasBeenResizedByUser.current ? '2px solid lime' : 'none',
    };

    const resizeHandles = ['tl', 't', 'tr', 'l', 'r', 'bl', 'b', 'br'];
    const handleSize = 8 * Math.max(0.5, canvasScale);
    const canResizeWidth = initialPositioning.width !== 'auto' || hasBeenResizedByUser.current;
    const canResizeHeight = initialPositioning.height !== 'auto' || hasBeenResizedByUser.current;

    return (
        // Передаем elementRefCallback в ref корневого div
        <div ref={elementRefCallback} style={displayStyle} onMouseDown={handleMouseDownDrag} onClick={(e) => e.stopPropagation()}>
            <div style={{ width: '100%', height: '100%', overflow: 'hidden', boxSizing: 'border-box' }}>
                {children}
            </div>

            {isSelected && resizeHandles.map(handle => {
                if ((handle.includes('l') || handle.includes('r')) && !canResizeWidth) return null;
                if ((handle.includes('t') || handle.includes('b')) && !canResizeHeight) return null;

                const handleStyle: JSX.CSSProperties = {
                    position: 'absolute',
                    width: `${handleSize}px`,
                    height: `${handleSize}px`,
                    backgroundColor: 'blue',
                    border: '1px solid white',
                    borderRadius: '50%',
                    ...(handle.includes('t') && { top: `-${handleSize / 2}px` }),
                    ...(handle.includes('b') && { bottom: `-${handleSize / 2}px` }),
                    ...(handle.includes('l') && { left: `-${handleSize / 2}px` }),
                    ...(handle.includes('r') && { right: `-${handleSize / 2}px` }),
                    ...((handle === 't' || handle === 'b') && { left: `calc(50% - ${handleSize / 2}px)` }),
                    ...((handle === 'l' || handle === 'r') && { top: `calc(50% - ${handleSize / 2}px)` }),
                };
                if(handle === 't') handleStyle.cursor = 'n-resize'; else if(handle === 'b') handleStyle.cursor = 's-resize';
                else if(handle === 'l') handleStyle.cursor = 'w-resize'; else if(handle === 'r') handleStyle.cursor = 'e-resize';
                else if(handle === 'tl') handleStyle.cursor = 'nw-resize'; else if(handle === 'tr') handleStyle.cursor = 'ne-resize';
                else if(handle === 'bl') handleStyle.cursor = 'sw-resize'; else if(handle === 'br') handleStyle.cursor = 'se-resize';

                return (
                    <div key={handle} style={handleStyle} onMouseDown={(e) => handleMouseDownResize(e, handle)} />
                );
            })}
        </div>
    );
};